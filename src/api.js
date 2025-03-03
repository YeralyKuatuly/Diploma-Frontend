import axios from "axios";

const API_URL = "http://localhost:8000/api";

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
    baseURL: API_URL
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
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

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
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