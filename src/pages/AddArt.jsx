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
  });
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
        
        // Find current user's artist profile
        const token = localStorage.getItem('accessToken');
        if (token) {
          const userId = JSON.parse(atob(token.split('.')[1])).user_id;
          const userArtist = data.find(artist => artist.user.id === userId);
          if (userArtist) {
            setCurrentUser(userArtist);
          }
        }
      } catch (err) {
        setError("Failed to load artists");
      }
    };
    fetchArtists();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      await createArtwork(formDataToSend);
      navigate("/artworks");
    } catch (err) {
      console.error("Error creating artwork:", err);
      setError(err.response?.data?.detail || err.message || "Failed to create artwork");
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
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
        </div>

        <button type="submit" disabled={isLoading || !currentUser}>
          {isLoading ? "Creating..." : "Add Artwork"}
        </button>
      </form>
    </div>
  );
};

export default AddArt; 