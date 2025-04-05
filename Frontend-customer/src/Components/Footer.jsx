import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-green-600 text-white py-12 w-full" style={{ width: '100vw', marginLeft: '-160px', marginBottom: "-32px", height: "auto", overflowX: 'hidden' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Contact Us Section */}
          <div className="text-left">
            <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Contact Us</h3>
            <p className="text-lg mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Email: <a href="mailto:info@princelanka.com" className="hover:text-gray-200">info@princelanka.com</a></p>
            <p className="text-lg mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Phone: <span className="text-gray-200">+1 234 567 890</span></p>
          </div>

          {/* Quick Links Section */}
          <div className="text-left">
            <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-400 text-lg text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>About Us</a></li>
              <li><a href="#" className="hover:text-gray-200 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>Products</a></li>
              <li><a href="#" className="hover:text-gray-200 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>Services</a></li>
            </ul>
          </div>

          {/* Company Info Section */}
          <div className="text-left">
            <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Prince Lanka Pvt(Ltd)</h3>
            <p className="text-lg mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Address: 9719 Lincoln Village Dr Suite 600, Sacramento, CA 95827</p>
            <p className="text-lg mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Phone: (916) 472-0847</p>
            <p className="text-white text-lg mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>Email: <a href="mailto:info@princelanka.com" className="hover:text-gray-200">info@princelanka.com</a></p>
            <p className="text-sm text-gray-300" style={{ fontFamily: 'Roboto, sans-serif' }}>© 2025 Prince Lanka Pvt(Ltd). All rights reserved.</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
