import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="nav-container">
          <nav className="nav">
            <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
              The Voyages of Victora
            </Link>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
              <li>
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/book-series"
                  className={`nav-link ${location.pathname === '/book-series' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Series
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              {/* <li>
                <Link 
                  to="/donation" 
                  className={`nav-link ${location.pathname === '/donation' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
              </li> */}
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="https://chris-feveck.com" target="_blank" rel="noopener noreferrer">
              Author: Christopher Feveck
            </a>
            <span>•</span>
            <span>© 2024 The Voyages of Victora</span>
          </div>
          <p>Embark on a thrilling adventure with Captain Bartley and his eclectic crew.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;