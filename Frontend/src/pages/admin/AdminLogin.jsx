import React, { useState } from "react";
import "./AdminLogin.css";  
import logo from "../../assets/PicturesAdmin/logoBlack.png"; 
import { FaUser, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';  
import axios from "axios"; 

function Login() {
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: ""
  });

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, email: "Email is required"});
    } else if (!validateEmail(value)) {
      setValidationErrors({...validationErrors, email: "Please enter a valid email address"});
    } else {
      setValidationErrors({...validationErrors, email: ""});
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, password: "Password is required"});
    } else {
      setValidationErrors({...validationErrors, password: ""});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before submission
    const emailError = !email ? "Email is required" : !validateEmail(email) ? "Please enter a valid email address" : "";
    const passwordError = !password ? "Password is required" : "";
    
    setValidationErrors({
      email: emailError,
      password: passwordError
    });
    
    // If there are validation errors, don't proceed with submission
    if (emailError || passwordError) {
      return;
    }

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
                className={`form-control ${validationErrors.email ? "error-input" : ""}`}
                value={email}   
                onChange={handleEmailChange}  
                placeholder="Enter your email"
                required
              />
            </div>
            {validationErrors.email && (
              <div className="validation-error">{validationErrors.email}</div>
            )}
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
                className={`form-control ${validationErrors.password ? "error-input" : ""}`}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                required
              />
            </div>
            {validationErrors.password && (
              <div className="validation-error">{validationErrors.password}</div>
            )}
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {error && <p className="error-message">{error}</p>} {/* Display error message */}
        <p className="signup-text">
            Forgot your password?{" "}
            <Link to="/admin/Reset_Password">Reset Password</Link>
          </p>
      </div>
    </div>
  );
}

export default Login;
