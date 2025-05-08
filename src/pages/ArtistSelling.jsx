import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { getArtistOrders } from '../api';

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

const ArtistSelling = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    delivery_status: '',
    order_type: '',
  });

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching artist orders...');
        setLoading(true);
        const data = await getArtistOrders(filters);
        console.log('Received orders data:', data);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching artist orders:', err);
        setError('Failed to load orders. Make sure you have an artist account.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update filters based on tab
    switch (newValue) {
      case 0: // All Orders
        setFilters({ delivery_status: '', order_type: '' });
        break;
      case 1: // Pending Payment
        setFilters({ delivery_status: 'awaiting', order_type: '' });
        break;
      case 2: // In Delivery
        setFilters({ 
          delivery_status: ['preparing', 'on_road', 'arrived'].join(','), 
          order_type: '' 
        });
        break;
      case 3: // Completed
        setFilters({ delivery_status: 'delivered', order_type: '' });
        break;
      default:
        setFilters({ delivery_status: '', order_type: '' });
    }
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading && !orders.length) {
    console.log('Rendering loading state...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading orders...</Typography>
      </Box>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  console.log('Rendering main content with orders:', orders);
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Selling Dashboard
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="All Orders" />
        <Tab label="Pending Payment" />
        <Tab label="In Delivery" />
        <Tab label="Completed" />
      </Tabs>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Orders
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Delivery Status</InputLabel>
                <Select
                  name="delivery_status"
                  value={filters.delivery_status}
                  onChange={handleFilterChange}
                  label="Delivery Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.entries(DELIVERY_STATUS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Order Type</InputLabel>
                <Select
                  name="order_type"
                  value={filters.order_type}
                  onChange={handleFilterChange}
                  label="Order Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="pickup">Self Pickup</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {!orders.length ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          No orders found matching your filters.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Delivery Info</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>Customer #{order.user.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.order_type === 'pickup' ? 'Self Pickup' : 'Delivery'}
                      color={order.order_type === 'pickup' ? 'info' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${order.total_amount}</TableCell>
                  <TableCell>
                    {order.kaspi_payments?.map((payment, index) => (
                      <Chip
                        key={index}
                        label={payment.status.toUpperCase()}
                        color={payment.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.order_type === 'pickup' ? (
                      <Typography variant="body2">
                        {order.pickup_location || 'Location not set'}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        {order.shipping_address}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={DELIVERY_STATUS[order.delivery_status] || order.delivery_status}
                      color={order.delivery_status === 'delivered' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ArtistSelling; 