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
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getCart, removeFromCart, createOrder } from '../api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderType, setOrderType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('kaspi');
  const [pickupLocation, setPickupLocation] = useState('');
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
      // Validate fields based on order type
      if (orderType === 'delivery' && !shippingAddress) {
        setError('Please enter a shipping address for delivery');
        return;
      }

      // Create order with the appropriate fields
      const orderData = {
        order_type: orderType,
        payment_method: paymentMethod,
      };

      // Add shipping address or pickup location based on order type
      if (orderType === 'delivery') {
        orderData.shipping_address = shippingAddress;
      } else {
        orderData.pickup_location = pickupLocation;
      }

      const order = await createOrder(orderData);
      
      // Debug logs to check the order data
      console.log('Order created with data:', order);
      console.log('Order ID:', order.id);
      
      if (!order || !order.id) {
        console.error('No order ID returned from the API!');
        setError('Failed to create order - no order ID returned');
        return;
      }

      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.detail || 'Failed to create order');
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
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Typography variant="h6">{item.artwork.title}</Typography>
                    <Typography color="text.secondary">
                      by {item.artwork.artist.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${item.artwork.price}
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
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend">Order Type</FormLabel>
                <RadioGroup 
                  value={orderType} 
                  onChange={(e) => setOrderType(e.target.value)}
                  name="order-type"
                >
                  <FormControlLabel value="pickup" control={<Radio />} label="Self Pickup" />
                  <FormControlLabel value="delivery" control={<Radio />} label="Delivery" />
                </RadioGroup>
              </FormControl>
              
              {orderType === 'delivery' ? (
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Shipping Address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  sx={{ mb: 2 }}
                  error={!shippingAddress && error?.includes('shipping address')}
                  helperText={!shippingAddress && error?.includes('shipping address') ? 'Shipping address is required' : ''}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You've selected self-pickup. The artist will provide the pickup location after your order is confirmed.
                </Typography>
              )}
              
              <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  name="payment-method"
                >
                  <FormControlLabel value="kaspi" control={<Radio />} label="Kaspi Pay" />
                  <FormControlLabel value="cash" control={<Radio />} label="Cash on Pickup/Delivery" />
                </RadioGroup>
              </FormControl>

              {paymentMethod === 'kaspi' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  After checkout, you'll see Kaspi QR codes to pay each artist separately.
                </Alert>
              )}
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleCheckout}
                disabled={orderType === 'delivery' && !shippingAddress}
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