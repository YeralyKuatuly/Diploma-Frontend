import axios from "axios";

const API_URL = "http://localhost:8000/api/";

export const getArtists = async () => {
    try {
        const response = await axios.get(`${API_URL}artists/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getArtworks = async () => {
    try {
        const response = await axios.get(`${API_URL}artworks/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching artworks:", error);
        return [];
    }
};

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

export const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => {
    return localStorage.getItem("accessToken");
};

export const createArtwork = async (formData) => {
    try {
        const token = getAccessToken();
        if (!token) {
            throw new Error("You must be logged in to create artwork");
        }
        
        const response = await axios.post(`${API_URL}artworks/`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });
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