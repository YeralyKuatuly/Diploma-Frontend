import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { 
  getOrderById, 
  cancelOrder, 
  getPaymentQRCodes,
  completePayment,
  updateDeliveryStatus,
  updatePickupLocation,
  getUserProfile
} from '../api';

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

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentQRCodes, setPaymentQRCodes] = useState([]);
  const [loadingQRCodes, setLoadingQRCodes] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isArtist, setIsArtist] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [newDeliveryStatus, setNewDeliveryStatus] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [action, setAction] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Fetch order details on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch order data
        const orderData = await getOrderById(id);
        setOrder(orderData);
        
        // Fetch user profile to check if user is an artist
        const profile = await getUserProfile();
        setUserProfile(profile);
        setIsArtist(profile?.artist !== null);
        
        // If it's a kaspi payment, fetch QR codes
        if (orderData.payment_method === 'kaspi') {
          try {
            setLoadingQRCodes(true);
            const qrData = await getPaymentQRCodes(id);
            setPaymentQRCodes(qrData.payments || []);
          } catch (qrError) {
            console.error('Error loading QR codes:', qrError);
          } finally {
            setLoadingQRCodes(false);
          }
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      setAction({ loading: true, error: null, success: null });
      const updatedOrder = await cancelOrder(id);
      setOrder(updatedOrder);
      setAction({ 
        loading: false, 
        error: null, 
        success: 'Order cancelled successfully' 
      });
    } catch (err) {
      console.error('Error cancelling order:', err);
      setAction({ 
        loading: false, 
        error: err.response?.data?.detail || 'Failed to cancel order', 
        success: null 
      });
    }
  };

  // Handle mark payment as complete
  const handleCompletePayment = async (paymentId) => {
    try {
      setAction({ loading: true, error: null, success: null });
      const updatedOrder = await completePayment(id, paymentId);
      setOrder(updatedOrder);
      setAction({ 
        loading: false, 
        error: null, 
        success: 'Payment marked as complete' 
      });
    } catch (err) {
      console.error('Error completing payment:', err);
      setAction({ 
        loading: false, 
        error: err.response?.data?.detail || 'Failed to complete payment', 
        success: null 
      });
    }
  };

  // Dialog handlers
  const openDialog = (type) => {
    setDialogType(type);
    if (type === 'delivery') {
      setNewDeliveryStatus(order.delivery_status);
    } else if (type === 'pickup') {
      setPickupLocation(order.pickup_location || '');
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setNewDeliveryStatus('');
    setPickupLocation('');
  };

  // Handle update delivery status
  const handleUpdateDeliveryStatus = async () => {
    try {
      setAction({ loading: true, error: null, success: null });
      const updatedOrder = await updateDeliveryStatus(id, newDeliveryStatus);
      setOrder(updatedOrder);
      setAction({ 
        loading: false, 
        error: null, 
        success: 'Delivery status updated' 
      });
      closeDialog();
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setAction({ 
        loading: false, 
        error: err.response?.data?.detail || 'Failed to update delivery status', 
        success: null 
      });
    }
  };

  // Handle update pickup location
  const handleUpdatePickupLocation = async () => {
    if (!pickupLocation) {
      setAction({ 
        loading: false, 
        error: 'Pickup location cannot be empty', 
        success: null 
      });
      return;
    }
    
    try {
      setAction({ loading: true, error: null, success: null });
      const updatedOrder = await updatePickupLocation(id, pickupLocation);
      setOrder(updatedOrder);
      setAction({ 
        loading: false, 
        error: null, 
        success: 'Pickup location updated' 
      });
      closeDialog();
    } catch (err) {
      console.error('Error updating pickup location:', err);
      setAction({ 
        loading: false, 
        error: err.response?.data?.detail || 'Failed to update pickup location', 
        success: null 
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading order details...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  // If no order found
  if (!order) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>Order not found</Alert>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Order #{order.id}</Typography>
        <Button variant="outlined" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Box>
      
      {action.error && (
        <Alert severity="error" sx={{ mb: 2 }}>{action.error}</Alert>
      )}
      
      {action.success && (
        <Alert severity="success" sx={{ mb: 2 }}>{action.success}</Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Order Details Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Order Status</Typography>
                <Chip 
                  label={order.status.toUpperCase()} 
                  color={STATUS_COLORS[order.status] || 'default'} 
                  variant="outlined"
                />
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Delivery Status</Typography>
                <Chip 
                  label={DELIVERY_STATUS[order.delivery_status] || order.delivery_status.toUpperCase()} 
                  color={order.delivery_status === 'delivered' ? 'success' : 'info'} 
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Order Type: {order.order_type === 'pickup' ? 'Self Pickup' : 'Delivery'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Payment Method: {order.payment_method === 'kaspi' ? 'Kaspi Pay' : 'Cash'}
              </Typography>
              
              {order.order_type === 'delivery' && order.shipping_address && (
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address: {order.shipping_address}
                </Typography>
              )}
              
              {order.order_type === 'pickup' && order.pickup_location && (
                <Typography variant="subtitle1" gutterBottom>
                  Pickup Location: {order.pickup_location}
                </Typography>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                Total Amount: ${order.total_amount}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Order Date: {new Date(order.created_at).toLocaleString()}
              </Typography>
              
              {/* Artist Actions */}
              {isArtist && (
                <Box mt={3}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Artist Actions</Typography>
                  
                  <Grid container spacing={2}>
                    {order.order_type === 'pickup' && (
                      <Grid item xs={12} sm={6}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          onClick={() => openDialog('pickup')}
                          disabled={action.loading || order.status === 'cancelled'}
                        >
                          {order.pickup_location ? 'Update Pickup Location' : 'Set Pickup Location'}
                        </Button>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth
                        onClick={() => openDialog('delivery')}
                        disabled={action.loading || order.status === 'cancelled'}
                      >
                        Update Delivery Status
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Customer Actions */}
              {!isArtist && order.status === 'pending' && (
                <Box mt={3}>
                  <Divider sx={{ my: 2 }} />
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleCancelOrder}
                    disabled={action.loading}
                  >
                    {action.loading ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
          
          {/* Order Items Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <List>
                {order.items.map((item) => (
                  <ListItem key={item.id} divider>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <img 
                          src={item.artwork.image} 
                          alt={item.artwork.title}
                          style={{ width: '100%', height: 'auto' }}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <ListItemText 
                          primary={item.artwork.title}
                          secondary={`by ${item.artwork.artist.name}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body1" align="right">
                          ${item.price} × {item.quantity}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" align="right">
                          ${item.price * item.quantity}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Payments */}
        <Grid item xs={12} md={4}>
          {order.payment_method === 'kaspi' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Kaspi Payments</Typography>
                
                {loadingQRCodes ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }}>Loading payment details...</Typography>
                  </Box>
                ) : paymentQRCodes.length > 0 ? (
                  <List>
                    {paymentQRCodes.map((payment) => (
                      <Paper elevation={2} sx={{ mb: 3, p: 2 }} key={payment.id}>
                        <Typography variant="subtitle1" gutterBottom>
                          Payment to: {payment.artist.name}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Amount: ${payment.amount}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Status: {payment.status.toUpperCase()}
                        </Typography>
                        
                        {payment.qr_code_url ? (
                          <Box textAlign="center" mt={2} mb={2}>
                            <img 
                              src={payment.qr_code_url} 
                              alt="Kaspi QR Code" 
                              style={{ 
                                maxWidth: '100%', 
                                height: 'auto',
                                border: '1px solid #eee',
                                borderRadius: '4px',
                              }}
                            />
                          </Box>
                        ) : (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            QR code not available
                          </Alert>
                        )}
                        
                        {payment.status !== 'completed' && isArtist && (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            onClick={() => handleCompletePayment(payment.id)}
                            disabled={action.loading}
                            sx={{ mt: 2 }}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No payment details available. Please contact support if you believe this is an error.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Dialogs */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'delivery' ? 'Update Delivery Status' : 'Set Pickup Location'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delivery' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Delivery Status</InputLabel>
              <Select
                value={newDeliveryStatus}
                onChange={(e) => setNewDeliveryStatus(e.target.value)}
                label="Delivery Status"
              >
                {Object.entries(DELIVERY_STATUS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {dialogType === 'pickup' && (
            <TextField
              autoFocus
              margin="dense"
              label="Pickup Location"
              fullWidth
              multiline
              rows={4}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={
              dialogType === 'delivery' 
                ? handleUpdateDeliveryStatus 
                : handleUpdatePickupLocation
            }
            color="primary" 
            disabled={action.loading}
          >
            {action.loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail; 