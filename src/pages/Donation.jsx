import { useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { recordDonation, getRecentDonations, getDonationStats } from '../firebase/donations';

const Donation = () => {
  const [donationStatus, setDonationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
      icon: <CoffeeIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
    },
    {
      id: 'supporter',
      name: 'Crew Supporter',
      amount: 15,
      description: 'Become an official supporter and get your name in the acknowledgments',
      icon: <FavoriteIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
    },
    {
      id: 'first_mate',
      name: 'First Mate',
      amount: 50,
      description: 'Major supporter with exclusive updates and behind-the-scenes content',
      icon: <StarIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
    },
    {
      id: 'custom',
      name: 'Custom Amount',
      amount: 0,
      description: 'Choose your own donation amount',
      icon: <LocalAtmIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
    }
  ];

  const handleDonation = async (tier, customAmount = null) => {
    setIsProcessing(true);
    setDonationStatus(null);

    try {
      const amount = customAmount || tier.amount;
      
      // For demo purposes - in a real app, you would integrate with a payment processor
      // like Stripe, PayPal, or Patreon here
      
      const donationData = {
        donorName: donorInfo.name || 'Anonymous',
        donorEmail: donorInfo.email,
        amount: amount,
        currency: 'USD',
        tier: tier.id,
        message: donorInfo.message,
        showPublic: donorInfo.showPublic,
        showName: donorInfo.showName,
        paymentMethod: 'demo', // Replace with actual payment method
        status: 'completed', // In real app, this would start as 'pending'
        transactionId: `demo_${Date.now()}` // Replace with actual transaction ID
      };

      const donationId = await recordDonation(donationData);
      
      setDonationStatus({
        type: 'success',
        message: `Thank you for your ${tier.name} donation of $${amount}! Your support means the world to us.`,
        donationId
      });

      // Reset form
      setDonorInfo({
        name: '',
        email: '',
        message: '',
        showPublic: true,
        showName: true
      });

    } catch (error) {
      setDonationStatus({
        type: 'error',
        message: `Failed to process donation: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomDonation = () => {
    const customAmount = parseFloat(prompt('Enter your custom donation amount (USD):'));
    if (customAmount && customAmount > 0) {
      handleDonation(donationTiers[3], customAmount);
    }
  };

  return (
    <div>
      <h1 className="page-title">Support The Voyages</h1>
      
      <div className="page-section">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#20c997' }}>
          Help Continue the Adventure!
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
          Your support helps create more stories, develop new characters, and bring the world of Victora to life. Every contribution makes a difference!
        </p>
      </div>

      {/* Donation Status Message */}
      {donationStatus && (
        <div 
          className="page-section" 
          style={{ 
            borderColor: donationStatus.type === 'success' ? '#20c997' : '#ff4444',
            backgroundColor: donationStatus.type === 'success' ? 'rgba(32, 201, 151, 0.1)' : 'rgba(255, 68, 68, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {donationStatus.type === 'success' && <CheckCircleIcon style={{ color: '#20c997' }} />}
            <p style={{ margin: 0, color: donationStatus.type === 'success' ? '#20c997' : '#ff4444' }}>
              {donationStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Donor Information Form */}
      <div className="page-section">
        <h3 style={{ color: '#20c997', marginBottom: '1rem' }}>Your Information (Optional)</h3>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
              Name (for acknowledgment)
            </label>
            <input
              type="text"
              value={donorInfo.name}
              onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#f7f7f7',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
              Email (for updates)
            </label>
            <input
              type="email"
              value={donorInfo.email}
              onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#f7f7f7',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cccccc' }}>
              Message (optional)
            </label>
            <textarea
              value={donorInfo.message}
              onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
              placeholder="Leave an encouraging message for the author..."
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#f7f7f7',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cccccc' }}>
              <input
                type="checkbox"
                checked={donorInfo.showPublic}
                onChange={(e) => setDonorInfo({ ...donorInfo, showPublic: e.target.checked })}
              />
              Show publicly
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cccccc' }}>
              <input
                type="checkbox"
                checked={donorInfo.showName}
                onChange={(e) => setDonorInfo({ ...donorInfo, showName: e.target.checked })}
              />
              Show my name
            </label>
          </div>
        </div>
      </div>

      {/* Donation Options */}
      <div className="donation-options">
        {donationTiers.map((tier) => (
          <div key={tier.id} className="donation-option">
            {tier.icon}
            <h3>{tier.name}</h3>
            {tier.amount > 0 && (
              <h4 style={{ color: '#20c997', margin: '0.5rem 0', fontSize: '1.5rem' }}>
                ${tier.amount}
              </h4>
            )}
            <p>{tier.description}</p>
            <button 
              className="btn" 
              style={{ marginTop: '1rem' }}
              onClick={() => tier.id === 'custom' ? handleCustomDonation() : handleDonation(tier)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : (tier.id === 'custom' ? 'Choose Amount' : `Donate $${tier.amount}`)}
            </button>
          </div>
        ))}
      </div>

      {/* Demo Notice */}
      <div className="page-section" style={{ textAlign: 'center' }}>
        <p style={{ color: '#ffa500', fontSize: '0.9rem' }}>
          <strong>Demo Notice:</strong> This is a demonstration version. In a production environment, 
          this would integrate with actual payment processors like Stripe or PayPal.
        </p>
      </div>

      <div className="page-section">
        <h3>Other Ways to Support</h3>
        <ul style={{ paddingLeft: '2rem', marginTop: '1rem' }}>
          <li>Purchase the books and leave reviews</li>
          <li>Share with friends and on social media</li>
          <li>Join the newsletter for updates</li>
          <li>Follow on social media platforms</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ color: '#cccccc' }}>
          Thank you for your support! Every contribution helps bring more adventures to life.
        </p>
      </div>
    </div>
  );
};

export default Donation;