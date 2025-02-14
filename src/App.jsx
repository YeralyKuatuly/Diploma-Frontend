import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Gallery from "./components/Gallery";
import Login from "./components/Login";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Gallery />} />
                <Route path="/login" element={<Login />} />
            </Routes>   
        </Router>
    );
}

export default App;
