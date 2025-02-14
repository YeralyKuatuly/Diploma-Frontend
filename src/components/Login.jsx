import React, { useState } from "react";
import { loginUser } from "../api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");  // Clear previous errors

        try {
            const data = await loginUser(email, password);
            alert("Login successful!");
            window.location.href = "/";
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.response ? error.response.data.detail : "Login failed. Please try again.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
