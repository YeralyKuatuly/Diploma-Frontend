import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Paper,
} from '@mui/material';
import { getOrders } from '../api';

// Map of status codes to display colors
const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'error',
};

// Map of delivery status codes to display names
const DELIVERY_STATUS = {
  awaiting: 'Awaiting Processing',
  preparing: 'Preparing Artwork',
  ready: 'Ready for Pickup',
  on_road: 'On the Road',
  arrived: 'Arrived',
  delivered: 'Delivered',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(response);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading your orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>You don't have any orders yet</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Browse Artworks
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Orders</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Browse More Artworks
        </Button>
      </Box>

      <List>
        {orders.map((order) => (
          <Paper 
            key={order.id} 
            elevation={2} 
            sx={{ mb: 3, overflow: 'hidden' }}
          >
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #eee' }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs>
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip 
                    label={order.status.toUpperCase()} 
                    color={STATUS_COLORS[order.status] || 'default'} 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    label={DELIVERY_STATUS[order.delivery_status] || order.delivery_status.toUpperCase()} 
                    color={order.delivery_status === 'delivered' ? 'success' : 'info'}
                    variant="outlined"
                  />
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    onClick={() => handleViewOrder(order.id)}
                  >
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <CardContent>
              <Typography 
                variant="subtitle1" 
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                {order.order_type === 'pickup' ? 'Self Pickup' : 'Delivery'} • 
                {order.payment_method === 'kaspi' ? ' Kaspi Pay' : ' Cash'} • 
                ${order.total_amount}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2}>
                {order.items.slice(0, 3).map((item) => (
                  <Grid item xs={12} sm={4} key={item.id}>
                    <Box display="flex" alignItems="center">
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 2,
                          backgroundImage: `url(${item.artwork.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 1
                        }}
                      />
                      <Box>
                        <Typography variant="body2" noWrap sx={{ width: '180px' }}>
                          {item.artwork.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${item.price} × {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
                
                {order.items.length > 3 && (
                  <Grid item xs={12} sm={4}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      sx={{ height: '100%' }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        +{order.items.length - 3} more items
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default Orders; 