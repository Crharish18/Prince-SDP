import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './Pages/Home'; // Import Home component
import About from './Pages/About'; // Import About component
import Products from './Pages/Products';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Define a route for the Home page */}
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Products" element={<Products />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;