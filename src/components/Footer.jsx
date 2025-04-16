import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, useMediaQuery, useTheme, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../styles/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Quick Links section 
    const quickLinks = [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Artists', path: '/artists', icon: '🎭' },
        { name: 'Gallery', path: '/gallery', icon: '🖼️' },
        { name: 'Add Art', path: '/add-art', icon: '➕' }
    ];

    // Legal links section
    const legalLinks = [
        { name: 'Privacy Policy', path: '/privacy', icon: '🔏' },
        { name: 'Terms of Service', path: '/terms', icon: '📜' },
        { name: 'Contact Us', path: '/contact', icon: '📧' }
    ];

    // Social media links
    const socialLinks = [
        { name: 'Facebook', icon: <FacebookIcon />, url: '#' },
        { name: 'Twitter', icon: <TwitterIcon />, url: '#' },
        { name: 'Instagram', icon: <InstagramIcon />, url: '#' }
    ];

    // Mobile accordion footer layout
    if (isMobile) {
        return (
            <footer className="footer">
                <Container maxWidth="lg" className="footer-container">
                    <div className="footer-mobile">
                        <Typography variant="h5" className="footer-title">
                            🎨 Art Gallery
                        </Typography>
                        
                        <Accordion className="footer-accordion">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Quick Links</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box className="footer-links-mobile">
                                    {quickLinks.map((link) => (
                                        <Link key={link.path} to={link.path} className="footer-link">
                                            {link.icon} {link.name}
                                        </Link>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        
                        <Accordion className="footer-accordion">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Legal</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box className="footer-links-mobile">
                                    {legalLinks.map((link) => (
                                        <Link key={link.path} to={link.path} className="footer-link">
                                            {link.icon} {link.name}
                                        </Link>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        
                        <Box className="social-links-mobile">
                            {socialLinks.map((link) => (
                                <IconButton 
                                    key={link.name}
                                    aria-label={link.name} 
                                    className="social-icon" 
                                    href={link.url}
                                >
                                    {link.icon}
                                </IconButton>
                            ))}
                        </Box>
                    </div>
                    
                    <div className="footer-bottom">
                        <Typography variant="body2">
                            &copy; {currentYear} All rights reserved
                        </Typography>
                        <Typography variant="body2">
                            Made with ❤️ by <span className="highlight">Art Gallery Team</span>
                        </Typography>
                    </div>
                </Container>
            </footer>
        );
    }

    // Desktop and tablet layout
    return (
        <footer className="footer">
            <Container maxWidth="lg" className="footer-container">
                <Grid container spacing={4} className="footer-content">
                    {/* Brand Section */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h5" className="footer-title">
                            🎨 Art Gallery
                        </Typography>
                        <Typography variant="body2">
                            &copy; {currentYear} All rights reserved.
                        </Typography>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" className="footer-section-title">
                            Quick Links
                        </Typography>
                        <nav className="footer-links">
                            {quickLinks.map(link => (
                                <Link key={link.path} to={link.path}>
                                    {link.icon} {link.name}
                                </Link>
                            ))}
                        </nav>
                    </Grid>

                    {/* Legal */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" className="footer-section-title">
                            Legal
                        </Typography>
                        <nav className="footer-links">
                            {legalLinks.map(link => (
                                <Link key={link.path} to={link.path}>
                                    {link.icon} {link.name}
                                </Link>
                            ))}
                        </nav>
                    </Grid>

                    {/* Social Media */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" className="footer-section-title">
                            Connect With Us
                        </Typography>
                        <Box className="social-links">
                            {socialLinks.map(link => (
                                <IconButton 
                                    key={link.name}
                                    aria-label={link.name} 
                                    className="social-icon" 
                                    href={link.url}
                                >
                                    {link.icon}
                                </IconButton>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* Bottom Footer */}
                <Box className="footer-bottom">
                    <Typography variant="body2">
                        Made with ❤️ by <span className="highlight">Art Gallery Team</span>
                    </Typography>
                </Box>
            </Container>
        </footer>
    );
};

export default Footer;
