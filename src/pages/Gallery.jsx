import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtworks, deleteArtwork, getUserProfile } from "../api";
import "../styles/Gallery.css";

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        console.log("Gallery component mounted");
        const fetchData = async () => {
            try {
                console.log("Fetching artworks...");
                // First fetch artworks
                const artworksData = await getArtworks();
                console.log("Artworks received:", artworksData);
                setArtworks(artworksData);
                
                // Then try to fetch user profile
                try {
                    const profileData = await getUserProfile();
                    console.log("User profile received:", profileData);
                    setUserProfile(profileData);
                } catch (profileError) {
                    console.error("Error fetching user profile:", profileError);
                    // Don't set error state for profile fetch failure
                    // Just continue without user profile
                }
            } catch (err) {
                console.error("Error in fetchData:", err);
                setError("Failed to load artworks");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleDelete = async (artworkId) => {
        if (window.confirm("Are you sure you want to delete this artwork?")) {
            try {
                await deleteArtwork(artworkId);
                setArtworks(artworks.filter(art => art.id !== artworkId));
            } catch (err) {
                console.error("Error deleting artwork:", err);
                alert("Failed to delete artwork");
            }
        }
    };

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
                    {filteredArtworks.map(art => {
                        const isOwner = userProfile?.artist?.id === art.artist.id;
                        return (
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
                                    <div className="artwork-actions">
                                        <Link to={`/artwork/${art.id}`} className="view-details-button">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Gallery; 