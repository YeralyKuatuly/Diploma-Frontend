import React, { useState } from 'react';
import { registerUser } from '../../api';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [artistName, setArtistName] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        
        try {
            const userData = {
                username,
                email,
                password,
                artist_name: artistName,
                bio
            };
            
            await registerUser(userData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username
                    <input 
                        id="username" 
                        name="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label htmlFor="email">Email
                    <input 
                        id="email" 
                        name="email" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label htmlFor="password">Password
                    <input 
                        id="password" 
                        name="password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label htmlFor="artistName">Artist Name (optional)
                    <input 
                        id="artistName" 
                        name="artistName" 
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label htmlFor="bio">Bio (optional)
                    <textarea 
                        id="bio" 
                        name="bio" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </label>
            </div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">Registration successful!</div>}
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm; 