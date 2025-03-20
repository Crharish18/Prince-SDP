import React from 'react';
import { Scaling, Tractor, ShoppingBag } from 'lucide-react';

const ProductCategories = () => {
  const categories = [
    { icon: Scaling, title: 'Seeds', description: 'High-quality seeds for better yields' },
    { icon: Tractor, title: 'Machinery', description: 'Modern farming equipment' },
    { icon: ShoppingBag, title: 'Supplies', description: 'Essential farming supplies' },
    { icon: ShoppingBag, title: 'Supplies', description: 'Essential farming supplies' },
  ];

  return (
    <div className="py-16 bg-gray-50 w-full" style={{ width: '100vw',marginLeft: '-160px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Our Product Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <Icon className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 mb-4">{description}</p>
              <button className="text-green-500 font-semibold hover:text-green-600">View More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;

