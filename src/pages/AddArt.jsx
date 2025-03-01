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
  const [userArtists, setUserArtists] = useState([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/login", { state: { from: "/add-art" } });
    }
  }, [navigate]);

  // Fetch artists and identify user's artist profiles
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getArtists();
        setArtists(data);
        
        // Get current user info from token
        const token = getAccessToken();
        if (token) {
          try {
            // Decode the JWT token to get user ID
            const tokenParts = token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            const userId = payload.user_id;
            
            // Filter artists that belong to the current user
            const currentUserArtists = data.filter(artist => 
              artist.user && artist.user.id === userId
            );
            
            setUserArtists(currentUserArtists);
            
            // If user has only one artist profile, select it automatically
            if (currentUserArtists.length === 1) {
              setArtistId(currentUserArtists[0].id);
            }
          } catch (err) {
            console.error("Error decoding token:", err);
          }
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
    setError(null);
    
    try {
      if (!userArtists.length) {
        throw new Error("Artist profile not found");
      }
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("artist_id", userArtists[0].id);
      
      if (imageFile) {
        console.log("Appending image file:", imageFile.name);
        formData.append("image_file", imageFile);
      } else if (imageUrl) {
        formData.append("image_url", imageUrl);
      } else {
        throw new Error("Please provide an image file or URL");
      }
      
      const newArtwork = await createArtwork(formData);
      console.log("New artwork created:", newArtwork);
      
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setImageUrl("");
      setPreview(null);
      
      // Show success message
      setSuccess(true);
      
      // Navigate to the artwork detail page after a delay
      setTimeout(() => {
        navigate(`/artwork/${newArtwork.id}`);
      }, 2000);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || "Failed to create artwork");
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
          {userArtists.length === 1 ? (
            <div className="selected-artist">
              <p>You'll publish as: <strong>{userArtists[0].name}</strong></p>
              <input type="hidden" value={userArtists[0].id} />
            </div>
          ) : (
            <select
              id="artist"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              required
            >
              <option value="">Select Artist</option>
              {userArtists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} (Your profile)
                </option>
              ))}
            </select>
          )}
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