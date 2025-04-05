import React, { useState, useEffect } from 'react';
import { Scaling, ShoppingBag, User } from 'lucide-react';
import logoBlack from '../assets/logoBlack.png';
import logoWhite from '../assets/logoWhite.png';
import CartSidebar from './CartSidebar';  // Assuming you have a CartSidebar component for the cart content

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // State for cart visibility

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen); // Toggle the cart open/close state
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
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
          <div className="hidden md:flex space-x-8 relative">
            {['Home', 'About Us', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                {item}
              </a>
            ))}

            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <a
                href="#"
                className={`${isScrolled ? 'text-gray-600 hover:text-green-500' : 'text-white hover:text-green-200'}`}
              >
                Products
              </a>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 bg-white text-black shadow-lg rounded-[10px] w-48 z-20">
                  <ul className="space-y-2 p-4">
                    <li><a href="#" className="hover:text-green-500">Agricultural Machinery</a></li>
                    <li><a href="#" className="hover:text-green-500">Seeds & Plants</a></li>
                    <li><a href="#" className="hover:text-green-500">Farm Equipment</a></li>
                    <li><a href="#" className="hover:text-green-500">Agricultural Supplies</a></li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Cart and Profile Section */}
          <div className="flex items-center ">
            {/* Cart Icon */}
            <ShoppingBag
              className={`mr-[10px] h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`}
              onClick={toggleCart} // Toggle cart when clicked
            />
            <span className={isScrolled ? 'text-gray-600' : 'text-white'}>Cart (0)</span>
            <div className='ml-[20px]'>
              {/* Profile/Login Icon */}
              <User className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar (conditional rendering based on isCartOpen state) */}
      {isCartOpen && <CartSidebar />}
    </nav>
  );
};

export default Header;
