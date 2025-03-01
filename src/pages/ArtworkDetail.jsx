import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArtworkById } from "../api";
import "../styles/ArtworkDetail.css";

const ArtworkDetail = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const data = await getArtworkById(id);
        setArtwork(data);
      } catch (err) {
        setError("Failed to load artwork details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading artwork details...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!artwork) return <div className="error-message">Artwork not found</div>;

  return (
    <div className="artwork-detail-container">
      <div className="artwork-detail-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Back to Gallery
        </button>
      </div>

      <div className="artwork-detail-content">
        <div className="artwork-detail-image-container">
          <img 
            src={artwork.image} 
            alt={artwork.title} 
            className="artwork-detail-image"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>

        <div className="artwork-detail-info">
          <h1 className="artwork-detail-title">{artwork.title}</h1>
          
          <div className="artwork-detail-artist">
            <Link to={`/artist/${artwork.artist.id}`} className="artist-link">
              by {artwork.artist.name}
            </Link>
          </div>
          
          <div className="artwork-detail-price">
            ${artwork.price}
          </div>
          
          <div className="artwork-detail-description">
            <h2>Description</h2>
            <p>{artwork.description}</p>
          </div>
          
          <div className="artwork-detail-actions">
            <button className="purchase-button">
              Purchase Artwork
            </button>
            <button className="contact-button">
              Contact Artist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail; 