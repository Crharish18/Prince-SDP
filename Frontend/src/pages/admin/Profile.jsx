import React, { useState, useEffect } from 'react';
import './profile.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Mail, Phone, Building, MapPin, Lock, X, User, IdCard, Calendar, UserCircle } from 'lucide-react';
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

  

  const [formData, setFormData] = useState({});

// Initialize form data when userData is loaded
useEffect(() => {
  if (userData) {
    setFormData({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phonenum: userData.phonenum || '',
      address: userData.address || '',
      natID: userData.natID || '',
      dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : ''
    });
  }
}, [userData]);

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
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
    setIsEditing(!isEditing);
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(!isChangingPassword);
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
  
  const handleSaveProfile = () => {
    if (!isEditing) return;
    
    const token = localStorage.getItem('token');
    
    axios.put('http://localhost:5000/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setUserData(response.data);
        setIsEditing(false);
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
          <button 
              className="edit-profile-button" 
              onClick={isEditing ? handleSaveProfile : handleEditClick} 
              style={{borderRadius:'8px', height:'45px'}}
            >
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>

        </div>

        {/* Profile Information Section */}
        <div className="profile-info">
          <div className="profile-image" style={{ marginRight: '30px' }}>
            <img
              src={'https://i.pravatar.cc/300'}
              alt="Profile"
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #0066cc',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>

          {/* Toggle between view mode and edit mode */}
          {isEditing ? (
            <div className="profile-edit" style={{ marginLeft: '20px', width: '100%' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>First Name</label>
                  <input
                          className="editable-field"
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Last Name</label>
                  <input
                      className="editable-field"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                  <input
                    className="editable-field"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                  <input
                      className="editable-field"
                      type="tel"
                      name="phonenum"
                      value={formData.phonenum}
                      onChange={handleInputChange}
                    />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Address</label>
                  <input
                          className="editable-field"
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>National ID</label>
                  <input
                      className="editable-field"
                      type="text"
                      name="natID"
                      value={formData.natID}
                      onChange={handleInputChange}
                    />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Date of Birth</label>
                    <input
                      className="editable-field"
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
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