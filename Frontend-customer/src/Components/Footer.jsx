import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-green-700 to-green-500 text-white py-16 relative   ">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-green-300 to-green-600"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Section */}
          <div className='ml-[-60px] text-left'>
            <h3 className="text-2xl font-bold mb-6 border-b border-green-400 pb-2 inline-block">Prince Lanka</h3>
            <p className="text-green-100 mb-6">
              Providing quality products and services since 2020. Your trusted partner for sustainable agricultural solutions.
            </p>
            <div className="flex space-x-4 ">
              <a href="#" className="bg-white text-green-600 rounded-full p-2 hover:bg-green-200 transition duration-300">
                <Facebook size={20} />
              </a>
              
              <a href="#" className="bg-white text-green-600 rounded-full p-2 hover:bg-green-200 transition duration-300">
                <Instagram size={20} />
              </a>
              
            </div>
          </div>

          {/* Quick Links Section */}
          <div className='text-left'>
            <h3 className="text-2xl font-bold mb-6 border-b border-green-400 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/About" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/Products" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Products
                </a>
              </li>
              <li>
                <a href="/Services" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Services
                </a>
              </li>
             
              
              <li>
                <a href="/Contact" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div className='text-left'>
            <h3 className="text-2xl font-bold mb-6 border-b border-green-400 pb-2 inline-block">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Fertilizer Sales
                </a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Delivery Service
                </a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Customer Support
                </a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-400 w-1.5 h-1.5 rounded-full mr-2"></span>
                  Pesticides & Herbicides
                </a>
              </li>
              
            </ul>
          </div>

          {/* Contact Section */}
          <div className='text-left'>
            <h3 className="text-2xl font-bold mb-6 border-b border-green-400 pb-2 inline-block">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-full">
                  <MapPin size={20} className="text-white" />
                </div>
                <p className="text-green-100">No 21,Courtlodge, Kandapola</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-full">
                  <Phone size={20} className="text-white" />
                </div>
                <p className="text-green-100">+94 775670258</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 p-2 rounded-full">
                  <Mail size={20} className="text-white" />
                </div>
                <a href="mailto:info@princelanka.com" className="text-green-100 hover:text-white transition duration-300">princelankaagenciespvtltd@gmail.com</a>
              </div>
            </div>
          </div>
        </div>
        
       
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-green-600 text-center">
          <p className="text-green-100">© 2025 Prince Lanka Pvt(Ltd). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;