import React, { useState } from 'react';
import './profile.css';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Mail, Phone, Building, MapPin, Lock } from 'lucide-react';

const Profile = () => {
  // State to manage edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State to manage the visibility of the change password form
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toggle the edit profile mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Toggle the change password form
  const handleChangePasswordClick = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  return (
    <div>
      <Header />
      <Sidebar />

      <div className="profile-container">
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
            {/* Placeholder for profile image */}
            <img src="path/to/profile-image.jpg" alt="Profile" />
          </div>

          {/* Toggle between view mode and edit mode */}
          {isEditing ? (
            <div className="profile-edit" style={{ marginLeft: '100px' }}>
              {/* Editable fields */}
              <input
                className="editable-field"
                type="text"
                defaultValue="John Doe"
              />
              <input
                className="editable-field"
                type="email"
                defaultValue="john.doe@example.com"
              />
              <input
                className="editable-field"
                type="tel"
                defaultValue="+1 (555) 123-4567"
              />
              <input
                className="editable-field"
                type="text"
                defaultValue="Inventory Solutions Inc."
              />
              <input
                className="editable-field"
                type="text"
                defaultValue="New York, USA"
              />
            </div>
          ) : (

            <div className="profile-details">
              {/* Non-editable fields */}
              <p className="user-name">John Doe</p>
              <p className="user-email">
                <Mail /> john.doe@example.com
              </p>
              <p className="user-phone">
                <Phone /> +1 (555) 123-4567
              </p>
              <p className="user-company">
                <Building /> Inventory Solutions Inc.
              </p>
              <p className="user-location">
                <MapPin /> New York, USA
              </p>
            </div>

          )}

        </div>

        {/* Password Settings Section (appears below profile information) */}
        <div className="password-settings">
          <button className="change-password-button" onClick={handleChangePasswordClick}>
            <Lock /> Change Password
          </button>
          
          
          {/* Toggle the password change form visibility */}
          {isChangingPassword && (
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
                <button className="cancel-button" onClick={handleChangePasswordClick}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>qa
    </div>
  );
};

export default Profile;
