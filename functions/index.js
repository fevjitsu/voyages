const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || functions.config().stripe.secret, {
    apiVersion: "2023-10-16",
});

// Helper function to update donation statistics
async function updateDonationStats(amount) {
    const db = admin.firestore();
    const statsRef = db.collection("donationStats").doc("current");

    try {
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef);

            if (statsDoc.exists) {
                const currentStats = statsDoc.data();
                transaction.update(statsRef, {
                    totalAmount: (currentStats.totalAmount || 0) + amount,
                    totalDonations: (currentStats.totalDonations || 0) + 1,
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
        console.error("Error updating donation stats:", error);
    }
}

// Create Payment Intent Function
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        const { amount, currency = "usd", metadata } = data;

        // Validate input
        if (!amount || amount < 50) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Amount must be at least $0.50"
            );
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency,
            metadata: metadata || {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log("Payment intent created:", paymentIntent.id);

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to create payment intent: " + error.message
        );
    }
});

// Webhook to handle successful payments
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                sig,
                functions.config().stripe.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle successful payment
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;

            try {
                const db = admin.firestore();

                // Record successful donation in Firestore
                await db.collection("donations").doc(paymentIntent.id).set({
                    donorName: paymentIntent.metadata.donorName || "Anonymous",
                    donorEmail: paymentIntent.metadata.donorEmail,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    tier: paymentIntent.metadata.tier,
                    message: paymentIntent.metadata.message,
                    showPublic: paymentIntent.metadata.showPublic === "true",
                    showName: paymentIntent.metadata.showName === "true",
                    paymentMethod: "stripe",
                    status: "completed",
                    transactionId: paymentIntent.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Update donation statistics
                await updateDonationStats(paymentIntent.amount / 100);

                console.log("Donation recorded successfully:", paymentIntent.id);
            } catch (error) {
                console.error("Error recording donation:", error);
            }
        }

        res.json({ received: true });
    });
});

// Get donation statistics
exports.getDonationStats = functions.https.onCall(async (data, context) => {
    try {
        const db = admin.firestore();
        const statsDoc = await db.collection("donationStats").doc("current").get();

        if (statsDoc.exists) {
            const data = statsDoc.data();
            return {
                totalAmount: data.totalAmount || 0,
                totalDonations: data.totalDonations || 0,
                lastDonationAmount: data.lastDonationAmount || 0,
                lastDonationAt: data.lastDonationAt,
            };
        } else {
            return {
                totalAmount: 0,
                totalDonations: 0,
                lastDonationAmount: 0,
                lastDonationAt: null,
            };
        }
    } catch (error) {
        console.error("Error getting donation stats:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to fetch donation statistics"
        );
    }
});

// Get recent donations
exports.getRecentDonations = functions.https.onCall(async (data, context) => {
    try {
        const db = admin.firestore();
        const limit = data.limit || 10;

        const donationsSnapshot = await db
            .collection("donations")
            .where("status", "==", "completed")
            .where("showPublic", "==", true)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const donations = donationsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                donorName: data.showName ? data.donorName : "Anonymous",
                amount: data.amount,
                tier: data.tier,
                message: data.message,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            };
        });

        return donations;
    } catch (error) {
        console.error("Error getting recent donations:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to fetch recent donations"
        );
    }
});

// Record manual donation (for testing or other payment methods)
exports.recordDonation = functions.https.onCall(async (data, context) => {
    try {
        const db = admin.firestore();
        const {
            donorName,
            donorEmail,
            amount,
            currency = "USD",
            tier,
            message,
            showPublic = true,
            showName = true,
            paymentMethod = "manual",
            status = "completed",
            transactionId
        } = data;

        if (!amount || amount <= 0) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Amount is required and must be greater than 0"
            );
        }

        const donationData = {
            donorName: donorName || "Anonymous",
            donorEmail: donorEmail,
            amount: amount,
            currency: currency,
            tier: tier,
            message: message,
            showPublic: showPublic,
            showName: showName,
            paymentMethod: paymentMethod,
            status: status,
            transactionId: transactionId || `manual_${Date.now()}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection("donations").add(donationData);

        await updateDonationStats(amount);

        return { donationId: docRef.id };
    } catch (error) {
        console.error("Error recording donation:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to record donation"
        );
    }
});