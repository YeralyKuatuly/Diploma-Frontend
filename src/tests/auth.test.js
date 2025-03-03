import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import axios from 'axios';

// First mock axios
jest.mock('axios');

// Mock the api module without any implementation initially
jest.mock('../api', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  getAccessToken: jest.fn(),
  logoutUser: jest.fn()
}));

// Then import the mocked api
import { loginUser, registerUser, getAccessToken, logoutUser } from '../api';

describe('Authentication Flow', () => {
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

    describe('Login Form', () => {
        it('renders login form correctly', () => {
            render(
                <AuthProvider>
                    <LoginForm />
                </AuthProvider>
            );

            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        it('handles successful login', async () => {
            const mockTokens = {
                access: 'test-access-token',
                refresh: 'test-refresh-token'
            };

            // Setup our mock implementation
            loginUser.mockImplementation(async (username, password) => {
                localStorage.setItem('accessToken', mockTokens.access);
                localStorage.setItem('refreshToken', mockTokens.refresh);
                return mockTokens;
            });

            render(
                <AuthProvider>
                    <LoginForm />
                </AuthProvider>
            );

            fireEvent.change(screen.getByLabelText(/username/i), {
                target: { value: 'testuser' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'testpass' }
            });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /login/i }));
            });

            expect(loginUser).toHaveBeenCalledWith('testuser', 'testpass');
            expect(localStorage.getItem('accessToken')).toBe(mockTokens.access);
        });
    });

    describe('Register Form', () => {
        it('renders register form correctly', () => {
            render(
                <AuthProvider>
                    <RegisterForm />
                </AuthProvider>
            );

            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
        });

        it('handles successful registration', async () => {
            const mockResponse = {
                message: 'Registration successful',
                username: 'testuser'
            };

            // Setup our mock implementation
            registerUser.mockImplementation(async (userData) => {
                return mockResponse;
            });

            render(
                <AuthProvider>
                    <RegisterForm />
                </AuthProvider>
            );

            fireEvent.change(screen.getByLabelText(/username/i), {
                target: { value: 'testuser' }
            });
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' }
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'testpass' }
            });

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /register/i }));
            });

            expect(registerUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'testpass'
                })
            );
        });
    });
}); 