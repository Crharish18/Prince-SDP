import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="header d-flex align-items-center justify-content-between p-3">
      <h1 className="header-title mb-0">Inventory Management System</h1>
      <div className="header-actions">
        <button className="btn btn-primary">Sign Out</button>
      </div>
    </div>
  );
};

export default Header;
