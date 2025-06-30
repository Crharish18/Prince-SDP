import React from 'react';
import './Header.css';
import axios from 'axios'; 


const Header = () => {
  // Get username from localStorage
  const username = localStorage.getItem('username'); 

  // Handle user logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Send logout request to backend if token exists
        console.log('Token found, sending logout request');
        
        const response = await axios.post('/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Logout response:', response.data);
      } else {
        
        console.log('No token found');
      }
    } catch (error) {
      // Log error 
      console.error('Logout error:', error.response ? error.response.data : error.message);
    } finally {
      // Clear authentication and user data from localStorage
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/admin';
    }
  };
  
  return (
    <div className="header d-flex align-items-center justify-content-between p-3">
   
      <h1 className="header-title mb-0">Welcome, {username || 'Guest'}</h1>
      
      {/* Sign Out button */}
      <div className="header-actions">
        <button className="btn btn-primary" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
};

export default Header;
