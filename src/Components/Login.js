import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

const LoginPage = () => {
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (userName.trim()) {
            // Store username in localStorage
            localStorage.setItem("username", userName.trim());
            navigate("/home");
        }
        else {
            console.error("Username is required");
            alert("Username is required");
        }
    };

    return (
        <div className="home-page">
            <div className="login">
                <h2>Please Login!</h2>
                <div className="input-field">
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)} // Update state on input change
                        placeholder="Enter your username"
                    />
                </div>
                <div className="btns">
                    <Button className="btn" onClick={handleLogin}>Login</Button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
