import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import AddArt from "./pages/AddArt";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtworkDetail from "./pages/ArtworkDetail";
import ArtistDetail from "./pages/ArtistDetail";
import Profile from "./pages/Profile";
import Subscriptions from "./pages/Subscriptions";
import ArtSlideshow from "./pages/ArtSlideshow";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import "./App.css"; // Make sure to import the CSS
import EditArtwork from "./pages/EditArtwork";
import PrivateRoute from "./components/PrivateRoute";
import Cart from './components/Cart';
import Order from './components/Order';

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
                <Routes>
                    <Route path="/" element={<Gallery />} />
                    <Route path="/gallery" element={<Gallery />} />
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
                    <Route path="/orders/:orderId" element={<Order />} />
                </Routes>
            </main>
            <FooterWrapper />
        </div>
    );
};

function App() {
    useEffect(() => {
        // Debug log to check if component is mounting
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