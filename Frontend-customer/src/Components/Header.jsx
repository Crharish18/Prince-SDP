import React, { useState, useEffect } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import logoWhite from '../assets/logoWhite.png';
import CartSidebar from './CartSidebar';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false); // Separate state for Products dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);   // Separate state for Profile dropdown
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    // Check if the customer is logged in using the customerToken in localStorage
    const token = localStorage.getItem('customerToken');
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
      setUserData(decodedToken); // Use customer data from token
    }
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleCategoryClick = (categoryId) => {
    setProductsDropdownOpen(false); // Close the Products dropdown after selection
    navigate(`/products?category=${categoryId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    setIsLoggedIn(false);
    navigate('/CustomerLogin');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center w-full">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/">
                <img
                  src={isScrolled ? logoBlack : logoWhite}
                  alt="Prince Lanka Logo"
                  className={`h-[220px] mt-[16px] ${isScrolled ? 'text-green-500' : 'text-white'}`}
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8 relative">
              {/* Home link */}
              <Link
                to="/"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                Home
              </Link>

              {/* Products Dropdown with Categories */}
              <div
                className="relative group"
                onMouseEnter={() => setProductsDropdownOpen(true)}  // Open Products dropdown
                onMouseLeave={() => setProductsDropdownOpen(false)} // Close Products dropdown when mouse leaves
              >
                <Link
                  to="/products"
                  className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
                >
                  Products
                </Link>
                {productsDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 bg-white bg-opacity-90 shadow-lg rounded-lg z-20"
                    style={{ width: '750px' }}
                  >
                    <div className="p-3 border-b border-gray-200 bg-green-500 text-white font-medium rounded-t-lg">
                      Categories
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <button
                              key={category.category_id}
                              onClick={() => handleCategoryClick(category.category_id)}
                              className="text-black hover:text-green-500 hover:bg-transparent bg-transparent py-1 truncate text-left"
                            >
                              {category.category_name}
                            </button>
                          ))
                        ) : (
                          <span className="text-gray-500">Loading categories...</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Remaining navigation links */}
              <Link
                to="/about"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                About Us
              </Link>

              <Link
                to="/services"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                Services
              </Link>

              <Link
                to="/contact"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                Contact
              </Link>
            </div>

            {/* Cart and Profile Section */}
            <div className="flex items-center">
              {/* Cart Icon */}
              <div className="flex items-center cursor-pointer" onClick={toggleCart}>
                <ShoppingBag
                  className={`mr-[10px] h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`}
                />
                <span className={isScrolled ? 'text-gray-600' : 'text-white'}>Cart (0)</span>
              </div>
              <div className="ml-[20px]">
                {/* Profile/Login Icon with link */}
                {isLoggedIn ? (
                  <div className="relative">
                    <button 
                      className={`text-white ${isScrolled ? 'text-gray-600' : 'text-white'}`}
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}  // Toggle Profile dropdown
                    >
                      <User className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                    </button>
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg z-20">
                        <div className="p-3">
                          <button onClick={() => navigate('/profile')} className="text-black hover:text-green-500 hover:bg-transparent bg-transparent py-1 text-left">
                            My Profile
                          </button>
                          <button onClick={handleLogout} className="text-black hover:text-green-500 hover:bg-transparent bg-transparent py-1 text-left">
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/CustomerLogin">
                    <User className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
};

export default Header;
