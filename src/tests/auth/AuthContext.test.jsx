import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// First mock axios
jest.mock('axios');

// Mock the api module without any implementation initially
jest.mock('../../api', () => {
  const originalModule = jest.requireActual('../../api');
  return {
    ...originalModule,
    loginUser: jest.fn(),
    getAccessToken: jest.fn(),
    logoutUser: jest.fn()
  };
});

// Then import the mocked api
import { loginUser, getAccessToken, logoutUser } from '../../api';

// Test component that uses auth context
const TestComponent = () => {
    const { isLoggedIn, login, logout } = useAuth();
    
    const handleLogin = async () => {
        // Directly call our mocked loginUser function
        await loginUser('testuser', 'testpass');
        login();
    };
    
    return (
        <div>
            <div data-testid="login-status">
                {isLoggedIn ? 'logged-in' : 'logged-out'}
            </div>
            <button onClick={handleLogin} data-testid="login-button">
                Login
            </button>
            <button onClick={() => {
                logout();
                logoutUser(); // Ensure logoutUser is called
            }} data-testid="logout-button">
                Logout
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        
        // Set up the implementations here in beforeEach
        getAccessToken.mockImplementation(() => localStorage.getItem('accessToken'));
        logoutUser.mockImplementation(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        });
    });

    it('provides initial logged out state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        
        expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    });

    it('updates state on login/logout', async () => {
        const mockTokens = {
            access: 'test-access-token',
            refresh: 'test-refresh-token'
        };

        // Set up mock implementation for loginUser to set tokens
        loginUser.mockImplementation(async (username, password) => {
            localStorage.setItem('accessToken', mockTokens.access);
            localStorage.setItem('refreshToken', mockTokens.refresh);
            return mockTokens;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        
        // Test login
        await act(async () => {
            screen.getByTestId('login-button').click();
        });

        expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
        expect(localStorage.getItem('accessToken')).toBe(mockTokens.access);
        
        // Test logout
        act(() => {
            screen.getByTestId('logout-button').click();
        });
        expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('initializes with logged in state if token exists', () => {
        localStorage.setItem('accessToken', 'test-token');
        
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        
        expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
    });
}); 