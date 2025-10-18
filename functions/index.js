// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// Create Payment Intent
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { amount, currency = 'usd', donorInfo, tier } = req.body;

      // Validate input
      if (!amount || amount < 50) { // Minimum $0.50
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency,
        metadata: {
          donor_name: donorInfo.name || 'Anonymous',
          donor_email: donorInfo.email || '',
          tier: tier.id,
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Stripe Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleSuccessfulPayment(paymentIntent) {
  const { donor_email, donor_name, tier } = paymentIntent.metadata;

  try {
    // Record donation in Firestore
    await admin.firestore().collection('donations').add({
      donorName: donor_name,
      donorEmail: donor_email,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      tier: tier,
      paymentMethod: 'stripe',
      status: 'completed',
      transactionId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      showPublic: true,
      showName: true,
    });

    // Update stats
    await updateDonationStats(paymentIntent.amount / 100);

    console.log(`Successfully recorded donation from ${donor_email}`);
  } catch (error) {
    console.error('Error recording donation:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  console.log(`Payment failed for ${paymentIntent.id}`);
  // You might want to notify the user or log this for follow-up
}

async function updateDonationStats(amount) {
  const statsRef = admin.firestore().collection('donationStats').doc('current');

  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);

      if (statsDoc.exists) {
        const currentStats = statsDoc.data();
        transaction.update(statsRef, {
          totalAmount: currentStats.totalAmount + amount,
          totalDonations: currentStats.totalDonations + 1,
          lastDonationAmount: amount,
          lastDonationAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        transaction.set(statsRef, {
          totalAmount: amount,
          totalDonations: 1,
          lastDonationAmount: amount,
          lastDonationAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  } catch (error) {
    console.error('Error updating donation stats:', error);
  }
}