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
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Art Gallery</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map(art => (
                    <div key={art.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                            src={art.image} 
                            alt={art.title} 
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{art.title}</h2>
                            <p className="text-gray-600 mb-2">{art.description}</p>
                            <p className="text-lg font-bold">${art.price}</p>
                            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery; 