import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-green-500 text-white py-8 w-full"  style={{ width: '100vw',marginLeft: '-160px',marginBottom: "-32px", height:"200px", overflowX: 'hidden' }} >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className='text-left ml-[130px]'>
            <h3 className="text-xl font-semibold mb-4 ">Contact Us</h3>
            <p>Email: princelanka.com</p>
            <p>Phone: +1 234 567 890</p>
          </div>
          <div className="text-white text-left ml-[100px]">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul>
              <li><a href="#" className="hover:text-gray-200 text-white">About Us</a></li>
              <li><a href="#" className="hover:text-gray-200 text-white">Products</a></li>
              <li><a href="#" className="hover:text-gray-200 text-white">Services</a></li>
            </ul>
          </div>
          <div className='text-left ml-[30px]'>
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-200 text-white">Facebook</a>
              <a href="#" className="hover:text-gray-200 text-white">Twitter</a>
              <a href="#" className="hover:text-gray-200 text-white">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
