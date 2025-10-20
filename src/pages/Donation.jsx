import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Firebase Functions
const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
const getDonationStats = httpsCallable(functions, 'getDonationStats');
const getRecentDonations = httpsCallable(functions, 'getRecentDonations');

// Stripe Payment Form Component
const StripePaymentForm = ({
  tier,
  amount,
  donorInfo,
  onSuccess,
  onError,
  onProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    onProcessing(true);
    setErrorMessage('');

    try {
      // Create payment intent
      const result = await createPaymentIntent({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          tier: tier.id,
          donorName: donorInfo.name,
          donorEmail: donorInfo.email,
          message: donorInfo.message,
          showPublic: donorInfo.showPublic.toString(),
          showName: donorInfo.showName.toString(),
        }
      });

      const { clientSecret, paymentIntentId } = result.data;

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/donation/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
      } else {
        // Payment is processing
        onSuccess(paymentIntentId, amount, tier.name);
      }
    } catch (error) {
      const message = error.message || 'An unexpected error occurred';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
      onProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-element-container">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'never',
                email: 'never',
              }
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="payment-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={16} style={{ marginRight: '8px', color: 'white' }} />
              Processing...
            </>
          ) : (
            `Donate $${amount}`
          )}
        </button>
      </div>
    </form>
  );
};

// Main Donation Component
const DonationPage = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donationStatus, setDonationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationStats, setDonationStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    showPublic: true,
    showName: true
  });

  const donationTiers = [
    {
      id: 'coffee',
      name: 'Buy a Coffee',
      amount: 5,
      description: 'Support with a small donation that helps fuel the creative process',
      icon: <CoffeeIcon className="donation-icon" />
    },
    {
      id: 'supporter',
      name: 'Crew Supporter',
      amount: 15,
      description: 'Become an official supporter and get your name in the acknowledgments',
      icon: <FavoriteIcon className="donation-icon" />
    },
    {
      id: 'first_mate',
      name: 'First Mate',
      amount: 50,
      description: 'Major supporter with exclusive updates and behind-the-scenes content',
      icon: <StarIcon className="donation-icon" />
    },
    {
      id: 'captain',
      name: 'Captain\'s Circle',
      amount: 100,
      description: 'Join the elite circle of top supporters with special recognition',
      icon: <LocalAtmIcon className="donation-icon" />
    }
  ];

  useEffect(() => {
    loadDonationData();
  }, []);

  const loadDonationData = async () => {
    try {
      setLoading(true);
      const [statsResult, donationsResult] = await Promise.all([
        getDonationStats(),
        getRecentDonations({ limit: 8 })
      ]);

      setDonationStats(statsResult.data);
      setRecentDonations(donationsResult.data);
    } catch (error) {
      console.error('Error loading donation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSuccess = (donationId, amount, tierName) => {
    setDonationStatus({
      type: 'success',
      message: `Thank you for your ${tierName} donation of $${amount}! Your support means the world to us. You should receive a confirmation email shortly.`,
      donationId
    });
    setSelectedTier(null);

    // Reset form
    setDonorInfo({
      name: '',
      email: '',
      message: '',
      showPublic: true,
      showName: true
    });

    // Reload stats
    setTimeout(loadDonationData, 3000);
  };

  const handleDonationError = (errorMessage) => {
    setDonationStatus({
      type: 'error',
      message: `Payment failed: ${errorMessage}. Please try again or contact support if the issue persists.`
    });
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= 1) {
      setSelectedTier({
        id: 'custom',
        name: 'Custom Donation',
        amount: amount
      });
      setCustomAmount('');
    } else {
      setDonationStatus({
        type: 'error',
        message: 'Please enter a valid donation amount (minimum $1)'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="donation-page">
        <div className="loading-container">
          <CircularProgress size={60} style={{ color: '#20c997' }} />
          <p>Loading donation information...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
      <div className="donation-page">
        <header className="donation-header">
          <h1>Support The Voyages of Victora</h1>
          <p className="subtitle">
            Your support helps create more stories, develop new characters, and bring the world of Victora to life.
            Every contribution makes a difference!
          </p>
        </header>

        {/* Donation Stats */}
        {donationStats && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(donationStats.totalAmount || 0)}</div>
                <div className="stat-label">Total Raised</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{donationStats.totalDonations || 0}</div>
                <div className="stat-label">Total Donations</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{formatCurrency(donationStats.lastDonationAmount || 0)}</div>
                <div className="stat-label">Last Donation</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {donationStatus && (
          <div className={`status-message ${donationStatus.type}`}>
            <CheckCircleIcon className="status-icon" />
            <p>{donationStatus.message}</p>
          </div>
        )}

        {/* Donation Options */}
        {!selectedTier ? (
          <div className="donation-options-section">
            <h2>Choose Your Support Level</h2>
            <div className="donation-tiers">
              {donationTiers.map((tier) => (
                <div key={tier.id} className="donation-tier">
                  <div className="tier-icon">{tier.icon}</div>
                  <h3>{tier.name}</h3>
                  <div className="tier-amount">{formatCurrency(tier.amount)}</div>
                  <p className="tier-description">{tier.description}</p>
                  <button
                    className="btn btn-primary tier-button"
                    onClick={() => setSelectedTier(tier)}
                    disabled={isProcessing}
                  >
                    Donate {formatCurrency(tier.amount)}
                  </button>
                </div>
              ))}

              {/* Custom Amount */}
              <div className="donation-tier custom-tier">
                <LocalAtmIcon className="tier-icon" />
                <h3>Custom Amount</h3>
                <div className="custom-amount-input">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="1"
                    className="amount-input"
                  />
                </div>
                <p className="tier-description">Choose your own donation amount (minimum $1)</p>
                <button
                  className="btn btn-outline tier-button"
                  onClick={handleCustomDonation}
                  disabled={!customAmount || parseFloat(customAmount) < 1 || isProcessing}
                >
                  Set Custom Amount
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Section */
          <div className="payment-section">
            <div className="payment-header">
              <h2>Complete Your Donation</h2>
              <p>You're supporting us with {selectedTier.name} - {formatCurrency(selectedTier.amount)}</p>
            </div>

            {/* Donor Information */}
            <div className="donor-info-section">
              <h3>Your Information (Optional)</h3>
              <div className="donor-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name for acknowledgment</label>
                    <input
                      type="text"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      placeholder="Enter your name"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email for updates</label>
                    <input
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      placeholder="Enter your email"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message (optional)</label>
                  <textarea
                    value={donorInfo.message}
                    onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                    placeholder="Leave an encouraging message for the author..."
                    rows="3"
                    className="form-textarea"
                  />
                </div>
                <div className="privacy-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={donorInfo.showPublic}
                      onChange={(e) => setDonorInfo({ ...donorInfo, showPublic: e.target.checked })}
                    />
                    Show my donation publicly
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={donorInfo.showName}
                      onChange={(e) => setDonorInfo({ ...donorInfo, showName: e.target.checked })}
                    />
                    Show my name with donation
                  </label>
                </div>
              </div>
            </div>

            {/* Stripe Payment Form */}
            <StripePaymentForm
              tier={selectedTier}
              amount={selectedTier.amount}
              donorInfo={donorInfo}
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
              onProcessing={setIsProcessing}
            />

            <button
              className="btn btn-secondary"
              onClick={() => setSelectedTier(null)}
              disabled={isProcessing}
            >
              Choose Different Amount
            </button>
          </div>
        )}

        {/* Recent Donations */}
        {recentDonations.length > 0 && (
          <div className="recent-donations-section">
            <h2>Recent Supporters</h2>
            <div className="donations-grid">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="donation-item">
                  <div className="donor-name">{donation.donorName}</div>
                  <div className="donation-amount">{formatCurrency(donation.amount)}</div>
                  {donation.message && (
                    <div className="donation-message">"{donation.message}"</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Support Options */}
        <div className="support-options-section">
          <h2>Other Ways to Support</h2>
          <div className="support-options">
            <div className="support-option">
              <h3>📚 Purchase Books</h3>
              <p>Buy the books and leave reviews to help reach more readers</p>
            </div>
            <div className="support-option">
              <h3>📢 Share & Follow</h3>
              <p>Share with friends and follow on social media platforms</p>
            </div>
            <div className="support-option">
              <h3>✉️ Join Newsletter</h3>
              <p>Stay updated with the latest news and releases</p>
            </div>
          </div>
        </div>

        <footer className="donation-footer">
          <p>Thank you for your support! Every contribution helps bring more adventures to life.</p>
        </footer>
      </div>
    </Elements>
  );
};

export default DonationPage;