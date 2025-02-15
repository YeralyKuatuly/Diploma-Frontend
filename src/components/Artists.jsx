import { useEffect, useState } from "react";
import { getArtists } from "../api";
import { Link } from "react-router-dom";

const Artists = () => {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        getArtists().then(setArtists).catch(console.error);
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Artists</h2>
            <ul>
                {artists.map((artist) => (
                    <li key={artist.id} className="flex items-center justify-between border p-2">
                        <div className="flex items-center space-x-2">
                            <img src={artist.profile_picture} alt={artist.name} className="w-12 h-12 rounded-full" />
                            <span>{artist.name}</span>
                        </div>
                        <Link to={`/artists/${artist.id}/arts`} className="text-blue-500">View Arts</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Artists;