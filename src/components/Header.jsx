import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import '../styles/Header.css'; // Import CSS file
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api';

// Add the default profile picture URL at the top of the file
const DEFAULT_PROFILE_PICTURE = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Debug log to check auth status
  console.log("Header rendered with isLoggedIn:", isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
      fetchCart();
      fetchNotifications();
    } else {
      setUser(null);
      setCartItemCount(0);
      setNotifications([]);
    }
  }, [isLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile/');
      console.log("Profile fetched:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart/me/');
      console.log("Cart fetched:", response.data);
      setCartItemCount(response.data.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications/');
      console.log("Notifications fetched:", response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout(); // Update auth context
      console.log("Logged out successfully");
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
      handleMobileMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/mark_read/`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const navItems = [
    { label: 'Gallery', path: '/gallery' },
    { label: 'Slideshow', path: '/slideshow' },
    { label: 'Artists', path: '/artists' },
  ];

  const authNavItems = [
    { label: 'Add Art', path: '/add-art' },
    { label: 'My Sales', path: '/artist/selling' },
    { label: 'Profile', path: '/profile' },
    { label: 'Subscriptions', path: '/subscriptions' },
  ];

  const mobileDrawer = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuClose}
      className="mobile-drawer"
    >
      <Box sx={{ width: 250, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={handleMobileMenuClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.path} 
              component={RouterLink} 
              to={item.path}
              onClick={handleMobileMenuClose}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          
          {isLoggedIn && authNavItems.map((item) => (
            <ListItem 
              button 
              key={item.path} 
              component={RouterLink} 
              to={item.path}
              onClick={handleMobileMenuClose}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          
          {isLoggedIn ? (
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <>
              <ListItem 
                button 
                component={RouterLink} 
                to="/login"
                onClick={handleMobileMenuClose}
              >
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem 
                button 
                component={RouterLink} 
                to="/register"
                onClick={handleMobileMenuClose}
              >
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static" className="header">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 0,
            flexShrink: 0,
            textDecoration: 'none',
            color: 'inherit',
            paddingRight: 2,
            paddingLeft: 0,
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            textAlign: 'left',
            mr: 'auto',
          }}
          className="logo"
        >
          Art Gallery
        </Typography>

        {/* Desktop Navigation Links */}
        {!isMobile && (
        <Box sx={{ display: 'flex', mr: 2 }} className="nav-links">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                color="inherit" 
                component={RouterLink} 
                to={item.path}
                sx={{ mr: 1 }}
              >
                {item.label}
              </Button>
            ))}
            
            {isLoggedIn && authNavItems.map((item) => (
              <Button 
                key={item.path}
                color="inherit" 
                component={RouterLink} 
                to={item.path}
                sx={{ mr: 1 }}
              >
                {item.label}
              </Button>
            ))}
        </Box>
        )}

        {isLoggedIn ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }} className="header-actions">
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/cart"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ mr: 1 }}
            >
              <Badge
                badgeContent={notifications.filter((n) => !n.is_read).length}
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {isMobile ? (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                className="mobile-menu-button"
              >
                <MenuIcon />
              </IconButton>
            ) : (
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              {user?.artist?.profile_picture ? (
                <Avatar
                  src={user.artist.profile_picture}
                  alt={user?.username || 'User'}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                  <Avatar
                    src={DEFAULT_PROFILE_PICTURE}
                    alt={user?.username || 'User'}
                    sx={{ width: 32, height: 32 }}
                  />
              )}
            </IconButton>
            )}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleMenuClose}
              >
                Profile
              </MenuItem>
              {user?.is_artist && (
                <MenuItem
                  component={RouterLink}
                  to="/artist/selling"
                  onClick={handleMenuClose}
                >
                  My Sales
                </MenuItem>
              )}
              <MenuItem
                component={RouterLink}
                to="/subscriptions"
                onClick={handleMenuClose}
              >
                Subscriptions
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
            >
              {notifications.length === 0 ? (
                <MenuItem>No notifications</MenuItem>
              ) : (
                notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{
                      backgroundColor: notification.is_read
                        ? 'inherit'
                        : 'action.hover',
                    }}
                  >
                    <Typography variant="body2">
                      {notification.content}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Menu>
          </Box>
        ) : (
          <Box className="header-actions">
            {isMobile ? (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                className="mobile-menu-button"
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ mr: 1 }}
              className="auth-button"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              variant="outlined"
              className="auth-button"
            >
              Register
            </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
      {mobileDrawer}
    </AppBar>
  );
};

export default Header;
