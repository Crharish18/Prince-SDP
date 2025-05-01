import React, { useState, useEffect } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import CartSidebar from './CartSidebar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HeaderPages = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

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

    const token = localStorage.getItem('customerToken');
    if (token) {
      setIsLoggedIn(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserData(decodedToken);
    }
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleCategoryClick = (categoryId) => {
    setProductsDropdownOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-10 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center w-full">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/">
                <img src={logoBlack} alt="Prince Lanka Logo" className="h-[220px] mt-[16px]" />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8 relative">
              <Link to="/" className="text-gray-600 hover:text-green-500">Home</Link>

              {/* Products Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setProductsDropdownOpen(true)}
                onMouseLeave={() => setProductsDropdownOpen(false)}
              >
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-green-500"
                  onClick={e => {
                    e.preventDefault();
                    setProductsDropdownOpen(open => !open);
                  }}
                >
                  Products
                </Link>
                {productsDropdownOpen && (
                  <div className="absolute left-0 top-full bg-white bg-opacity-90 shadow-lg rounded-lg z-20" style={{ width: '750px' }}>
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

              <Link to="/about" className="text-gray-600 hover:text-green-500">About Us</Link>
              <Link to="/services" className="text-gray-600 hover:text-green-500">Services</Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-500">Contact</Link>
            </div>

            {/* Cart and Profile Section */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer" onClick={toggleCart}>
                <ShoppingBag className="mr-[10px] h-6 w-6 text-gray-600" />
                <span className="text-gray-600">Cart (0)</span>
              </div>

              <div className="ml-[20px]">
                {isLoggedIn ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setProfileDropdownOpen(true)}
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <button
                      className="bg-transparent p-0 m-0 border-none shadow-none text-gray-600"
                      style={{ background: 'transparent' }}
                      onClick={() => setProfileDropdownOpen(open => !open)}
                      tabIndex={0}
                    >
                      <User className="h-6 w-6 text-gray-600" />
                    </button>
                    {profileDropdownOpen && (
                      <div className="absolute right-0 top-full bg-white/70 shadow-lg rounded-lg z-20">
                        <div className="p-3">
                          <button
                            onClick={() => navigate('/profile')}
                            className="text-black hover:text-green-500 hover:bg-transparent bg-transparent py-1 text-left"
                          >
                            My Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="text-black hover:text-green-500 hover:bg-transparent bg-transparent py-1 text-left"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/CustomerLogin">
                    <User className="h-6 w-6 text-gray-600" />
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

export default HeaderPages;
