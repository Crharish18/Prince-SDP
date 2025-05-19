import React, { useState } from "react";
import "./Reset_Password.css";
import logo from "../../assets/PicturesAdmin/logoBlack.png";
import { FaUser, FaLock, FaEnvelope, FaKey } from 'react-icons/fa';
import axios from "axios";

function ResetPass() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
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

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, otp: "OTP is required"});
    } else if (!/^\d{6}$/.test(value)) {
      setValidationErrors({...validationErrors, otp: "OTP must be 6 digits"});
    } else {
      setValidationErrors({...validationErrors, otp: ""});
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, newPassword: "New password is required"});
    } else if (value.length < 8) {
      setValidationErrors({...validationErrors, newPassword: "Password must be at least 8 characters"});
    } else {
      setValidationErrors({...validationErrors, newPassword: ""});
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (!value) {
      setValidationErrors({...validationErrors, confirmPassword: "Confirm password is required"});
    } else if (value !== newPassword) {
      setValidationErrors({...validationErrors, confirmPassword: "Passwords do not match"});
    } else {
      setValidationErrors({...validationErrors, confirmPassword: ""});
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !validateEmail(email)) {
      setValidationErrors({
        ...validationErrors,
        email: !email ? "Email is required" : "Please enter a valid email address"
      });
      return;
    }

    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/IMS_Reset_Password/send-otp', { email });
      setSuccess(response.data.message || "OTP sent successfully! Please check your email.");
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Email might not exist in our system.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || !/^\d{6}$/.test(otp)) {
      setValidationErrors({
        ...validationErrors,
        otp: !otp ? "OTP is required" : "OTP must be 6 digits"
      });
      return;
    }

    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/IMS_Reset_Password/verify-otp', { email, otp });
      setSuccess(response.data.message || "OTP verified successfully!");
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    const newPasswordError = !newPassword ? "New password is required" : 
                            newPassword.length < 8 ? "Password must be at least 8 characters" : "";
    
    const confirmPasswordError = !confirmPassword ? "Confirm password is required" : 
                                confirmPassword !== newPassword ? "Passwords do not match" : "";
    
    if (newPasswordError || confirmPasswordError) {
      setValidationErrors({
        ...validationErrors,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError
      });
      return;
    }

    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/IMS_Reset_Password/reset-password', { 
        email, 
        otp,
        newPassword 
      });
      setSuccess(response.data.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
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
            <button type="submit" className="reset-button">
              Send OTP
            </button>
          </form>
        );
      
      case 2:
        return (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">
                Enter OTP
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaKey />
                </span>
                <input
                  type="text"
                  id="otp"
                  className={`form-control ${validationErrors.otp ? "error-input" : ""}`}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              {validationErrors.otp && (
                <div className="validation-error">{validationErrors.otp}</div>
              )}
            </div>
            <button type="submit" className="reset-button">
              Verify OTP
            </button>
            <button type="button" className="back-button" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        );
      
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="newPassword"
                  className={`form-control ${validationErrors.newPassword ? "error-input" : ""}`}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>
              {validationErrors.newPassword && (
                <div className="validation-error">{validationErrors.newPassword}</div>
              )}
            </div>
            
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-control ${validationErrors.confirmPassword ? "error-input" : ""}`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {validationErrors.confirmPassword && (
                <div className="validation-error">{validationErrors.confirmPassword}</div>
              )}
            </div>
            
            <button type="submit" className="reset-button">
              Reset Password
            </button>
            <button type="button" className="back-button" onClick={() => setStep(2)}>
              Back
            </button>
          </form>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className="forgot-password-box">
        <h2>Reset Password</h2>
        
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
        
        <div className="step-title">
          {step === 1 && <h3>Enter Your Email</h3>}
          {step === 2 && <h3>Verify OTP</h3>}
          {step === 3 && <h3>Create New Password</h3>}
        </div>
        
        {renderStep()}
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <p className="login-text">
          Remember your password?{" "}
          <a href="/admin">Back to Login</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPass;
