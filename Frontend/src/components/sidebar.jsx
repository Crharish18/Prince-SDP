import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import React, { useState } from 'react';
import './Sidebar.css'; 
import { FaTachometerAlt, FaUsers, FaBox, FaListAlt, FaRegFileAlt, FaCogs, FaChevronDown, FaChevronUp, FaUserShield, FaUserCircle, FaExchangeAlt, FaTag, FaTruck,FaBoxOpen, FaCalendarTimes, FaShoppingBasket, FaTags, FaHandshake } from 'react-icons/fa'; // Added icons for submenu
import logodash from "../assets/PicturesAdmin/logoWhite.png";

const Sidebar = () => {
  const [isEmployeesOpen, setEmployeesOpen] = useState(false);
  const [isProductOpen, setProductOpen] = useState(false);
  const [isCategoriesOpen, setCategoriesOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isSupplierOpen, setSupplierOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isReviewsOpen, setReviewsOpen] = useState(false);

  const toggleDropdown = (setter) => {
    setter(prevState => !prevState);
  };

  // Style to reduce spacing between sidebar items(extra)
  const sidebarItemStyle = {
    padding: '4px 0', 
    marginBottom: '2px' 
  };
  

  return (
    <div className="sidebar d-flex flex-column">
      <div className="logodash-container mb-0">
        <img src={logodash} alt="Shop Logo" className="logodash img-fluid" />
      </div>
      
      <div style={{ marginTop: '-30px', marginLeft: '7px' }}>
      <ul className="list-unstyled">
        {/* Dashboard */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/dashboard" className="btn btn-link text-white">
            <FaTachometerAlt className="sidebar-icon" /> Dashboard
          </Link>
        </li>

        {/* Manage Admin */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/Admin" className="btn btn-link text-white">
            <FaUserShield className="sidebar-icon" /> Admin
          </Link>
        </li>

        
        
        {/* Manage Employees */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/manageemployee" className="btn btn-link text-white">
            <FaUsers className="sidebar-icon" /> Employees
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
            <FaListAlt className="sidebar-icon" style={{ marginRight: '10px' }} /> Orders
          </div>

          {isOrdersOpen && (
            <div className="hover-submenu">
              <Link to="/admin/Orders" className="submenu-item">
                <FaListAlt className="submenu-icon" style={{ marginRight: '10px' }} /> All Orders
              </Link>
              <Link to="/admin/Transactions" className="submenu-item">
                <FaExchangeAlt className="submenu-icon" style={{ marginRight: '10px' }} /> All Transactions
              </Link>
            </div>
          )}
        </li>

        {/* Manage Customers */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/Customer" className="btn btn-link text-white">
            <FaUsers className="sidebar-icon" /> Customers
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
            <FaCogs className="sidebar-icon" style={{ marginRight: '10px' }} /> Inventory
          </div>

          {isInventoryOpen && (
            <div className="hover-submenu">
                <Link to="/admin/Inventory" className="submenu-item">
                    <FaBoxOpen className="submenu-icon" style={{ marginRight: '10px' }} /> Inventories
                  </Link>
                  <Link to="/admin/Expired_Inventories" className="submenu-item">
                    <FaCalendarTimes className="submenu-icon" style={{ marginRight: '10px' }} /> Expired Inventories
                  </Link>
                  <Link to="/admin/products" className="submenu-item">
                    <FaShoppingBasket className="submenu-icon" style={{ marginRight: '10px' }} /> Products
                  </Link>
                  <Link to="/admin/Categories" className="submenu-item">
                    <FaTags className="submenu-icon" style={{ marginRight: '10px' }} /> Categories
                  </Link>
                  <Link to="/admin/Supplier" className="submenu-item">
                    <FaHandshake className="submenu-icon" style={{ marginRight: '10px' }} /> Suppliers
                  </Link>

            </div>
          )}
        </li>

        {/* Reviews */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/reviews" className="btn btn-link text-white">
            <FaRegFileAlt className="sidebar-icon" /> Reviews
          </Link>
        </li>

        {/* Activity Log */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/activitylog" className="btn btn-link text-white">
            <FaListAlt className="sidebar-icon" /> Activity Log
          </Link>
        </li>

        {/* Reports - Added as requested */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/reports" className="btn btn-link text-white">
            <FaRegFileAlt className="sidebar-icon" /> Reports
          </Link>
        </li>

        {/* Profile */}
        <li className="sidebar-item" style={sidebarItemStyle}>
          <Link to="/admin/Profile" className="btn btn-link text-white">
            <FaUserCircle className="sidebar-icon" /> Profile
          </Link>
        </li>
      </ul>
      </div>
    </div>
  );
};

export default Sidebar;
