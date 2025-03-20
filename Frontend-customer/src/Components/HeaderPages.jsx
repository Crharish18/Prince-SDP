import React, { useState, useEffect } from 'react';
import { Scaling, ShoppingBag } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import logoWhite from '../assets/logoWhite.png'; // Adjust the path as well

const HeaderPages = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8"> {/* Ensures the width is full and responsive */}
        <div className="flex justify-between h-16 items-center w-full">
          {/* Logo Section */}
          <div className="flex items-center">
          <img
              src={isScrolled ? logoBlack : logoWhite}  // Conditionally render logo based on scroll
              alt="AgroTech Logo"
              className={`h-[220px] mt-[16px] ${isScrolled ? 'text-green-500' : 'text-white'}`}
            />
            
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {['Home', 'About Us', 'Products', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Cart Section */}
          <div className="flex items-center space-x-4">
            <ShoppingBag className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
            <span className={isScrolled ? 'text-gray-600' : 'text-white'}>Cart (0)</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderPages;
