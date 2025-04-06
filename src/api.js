import axios from "axios";

// Define API URL with correct path prefix
export const API_URL = "http://localhost:8000/api";

// Get token from localStorage
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Create an axios instance for authenticated requests
export const createAuthAxios = () => {
  const instance = axios.create({
    baseURL: 'http://localhost:8000'
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Debug logging
      console.log(`Auth request to: ${config.url}`);
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle token expiration
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response) {
        // Check if the error is due to token issues
        const { status, data } = error.response;
        
        if (status === 401 && data.code) {
          switch (data.code) {
            case 'token_expired':
            case 'token_blacklisted':
            case 'authentication_failed':
              // Clear tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              
              // Redirect to login page
              window.location.href = '/login';
              break;
            default:
              break;
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create a singleton instance
const authAxios = createAuthAxios();

// Artworks
export const getArtworks = async () => {
  try {
    const response = await axios.get(`${API_URL}/artworks/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching artworks:", error);
    return [];
  }
};

export const getArtworkById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/artworks/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching artwork ${id}:`, error);
    throw error;
  }
};

export const createArtwork = async (artworkData) => {
  try {
    console.log("Creating artwork with data:", artworkData);
    // Log the form data contents
    for (let pair of artworkData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
        `File: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)` : 
        pair[1]));
    }
    
    const response = await authAxios.post(`${API_URL}/artworks/`, artworkData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Artwork creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating artwork:", error);
    if (error.response && error.response.data) {
      console.error("Server error details:", error.response.data);
      throw new Error(error.response.data.detail || "Failed to create artwork");
    }
    throw error;
  }
};

export const updateArtwork = async (id, artworkData) => {
  try {
    console.log("Updating artwork with data:", artworkData);
    const response = await authAxios.patch(`${API_URL}/artworks/${id}/`, artworkData, {
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
    await authAxios.delete(`${API_URL}/artworks/${id}/`);
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
    const response = await axios.get(`${API_URL}/artists/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
};

export const getArtistById = async (id) => {
  try {
    console.log(`Fetching artist with ID: ${id}`);
    const response = await axios.get(`${API_URL}/artists/${id}/`);
    console.log("Artist data received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching artist ${id}:`, error);
    throw error;
  }
};

// Authentication
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      username,
      password
    });
    
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Login failed");
    }
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = Object.keys(errorData)
        .map(key => `${key}: ${errorData[key]}`)
        .join(', ');
      throw new Error(errorMessage || "Registration failed");
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authAxios.post(`${API_URL}/auth/logout/`, {
        refresh_token: refreshToken
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
    const response = await authAxios.get(`${API_URL}/auth/profile/`);
    const data = response.data;
    
    // Debug profile picture URL
    if (data.artist && data.artist.profile_picture) {
      console.log("Profile picture URL:", data.artist.profile_picture);
      const isValid = await checkImageUrl(data.artist.profile_picture);
      console.log("Profile picture URL is valid:", isValid);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (artistId, profileData) => {
  try {
    console.log("Updating profile with data:", profileData);
    
    // Log the form data contents
    for (let pair of profileData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
        `File: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)` : 
        pair[1]));
    }
    
    // Make sure we're using the correct URL
    const url = `${API_URL}/artists/${artistId}/`;
    console.log("Request URL:", url);
    
    const response = await authAxios.patch(url, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Profile update response:", response.data);
    
    // If profile_picture is in the response, check if it's a valid URL
    if (response.data.profile_picture) {
      console.log("Updated profile picture URL:", response.data.profile_picture);
      
      // Try to load the image to verify it works
      const img = new Image();
      img.onload = () => console.log("Profile picture loaded successfully");
      img.onerror = () => console.error("Failed to load profile picture");
      img.src = response.data.profile_picture;
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
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

export const deleteAccount = async () => {
  try {
    await authAxios.delete(`${API_URL}/auth/delete/`);
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

// Subscriptions
export const subscribeToArtist = async (artistId) => {
  try {
    const response = await authAxios.post(`${API_URL}/artists/${artistId}/subscribe/`);
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
    const response = await authAxios.post(`${API_URL}/artists/${artistId}/unsubscribe/`);
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
    const response = await authAxios.get(`${API_URL}/notifications/`);
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
    const response = await authAxios.post(`${API_URL}/notifications/${notificationId}/mark_read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authAxios.post(`${API_URL}/notifications/mark_all_read/`);
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// User subscriptions
export const getUserSubscriptions = async () => {
  try {
    const response = await authAxios.get(`${API_URL}/auth/subscriptions/`);
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
    const response = await authAxios.get(`${API_URL}/cart/me/`);
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
    console.log(`Adding artwork ${artworkId} to cart, quantity: ${quantity}`);
    // Log the request payload for debugging
    const payload = {
      artwork_id: artworkId,
      quantity: quantity
    };
    console.log("Request payload:", payload);
    console.log("Request URL:", `${API_URL}/cart/add_item/`);
    console.log("Authorization token exists:", !!getAccessToken());
    
    const response = await authAxios.post(`${API_URL}/cart/add_item/`, payload);
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

export const removeFromCart = async (artworkId, quantity = 1) => {
  try {
    console.log(`Removing artwork ${artworkId} from cart, quantity: ${quantity}`);
    const response = await authAxios.post(`${API_URL}/cart/remove_item/`, {
      artwork_id: artworkId,
      quantity: quantity
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

// Order functions
export const getOrders = async () => {
  try {
    console.log("Fetching orders");
    const response = await authAxios.get(`${API_URL}/orders/`);
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
    const response = await authAxios.get(`${API_URL}/orders/${orderId}/`);
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
    const response = await authAxios.post(`${API_URL}/orders/`, {
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
    const response = await authAxios.post(`${API_URL}/orders/${orderId}/cancel/`);
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