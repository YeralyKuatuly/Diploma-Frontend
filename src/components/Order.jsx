import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import { getOrderById, cancelOrder } from '../api';

const Order = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();

  useEffect(() => {
    console.log("Order component mounted with orderId:", orderId);
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      console.log(`Fetching order with id ${orderId}`);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order');
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      console.log(`Cancelling order with id ${orderId}`);
      await cancelOrder(orderId);
      fetchOrder();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading order details...</Typography>
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

  if (!order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">Order not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {order.items.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
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
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${item.total_price}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="h4" color="primary" gutterBottom>
                  ${order.total_amount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order ID: {order.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(order.created_at).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Shipping Address
                </Typography>
                <Typography variant="body2">{order.shipping_address}</Typography>
              </Box>
              {order.status === 'pending' && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Order; 