import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './Pages/Home'; // Import Home component
import About from './Pages/About'; // Import About component
import Products from './Pages/Products';
import ProductDetail from './Pages/ProductDetail'; // Product Detail page
import CustomerLogin from './Pages/CustomerLogin';
import Signup from './Pages/CustomerSignup';
import Checkout from './Pages/Checkout';
import Profile from './Pages/Profile';     
import Services from './Pages/Services';
import Contact from './Pages/Contacts'; 
import ForgotPassword from './Pages/ForgotPassword';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Define a route for the Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Products" element={<Products />} />
        <Route path="/Product/:productId" element={<ProductDetail />} />
        <Route path="/CustomerLogin" element={<CustomerLogin />} />
        <Route path="/CustomerSignup" element={<Signup />} />
        <Route path="/Checkout" element={<Checkout />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;