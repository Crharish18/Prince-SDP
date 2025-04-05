// src/Pages/Home.jsx
import React from 'react';
import Header from '../Components/Header';
import Hero from '../Components/Hero';
import Categories from '../Components/Categories';
import Footer from '../Components/Footer';
import Features from '../Components/Features';

const Home = () => {
  return (
    <div  
    style={{  scrollbarWidth:"none",
    }} 
     >
      {/* Render the Header component */}
      <Header />
      <Hero />
      <Categories />
      <Features />
      {/* Add more components or sections as needed */}
      {/* For example, you can add a section for featured products or services */}
      
      {/* Render the Footer component */}
      <Footer />
      
      {/* You can add more content below */}
    </div>
  );
};




export default Home;
