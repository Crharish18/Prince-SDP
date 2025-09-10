import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1466801182732-9e4ea054c094?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNext = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setFadeClass('fade-in');
    }, 500);
  };

  const handlePrevious = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      setFadeClass('fade-in');
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative min-h-screen" 
      style={{ width: '100vw', overflowX: 'hidden', position: 'relative'}}
    >
      {/* Full width container */}
      <div className="absolute inset-0 w-full h-full">
        {/* Background image */}
        <img
          src={images[currentImageIndex]}
          alt="Agriculture"
          className={`w-full h-full object-cover transition-opacity duration-300 ${fadeClass}`}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Centered content */}
      <div className="relative flex items-center justify-center min-h-screen w-full">
        <div className="text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-[60px] font-bold mb-6 ">Welcome to Prince Lanka</h1>
          <p className="text-[23px] mb-8">Your Partner in Sustainable Agriculture</p>

          {/*Search Bar */}
          <div className="w-[1000px] max-w-2xl mx-auto mb-12 mt-[50px] align-middle">
            <form onSubmit={handleSearch}>
              <div 
                className={`relative transition-all duration-300 transform ${
                  searchFocused ? 'scale-105' : 'scale-100'
                }`}
              >
                {/* Glowing effect */}
                <div 
                  className={`absolute -inset-0.5 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full blur opacity-75 transition-opacity duration-300 ${
                    searchFocused ? 'opacity-100' : 'opacity-0'
                  }`}
                ></div>

                {/* Search container */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center">
                  {/* Search icon - replaced with SVG */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 ml-6 transition-colors duration-300 ${
                      searchFocused ? 'text-green-500' : 'text-gray-400'
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  <input
                    type="text"
                    placeholder="Search for agricultural products, equipment, or supplies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full px-4 py-5 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-2 mr-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="space-x-4">
            <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
              Contact Us
            </button>
            <button 
              onClick={() => navigate('/products')} 
              className="bg-white text-green-500 px-8 py-3 rounded-full hover:bg-gray-100 transition"
            >
              Shop
            </button>
          </div>
        </div>
      </div>

      {/* Left navigation button */}
      <button onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full">
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>

      {/* Right navigation button */}
      <button onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full">
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
};

export default Hero;