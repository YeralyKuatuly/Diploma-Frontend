import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Check if user is authenticated by looking for the access token
    const isAuthenticated = localStorage.getItem('accessToken');

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return children;
};

export default PrivateRoute; 