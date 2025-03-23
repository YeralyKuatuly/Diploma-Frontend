import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import '../styles/Header.css';
import { useAuth } from "../context/AuthContext";
import NotificationButton from "./NotificationButton";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleAuthClick = () => {
        if (isLoggedIn) {
            // Logout logic
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            logout(); // Update auth context
            navigate('/');
        } else {
            // Navigate to login
            navigate('/login');
        }
    };

    return (
        <header className="header">
            <Link to="/" className="logo">
                <span className="text-xl font-bold metallic-logo">🎨 Art Gallery</span>
            </Link>
            
            <button className="menu-button" onClick={toggleMenu}>
                {isMenuOpen ? '✕' : '☰'}
            </button>

            <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/artists" onClick={() => setIsMenuOpen(false)}>Artists</Link>
                <Link to="/gallery" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
                <Link to="/slideshow" onClick={() => setIsMenuOpen(false)}>Art Slideshow</Link>
                {isLoggedIn && (
                    <>
                        <Link to="/add-art" onClick={() => setIsMenuOpen(false)}>Add Art</Link>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                        <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)}>My Subscriptions</Link>
                    </>
                )}
            </nav>

            <div className="header-actions">
                {isLoggedIn && <NotificationButton />}
                <button 
                    className="auth-button"
                    onClick={handleAuthClick}
                >
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </div>
        </header>
    );
};

export default Header;
