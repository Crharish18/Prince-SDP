import React, { useState } from "react";
import "./AdminLogin.css";  
import logo from "../../assets/PicturesAdmin/logoBlack.png"; 
import { FaUser, FaLock } from 'react-icons/fa';  
import axios from "axios"; 

function Login() {
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Attempting login with:", { email, password });  // Debugging

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }, 
        { headers: { "Content-Type": "application/json" } } // Ensure correct format
      );

      console.log("Response received:", response.data);  // Debugging

      // Store token and role
      localStorage.setItem('token', response.data.token);  
      localStorage.setItem('role', response.data.role);    
      localStorage.setItem('username', response.data.username);  // Store username

      if (response.data.role === 'admin') {
        window.location.href = '/admin-dashboard';  
      } else if (response.data.role === 'employee') {
        window.location.href = '/employee-dashboard';  
      }

    } catch (error) {
      console.error("Error response:", error.response?.data);  // Debugging
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                type="email"
                id="email"  
                className="form-control"
                value={email}   
                onChange={(e) => setEmail(e.target.value)}  
                placeholder="Enter your email"
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
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
        <p className="signup-text">
          Forgot your password?{" "}
          <a href="#">Reset Password</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
