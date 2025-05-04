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

// Map of payment status codes to display colors
const PAYMENT_STATUS = {
  pending: 'Awaiting Payment',
  completed: 'Payment Completed',
  failed: 'Payment Failed',
  expired: 'Payment Expired',
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
        
        // Check if this user is an artist AND has items in this order
        // First, check if the user is an artist
        if (profile?.artist) {
          // Then check if they have artworks in this order
          const artistId = profile.artist.id;
          const artistHasItemsInOrder = orderData.items.some(
            item => item.artwork.artist.id === artistId
          );
          
          // Only set isArtist to true if they are the artist for some items in this order
          setIsArtist(artistHasItemsInOrder);
        } else {
          setIsArtist(false);
        }
        
        // If it's a kaspi payment, fetch payment details
        if (orderData.payment_method === 'kaspi') {
          try {
            setLoadingQRCodes(true);
            try {
              const qrData = await getPaymentQRCodes(id);
              setPaymentQRCodes(qrData.payments || []);
            } catch (qrError) {
              console.error('Error loading payment details:', qrError);
              // If no payment details are available, set to empty array
              setPaymentQRCodes([]);
              
              // We'll still continue since we can show the order without payment details
              console.log('Continuing without payment details');
            }
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
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Artist Actions</Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      As an artist, you can update the order status after receiving payment.
                    </Alert>
                    
                    <Grid container spacing={2}>
                      {order.order_type === 'pickup' && (
                        <Grid item xs={12}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            onClick={() => openDialog('pickup')}
                            disabled={action.loading || order.status === 'cancelled'}
                            startIcon={<span role="img" aria-label="location">📍</span>}
                          >
                            {order.pickup_location ? 'Update Pickup Location' : 'Set Pickup Location'}
                          </Button>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          fullWidth
                          onClick={() => openDialog('delivery')}
                          disabled={action.loading || order.status === 'cancelled'}
                          startIcon={<span role="img" aria-label="delivery">📦</span>}
                        >
                          Update Delivery Status
                        </Button>
                      </Grid>
                      
                      {order.payment_method === 'kaspi' && 
                        paymentQRCodes.filter(p => 
                          p.artist.id === userProfile?.artist?.id && 
                          p.status !== 'completed'
                        ).map(payment => (
                          <Grid item xs={12} key={payment.id}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              fullWidth
                              onClick={() => handleCompletePayment(payment.id)}
                              disabled={action.loading}
                              startIcon={<span role="img" aria-label="money">💰</span>}
                            >
                              Mark Payment as Received
                            </Button>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                              Amount: ${payment.amount}
                            </Typography>
                          </Grid>
                        ))
                      }
                    </Grid>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                      Remember to update the delivery status regularly to keep your customer informed.
                    </Typography>
                  </CardContent>
                </Card>
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
                <Typography variant="h6" gutterBottom>Payment Information</Typography>
                
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
                          Status: {PAYMENT_STATUS[payment.status] || payment.status.toUpperCase()}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Kaspi Payment Details
                          </Typography>
                          
                          {payment.recipient_phone && (
                            <Typography variant="body2" gutterBottom>
                              Phone Number: <span style={{ fontWeight: 'bold' }}>{payment.recipient_phone}</span>
                            </Typography>
                          )}
                          
                          {payment.recipient_card && (
                            <Typography variant="body2" gutterBottom>
                              Card Number: <span style={{ fontWeight: 'bold' }}>{payment.recipient_card}</span>
                            </Typography>
                          )}
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Please use Kaspi mobile app to transfer the exact amount shown above to the artist's account.
                          </Typography>
                        </Box>
                        
                        {/* Customer guidance */}
                        {!isArtist && payment.status !== 'completed' && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            After completing your Kaspi payment, the artist will update the order status.
                          </Alert>
                        )}

                        {/* If payment is completed, show success message */}
                        {payment.status === 'completed' && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            Payment completed. Thank you!
                          </Alert>
                        )}
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No payment details available. Please contact the artist directly.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          
          {order.payment_method === 'cash' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cash Payment</Typography>
                <Alert severity="info">
                  {order.order_type === 'pickup' 
                    ? 'Please pay in cash when you pick up your items.'
                    : 'Please pay in cash upon delivery.'}
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Artist Contact Information */}
          {!isArtist && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Artist Contact Information</Typography>
                
                {/* Group items by artist and show contact info */}
                {Object.values(
                  order.items.reduce((acc, item) => {
                    const artistId = item.artwork.artist.id;
                    if (!acc[artistId]) {
                      acc[artistId] = {
                        artist: item.artwork.artist,
                        items: []
                      };
                    }
                    acc[artistId].items.push(item);
                    return acc;
                  }, {})
                ).map(({ artist, items }) => (
                  <Box key={artist.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {artist.name} ({items.length} item{items.length > 1 ? 's' : ''})
                    </Typography>
                    
                    <Box sx={{ ml: 2, mt: 1 }}>
                      {artist.contact_email && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Email:</strong> {artist.contact_email}
                        </Typography>
                      )}
                      
                      {artist.telegram && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Telegram:</strong> {artist.telegram}
                        </Typography>
                      )}
                      
                      {artist.whatsapp && (
                        <Typography variant="body2" gutterBottom>
                          <strong>WhatsApp:</strong> {artist.whatsapp}
                        </Typography>
                      )}
                      
                      {!artist.contact_email && !artist.telegram && !artist.whatsapp && (
                        <Typography variant="body2" color="text.secondary">
                          No contact information available.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  If you have any questions about your order, please contact the artists directly using the information above.
                </Alert>
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