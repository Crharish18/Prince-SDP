import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1466801182732-9e4ea054c094?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Example second image
    "https://images.unsplash.com/photo-1563772204-b2e8be0a5d2d?crop=entropy&cs=tinysrgb&fit=max&ixid=MnwzNjYyOXwwfDF8c2VhY2h8Mnx8fGFncmljdWx0dXJlfGVufDB8fHx8fDE2ODk2MDM1NzA&ixlib=rb-1.2.1&q=80&w=1080"  // Example third image
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');

  const handleNext = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length); // Loop back to the first image
      setFadeClass('fade-in');
    }, 300); // Match the duration of fade-out
  };

  const handlePrevious = () => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length); // Loop back to the last image
      setFadeClass('fade-in');
    }, 300); // Match the duration of fade-out
  };

  return (
    <div 
      className="relative min-h-screen" 
      style={{ width: '100vw', overflowX: 'hidden', position: 'relative', marginLeft: '-160px', marginTop: '-32px'}} // full width and hidden overflow
    >
      {/* Full width container */}
      <div className="absolute inset-0 w-full h-full">
        {/* Background image */}
        <img
          src={images[currentImageIndex]} // Dynamically use the current image
          alt="Agriculture"
          className={`w-full h-full object-cover transition-opacity duration-300 ${fadeClass}`} // Apply fade transition
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Centered content */}
      <div className="relative flex items-center justify-center min-h-screen w-full">
        <div className="text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-6">Welcome to Prince Lanka</h1>
          <p className="text-xl mb-8">Your Partner in Sustainable Agriculture</p>
          <div className="space-x-4">
            <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
              Contact Us
            </button>
            <button className="bg-white text-green-500 px-8 py-3 rounded-full hover:bg-gray-100 transition">
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
