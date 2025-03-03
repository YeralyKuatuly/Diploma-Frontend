import React, { useState } from 'react';
import { loginUser } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const response = await loginUser(username, password);
            login();
        } catch (err) {
            setError(err.message || 'Login failed');
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
            {error && <div className="error">{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
};

export default LoginForm; 