import { loginUser, registerUser, logoutUser, createAuthAxios } from '../../api';
import axios from 'axios';

// Make sure to use jest.mock manually
jest.mock('axios');

describe('Authentication API Functions', () => {
    const mockUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123',
        artist_name: 'Test Artist',
        bio: 'Test bio'
    };

    const mockTokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token'
    };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('createAuthAxios', () => {
        it('creates an axios instance with interceptors', () => {
            // Setup the mocks
            const mockUse = jest.fn();
            const mockInstance = {
                interceptors: {
                    request: {
                        use: mockUse
                    },
                    response: {
                        use: jest.fn()
                    }
                }
            };
            
            axios.create.mockReturnValueOnce(mockInstance);
            
            // Call the function
            const instance = createAuthAxios();
            
            // Assert
            expect(axios.create).toHaveBeenCalled();
            expect(mockUse).toHaveBeenCalled();
            
            // Test the interceptor if possible
            const interceptorFn = mockUse.mock.calls[0][0];
            if (typeof interceptorFn === 'function') {
                const config = { headers: {} };
                localStorage.setItem('accessToken', 'test-token');
                const modifiedConfig = interceptorFn(config);
                expect(modifiedConfig.headers.Authorization).toBe('Bearer test-token');
            }
        });
    });

    describe('loginUser', () => {
        it('handles successful login', async () => {
            axios.post.mockResolvedValueOnce({ data: mockTokens });
            
            const result = await loginUser('testuser', 'testpass123');
            
            expect(result).toEqual(mockTokens);
            expect(localStorage.getItem('accessToken')).toBe(mockTokens.access);
            expect(localStorage.getItem('refreshToken')).toBe(mockTokens.refresh);
        });

        it('handles login failure', async () => {
            const errorMessage = 'Invalid credentials';
            axios.post.mockRejectedValueOnce({
                response: { data: { detail: errorMessage } }
            });
            
            await expect(loginUser('wronguser', 'wrongpass'))
                .rejects
                .toThrow(errorMessage);
        });
    });

    describe('registerUser', () => {
        it('handles successful registration', async () => {
            const mockResponse = {
                message: 'Registration successful',
                username: mockUserData.username
            };
            axios.post.mockResolvedValueOnce({ data: mockResponse });
            
            const result = await registerUser(mockUserData);
            
            expect(result).toEqual(mockResponse);
        });

        it('handles registration failure', async () => {
            const errorMessage = 'Username already exists';
            axios.post.mockRejectedValueOnce({
                response: { data: { username: [errorMessage] } }
            });
            
            await expect(registerUser(mockUserData))
                .rejects
                .toThrow(`username: ${errorMessage}`);
        });
    });

    describe('logoutUser', () => {
        it('clears tokens from localStorage', () => {
            localStorage.setItem('accessToken', 'test-token');
            localStorage.setItem('refreshToken', 'test-refresh-token');
            
            logoutUser();
            
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });
    });
}); 