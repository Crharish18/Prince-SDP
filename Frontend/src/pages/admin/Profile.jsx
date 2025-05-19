import React, { useState, useEffect, useRef } from 'react';
import './profile.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Mail, Phone, Building, MapPin, Lock, X, User, IdCard, Calendar, UserCircle, Upload } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({});
  const [originalFormData, setOriginalFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when userData is loaded
  useEffect(() => {
    if (userData) {
      const initialData = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phonenum: userData.phonenum || '',
        address: userData.address || '',
        natID: userData.natID || '',
        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : ''
      };
      
      setFormData(initialData);
      setOriginalFormData(initialData);
      
      // Set profile photo from user data
      if (userData.profile_picture_path) {
        setProfilePhoto(userData.profile_picture_path);
      }
    }
  }, [userData]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value || value.trim().length < 3) {
          error = `${name === 'first_name' ? 'First' : 'Last'} name must be at least 3 characters long.`;
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = `${name === 'first_name' ? 'First' : 'Last'} name can only contain letters and spaces.`;
        }
        break;
      
      case 'email':
        if (!value) {
          error = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address.';
        }
        break;
      
      case 'phonenum':
        if (!value) {
          error = 'Phone number is required.';
        } else if (!/^\d{10}$/.test(value)) {
          error = 'Phone number must be exactly 10 digits.';
        }
        break;
      
      case 'address':
        if (!value || value.trim().length < 5) {
          error = 'Address must be at least 5 characters long.';
        }
        break;
      
      case 'natID':
        if (!value) {
          error = 'National ID is required.';
        } else if (value.length < 10 || value.length > 12) {
          error = 'National ID must be between 10 to 12 characters long.';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = 'National ID should not contain symbols.';
        }
        break;
      
      case 'dob':
        if (!value) {
          error = 'Date of Birth is required.';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          
          if (selectedDate >= today) {
            error = 'Date of Birth must be in the past.';
          }
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate the field
    const error = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
  };

  // Fetch the user profile data
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("No token found. Please log in again.");
      return;
    }

    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user profile data:', error);
      });
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    // Clear validation errors when starting to edit
    setValidationErrors({});
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData(originalFormData);
    // If profile photo was changed but not saved, revert to original
    if (userData && userData.profile_picture_path) {
      setProfilePhoto(userData.profile_picture_path);
    }
    setIsEditing(false);
    // Clear validation errors
    setValidationErrors({});
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handleProfilePictureClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, GIF).");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/upload-profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      setProfilePhoto(response.data.secure_url);
      // Add the profile picture URL to the form data
      setFormData(prev => ({
        ...prev,
        profile_picture_path: response.data.secure_url
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Format as DD-MM-YYYY
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveProfile = () => {
    if (!isEditing) return;
    
    // Validate all fields before saving
    if (!validateForm()) {
      alert('Please fix the validation errors before saving.');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    axios.put('http://localhost:5000/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setUserData(response.data);
        setIsEditing(false);
        // Update original form data after successful save
        setOriginalFormData(formData);
        alert('Profile updated successfully!');
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/auth/change-password', passwordForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPasswordSuccess(res.data.message);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch(err => {
        setPasswordError(err.response?.data?.message || 'Error updating password');
      });
  };
  
  return (
    <div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <Header />
      </div>
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 99 }}>
        <Sidebar />
      </div>
      
      <div className="profile-container" style={{ marginTop: '80px' }}>
        {/* Profile Header */}
        <div className="profile-header">
          <h2>Profile Settings</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing ? (
              <>
                <button 
                  className="cancel-button" 
                  onClick={handleCancelEdit} 
                  style={{borderRadius:'8px', height:'45px', backgroundColor: '#e74c3c', color: 'white'}}
                >
                  Cancel
                </button>
                <button 
                  className="save-profile-button" 
                  onClick={handleSaveProfile} 
                  style={{borderRadius:'8px', height:'45px'}}
                >
                  Save Profile
                </button>
              </>
            ) : (
              <button 
                className="edit-profile-button" 
                onClick={handleEditClick} 
                style={{borderRadius:'8px', height:'45px'}}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="profile-info">
          <div 
            className="profile-image" 
            style={{ 
              marginRight: '30px',
              cursor: isEditing ? 'pointer' : 'default' 
            }}
            onClick={handleProfilePictureClick}
          >
            {isUploading ? (
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: '50%', 
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid #3498db'
              }}>
                <span>Uploading...</span>
              </div>
            ) : profilePhoto ? (
              <div style={{ position: 'relative' }}>
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '4px solid #3498db'
                  }} 
                />
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '15px',
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload size={24} color="white" />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: '50%', 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid #3498db',
                position: 'relative'
              }}>
                <UserCircle size={100} color="#777" />
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '15px',
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Upload size={24} color="white" />
                  </div>
                )}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Toggle between view mode and edit mode */}
          {isEditing ? (
            <div className="profile-edit" style={{ marginLeft: '20px', width: '100%' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>First Name</label>
                  <input
                    className={`editable-field ${validationErrors.first_name ? 'error-input' : ''}`}
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                  {validationErrors.first_name && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.first_name}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Last Name</label>
                  <input
                    className={`editable-field ${validationErrors.last_name ? 'error-input' : ''}`}
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                  {validationErrors.last_name && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.last_name}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                  <input
                    className={`editable-field ${validationErrors.email ? 'error-input' : ''}`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {validationErrors.email && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                  <input
                    className={`editable-field ${validationErrors.phonenum ? 'error-input' : ''}`}
                    type="tel"
                    name="phonenum"
                    value={formData.phonenum}
                    onChange={handleInputChange}
                  />
                  {validationErrors.phonenum && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.phonenum}
                    </div>
                  )}
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Address</label>
                  <input
                    className={`editable-field ${validationErrors.address ? 'error-input' : ''}`}
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {validationErrors.address && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.address}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>National ID</label>
                  <input
                    className={`editable-field ${validationErrors.natID ? 'error-input' : ''}`}
                    type="text"
                    name="natID"
                    value={formData.natID}
                    onChange={handleInputChange}
                  />
                  {validationErrors.natID && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.natID}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Date of Birth</label>
                  <input
                    className={`editable-field ${validationErrors.dob ? 'error-input' : ''}`}
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {validationErrors.dob && (
                    <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
                      {validationErrors.dob}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-details" style={{ marginLeft: '40px' }}>
              <p className="user-username">
                <User /> <strong>Username: </strong> {userData.username}
              </p>
              <p className="user-name">
                <UserCircle /> <strong>Full Name: </strong>{userData.first_name} {userData.last_name}
              </p>
              <p className="user-email">
                <Mail /> <strong>Email: </strong>{userData.email}
              </p>
              <p className="user-phone">
                <Phone /><strong>Phone Number: </strong> {userData.phonenum}
              </p>
              <p className="user-location">
                <MapPin /><strong>Address: </strong> {userData.address}
              </p>
              <p className="user-natID">
                <IdCard /> <strong>National ID: </strong> {userData.natID}
              </p>
              <p className="user-dob">
                <Calendar /> <strong>Date of Birth: </strong> {formatDateForDisplay(userData.dob)}
              </p>
            </div>
          )}
        </div>

        <div className="password-settings">
          <button
            className="change-password-button"
            onClick={handleChangePasswordClick}
            style={{borderRadius:'8px', height:'55px'}}
          >
            <Lock /> Change Password
          </button>
        </div>
      </div>

      {/* ===== Modal for Change Password ===== */}
      {isChangingPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="profile-header" >
              <h2>Change Password</h2>
            </div>
            <div className="password-change-form">
              <form onSubmit={handleUpdatePassword}>
                <div className="password-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                <div className="password-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                <div className="password-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                </div>
                {passwordError && <div style={{ color: 'red', marginBottom: 8 }}>{passwordError}</div>}
                {passwordSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{passwordSuccess}</div>}
                <div className="password-actions">
                  <button className="update-password-button" style={{borderRadius:'8px'}} type="submit">Update Password</button>
                  <button
                    className="cancel-button"
                    onClick={handleChangePasswordClick}
                    style={{borderRadius:'8px'}}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
