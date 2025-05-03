import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createArtwork, getArtists } from "../api";
import "../styles/AddArt.css";

const AddArt = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    is_available: true  // Set artwork as available by default
  });
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        console.log("Fetching artists...");
        const data = await getArtists();
        console.log("Artists data:", data);
        setArtists(data);
        
        // Find current user's artist profile
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("Token payload:", payload);
            const userId = payload.user_id;
            console.log("Current user ID:", userId);
            
            const userArtist = data.find(artist => artist.user && artist.user.id === userId);
            console.log("Found user artist:", userArtist);
            
            if (userArtist) {
              setCurrentUser(userArtist);
            } else {
              console.log("No matching artist profile found for user");
            }
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        } else {
          console.log("No access token found");
        }
      } catch (err) {
        console.error("Error fetching artists:", err);
        setError("Failed to load artists: " + (err.message || "Unknown error"));
      }
    };
    fetchArtists();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDebugInfo(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formDataToSend = new FormData();
      
      // Only add necessary fields, explicitly excluding 'artist'
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_available', formData.is_available);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      // Log what we're sending
      const formDataDebug = {};
      for (let [key, value] of formDataToSend.entries()) {
        formDataDebug[key] = value instanceof File ? 
          `File: ${value.name} (${value.type}, ${value.size} bytes)` : 
          value;
      }
      console.log("Sending form data:", formDataDebug);
      
      const result = await createArtwork(formDataToSend);
      console.log("Artwork created successfully:", result);
      navigate("/artworks");
    } catch (err) {
      console.error("Error creating artwork:", err);
      // Show detailed error info
      const errorDetails = {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response',
        request: err.request ? 'Request sent but no response' : 'Request not sent'
      };
      console.log("Error details:", errorDetails);
      setDebugInfo(JSON.stringify(errorDetails, null, 2));
      
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        err.message || 
        "Failed to create artwork"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-art-container">
      <h2>Add New Artwork</h2>
      {error && <div className="error-message">{error}</div>}
      
      {currentUser ? (
        <div className="current-artist-info">
          <p>Creating artwork as: <strong>{currentUser.name}</strong></p>
        </div>
      ) : (
        <div className="warning-message">
          <p>You need to be registered as an artist to add artwork.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-art-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image (optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="is_available" className="checkbox-label">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            Available for Purchase
          </label>
          <div className="checkbox-hint">
            When checked, users can add this artwork to their cart and purchase it.
          </div>
        </div>

        <button type="submit" disabled={isLoading || !currentUser}>
          {isLoading ? "Creating..." : "Add Artwork"}
        </button>
      </form>
      
      {debugInfo && (
        <div className="debug-info">
          <h3>Debug Information</h3>
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default AddArt; 