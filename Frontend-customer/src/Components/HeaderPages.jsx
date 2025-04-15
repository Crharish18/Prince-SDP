import React, { useState } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import CartSidebar from './CartSidebar';
import { Link } from 'react-router-dom';

const HeaderPages = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-10 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center w-full">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/">
                <img
                  src={logoBlack}
                  alt="Prince Lanka Logo"
                  className="h-[220px] mt-[16px]"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8 relative">
              <Link
                to="/"
                className="text-gray-600 hover:text-green-500"
              >
                Home
              </Link>
              
              <Link
                to="/products"
                className="text-gray-600 hover:text-green-500"
              >
                Products
              </Link>
              
              <Link
                to="/about"
                className="text-gray-600 hover:text-green-500"
              >
                About Us
              </Link>
              
              <Link
                to="/services"
                className="text-gray-600 hover:text-green-500"
              >
                Services
              </Link>
              
              <Link
                to="/contact"
                className="text-gray-600 hover:text-green-500"
              >
                Contact
              </Link>
            </div>

            {/* Cart and Profile Section */}
            <div className="flex items-center">
              {/* Cart Icon */}
              <div className="flex items-center cursor-pointer" onClick={toggleCart}>
                <ShoppingBag
                  className="mr-[10px] h-6 w-6 text-gray-600"
                />
                <span className="text-gray-600">Cart (0)</span>
              </div>
              <div className="ml-[20px]">
                {/* Profile/Login Icon with link */}
                <Link to="/profile">
                  <User className="h-6 w-6 text-gray-600" />
                </Link>
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