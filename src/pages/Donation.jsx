import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';

const Donation = () => {
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

      <div className="donation-options">
        <div className="donation-option">
          <CoffeeIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
          <h3>Buy a Coffee</h3>
          <p>Support with a small donation that helps fuel the creative process</p>
          <button className="btn" style={{ marginTop: '1rem' }}>
            $5 Donation
          </button>
        </div>

        <div className="donation-option">
          <FavoriteIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
          <h3>Crew Supporter</h3>
          <p>Become an official supporter and get your name in the acknowledgments</p>
          <button className="btn" style={{ marginTop: '1rem' }}>
            $15 Donation
          </button>
        </div>

        <div className="donation-option">
          <StarIcon style={{ fontSize: '3rem', color: '#20c997', marginBottom: '1rem' }} />
          <h3>First Mate</h3>
          <p>Major supporter with exclusive updates and behind-the-scenes content</p>
          <button className="btn" style={{ marginTop: '1rem' }}>
            $50 Donation
          </button>
        </div>
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