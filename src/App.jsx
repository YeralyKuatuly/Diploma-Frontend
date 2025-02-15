import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Artists from "./pages/Artists";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css"; // Make sure to import the CSS

function App() {
    return (
        <Router>
            <div className="app-container">
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Gallery />} />
                        <Route path="/artists" element={<Artists />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;