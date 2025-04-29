import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtists } from "../api";
import "../styles/Artists.css";

const DEFAULT_PROFILE_PIC = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';

const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const data = await getArtists();
                setArtists(data);
            } catch (err) {
                setError("Failed to load artists");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchArtists();
    }, []);

    const filteredArtists = artists
        .filter(artist => 
            artist.name.toLowerCase().includes(filter.toLowerCase()) ||
            (artist.bio && artist.bio.toLowerCase().includes(filter.toLowerCase()))
        )
        .sort((a, b) => a.name.localeCompare(b.name));  // Sort alphabetically by name

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading artists...</p>
        </div>
    );
    
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="artists-container">
            <div className="artists-header">
                <h1>Our Artists</h1>
                <div className="filter-container">
                    <input 
                        type="text" 
                        placeholder="Search artists..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            {filteredArtists.length === 0 ? (
                <div className="no-results">
                    <p>No artists found matching your search.</p>
                </div>
            ) : (
                <div className="artists-grid">
                    {filteredArtists.map(artist => (
                        <div key={artist.id} className="artist-card">
                            <div className="artist-image-container">
                                <img 
                                    src={artist.profile_picture || DEFAULT_PROFILE_PIC} 
                                    alt={artist.name} 
                                    className="artist-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_PROFILE_PIC;
                                    }}
                                />
                            </div>
                            <div className="artist-details">
                                <h2 className="artist-name">{artist.name}</h2>
                                <p className="artist-bio">
                                    {artist.bio ? 
                                        (artist.bio.length > 120 ? 
                                            `${artist.bio.substring(0, 120)}...` : 
                                            artist.bio) : 
                                        "No bio available"}
                                </p>
                                <Link to={`/artist/${artist.id}`} className="view-profile-button">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artists; 