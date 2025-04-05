import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import CartSidebar from './CartSidebar'; // Import your CartSidebar component

const HeaderPages = () => {
  const [isCartOpen, setIsCartOpen] = useState(false); // State for cart visibility

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen); // Toggle the cart visibility
  };

  return (
    <div>
      <nav className="fixed top-0 left-0 w-full z-10 bg-white shadow-sm transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center w-full">
            {/* Logo Section */}
            <div className="flex items-center">
              <img
                src={logoBlack}
                alt="AgroTech Logo"
                className="h-[220px] mt-[16px]"
              />
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              {['Home', 'About Us', 'Products', 'Services', 'Contact'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-600 hover:text-green-500"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Cart Section */}
            <div className="flex items-center space-x-4" onClick={toggleCart}>
              <ShoppingBag className="h-6 w-6 text-gray-600" />
              <span className="text-gray-600">Cart (0)</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={toggleCart} />
    </div>
  );
};

export default HeaderPages;
