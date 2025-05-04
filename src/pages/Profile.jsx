import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, deleteAccount } from "../api";
import "../styles/Profile.css";

// Default profile picture
const DEFAULT_PROFILE_PIC = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    profile_picture: null,
    telegram: '',
    whatsapp: '',
    contact_email: '',
    kaspi_phone: '',
    kaspi_card_number: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const data = await getUserProfile();
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          bio: data.artist?.bio || '',
          profile_picture: null,
          telegram: data.artist?.telegram || '',
          whatsapp: data.artist?.whatsapp || '',
          contact_email: data.artist?.contact_email || '',
          kaspi_phone: data.artist?.kaspi_phone || '',
          kaspi_card_number: data.artist?.kaspi_card_number || ''
        });
        
        // Set preview URL from API or default
        if (data.artist?.profile_picture) {
          setPreviewUrl(data.artist.profile_picture);
        } else {
          setPreviewUrl(DEFAULT_PROFILE_PIC);
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
        setPreviewUrl(DEFAULT_PROFILE_PIC);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('bio', formData.bio);
      submitData.append('telegram', formData.telegram);
      submitData.append('whatsapp', formData.whatsapp);
      submitData.append('contact_email', formData.contact_email);
      submitData.append('kaspi_phone', formData.kaspi_phone);
      submitData.append('kaspi_card_number', formData.kaspi_card_number);
      
      // Only append profile picture if it was selected
      if (formData.profile_picture) {
        submitData.append('profile_picture', formData.profile_picture);
      }

      await updateUserProfile(submitData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteAccount();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      } catch (err) {
        setError('Failed to delete account');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-image-section">
          <div className="profile-image-container">
            <img 
              src={previewUrl || DEFAULT_PROFILE_PIC} 
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PROFILE_PIC;
              }}
            />
          </div>
          
          <div className="profile-image-controls">
            <input
              type="file"
              accept="image/*"
              id="profile_picture"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              className="upload-image-button"
              onClick={() => fileInputRef.current.click()}
            >
              Upload New Photo
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telegram">Telegram</label>
          <input
            type="text"
            id="telegram"
            name="telegram"
            value={formData.telegram}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact_email">Contact Email</label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </div>
        
        {/* Kaspi Payment Details Section */}
        {profile && profile.artist && (
          <>
            <h3 className="section-title">Kaspi Payment Details</h3>
            <p className="section-description">These details are required to generate QR codes for Kaspi payments</p>
            
            <div className="form-group">
              <label htmlFor="kaspi_phone">Kaspi Phone Number</label>
              <input
                type="text"
                id="kaspi_phone"
                name="kaspi_phone"
                value={formData.kaspi_phone}
                onChange={handleChange}
                placeholder="Enter your Kaspi phone number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="kaspi_card_number">Kaspi Card Number</label>
              <input
                type="text"
                id="kaspi_card_number"
                name="kaspi_card_number"
                value={formData.kaspi_card_number}
                onChange={handleChange}
                placeholder="Enter your Kaspi card number"
              />
            </div>
          </>
        )}
        
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="save-button">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
      
      {profile && profile.artist && (
        <div className="artist-actions">
          <h3>Artist Actions</h3>
          <div className="artist-buttons">
            <button 
              onClick={() => navigate(`/artist/${profile.artist.id}`)} 
              className="view-artworks-button"
            >
              View My Artworks
            </button>
            <button 
              onClick={() => navigate('/add-art')} 
              className="add-artwork-button"
            >
              Add New Artwork
            </button>
          </div>
        </div>
      )}
      
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <button 
          onClick={handleDeleteAccount} 
          disabled={isLoading}
          className="delete-account-button"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile; 