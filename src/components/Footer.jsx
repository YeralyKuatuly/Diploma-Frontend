import '../styles/Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-section">
                    <h3>🎨 Art Gallery</h3>
                    <p>&copy; {currentYear} All rights reserved.</p>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <nav>
                        <Link to="/">🏠 Home</Link>
                        <Link to="/artists">🎭 Artists</Link>
                        <Link to="/gallery">🖼️ Gallery</Link>
                        <Link to="/add-art">➕ Add Art</Link>
                    </nav>
                </div>

                {/* Legal */}
                <div className="footer-section">
                    <h3>Legal</h3>
                    <nav>
                        <Link to="/privacy">🔏 Privacy Policy</Link>
                        <Link to="/terms">📜 Terms of Service</Link>
                        <Link to="/contact">📧 Contact Us</Link>
                    </nav>
                </div>

                {/* Social Media */}
                <div className="footer-section">
                    <h3>Connect With Us</h3>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook" className="social-icon">
                            📘
                        </a>
                        <a href="#" aria-label="Twitter" className="social-icon">
                            🐦
                        </a>
                        <a href="#" aria-label="Instagram" className="social-icon">
                            📸
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="footer-bottom">
                <p>Made with ❤️ by <span className="highlight">Art Gallery Team</span></p>
            </div>
        </footer>
    );
};

export default Footer;
