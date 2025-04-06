import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArtworkById, deleteArtwork, getUserProfile, addToCart } from "../api";
import "../styles/ArtworkDetail.css";

const ArtworkDetail = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artwork data
        const artworkData = await getArtworkById(id);
        setArtwork(artworkData);

        // Try to fetch user profile
        try {
          const profileData = await getUserProfile();
          setUserProfile(profileData);
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Don't set error state for profile fetch failure
        }
      } catch (err) {
        setError("Failed to load artwork details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await deleteArtwork(id);
        navigate("/");
      } catch (err) {
        console.error("Error deleting artwork:", err);
        alert("Failed to delete artwork");
      }
    }
  };

  const handlePurchase = async () => {
    if (!userProfile) {
      // User is not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    // Check if artwork is available for purchase
    if (!artwork.is_available) {
      setPurchaseMessage("This artwork is not available for purchase.");
      return;
    }
    
    try {
      setAddingToCart(true);
      setError(null); // Clear any previous errors
      setPurchaseMessage(""); // Clear any previous messages
      
      // Debug log
      console.log(`Adding artwork to cart: ID=${artwork.id}, Title=${artwork.title}`);
      
      await addToCart(artwork.id, 1);
      setPurchaseMessage("Artwork added to cart!");
      
      // Navigate to cart after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (err) {
      console.error("Error adding to cart:", err);
      
      // Set a specific error message based on the error
      if (err.response) {
        if (err.response.status === 401) {
          setPurchaseMessage("Please log in to add items to your cart.");
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.data && err.response.data.detail) {
          setPurchaseMessage(`Failed to add to cart: ${err.response.data.detail}`);
        } else {
          setPurchaseMessage(`Failed to add to cart (${err.response.status}). Please try again.`);
        }
      } else if (err.request) {
        setPurchaseMessage("Network error. Please check your connection and try again.");
      } else {
        setPurchaseMessage("Failed to add to cart. Please try again.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading artwork details...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  if (!artwork) return <div className="error-message">Artwork not found</div>;

  const isOwner = userProfile?.artist?.id === artwork.artist.id;

  return (
    <div className="artwork-detail-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button artwork-back-btn"
      >
        ← Back
      </button>

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
            <span className={`availability-status ${artwork.is_available ? 'available' : 'unavailable'}`}>
              {artwork.is_available ? 'Available for purchase' : 'Not available for purchase'}
            </span>
          </div>
          
          <div className="artwork-detail-description">
            <h2>Description</h2>
            <p>{artwork.description}</p>
          </div>
          
          {purchaseMessage && (
            <div className={`purchase-message ${purchaseMessage.includes("Failed") || purchaseMessage.includes("not available") ? "error" : "success"}`}>
              {purchaseMessage}
            </div>
          )}
          
          <div className="artwork-detail-actions">
            {isOwner ? (
              <>
                <Link to={`/artwork/${id}/edit`} className="edit-button">
                  Edit Artwork
                </Link>
                <button onClick={handleDelete} className="delete-button">
                  Delete Artwork
                </button>
                <div className="owner-availability-note">
                  {artwork.is_available 
                    ? "Your artwork is marked as available for purchase." 
                    : "Your artwork is marked as not available for purchase. Customers cannot add it to their cart."}
                </div>
              </>
            ) : (
              <>
                <button 
                  className={`purchase-button ${!artwork.is_available ? 'disabled' : ''}`}
                  onClick={handlePurchase}
                  disabled={addingToCart || !artwork.is_available}
                >
                  {addingToCart ? "Adding to Cart..." : (artwork.is_available ? "Add to Cart" : "Not Available")}
                </button>
                <button className="contact-button">
                  Contact Artist
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail; 