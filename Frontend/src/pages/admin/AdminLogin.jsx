import React, { useState } from "react";
import "./AdminLogin.css";  
import logo from "../../assets/PicturesAdmin/logoBlack.png"; 
import { FaUser } from 'react-icons/fa';  // Import FaUser from react-icons
import { FaLock } from 'react-icons/fa';  // Import FaLock from react-icons

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission (e.g., authentication)
    console.log("Username:", username);
    console.log("Password:", password);
  };

  return (
    <div className="login-container">
  {/* Logo */}
  <div className="logo-container">
    <img src={logo} alt="Logo" className="logo" />
  </div>

  <div className="login-box">
    <h2>Login</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          User Name
        </label>
        <div className="input-group">
          <span className="input-group-text">
            <FaUser />
          </span>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="input-group">
          <span className="input-group-text">
            <FaLock />
          </span>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
      </div>
      <button type="submit" className="login-button">
        Login
      </button>
    </form>
    <p className="signup-text">
      Forgot your paasword?{" "}
      <a href="#">Reset Password</a>
    </p>
  </div>
</div>

  );
}

export default Login;
