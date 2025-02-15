import React, { useEffect, useState } from "react";
import { getArtworks } from "../api";

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const data = await getArtworks();
                setArtworks(data);
            } catch (err) {
                setError("Failed to load artworks");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchArtworks();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Art Gallery</h1>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
                justifyContent: "center"
            }}>
                {artworks.map((art) => (
                    <div key={art.id} style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "10px",
                        textAlign: "center"
                    }}>
                        <img 
                            src={art.image} 
                            alt={art.title} 
                            style={{
                                width: "100%",
                                height: "250px",
                                objectFit: "cover",
                                borderRadius: "10px"
                            }}
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                            }}
                        />
                        <h3>{art.title}</h3>
                        <p>{art.artist.name}</p>
                        <p><strong>${art.price}</strong></p>
                        <button style={{
                            background: "#444",
                            color: "white",
                            padding: "10px 15px",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "5px"
                        }}>View more</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
