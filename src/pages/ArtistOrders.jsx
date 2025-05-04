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

const ArtistOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    delivery_status: '',
    order_type: '',
  });

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getArtistOrders(filters);
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

  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading && !orders.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Your Artwork Orders
      </Typography>
      
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
                <TableCell>Status</TableCell>
                <TableCell>Delivery Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>Customer #{order.user.id}</TableCell>
                  <TableCell>{order.order_type === 'pickup' ? 'Self Pickup' : 'Delivery'}</TableCell>
                  <TableCell>${order.total_amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={STATUS_COLORS[order.status] || 'default'}
                      size="small"
                    />
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

export default ArtistOrders; 