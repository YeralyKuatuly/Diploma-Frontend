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
        throw error.response?.data || error.message;
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post("http://localhost:8000/api/auth/login/", {
            username: email,  // We send email as username
            password: password,
        });

        console.log("Login Response:", response.data); // Debugging output

        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response ? error.response.data : error.message);
        throw error;
    }
};


export const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => {
    return localStorage.getItem("accessToken");
};