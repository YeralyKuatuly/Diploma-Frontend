import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import AddArt from "./pages/AddArt";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtworkDetail from "./pages/ArtworkDetail";
import ArtistDetail from "./pages/ArtistDetail";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import "./App.css"; // Make sure to import the CSS
import EditArtwork from "./pages/EditArtwork";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    useEffect(() => {
        // Debug log to check if component is mounting
        console.log("App component mounted");
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Header />
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
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;