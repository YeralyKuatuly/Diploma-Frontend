import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, getAccessToken } from "../api";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }
    
    fetchProfile();
  }, [navigate]);

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      console.log("Profile data:", data);
      setProfile(data);
      setArtistName(data.artist.name);
      setBio(data.artist.bio || "");
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate preview when file is selected
  useEffect(() => {
    if (!profileImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(profileImage);
    setImagePreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file.name, file.type, file.size);
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file is too large (max 5MB)");
        return;
      }
      
      setProfileImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", artistName);
      formData.append("bio", bio);
      
      if (profileImage) {
        console.log("Appending profile image to form data:", profileImage.name);
        formData.append("profile_picture", profileImage);
      }

      console.log("Submitting form data to update profile for artist ID:", profile.artist.id);
      const updatedProfile = await updateUserProfile(profile.artist.id, formData);
      
      // Update local state with new data
      setProfile({
        ...profile,
        artist: updatedProfile
      });
      
      // Clear the file input
      const fileInput = document.getElementById('profileImage');
      if (fileInput) {
        fileInput.value = '';
      }
      
      setUpdateSuccess(true);
      setIsEditing(false);
      setProfileImage(null);
      
      // Force a reload of the profile after a short delay
      setTimeout(() => {
        fetchProfile();
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  if (error && !profile) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {error && <div className="error-message">{error}</div>}
      {updateSuccess && <div className="success-message">Profile updated successfully!</div>}
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-header">
            <div className="profile-image-container">
              <img 
                src={profile.artist.profile_picture || '/default-profile.jpg'} 
                alt={profile.artist.name} 
                className="profile-image"
                onError={(e) => {
                  console.error("Error loading profile image:", e);
                  console.log("Image source was:", e.target.src);
                  e.target.src = '/default-profile.jpg';
                }}
              />
            </div>
            
            <div className="profile-info">
              <h2>{profile.artist.name}</h2>
              <p className="username">@{profile.username}</p>
              <p className="email">{profile.email}</p>
            </div>
          </div>
          
          <div className="profile-bio">
            <h3>Bio</h3>
            <p>{profile.artist.bio || "No bio yet. Add one to tell people about yourself!"}</p>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile.artist.artwork_count || 0}</span>
              <span className="stat-label">Artworks</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-button"
            >
              Edit Profile
            </button>
            <button 
              onClick={() => navigate("/add-art")}
              className="add-art-button"
            >
              Add New Artwork
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group">
            <label htmlFor="artistName">Artist Name</label>
            <input
              type="text"
              id="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
              placeholder="Tell people about yourself"
            />
          </div>
          
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="profile-image-upload">
              <div className="current-image">
                <img 
                  src={imagePreview || profile.artist.profile_picture || "/default-profile.jpg"} 
                  alt="Profile Preview" 
                  className="profile-image-preview"
                  onError={(e) => {
                    e.target.src = '/default-profile.jpg';
                  }}
                />
              </div>
              
              <div className="image-upload-controls">
                <label htmlFor="profileImage" className="file-input-label">
                  Choose New Image
                </label>
                <input
                  type="file"
                  id="profileImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setImagePreview(null);
                setProfileImage(null);
                setArtistName(profile.artist.name);
                setBio(profile.artist.bio || "");
              }}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateLoading}
              className="save-button"
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile; 