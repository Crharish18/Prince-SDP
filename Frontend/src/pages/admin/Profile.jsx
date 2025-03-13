import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import styles from './Profile.module.css'; // Importing CSS Module

function Profile() {
  const [userData, setUserData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    dob: '',
    phonenum: '',
    profilePic: '' // For profile picture
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Fetch user data (replace with API call)
    const fetchUserData = async () => {
      // Assuming the user data is already available from a logged-in user session or an API
      const data = {
        username: "johndoe",
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@example.com",
        address: "123 Street Name, City, Country",
        dob: "1990-01-01",
        phonenum: "+1234567890",
        profilePic: "https://via.placeholder.com/150" // Placeholder for profile picture
      };
      setUserData(data);
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = (event) => {
    // Handle profile picture change (upload functionality will go here)
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          profilePic: reader.result, // Update profile pic with uploaded image
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Password change logic (should be handled by the backend)
    if (newPassword === confirmPassword) {
      alert("Password changed successfully!");
    } else {
      alert("Passwords do not match.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="dashboard-content">
        <Header />
        
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.profilePicContainer}>
              <img 
                src={userData.profilePic} 
                alt="Profile" 
                className={styles.profilePic}
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePicChange} 
                className={styles.profilePicUpload}
              />
            </div>
            <div className={styles.profileInfo}>
              <h2>{userData.first_name} {userData.last_name}</h2>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Address:</strong> {userData.address}</p>
              <p><strong>Date of Birth:</strong> {userData.dob}</p>
              <p><strong>Phone Number:</strong> {userData.phonenum}</p>
            </div>
          </div>

          <div className={styles.passwordChangeSection}>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className={styles.passwordInputGroup}>
                <label>Old Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.passwordInputGroup}>
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.passwordInputGroup}>
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <button className={styles.profileButton} type="submit">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
