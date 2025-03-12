import React from 'react';
import './Header.css';  // Make sure to have the necessary styles for your header

const Header = () => {
  // Retrieve username from localStorage
  const username = localStorage.getItem('username'); 

  // Handle user logout
  const handleLogout = () => {
    // Clear session data from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Redirect user to the login page after logout
    window.location.href = '/login';
  };

  return (
    <div className="header d-flex align-items-center justify-content-between p-3">
      {/* Display username if it exists, otherwise default to 'Guest' */}
      <h1 className="header-title mb-0">Welcome, {username || 'Guest'}</h1>
      
      {/* Sign out button */}
      <div className="header-actions">
        <button className="btn btn-primary" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
};

export default Header;
