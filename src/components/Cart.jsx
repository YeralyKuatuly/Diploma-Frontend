import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  TextField,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getCart, addToCart, removeFromCart, createOrder } from '../api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
      setLoading(false);
    }
  };

  const handleQuantityChange = async (artworkId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(artworkId, 1);
      } else {
        await addToCart(artworkId, newQuantity);
      }
      fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (artworkId) => {
    try {
      await removeFromCart(artworkId);
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await createOrder(shippingAddress);
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading cart...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh">
        <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Your cart is empty
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/artworks')}
          sx={{ mt: 2 }}
        >
          Browse Artworks
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <img
                      src={item.artwork.image}
                      alt={item.artwork.title}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Typography variant="h6">{item.artwork.title}</Typography>
                    <Typography color="text.secondary">
                      by {item.artwork.artist.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${item.total_price}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 2 }}>Quantity: 1</Typography>
                      <IconButton
                        onClick={() => handleRemoveItem(item.artwork.id)}
                        aria-label="Remove from cart"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ${cart.total_price}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleCheckout}
                disabled={!shippingAddress}
                sx={{ mt: 2 }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart; 