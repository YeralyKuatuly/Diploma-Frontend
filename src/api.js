import axios from "axios";
import { jwtDecode } from 'jwt-decode';

// Define API URL with correct path prefix and fallback
const DEFAULT_API_URL = "http://46.101.105.28/api";
export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

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
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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

// Create a singleton instance
const authAxios = createAuthAxios();

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
      await authAxios.post('/auth/logout/', {
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
    const response = await authAxios.get('/auth/profile/');
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
    
    const response = await authAxios.put('/auth/profile/', userData, {
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
    await authAxios.delete('/auth/delete/');
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
    const response = await authAxios.post('/artworks/', artworkData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateArtwork = async (id, artworkData) => {
  try {
    console.log("Updating artwork with data:", artworkData);
    const response = await authAxios.put(`/artworks/${id}/`, artworkData, {
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
    await authAxios.delete(`/artworks/${id}/`);
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
    const response = await authAxios.get('/artists/');
    return response.data;
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};

export const getArtistById = async (id) => {
  try {
    console.log(`Fetching artist with ID: ${id}`);
    const response = await authAxios.get(`/artists/${id}/`);
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
    const response = await authAxios.post(`/artists/${artistId}/subscribe/`);
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
    const response = await authAxios.post(`/artists/${artistId}/unsubscribe/`);
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
    const response = await authAxios.get('/notifications/');
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
    const response = await authAxios.post(`/notifications/${notificationId}/mark_read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authAxios.post('/notifications/mark_all_read/');
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// User subscriptions
export const getUserSubscriptions = async () => {
  try {
    const response = await authAxios.get('/auth/subscriptions/');
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
    const response = await authAxios.get('/cart/');
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
      artwork: artworkId,
      quantity: quantity,
    };
    console.log("Request payload:", payload);
    console.log("Request URL:", `/cart/items/`);
    console.log("Authorization token exists:", !!getAccessToken());
    
    const response = await authAxios.post('/cart/items/', payload);
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
    const response = await authAxios.put(`/cart/items/${itemId}/`, {
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update cart item' };
  }
};

export const removeFromCart = async (itemId) => {
  try {
    console.log(`Removing item ${itemId} from cart`);
    const response = await authAxios.delete(`/cart/items/${itemId}/`);
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
    await authAxios.delete('/cart/clear/');
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};

// Order functions
export const getOrders = async () => {
  try {
    console.log("Fetching orders");
    const response = await authAxios.get('/orders/');
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
    const response = await authAxios.get(`/orders/${orderId}/`);
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

export const createOrder = async (shippingAddress) => {
  try {
    console.log("Creating order with shipping address:", shippingAddress);
    const response = await authAxios.post('/orders/', {
      shipping_address: shippingAddress
    });
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
    const response = await authAxios.post(`/orders/${orderId}/cancel/`);
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