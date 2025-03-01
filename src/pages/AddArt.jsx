import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createArtwork, getArtists, getAccessToken } from "../api";
import "../styles/AddArt.css";

const AddArt = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [artistId, setArtistId] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/login", { state: { from: "/add-art" } });
    }
  }, [navigate]);

  // Fetch artists
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
        // If user has only one artist profile, select it automatically
        if (data.length === 1) {
          setArtistId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load artists");
        console.error(err);
      }
    };

    fetchArtists();
  }, []);

  // Generate preview when file is selected
  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(""); // Clear URL if file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!title || !description || !price || (!imageFile && !imageUrl)) {
        throw new Error("Please fill all required fields");
      }

      if (!artistId) {
        throw new Error("Please select an artist");
      }

      // Create FormData object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("artist_id", artistId);

      if (imageFile) {
        formData.append("image_file", imageFile);
      } else if (imageUrl) {
        formData.append("image_url", imageUrl);
      }

      // Submit the form
      await createArtwork(formData);
      
      // Redirect to gallery on success
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create artwork");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-art-container">
      <h1>Add New Artwork</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="add-art-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist *</label>
          <select
            id="artist"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            required
          >
            <option value="">Select Artist</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Image *</label>
          <div className="image-input-container">
            <div className="file-input-group">
              <label htmlFor="imageFile" className="file-input-label">
                Upload Image
              </label>
              <input
                type="file"
                id="imageFile"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
            </div>
            
            <div className="or-divider">OR</div>
            
            <div className="url-input-group">
              <input
                type="url"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null); // Clear file if URL is entered
                  setPreview(null);
                }}
                disabled={!!imageFile}
              />
            </div>
          </div>
        </div>

        {preview && (
          <div className="image-preview">
            <h3>Image Preview</h3>
            <img src={preview} alt="Preview" />
          </div>
        )}

        {imageUrl && !imageFile && (
          <div className="image-preview">
            <h3>Image Preview</h3>
            <img 
              src={imageUrl} 
              alt="Preview" 
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
                setError("Invalid image URL. Please provide a valid URL or upload a file.");
              }}
            />
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/")}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Submitting..." : "Add Artwork"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddArt; 