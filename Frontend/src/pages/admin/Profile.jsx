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
          <button className="edit-profile-button" onClick={handleEditClick} style={{borderRadius:'8px', height:'45px'}}>
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
                    defaultValue={userData.first_name}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Last Name</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.last_name}
                  />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                  <input
                    className="editable-field"
                    type="email"
                    defaultValue={userData.email}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                  <input
                    className="editable-field"
                    type="tel"
                    defaultValue={userData.phonenum}
                  />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Address</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.address}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>National ID</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.natID}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Date of Birth</label>
                  <input
                    className="editable-field"
                    type="date"
                    defaultValue={userData.dob}
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
                <Calendar /> <strong>Date of Birth: </strong> {userData.dob}
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
              <div className="password-field">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current pass
                word" />
              </div>
              <div className="password-field">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="password-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              <div className="password-actions">
                <button className="update-password-button" style={{borderRadius:'8px'}}>Update Password</button>
                <button
                  className="cancel-button"
                  onClick={handleChangePasswordClick}
                  style={{borderRadius:'8px'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;