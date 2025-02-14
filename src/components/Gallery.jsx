import React, { useEffect, useState } from "react";
import { getArtworks } from "../api";

const Gallery = () => {
    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        getArtworks().then(data => setArtworks(data));
    }, []);

    return (
        <div>
            <h1>Art Gallery</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {artworks.map((art) => (
                    <div key={art.id} style={{ border: "1px solid black", padding: "10px" }}>
                        <img src={art.image} alt={art.title} style={{ width: "100%" }} />
                        <h2>{art.title}</h2>
                        <p>{art.description}</p>
                        <p>Price: ${art.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
