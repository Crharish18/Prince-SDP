import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import '../Sidebar.css'; 
import { FaTachometerAlt, FaUsers, FaBox, FaListAlt, FaRegFileAlt, FaCogs, FaUserCircle, FaExchangeAlt, FaTag, FaTruck, FaBoxOpen, FaCalendarTimes, FaShoppingBasket, FaTags, FaHandshake } from 'react-icons/fa';
import logodash from "../../assets/PicturesAdmin/logoWhite.png";

const Emp_Sidebar = () => {
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);

  // Style to reduce spacing between sidebar items
  const sidebarItemStyle = {
    padding: '7px 0', // Reduced padding
    marginBottom: '2px' // Reduced margin
  };

  // Style for icons with increased right margin
  const iconStyle = {
    marginRight: '15px' // Increased margin to create more space between icon and text
  };

  return (
    <div className="sidebar">
      <div className="logodash-container mb-0">
        <img src={logodash} alt="Shop Logo" className="logodash img-fluid" />
      </div>
      
      <div style={{ marginTop: '-5px', marginLeft: '7px' }}>
      <ul className="list-unstyled">
        {/* Dashboard */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/employee/dashboard" className="btn btn-link text-white">
            <FaTachometerAlt className="sidebar-icon" style={iconStyle} /> Dashboard
          </Link>
        </li>

        {/* Manage Orders */}
        <li 
          className="sidebar-item position-relative"
          style={sidebarItemStyle}
          onMouseEnter={() => setOrdersOpen(true)} 
          onMouseLeave={() => setOrdersOpen(false)}
        >
          <div className="btn btn-link text-white align-items-center" 
               style={{ textDecoration: 'none', fontSize: '20px', fontFamily: 'sans-serif' }}>
            <FaListAlt className="sidebar-icon" style={iconStyle} /> Orders
          </div>

          {isOrdersOpen && (
            <div className="hover-submenu">
              <Link to="/employee/Orders" className="submenu-item">
                <FaListAlt className="submenu-icon" style={iconStyle} /> All Orders
              </Link>
              <Link to="/employee/Transactions" className="submenu-item">
                <FaExchangeAlt className="submenu-icon" style={iconStyle} /> All Transactions
              </Link>
            </div>
          )}
        </li>

        {/* Manage Customers */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/employee/Customer" className="btn btn-link text-white">
            <FaUsers className="sidebar-icon" style={iconStyle} /> Customers
          </Link>
        </li>

        {/* Manage Inventory */}
        <li 
          className="sidebar-item position-relative"
          style={sidebarItemStyle}
          onMouseEnter={() => setInventoryOpen(true)} 
          onMouseLeave={() => setInventoryOpen(false)}
        >
          <div className="btn btn-link text-white align-items-center" 
               style={{ textDecoration: 'none', fontSize: '20px', fontFamily: 'sans-serif' }}>
            <FaCogs className="sidebar-icon" style={iconStyle} /> Inventory
          </div>

          {isInventoryOpen && (
            <div className="hover-submenu">
                <Link to="/employee/Inventory" className="submenu-item">
                <FaBoxOpen className="submenu-icon" style={iconStyle} /> Inventories
              </Link>
              <Link to="/employee/Expired_Inventories" className="submenu-item">
                <FaCalendarTimes  className="submenu-icon" style={iconStyle}/> Expired Inventories
              </Link>
              <Link to="/employee/products" className="submenu-item">
                <FaShoppingBasket className="submenu-icon" style={iconStyle} /> Products
              </Link>
              <Link to="/employee/Categories" className="submenu-item">
                <FaTags className="submenu-icon" style={iconStyle} /> Categories
              </Link>
              <Link to="/employee/Supplier" className="submenu-item">
                <FaHandshake className="submenu-icon" style={iconStyle} /> Suppliers
              </Link>
            </div>
          )}
        </li>



        {/* Profile */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/employee/Profile" className="btn btn-link text-white">
            <FaUserCircle className="sidebar-icon" style={iconStyle} /> Profile
          </Link>
        </li>
      </ul>
      </div>
    </div>
  );
};

export default Emp_Sidebar;
