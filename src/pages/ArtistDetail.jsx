import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArtistById, subscribeToArtist, unsubscribeFromArtist } from "../api";
import { useAuth } from "../context/AuthContext";
import "../styles/ArtistDetail.css";

const DEFAULT_PROFILE_PIC = '/default-profile.jpg';

const ArtistDetail = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const data = await getArtistById(id);
        console.log("Artist data:", data); // Debug log
        setArtist(data);
      } catch (err) {
        setError("Failed to load artist details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/artist/${id}` } });
      return;
    }

    try {
      setIsSubscribing(true);
      if (artist.is_subscribed) {
        await unsubscribeFromArtist(id);
        setArtist({ ...artist, is_subscribed: false });
      } else {
        await subscribeToArtist(id);
        setArtist({ ...artist, is_subscribed: true });
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading artist profile...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!artist) return <div className="error-message">Artist not found</div>;

  return (
    <div className="artist-detail-container">
      <div className="artist-detail-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Back
        </button>
      </div>

      <div className="artist-profile">
        <div className="artist-profile-header">
          <div className="artist-profile-image-container">
            <img 
              src={artist.profile_picture || DEFAULT_PROFILE_PIC} 
              alt={artist.name} 
              className="artist-profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PROFILE_PIC;
              }}
            />
          </div>
          
          <div className="artist-profile-info">
            <h1>{artist.name}</h1>
            <p className="artist-stats">
              <span className="artwork-count">
                {artist.artwork_count || 0} {artist.artwork_count === 1 ? 'Artwork' : 'Artworks'}
              </span>
            </p>
            <p className="artist-profile-bio">{artist.bio || "No bio available"}</p>
            
            <button 
              className={`subscribe-button ${artist.is_subscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? 'Processing...' : 
                artist.is_subscribed ? 'Unsubscribe' : 'Subscribe for Updates'}
            </button>
          </div>
        </div>
        
        <div className="artist-artworks">
          <h2>Artworks by {artist.name}</h2>
          
          {artist.artworks && artist.artworks.length > 0 ? (
            <div className="artist-artworks-grid">
              {artist.artworks.map(artwork => (
                <div key={artwork.id} className="artwork-card">
                  <div className="artwork-image-container">
                    <img 
                      src={artwork.image} 
                      alt={artwork.title} 
                      className="artwork-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="artwork-details">
                    <h3 className="artwork-title">{artwork.title}</h3>
                    <p className="artwork-price">${artwork.price}</p>
                    <Link to={`/artwork/${artwork.id}`} className="view-details-button">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-artworks">
              <p>This artist hasn't uploaded any artworks yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail; 