import React from 'react';
import HeaderPages from '../Components/HeaderPages';
import Footer from '../Components/Footer';
import ShopImage1 from '../assets/ShopImage1.jpeg';
import ShopImage2 from '../assets/ShopImage2.jpeg';
import ShopImage3 from '../assets/ShopImage3.jpeg'; 

const About = () => {
  return (
    <div className="pt-16">
      <HeaderPages />
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src="https://www.thecolombopost.org/wp-content/uploads/2021/08/fertilizer-@.jpg"
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">About Prince Lanka</h1>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At Prince Lanka, we're dedicated to revolutionizing agriculture through innovative technology 
            and sustainable practices. Our goal is to empower farmers with the tools and resources 
            they need to succeed in farming.
          </p>
        </div>

        {/* Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              name: "Maheshwaran",
              role: "Owner",
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
            },
            {
              name: "Surendhar",
              role: "Owner",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
            }
          ].map(function (member) {
            return (
              <div key={member.name} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            );
          })}
        </div>

        {/* Shop Photos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <img
            src={ShopImage2}
            alt="Our Shop"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <img
            src={ShopImage3}
            alt="Products Display"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <img
            src={ShopImage1}
            alt="Equipment Section"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
