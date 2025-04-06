import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getArtworks } from "../api";
import "../styles/ArtSlideshow.css";

const ArtSlideshow = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideshowRef = useRef(null);
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

  const snapToClosestSlide = () => {
    if (!slideshowRef.current) return;
    const container = slideshowRef.current;
    const slideWidth = container.clientWidth * 0.85;
    const index = Math.round(container.scrollLeft / slideWidth);
    setCurrentIndex(Math.max(0, Math.min(index, artworks.length - 1)));
    container.scrollTo({ left: index * slideWidth, behavior: "smooth" });
  };

  const handleScroll = (direction) => {
    if (!slideshowRef.current) return;
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    const boundedIndex = Math.max(0, Math.min(newIndex, artworks.length - 1));
    setCurrentIndex(boundedIndex);
    slideshowRef.current.scrollTo({
      left: boundedIndex * slideshowRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
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
            onClick={() => handleScroll("left")} 
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
            onClick={() => handleScroll("right")} 
            disabled={currentIndex === artworks.length - 1}
            aria-label="Next artwork"
          >
            →
          </button>
        </div>

        <div
          className="slideshow-container"
          ref={slideshowRef}
          onScroll={() => snapToClosestSlide()}
        >
          {artworks.map((artwork, index) => (
            <div
              key={artwork.id}
              className={`slideshow-slide ${index === currentIndex ? "active" : ""}`}
            >
              <Link to={`/artwork/${artwork.id}`}>
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="artwork-image"
                  onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="artwork-overlay">
                  <h3>{artwork.title}</h3>
                  <p>By {artwork.artist.name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="slideshow-dots">
          {artworks.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => handleScroll(index > currentIndex ? "right" : "left")}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtSlideshow;
