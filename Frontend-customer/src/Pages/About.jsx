import React from 'react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';

const About = () => {
  return (
    <div>
      <Header/>
    <div className="pt-16" style={{ width: "100vw", marginLeft: '-160px' }}>
      {/* Hero Section */}
      <div className="relative h-[400px] mt-[-100px]">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
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
            At AgroTech, we're dedicated to revolutionizing agriculture through innovative technology 
            and sustainable practices. Our goal is to empower farmers with the tools and resources 
            they need to succeed in modern farming.
          </p>
        </div>

        {/* Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            name: "Sarah Johnson",
            role: "CEO & Founder",
            image: ""
          },
          {
            name: "Michael Chen",
            role: "Head of Agriculture",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
          },
          {
            name: "Emily Rodriguez",
            role: "Tech Director",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
          }].map((member) => (
            <div key={member.name} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{
              title: "Innovation",
              description: "Constantly pushing the boundaries of agricultural technology"
            },
            {
              title: "Sustainability",
              description: "Promoting environmentally conscious farming practices"
            },
            {
              title: "Community",
              description: "Supporting local farmers and agricultural communities"
            },
            {
              title: "Quality",
              description: "Delivering the highest quality products and services"
            }].map((value) => (
              <div key={value.title} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
    <Footer/>
    </div>
  );
};

export default About;
