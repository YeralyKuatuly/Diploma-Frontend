import axios from "axios";
import { jwtDecode } from 'jwt-decode';

// Define API URL with correct path prefix and fallback
const DEFAULT_API_URL = "http://46.101.105.28/api";
export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

console.log("API URL configured as:", API_URL);

// Create direct axios instance with no authentication
const plainAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Get token from localStorage
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// Create an axios instance for authenticated requests
export const createAuthAxios = () => {
  console.log("Creating auth axios instance with baseURL:", API_URL);
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header added");
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await plainAxios.post('/auth/refresh/', {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('accessToken', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create a new instance each time to ensure we have the latest configuration
const getAuthAxios = () => createAuthAxios();

// Authentication
export const registerUser = async (userData) => {
  try {
    const fullUrl = `${API_URL}/auth/register/`;
    
    // Use direct axios without going through instance to troubleshoot
    const response = await axios({
      method: 'post',
      url: fullUrl,
      data: userData,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const fullUrl = `${API_URL}/auth/login/`;
    
    // Use direct axios without going through instance
    const response = await axios({
      method: 'post',
      url: fullUrl,
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await getAuthAxios().post('/auth/logout/', {
        refresh: refreshToken
      });
    }
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};

// User Profile
export const getUserProfile = async () => {
  try {
    console.log("Getting user profile from:", `${API_URL}/auth/profile/`);
    const response = await getAuthAxios().get('/auth/profile/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add this utility function
export const checkImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("Error checking image URL:", error);
    return false;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    // Check if userData is FormData (for file uploads)
    const isFormData = userData instanceof FormData;
    
    const response = await getAuthAxios().put('/auth/profile/', userData, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data'
      } : {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    await getAuthAxios().delete('/auth/delete/');
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  } catch (error) {
    console.error("Error deleting account:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Failed to delete account");
    }
    throw error;
  }
};

// Artworks
export const getArtworks = async () => {
  try {
    const response = await plainAxios.get('/artworks/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getArtworkById = async (id) => {
  try {
    const response = await plainAxios.get(`/artworks/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createArtwork = async (artworkData) => {
  try {
    console.log("Creating artwork with data:", Object.fromEntries(artworkData.entries()));
    console.log("Request URL:", `${API_URL}/artworks/`);
    
    const authInstance = getAuthAxios();
    const response = await authInstance.post('/artworks/', artworkData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Create artwork error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const updateArtwork = async (id, artworkData) => {
  try {
    console.log("Updating artwork with data:", artworkData);
    const response = await getAuthAxios().put(`/artworks/${id}/`, artworkData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating artwork:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Failed to update artwork");
    }
    throw error;
  }
};

export const deleteArtwork = async (id) => {
  try {
    await getAuthAxios().delete(`/artworks/${id}/`);
    return true;
  } catch (error) {
    console.error("Error deleting artwork:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Failed to delete artwork");
    }
    throw error;
  }
};

// Artists
export const getArtists = async () => {
  try {
    const response = await getAuthAxios().get('/artists/');
    return response.data;
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};

export const getArtistById = async (id) => {
  try {
    console.log(`Fetching artist with ID: ${id}`);
    const response = await getAuthAxios().get(`/artists/${id}/`);
    console.log("Artist data received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching artist ${id}:`, error);
    throw error;
  }
};

// Subscriptions
export const subscribeToArtist = async (artistId) => {
  try {
    const response = await getAuthAxios().post(`/artists/${artistId}/subscribe/`);
    return response.data;
  } catch (error) {
    console.error(`Error subscribing to artist ${artistId}:`, error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Failed to subscribe to artist");
    }
    throw error;
  }
};

export const unsubscribeFromArtist = async (artistId) => {
  try {
    const response = await getAuthAxios().post(`/artists/${artistId}/unsubscribe/`);
    return response.data;
  } catch (error) {
    console.error(`Error unsubscribing from artist ${artistId}:`, error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Failed to unsubscribe from artist");
    }
    throw error;
  }
};

// Notifications
export const getNotifications = async () => {
  try {
    const response = await getAuthAxios().get('/notifications/');
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (error.response && error.response.status !== 401) {  // Don't report 401 errors
      throw new Error("Failed to fetch notifications");
    }
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await getAuthAxios().post(`/notifications/${notificationId}/mark_read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await getAuthAxios().post('/notifications/mark_all_read/');
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// User subscriptions
export const getUserSubscriptions = async () => {
  try {
    const response = await getAuthAxios().get('/auth/subscriptions/');
    return response.data;
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    if (error.response && error.response.status !== 401) {  // Don't report 401 errors
      throw new Error("Failed to fetch subscriptions");
    }
    return [];
  }
};

// Cart functions
export const getCart = async () => {
  try {
    console.log("Fetching cart");
    const response = await getAuthAxios().get('/cart/me/');
    console.log("Cart response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const addToCart = async (artworkId, quantity = 1) => {
  try {
    console.log(`Adding artwork ${artworkId} to cart`);
    // Log the request payload for debugging
    const payload = {
      artwork_id: artworkId,
      quantity: quantity,
    };
    console.log("Request payload:", payload);
    console.log("Request URL:", `/cart/add_item/`);
    console.log("Authorization token exists:", !!getAccessToken());
    
    const response = await getAuthAxios().post('/cart/add_item/', payload);
    console.log("Add to cart response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Error details:", error.response.data.detail || "No detail provided");
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await getAuthAxios().put(`/cart/items/${itemId}/`, {
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update cart item' };
  }
};

export const removeFromCart = async (artworkId) => {
  try {
    console.log(`Removing artwork ${artworkId} from cart`);
    const response = await getAuthAxios().post('/cart/remove_item/', {
      artwork_id: artworkId
    });
    console.log("Remove from cart response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await getAuthAxios().post('/cart/clear/');
    console.log("Clear cart response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};

// Order functions
export const getOrders = async () => {
  try {
    console.log("Fetching orders");
    const response = await getAuthAxios().get('/orders/');
    console.log("Orders response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching order ${orderId}`);
    const response = await getAuthAxios().get(`/orders/${orderId}/`);
    console.log("Order response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", orderData);
    const response = await getAuthAxios().post('/orders/', orderData);
    console.log("Create order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    console.log(`Cancelling order ${orderId}`);
    const response = await getAuthAxios().post(`/orders/${orderId}/cancel/`);
    console.log("Cancel order response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// New functions for Kaspi payments and delivery

export const getPaymentQRCodes = async (orderId) => {
  try {
    console.log(`Fetching payment QR codes for order ${orderId}`);
    const response = await getAuthAxios().get(`/orders/${orderId}/payment-qr-codes/`);
    console.log("Payment QR codes response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment QR codes for order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const completePayment = async (orderId, paymentId) => {
  try {
    console.log(`Completing payment ${paymentId} for order ${orderId}`);
    const response = await getAuthAxios().post(`/orders/${orderId}/complete-payment/${paymentId}/`);
    console.log("Complete payment response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error completing payment for order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

// Artist order management functions
export const getArtistOrders = async (filters = {}) => {
  try {
    console.log("Fetching artist orders with filters:", filters);
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.delivery_status) {
      queryParams.append('delivery_status', filters.delivery_status);
    }
    if (filters.order_type) {
      queryParams.append('order_type', filters.order_type);
    }
    
    const queryString = queryParams.toString();
    const url = `/orders/artist-orders/${queryString ? `?${queryString}` : ''}`;
    
    const response = await getAuthAxios().get(url);
    console.log("Artist orders response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching artist orders:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const updateDeliveryStatus = async (orderId, deliveryStatus) => {
  try {
    console.log(`Updating delivery status for order ${orderId} to ${deliveryStatus}`);
    const response = await getAuthAxios().post(`/orders/${orderId}/update-delivery-status/`, {
      delivery_status: deliveryStatus
    });
    console.log("Update delivery status response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating delivery status for order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const updatePickupLocation = async (orderId, pickupLocation) => {
  try {
    console.log(`Updating pickup location for order ${orderId}`);
    const response = await getAuthAxios().post(`/orders/${orderId}/update-pickup-location/`, {
      pickup_location: pickupLocation
    });
    console.log("Update pickup location response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating pickup location for order ${orderId}:`, error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};