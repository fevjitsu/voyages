import { useState, useEffect } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import { recordDonation, getRecentDonations, getDonationStats } from '../../functions/src/firebase/donations';

const Donation = () => {
  const [donationStatus, setDonationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    showPublic: true,
    showName: true
  });

  // Load recent donations and stats on component mount
  useEffect(() => {
    loadDonationData();
  }, []);

  const loadDonationData = async () => {
    try {
      const [donations, donationStats] = await Promise.all([
        getRecentDonations(5),
        getDonationStats()
      ]);
      setRecentDonations(donations);
      setStats(donationStats);
    } catch (error) {
      console.error('Error loading donation data:', error);
    }
  };

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
    }
  ];

  const handleDonation = async (tier, customAmount = null) => {
    setIsProcessing(true);
    setDonationStatus(null);

    try {
      const amount = customAmount || tier.amount;

      // For demo purposes - in production, integrate with Stripe
      const donationData = {
        donorName: donorInfo.name || 'Anonymous',
        donorEmail: donorInfo.email,
        amount: amount,
        currency: 'USD',
        tier: tier.id,
        message: donorInfo.message,
        showPublic: donorInfo.showPublic,
        showName: donorInfo.showName,
        paymentMethod: 'demo',
        status: 'completed',
        transactionId: `demo_${Date.now()}`
      };

      const donationId = await recordDonation(donationData);

      setDonationStatus({
        type: 'success',
        message: `Thank you for your ${tier.name} donation of $${amount}! Your support means the world to us.`,
        donationId
      });

      // Reset form and reload data
      setDonorInfo({
        name: '',
        email: '',
        message: '',
        showPublic: true,
        showName: true
      });

      // Reload recent donations and stats
      await loadDonationData();

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
      const customTier = {
        id: 'custom',
        name: 'Custom Donation',
        amount: customAmount
      };
      handleDonation(customTier, customAmount);
    } else if (customAmount !== null) {
      alert('Please enter a valid donation amount greater than $0');
    }
  };

  // ... rest of your component code with the new stats and recent donations display

  return (
    <div>
      <h1 className="page-title">Support The Voyages</h1>

      {/* Display Stats if available */}
      {stats && (
        <div className="page-section" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <PeopleIcon style={{ fontSize: '2rem', color: '#20c997', marginBottom: '0.5rem' }} />
              <h3 style={{ color: '#20c997', margin: '0.5rem 0' }}>{stats.totalDonations}</h3>
              <p style={{ margin: 0, color: '#cccccc' }}>Total Supporters</p>
            </div>
            <div>
              <LocalAtmIcon style={{ fontSize: '2rem', color: '#20c997', marginBottom: '0.5rem' }} />
              <h3 style={{ color: '#20c997', margin: '0.5rem 0' }}>${stats.totalAmount}</h3>
              <p style={{ margin: 0, color: '#cccccc' }}>Total Raised</p>
            </div>
          </div>
        </div>
      )}

      {/* Display Recent Donations */}
      {recentDonations.length > 0 && (
        <div className="page-section">
          <h3 style={{ color: '#20c997', marginBottom: '1rem', textAlign: 'center' }}>
            Recent Supporters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentDonations.map((donation, index) => (
              <div
                key={donation.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(32, 201, 151, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(32, 201, 151, 0.2)'
                }}
              >
                <span style={{ color: '#f7f7f7', fontWeight: '500' }}>
                  {donation.donorName}
                </span>
                <span style={{ color: '#20c997', fontWeight: 'bold' }}>
                  ${donation.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rest of your existing component JSX */}
      {/* ... */}
    </div>
  );
};

export default Donation;