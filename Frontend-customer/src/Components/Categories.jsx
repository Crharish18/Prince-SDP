import React, { useState, useEffect } from 'react';
import { Scaling, Tractor, ShoppingBag } from 'lucide-react';

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  
  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories/only6'); // Adjust the URL as per your backend API
        
        // Check if the response is OK (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(data);  // Set categories data to state
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Function to choose icons based on category name
  const getIcon = (categoryName) => {
    switch (categoryName) {
      default:
        return <ShoppingBag className="h-16 w-16 text-green-500" />;
    }
  };

  return (
    <div className="py-16 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Our Product Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(({ category_name }) => (
            <div key={category_name} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                {getIcon(category_name)}  {/* Display the appropriate icon */}
              </div>
              <h3 className="text-xl font-semibold mb-2">{category_name}</h3>
              
              <div className="text-green-500 font-semibold hover:text-green-600">Category </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
