import axios from "axios";

const API_URL = "http://localhost:8000/api/";

// Get token from localStorage
export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// Create axios instance with auth header
const authAxios = axios.create({
    baseURL: API_URL,
});

// Add interceptor to add token to requests
authAxios.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add interceptor to handle token expiration
authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 (Unauthorized) and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                
                const response = await axios.post(`${API_URL}auth/token/refresh/`, {
                    refresh: refreshToken
                });
                
                // Store the new access token
                localStorage.setItem('accessToken', response.data.access);
                
                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out the user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event('storage')); // Trigger storage event to update auth state
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// Authentication functions
export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}auth/login/`, {
            username,
            password
        });
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}auth/register/`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Use authAxios for authenticated requests
export const getArtworks = async () => {
    try {
        const response = await axios.get(`${API_URL}artworks/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getArtworkById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}artworks/${id}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createArtwork = async (formData) => {
    try {
        const response = await authAxios.post(`artworks/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getArtists = async () => {
    try {
        const response = await axios.get(`${API_URL}artists/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};