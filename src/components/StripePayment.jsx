// src/components/StripePayment.jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { recordDonation } from '../firebase/donations';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({
    amount,
    tier,
    donorInfo,
    onSuccess,
    onError
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Create payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: donorInfo.name,
                    email: donorInfo.email,
                },
            });

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            // Call your backend to create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: 'usd',
                    paymentMethodId: paymentMethod.id,
                    donorInfo,
                    tier,
                }),
            });

            const { clientSecret, error: serverError } = await response.json();

            if (serverError) {
                throw new Error(serverError);
            }

            // Confirm payment
            const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            // Record donation in Firebase
            const donationData = {
                donorName: donorInfo.name || 'Anonymous',
                donorEmail: donorInfo.email,
                amount: amount,
                currency: 'USD',
                tier: tier.id,
                message: donorInfo.message,
                showPublic: donorInfo.showPublic,
                showName: donorInfo.showName,
                paymentMethod: 'stripe',
                status: 'completed',
                transactionId: paymentMethod.id,
            };

            await recordDonation(donationData);
            onSuccess(amount, tier.name);

        } catch (err) {
            setError(err.message);
            onError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{
                padding: '1rem',
                border: '1px solid #333',
                borderRadius: '8px',
                marginBottom: '1rem',
                backgroundColor: '#1a1a1a'
            }}>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#f7f7f7',
                                '::placeholder': {
                                    color: '#888',
                                },
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <button
                className="btn"
                type="submit"
                disabled={!stripe || isProcessing}
                style={{ width: '100%' }}
            >
                {isProcessing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export const StripePayment = ({ amount, tier, donorInfo, onSuccess, onError }) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm
            amount={amount}
            tier={tier}
            donorInfo={donorInfo}
            onSuccess={onSuccess}
            onError={onError}
        />
    </Elements>
);