import voyagesOne from "/voyages1.png";
import voyagesTwo from "/voyages2.jpg";
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';

const BookSeries = () => {
  return (
    <div>
      <h1 className="page-title">Book Series</h1>
      
      <div className="series-list">
        <div className="series-list-item">
          <h3>The Voyages of Victora: Volume One</h3>
          <img src={voyagesOne} alt="A pirate ship at night on rough seas." className="book-image" />
          <div>
            <a href="https://www.amazon.ca/dp/B0DQJWVS97/ref=cbw_us_ca_dp_narx_gl_book" target="_blank" rel="noopener noreferrer" className="btn">
              <ShoppingBasketOutlinedIcon />
              Get Paperback
            </a>
          </div>
          <p>
            Captain Bartley, a charming and adventurous gentleman, leads his eclectic crew on a daring quest across the high seas. With his loyal first mate, a mysterious fish-man, and the formidable crew. Captain Bartley embarks on an unforgettable journey filled with danger, excitement, betrayal.
            <br /><br />
            As the crew faces the challenges of treacherous waters and formidable foes, they must rely on their wits, and bonds to succeed. "The Voyages of Victora" is a swashbuckling adventure that captures the spirit of exploration and the thrill of the hunt. Join Captain Bartley and his crew as they navigate the perils of the sea in pursuit of glory and fortune.
          </p>
        </div>

        <div className="series-list-item">
          <h3>The Voyages of Victora: Volume Two</h3>
          <img src={voyagesTwo} alt="A pirate ship at night on rough seas." className="book-image" />
          <div>
            <button className="btn" disabled style={{ opacity: 0.7 }}>
              Coming This Fall!
            </button>
          </div>
          <p>
            Captain Bartley allows one of his young crew members to visit home, a place now hidden from the world, a place of myth and conspiracy. Join the crew on their enlightening adventure.
            <br /><br />
            In this thrilling sequel, the crew faces new challenges and discovers ancient secrets that will test their loyalty and courage like never before. The journey continues with more action, mystery, and the bonds of friendship that make the Victora's crew legendary.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookSeries;