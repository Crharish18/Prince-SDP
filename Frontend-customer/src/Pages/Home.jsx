// src/Pages/Home.jsx
import React from 'react';
import Header from '../Components/Header';
import Hero from '../Components/Hero';
import Categories from '../Components/Categories';
import Footer from '../Components/Footer';

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
      <Footer />
      
      {/* You can add more content below */}
    </div>
  );
};

export default Home;
