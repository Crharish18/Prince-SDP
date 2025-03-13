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
                  <Link to="/admin/dashboard" className="btn btn-link text-white">
                 <FaUsers className="sidebar-icon" /> Dashboard
                 </Link>
            </li>


            {/* Manage Admin*/}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaBox className="sidebar-icon" /> Manage Admin
                </button>
            </li>

            {/* Manage Employees */}
            <li className="sidebar-item">
                 <Link to="/admin/manageemployee" className="btn btn-link text-white">
                 <FaUsers className="sidebar-icon" /> Manage Employees
                 </Link>
            </li>

            {/* Manage Customers*/}
            <li className="sidebar-item">
                <Link to="/admin/Customer" className="btn btn-link text-white">
                <FaBox className="sidebar-icon" /> Customers
                </Link>
            </li>

            {/* Manage Order & order items*/}
            <li className="sidebar-item">
                <Link to="/admin/Orders" className="btn btn-link text-white">
                <FaList className="sidebar-icon" /> Orders
               </Link>
            </li>
            

            {/* Manage Transactions*/}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaBox className="sidebar-icon" /> Transactions
                </button>
            </li>

            {/* Manage Product & Inventory */}
            <li className="sidebar-item">
                <Link to="/admin/products" className="btn btn-link text-white">
                <FaList className="sidebar-icon" /> Products
               </Link>
            </li>

            
        
             {/* Manage Supplier */}
             <li className="sidebar-item">
                
                <Link to="/admin/Supplier" className="btn btn-link text-white">
                <FaList className="sidebar-icon" /> Suppliers
               </Link>
            </li>

            {/* Reviews */}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaRegFileAlt className="sidebar-icon" /> Reviews
                </button>
            </li>

            {/* Activity log*/}
            <li className="sidebar-item">
                <button className="btn btn-link text-white">
                <FaRegFileAlt className="sidebar-icon" /> Activity log
                </button>
            </li>

             {/* Profile*/}
             <li className="sidebar-item">
               
                <Link to="/admin/Profile" className="btn btn-link text-white">
                <FaList className="sidebar-icon" /> Profile
               </Link>
            </li>

           
        </ul>

    </div>
  );
};

export default Sidebar;
