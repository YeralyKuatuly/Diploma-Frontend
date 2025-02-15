import React, { useEffect, useState } from "react";
import { getArtists } from "../api";

const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Our Artists</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map(artist => (
                    <div key={artist.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                            src={artist.profile_picture} 
                            alt={artist.name} 
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                                e.target.src = '/placeholder-artist.jpg';
                            }}
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{artist.name}</h2>
                            <p className="text-gray-600">{artist.bio}</p>
                            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Artists; 