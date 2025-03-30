import React, { useState, useEffect } from 'react';
import './profile.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Mail, Phone, Building, MapPin, Lock, X, User, IdCard, Calendar, UserCircle } from 'lucide-react';
import axios from 'axios';  // Import axios for making HTTP requests

const Profile = () => {
  const [userData, setUserData] = useState(null);  // State to store user data
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch the user profile data
  useEffect(() => {
    // Get the token from localStorage or wherever you store it
    const token = localStorage.getItem('token');

    // If no token is found, return early
    if (!token) {
      console.log("No token found. Please log in again.");
      return;
    }

    // Make an API call to fetch user data
    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setUserData(response.data);  // Store the user data in state
      })
      .catch(error => {
        console.error('Error fetching user profile data:', error);
      });
  }, []);

  // Toggle the edit profile mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  if (!userData) {
    return <div>Loading...</div>;  // Show loading while user data is being fetched
  }

  return (
          <div >
         
            <div style={{marginTop: "-123px"}}>
            <Header />
            <Sidebar style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '275px',  // Adjust based on your sidebar width
          height: '100vh', // Full height of the screen
          backgroundColor: '#fff', // Optional: Set background color
          zIndex: 1000,
          padding: '20px',// Optional: Ensure it stays on top of other content
        }} />
      
      </div>

      <div className="profile-container" style={{ marginLeft: "275px",  width: "80vw", marginTop: "-650px" }}>
      
        {/* Profile Header */}
        <div className="profile-header">
          <h2>Profile Settings</h2>
          <button className="edit-profile-button" onClick={handleEditClick}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Information Section */}
        <div className="profile-info">
        <div className="profile-image">
        <img
              src={'https://i.pravatar.cc/150'}
              alt="Profile"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #0066cc',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
            />

          </div>


    {/* Toggle between view mode and edit mode */}
    {isEditing ? (
            <div className="profile-edit">
              <div className="profile-edit-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {/* Editable fields in two columns */}
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>First Name</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.first_name}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Last Name</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.last_name}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Email</label>
                  <input
                    className="editable-field"
                    type="email"
                    defaultValue={userData.email}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Phone Number</label>
                  <input
                    className="editable-field"
                    type="tel"
                    defaultValue={userData.phonenum}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Address</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.address}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>National ID</label>
                  <input
                    className="editable-field"
                    type="text"
                    defaultValue={userData.natID}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: '1 1 calc(50% - 10px)' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Date of Birth</label>
                  <input
                    className="editable-field"
                    type="date"
                    defaultValue={userData.dob}
                    style={{ width: '100%', padding: '8px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-details">
            <p className="user-username">
                  <User /> <strong>Username : </strong> {userData.username}
                </p>
                <p className="user-name">
                  <UserCircle /> <strong>Full Name : </strong>{userData.first_name} {userData.last_name}
                </p>
                <p className="user-email">
                  <Mail /> <strong>Email : </strong>{userData.email}
                </p>
                <p className="user-phone">
                  <Phone /><strong>Phone Number : </strong> {userData.phonenum}
                </p>
                
                <p className="user-location">
                  <MapPin /><strong>Email : </strong> {userData.address}
                </p>
                
                <p className="user-natID">
                  <IdCard /> <strong>National ID : </strong> {userData.natID}
                </p>
                <p className="user-dob">
                  <Calendar /> <strong>Date of Birth : </strong> {userData.dob}
                </p>
              </div>


          )}
        </div>

        <div className="password-settings">
          <button
            className="change-password-button"
            onClick={handleChangePasswordClick}
          >
            <Lock /> Change Password
          </button>
        </div>
      </div>

      {/* ===== Modal for Change Password ===== */}
      {isChangingPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="profile-header">
              <h2>Change Password</h2>
              
            </div>
            <div className="password-change-form">
              <div className="password-field">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
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
                <button className="update-password-button">Update Password</button>
                <button
                  className="cancel-button"
                  onClick={handleChangePasswordClick}
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