import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtworks } from "../api";
import "../styles/Gallery.css";

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        console.log("Gallery component mounted");
        const fetchArtworks = async () => {
            try {
                console.log("Fetching artworks...");
                const data = await getArtworks();
                console.log("Artworks received:", data);
                setArtworks(data);
            } catch (err) {
                console.error("Error in fetchArtworks:", err);
                setError("Failed to load artworks");
            } finally {
                setLoading(false);
            }
        };
        
        fetchArtworks();
    }, []);

    // Debug render to see if component is rendering at all
    console.log("Gallery rendering, loading:", loading, "error:", error, "artworks:", artworks.length);

    const filteredArtworks = artworks.filter(art => 
        art.title.toLowerCase().includes(filter.toLowerCase()) ||
        art.description.toLowerCase().includes(filter.toLowerCase()) ||
        art.artist.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading amazing artworks...</p>
        </div>
    );
    
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>Art Gallery</h1>
                <div className="filter-container">
                    <input 
                        type="text" 
                        placeholder="Search artworks..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            {filteredArtworks.length === 0 ? (
                <div className="no-results">
                    <p>No artworks found matching your filter.</p>
                </div>
            ) : (
                <div className="artwork-grid">
                    {filteredArtworks.map(art => (
                        <div key={art.id} className="artwork-card">
                            <div className="artwork-image-container">
                                <img 
                                    src={art.image} 
                                    alt={art.title} 
                                    className="artwork-image"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="artwork-details">
                                <h2 className="artwork-title">{art.title}</h2>
                                <p className="artwork-artist">by {art.artist.name}</p>
                                <p className="artwork-price">${art.price}</p>
                                <Link to={`/artwork/${art.id}`} className="view-details-button">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery; 