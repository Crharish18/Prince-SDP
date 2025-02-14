import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import React, { useState } from 'react';
import './Sidebar.css'; 
import { FaHome, FaUsers, FaBox, FaList, FaRegFileAlt, FaCogs, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Added icons
import logodash from "../assets/PicturesAdmin/logoWhite.png";

const Sidebar = () => {
  const [isEmployeesOpen, setEmployeesOpen] = useState(false);
  const [isProductOpen, setProductOpen] = useState(false);
  const [isCategoriesOpen, setCategoriesOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isSupplierOpen, setSupplierOpen] = useState(false);

  const toggleDropdown = (setter) => {
    setter(prevState => !prevState);
  };

  return (
    <div className="sidebar d-flex flex-column">
      <div className="logodash-container mb-0">
        <img src={logodash} alt="Shop Logo" className="logodash img-fluid" />
      </div>

        <ul className="list-unstyled">
            {/* Dashboard */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaHome className="sidebar-icon" /> Dashboard
                </button>
            </li>

            {/* Manage Employees */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaUsers className="sidebar-icon" /> Manage Employees
                </button>
            </li>

            {/* Manage Product */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaBox className="sidebar-icon" /> Manage Product
                </button>
            </li>

            <li className="sidebar-item">
          <Link to="/admin/categories" className="btn btn-link text-white">
            <FaList className="sidebar-icon" /> Categories
          </Link>
        </li>
            

            {/* Manage Orders */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaRegFileAlt className="sidebar-icon" /> Manage Orders
                </button>
            </li>

            {/* Reviews */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaRegFileAlt className="sidebar-icon" /> Reviews
                </button>
            </li>

            {/* Enquiries */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaRegFileAlt className="sidebar-icon" /> Enquiries
                </button>
            </li>

            {/* Manage Supplier */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaCogs className="sidebar-icon" /> Manage Supplier
                </button>
            </li>
        </ul>

    </div>
  );
};

export default Sidebar;
