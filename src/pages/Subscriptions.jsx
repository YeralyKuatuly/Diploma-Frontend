import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserSubscriptions, unsubscribeFromArtist } from "../api";
import { useAuth } from "../context/AuthContext";
import "../styles/Subscriptions.css";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/subscribe' } });
      return;
    }
    
    // Fetch the user's subscribed artists
    fetchSubscriptions();
  }, [isLoggedIn, navigate]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Use our new API function to get subscriptions
      const data = await getUserSubscriptions();
      
      // Set the subscriptions from the API response
      setSubscriptions(data);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to load your subscriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (artistId) => {
    try {
      await unsubscribeFromArtist(artistId);
      // Update the subscriptions list after unsubscribing
      setSubscriptions(subscriptions.filter(artist => artist.id !== artistId));
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="subscriptions-container">
      <h1>Your Subscriptions</h1>
      
      {subscriptions.length === 0 ? (
        <div className="no-subscriptions">
          <p>You haven't subscribed to any artists yet.</p>
          <p>
            Discover talented artists in our <Link to="/artists">Artists Gallery</Link> and 
            subscribe to get notifications when they add new artwork.
          </p>
        </div>
      ) : (
        <div className="subscriptions-grid">
          {subscriptions.map(artist => (
            <div key={artist.id} className="subscription-card">
              <div className="artist-image-container">
                <img 
                  src={artist.profile_picture || '/default-profile.jpg'} 
                  alt={artist.name}
                  className="artist-image"
                  onError={(e) => {
                    e.target.src = '/default-profile.jpg';
                  }}
                />
              </div>
              <div className="artist-info">
                <h2 className="artist-name">{artist.name}</h2>
                <p className="artist-bio">
                  {artist.bio && artist.bio.length > 100 
                    ? `${artist.bio.substring(0, 100)}...` 
                    : artist.bio || "No bio available"}
                </p>
                <div className="subscription-actions">
                  <Link to={`/artist/${artist.id}`} className="view-profile-button">
                    View Profile
                  </Link>
                  <button 
                    className="unsubscribe-button"
                    onClick={() => handleUnsubscribe(artist.id)}
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions; 