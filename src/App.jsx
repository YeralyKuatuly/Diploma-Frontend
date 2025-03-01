import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import AddArt from "./pages/AddArt";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtworkDetail from "./pages/ArtworkDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import "./App.css"; // Make sure to import the CSS

function App() {
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
                            <Route path="/add-art" element={<AddArt />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/artwork/:id" element={<ArtworkDetail />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;