import React from 'react';
import { Link } from 'react-router-dom';


const Features = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex items-center gap-12">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <img
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1024&q=80"
              alt="Farmer"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Streamline Your Farming Experience with Prince Lanka</h2>
            <p className="text-gray-600 mb-8">
              Discover how Prince Lanka can transform your agricultural operations by providing a wide range of agricultural necessities. From seeds and agrochemicals to irrigation items and machinery, we have everything you need to enhance your farming operations.
            </p>
            <Link to="/Services">
  <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
    Learn More
  </button>
</Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;