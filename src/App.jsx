import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import './styles/base.css';
import './styles/loading.css';

// Lazy load components
const Gallery = lazy(() => import("./pages/Gallery"));
const Artists = lazy(() => import("./pages/Artists"));
const AddArt = lazy(() => import("./pages/AddArt"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const ArtSlideshow = lazy(() => import("./pages/ArtSlideshow"));
const EditArtwork = lazy(() => import("./pages/EditArtwork"));
const Cart = lazy(() => import('./components/Cart'));
const Order = lazy(() => import('./components/Order'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const ArtistSelling = lazy(() => import('./pages/ArtistSelling'));

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Paths where header and footer should be hidden
const hiddenComponentPaths = ['/slideshow'];

// Header wrapper component that only renders on non-slideshow routes
const HeaderWrapper = () => {
    const location = useLocation();
    
    if (hiddenComponentPaths.includes(location.pathname)) {
        return null;
    }
    
    return <Header />;
};

// Footer wrapper component that only renders on non-slideshow routes
const FooterWrapper = () => {
    const location = useLocation();
    
    if (hiddenComponentPaths.includes(location.pathname)) {
        return null;
    }
    
    return <Footer />;
};

// Main app with routes
const AppContent = () => {
    return (
        <div className="app-container">
            <HeaderWrapper />
            <main>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Gallery />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/artworks" element={<Gallery />} />
                        <Route path="/artists" element={<Artists />} />
                        <Route path="/artist/:id" element={<ArtistDetail />} />
                        <Route path="/add-art" element={<AddArt />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/artwork/:id" element={<ArtworkDetail />} />
                        <Route path="/slideshow" element={<ArtSlideshow />} />
                        <Route 
                            path="/artwork/:id/edit" 
                            element={
                                <PrivateRoute>
                                    <EditArtwork />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/subscriptions" 
                            element={
                                <PrivateRoute>
                                    <Subscriptions />
                                </PrivateRoute>
                            } 
                        />
                        <Route path="/cart" element={<Cart />} />
                        <Route 
                            path="/orders"
                            element={
                                <PrivateRoute>
                                    <Orders />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/orders/:id" 
                            element={
                                <PrivateRoute>
                                    <OrderDetail />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/artist/selling" 
                            element={
                                <PrivateRoute>
                                    <ArtistSelling />
                                </PrivateRoute>
                            } 
                        />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                    </Routes>
                </Suspense>
            </main>
            <FooterWrapper />
        </div>
    );
};

function App() {
    useEffect(() => {
        console.log("App component mounted");
    }, []);

    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <AppContent />
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;