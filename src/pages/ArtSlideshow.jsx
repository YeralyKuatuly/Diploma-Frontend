import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getArtworks } from "../api";
import "../styles/ArtSlideshow.css";

const ArtSlideshow = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await getArtworks();
        setArtworks(data);
      } catch (err) {
        setError("Failed to load artworks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  useEffect(() => {
    // Hide both header and footer for a true fullscreen experience
    const footer = document.querySelector("footer");
    const header = document.querySelector("header");
    
    if (footer) footer.style.display = "none";
    if (header) header.style.display = "none";
    
    // Ensure body doesn't scroll
    document.body.style.overflow = "hidden";
    
    return () => {
      if (footer) footer.style.display = "block";
      if (header) header.style.display = "block";
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Simple navigation functions
  const goToNextSlide = () => {
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Jump directly to a specific slide (for dot navigation)
  const jumpToSlide = (index) => {
    if (index >= 0 && index < artworks.length) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="slideshow-fullscreen">
        <div className="slideshow-loading">
          <div className="loading-spinner"></div>
          <p>Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slideshow-fullscreen">
        <div className="slideshow-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="slideshow-fullscreen">
      <button 
        className="back-button" 
        onClick={handleBack}
        aria-label="Back to previous page"
      >
        ←
      </button>
      
      <div className="slideshow-outer-container">
        <div className="slideshow-header">
          <h1 className="slideshow-title">Artwork Collection</h1>
          <p className="slideshow-subtitle">A selection of unique and beautiful pieces.</p>
        </div>

        <div className="slideshow-nav">
          <button 
            className="nav-button prev" 
            onClick={goToPrevSlide} 
            disabled={currentIndex === 0}
            aria-label="Previous artwork"
          >
            ←
          </button>
          <div className="slideshow-counter">
            {`${currentIndex + 1} / ${artworks.length}`}
          </div>
          <button 
            className="nav-button next" 
            onClick={goToNextSlide} 
            disabled={currentIndex === artworks.length - 1}
            aria-label="Next artwork"
          >
            →
          </button>
        </div>

        <div className="slideshow-simple-container">
          {artworks.length > 0 && (
            <div className="slideshow-slide active">
              <Link to={`/artwork/${artworks[currentIndex].id}`}>
                <img
                  src={artworks[currentIndex].image}
                  alt={artworks[currentIndex].title}
                  className="artwork-image"
                  onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                />
                <div className="artwork-overlay">
                  <h3>{artworks[currentIndex].title}</h3>
                  <p>By {artworks[currentIndex].artist.name}</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="slideshow-dots">
          {artworks.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => jumpToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtSlideshow;
