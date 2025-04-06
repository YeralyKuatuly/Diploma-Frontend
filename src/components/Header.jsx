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
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import '../styles/Header.css'; // Import CSS file
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const navigate = useNavigate();

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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/mark_read/`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

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

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', mr: 2 }} className="nav-links">
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/gallery"
            sx={{ mr: 1 }}
          >
            Gallery
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/slideshow"
            sx={{ mr: 1 }}
          >
            Slideshow
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/artists"
            sx={{ mr: 1 }}
          >
            Artists
          </Button>
          {isLoggedIn && (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/add-art"
                sx={{ mr: 1 }}
              >
                Add Art
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/profile"
                sx={{ mr: 1 }}
              >
                Profile
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/subscriptions"
                sx={{ mr: 1 }}
              >
                Subscriptions
              </Button>
            </>
          )}
        </Box>

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

            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              {user?.profile_picture ? (
                <Avatar
                  src={user.profile_picture}
                  alt={user?.username || 'User'}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>

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
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
