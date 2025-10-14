import { Link } from 'react-router-dom';
import voyagesOne from "/voyages1.png";
import voyagesTwo from "/voyages2.jpg";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';

const Home = () => {
  return (
    <>
      <section className="hero">
        <h1>The Voyages of Victora</h1>
        <h3>Embark on a thrilling adventure with Captain Bartley and his eclectic crew.</h3>
        
        <div className="social-links">
          <a href="https://www.facebook.com/profile.php?id=61569913277354" target="_blank" rel="noopener noreferrer" className="social-link">
            <FacebookIcon className="social-icon" />
            <span>Facebook</span>
          </a>
          <a href="https://www.instagram.com/the_voyages_of_victora/profilecard/?igsh=eHUxd2J5MDNsMmh4" target="_blank" rel="noopener noreferrer" className="social-link">
            <InstagramIcon className="social-icon" />
            <span>Instagram</span>
          </a>
          <a href="https://www.youtube.com/@only_pirates" target="_blank" rel="noopener noreferrer" className="social-link">
            <YouTubeIcon className="social-icon" />
            <span>YouTube</span>
          </a>
        </div>
      </section>

      <section className="page-section">
        <h2 className="page-title">Featured Books</h2>
        <div className="series-list">
          <div className="series-list-item">
            <h3>The Voyages of Victora: Volume One</h3>
            <img src={voyagesOne} alt="A pirate ship at night on rough seas." className="book-image" />
            <div>
              <a href="https://www.amazon.ca/dp/B0DQJWVS97/ref=cbw_us_ca_dp_narx_gl_book" target="_blank" rel="noopener noreferrer" className="btn">
                <ShoppingBasketOutlinedIcon />
                Paperback Edition
              </a>
              <Link to="/book-series" className="btn btn-outline">
                Learn More
              </Link>
            </div>
            <p>
              Captain Bartley, a charming and adventurous gentleman, leads his eclectic crew on a daring quest across the high seas. With his loyal first mate, a mysterious fish-man, and the formidable crew. Captain Bartley embarks on an unforgettable journey filled with danger, excitement, betrayal.
              <br /><br />
              As the crew faces the challenges of treacherous waters and formidable foes, they must rely on their wits, and bonds to succeed. "The Voyages of Victora" is a swashbuckling adventure that captures the spirit of exploration and the thrill of the hunt. Join Captain Bartley and his crew as they navigate the perils of the sea in pursuit of glory and fortune.
            </p>
          </div>
        </div>
      </section>

      <div className="invisible">
        <p>
          pirate fantasy, young adult fantasy, fantasy adventure, pirate books for teens, seafaring fantasy, pirate fantasy with magic, fantasy pirates on the high seas, young adult fantasy pirates, swashbuckling fantasy, mythical creatures at sea, female pirate, young adult fantasy with strong female protagonist, mythical creatures at sea, fantasy pirates with powers, dark pirate fantasy, humorous pirate fantasy, gritty pirate fantasy, best young adult pirate fantasy novels, fantasy books about pirates for teenagers, where to find a good pirate fantasy books
        </p>
      </div>
    </>
  );
};

export default Home;