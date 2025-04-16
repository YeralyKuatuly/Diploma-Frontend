import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../api';

const Debug = () => {
  const { isLoggedIn, isLoading, user, checkLoginStatus } = useAuth();
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    // Check backend health endpoint
    axios.get(`${API_URL.replace('/api', '')}/health/`)
      .then(response => {
        setBackendStatus('OK: ' + JSON.stringify(response.data));
      })
      .catch(error => {
        setBackendStatus(`Error: ${error.message}`);
      });

    // Get token info
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    setTokenInfo({
      access_token: accessToken ? `${accessToken.substring(0, 10)}...` : 'Not found',
      refresh_token: refreshToken ? `${refreshToken.substring(0, 10)}...` : 'Not found',
      has_access_token: !!accessToken,
      has_refresh_token: !!refreshToken
    });

    // Test auth endpoint
    if (accessToken) {
      axios.get(`${API_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
        .then(response => {
          setApiResponse({
            status: 'Success',
            data: response.data
          });
        })
        .catch(error => {
          setApiResponse({
            status: 'Error',
            message: error.message,
            response: error.response ? {
              status: error.response.status,
              data: error.response.data
            } : 'No response'
          });
        });
    }
  }, []);

  const handleRefreshStatus = () => {
    checkLoginStatus();
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Auth Context State</h2>
        <p><strong>isLoggedIn:</strong> {isLoggedIn.toString()}</p>
        <p><strong>isLoading:</strong> {isLoading.toString()}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
        <button onClick={handleRefreshStatus}>Refresh Status</button>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Backend Status</h2>
        <p>{backendStatus}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Token Information</h2>
        <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>API Test</h2>
        <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Debug; 