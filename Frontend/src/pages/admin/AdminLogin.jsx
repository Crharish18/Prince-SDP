import React, { useState } from "react";
import "./AdminLogin.css";  
import logo from "../../assets/PicturesAdmin/logoBlack.png"; 
import { FaUser, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';  
import axios from "axios"; 

function Login() {
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  // State to store any error message from API
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

  // Handle changes in the email input field with validation
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

  // Handle changes in the password input field with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, password: "Password is required"});
    } else {
      setValidationErrors({...validationErrors, password: ""});
    }
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email and password before submission
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

    // Debug log for login attempt
    console.log("Attempting login with:", { email, password });

    try {
      // Send login request to backend API
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }, 
        { headers: { "Content-Type": "application/json" } } // Ensure correct format
      );

      // Debug log for API response
      console.log("Response received:", response.data);

      // Store authentication token and user info in localStorage
      localStorage.setItem('token', response.data.token);  
      localStorage.setItem('role', response.data.role);    
      localStorage.setItem('username', response.data.username);  // Store username

      // Redirect user based on role
      if (response.data.role === 'admin') {
        window.location.href = '/admin-dashboard';  
      } else if (response.data.role === 'employee') {
        window.location.href = '/employee-dashboard';  
      }

    } catch (error) {
      // Log and show error message from API if login fails
      console.error("Error response:", error.response?.data);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  
  return (
    <div className="login-container">
      {/* Logo section */}
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {/* Login form box */}
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Email field */}
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
            {/* Email validation error message */}
            {validationErrors.email && (
              <div className="validation-error">{validationErrors.email}</div>
            )}
          </div>

          {/* Password field */}
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
            {/* Password validation error message */}
            {validationErrors.password && (
              <div className="validation-error">{validationErrors.password}</div>
            )}
          </div>
          {/* Login button */}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {/* General error message (e.g., wrong credentials) */}
        {error && <p className="error-message">{error}</p>}
        {/* Link to reset password */}
        <p className="signup-text">
            Forgot your password?{" "}
            <Link to="/admin/Reset_Password">Reset Password</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
