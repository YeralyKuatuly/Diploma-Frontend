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
    artist: "",
  });
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
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
      setError(err.message || "Failed to create artwork");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-art-container">
      <h2>Add New Artwork</h2>
      {error && <div className="error-message">{error}</div>}
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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <select
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
          >
            <option value="">Select an artist</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Add Artwork"}
        </button>
      </form>
    </div>
  );
};

export default AddArt; 