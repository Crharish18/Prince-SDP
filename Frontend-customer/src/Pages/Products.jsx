
import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const Products = () => {
  const [sortBy, setSortBy] = useState('default');
  
  const categories = [
    { name: "Agro Chemicals", count: 15 },
    { name: "Animal Husbandry", count: 8 },
    { name: "Bags for Agriculture", count: 12 },
    { name: "Books", count: 5 },
    { name: "Fertilizer", count: 20 },
    { name: "Home garden Items", count: 25 },
    { name: "Irrigation", count: 18 },
    { name: "Mechinary and agri equipments", count: 30 },
    { name: "Mushroom Items", count: 6 },
    { name: "Seeds", count: 40 }
  ];

  const products = [
    {
      id: 1,
      name: "Agrospray Electric / Battery Sprayer",
      category: "MECHINARY AND AGRI EQUIPMENTS",
      price: 16900.00,
      image: "https://images.unsplash.com/photo-1580982327559-c1d7200f6a3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Agrotec Dora Boat Water Pump",
      category: "MECHINARY AND AGRI EQUIPMENTS",
      price: 44000.00,
      image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Agrotech Brush Cutter BG 328 A",
      category: "MECHINARY AND AGRI EQUIPMENTS",
      price: 28500.00,
      image: "https://images.unsplash.com/photo-1598512199776-e5089fc45e43?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Irrigation System Pro",
      category: "IRRIGATION",
      price: 35999.00,
      image: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      name: "Premium Fertilizer Pack",
      category: "FERTILIZER",
      price: 2499.00,
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      name: "Organic Plant Protection Kit",
      category: "AGRO CHEMICALS",
      price: 1899.00,
      image: "https://images.unsplash.com/photo-1585314062604-1a357de8b000?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50" style={{ width: "100vw", marginLeft: '-160px' }}>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-gray-700">HOME</a>
            <span className="text-gray-500">/</span>
            <span className="font-medium">SHOP</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">PRODUCT CATEGORIES</h2>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <button className="w-full text-left flex items-center justify-between text-gray-600 hover:text-gray-900">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-400">({category.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600">Showing 1-12 of 97 results</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="default">Default sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Sort by name</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative pb-[100%]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-2">{product.category}</div>
                    <h3 className="text-sm font-medium mb-2 hover:text-green-600">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">Rs.{product.price.toFixed(2)}</div>
                      <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition">
                        ADD TO CART
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      or 3 X Rs.{(product.price / 3).toFixed(2)} with KOKO
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;