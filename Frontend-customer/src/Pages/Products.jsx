import { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../Components/Footer';
import HeaderPages from '../Components/HeaderPages';
import { Link, useLocation } from 'react-router-dom';

const Products = () => {
  const location = useLocation();
  
  // Get search query and category from URL
  const queryParams = new URLSearchParams(location.search);
  const urlSearchQuery = queryParams.get('search') || '';
  const urlCategoryId = queryParams.get('category') || null;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId);
  
  // Price filter state
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(165000); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filtered, setFiltered] = useState(false);

  // Search state - initialize with URL search query
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Fetch categories from the API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when component mounts or when URL params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        let response;
        
        // Check if we have a category filter from URL
        if (urlCategoryId) {
          response = await axios.get(`http://localhost:5000/api/products/category/${urlCategoryId}`);
          setSelectedCategory(urlCategoryId);
        } else if (urlSearchQuery) {
          // If we have a search query, fetch all products (we'll filter them client-side)
          response = await axios.get('http://localhost:5000/api/products');
        } else {
          // Default: fetch all products
          response = await axios.get('http://localhost:5000/api/products');
        }
        
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
    // Reset filters when URL parameters change
    resetFilter();
    // Reset pagination
    setCurrentPage(1);
  }, [urlCategoryId, urlSearchQuery]);


  useEffect(() => {
    // Reset category and search query if page is refreshed
    const newSearchParams = new URLSearchParams(location.search);
  
    // Check if category or search params exist and remove them
    if (newSearchParams.has('category') || newSearchParams.has('search')) {
      newSearchParams.delete('category');
      newSearchParams.delete('search');
      
      window.history.pushState({}, '', `${location.pathname}?${newSearchParams.toString()}`);
    }
  
    // Fetch categories from the API on component mount
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
  
    fetchCategories();
  }, []);
  

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Apply filters
  const applyFilter = () => {
    const filtered = products.filter(product => 
      parseFloat(product.price) >= minPrice && parseFloat(product.price) <= maxPrice
    );
    setFilteredProducts(filtered);
    setFiltered(true);
    setCurrentPage(1);
  };

  // Reset filter
  const resetFilter = () => {
    setMinPrice(0);
    setMaxPrice(165000);
    setFiltered(false);
    setFilteredProducts([]);
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Update the URL with the new search query without reloading the page
    const newSearchParams = new URLSearchParams(location.search);
    if (searchQuery) {
      newSearchParams.set('search', searchQuery);
    } else {
      newSearchParams.delete('search');
    }
    
    // Keep the category param if it exists
    if (selectedCategory) {
      newSearchParams.set('category', selectedCategory);
    }
    
    window.history.pushState(
      {}, 
      '', 
      `${location.pathname}?${newSearchParams.toString()}`
    );
    // Reset to page 1 when searching
    setCurrentPage(1);
  };

  // Filter products by search query
  const searchFilteredProducts = (products) => {
    if (!searchQuery) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Function to handle category click
  const handleCategoryClick = async (categoryId) => {
    const isDeselecting = categoryId === selectedCategory;
    setSelectedCategory(isDeselecting ? null : categoryId);
    
    // Update URL with the category parameter
    const newSearchParams = new URLSearchParams(location.search);
    if (!isDeselecting) {
      newSearchParams.set('category', categoryId);
    } else {
      newSearchParams.delete('category');
    }
    
    // Keep search query if it exists
    if (searchQuery) {
      newSearchParams.set('search', searchQuery);
    }
    
    window.history.pushState(
      {}, 
      '', 
      `${location.pathname}?${newSearchParams.toString()}`
    );
    
    setLoadingProducts(true);
    try {
      const response = await axios.get(
        isDeselecting 
          ? 'http://localhost:5000/api/products' 
          : `http://localhost:5000/api/products/category/${categoryId}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products by category:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Sort products based on the selected sorting option
  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return [...products].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  };

  // Logic to handle the current products per page
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

  // Get sorted products
  const sortedProducts = sortProducts(filtered ? filteredProducts : searchFilteredProducts(products));

  // Get current products based on page
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Page navigation logic
  const pageNumbers = [];
  const totalProducts = sortedProducts.length;
  for (let i = 1; i <= Math.ceil(totalProducts / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Handle price range changes
  const handleMinPriceChange = (event) => {
    setMinPrice(parseInt(event.target.value, 10));
  };

  const handleMaxPriceChange = (event) => {
    setMaxPrice(parseInt(event.target.value, 10));
  };

  // Find selected category name for breadcrumb
  const selectedCategoryName = categories.find(
    category => category.category_id === selectedCategory
  )?.category_name;

  return (
    <div className=''>
    <div className="pt-16 min-h-screen bg-gray-50 " >
      <HeaderPages />

      <div>
        <div className="bg-white border-b mt-[-10px]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <a href="/" className="text-gray-500 hover:text-gray-700">HOME</a>
              <span className="text-gray-500">/</span>
              <span className="font-medium">SHOP</span>
              {selectedCategoryName && (
                <>
                  <span className="text-gray-500">/</span>
                  <span className="font-medium">{selectedCategoryName}</span>
                </>
              )}
              {searchQuery && (
                <>
                  <span className="text-gray-500">/</span>
                  <span className="font-medium">SEARCH RESULTS: "{searchQuery}"</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 ml-[-60px] mr-[50px]">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">PRODUCT CATEGORIES</h2>
                <ul className="space-y-3">
                  {loadingCategories ? (
                    <p>Loading categories...</p>
                  ) : (
                    categories.map((category) => (
                      <li key={category.category_id}>
                        <button 
                          onClick={() => handleCategoryClick(category.category_id)}
                          className={`w-full text-left flex items-center justify-between p-2 rounded ${
                            selectedCategory === category.category_id ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{category.category_name}</span>
                          <span className={`text-sm ${selectedCategory === category.category_id ? 'text-white' : 'text-gray-400'}`}>
                            ({category.count})
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>

                {/* Price Filter */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-4">FILTER BY PRICE</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Price: Rs.{minPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="165000"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      className="w-full"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Max Price: Rs.{maxPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="165000"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">Price: Rs.{minPrice} — Rs.{maxPrice}</p>

                  <div className="mt-4 flex justify-between">
                    <button 
                      onClick={applyFilter}
                      className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                    >
                      Filter
                    </button>

                    <button 
                      onClick={resetFilter}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 mr-[0px]">
              {/* Search Bar */}
              <div className="mb-6">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search products..."
                      className="w-[1000px] h-[53px] mr-[-38px] p-4 rounded-[20px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button 
                      type="submit"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <p className="text-gray-600">
                  {totalProducts === 0 ? (
                    "No products found"
                  ) : (
                    `Showing ${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, totalProducts)} of ${totalProducts} results`
                  )}
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategoryName && ` in "${selectedCategoryName}"`}
                </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mr-[-40px]">
                {loadingProducts ? (
                  <div className="col-span-3 text-center py-10">
                    <p>Loading products...</p>
                  </div>
                ) : currentProducts.length === 0 ? (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-lg text-gray-500">No products found matching your criteria.</p>
                    {(searchQuery || selectedCategory) && (
                      <p className="mt-2 text-gray-500">Try a different search term or browse categories.</p>
                    )}
                  </div>
                ) : (
                  currentProducts.map((product) => (
                    <div key={product.product_id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative pb-[100%]">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="absolute inset-0 w-[230px] h-[240px] ml-[40px] mt-[40px]"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-[18px] font-medium mb-2 hover:text-green-600 mt-[-15px] mb-[22px]">
                          <Link className='text-black' to={`/product/${product.product_id}`}>{product.name}</Link>
                        </h3>
                        <div className="text-xs text-gray-500 mb-2">{product.category_name}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">
                            Rs. {isNaN(product.price) || product.price === null ? 'N/A' : parseFloat(product.price).toFixed(2)}
                          </div>
                          <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition">
                            ADD TO CART
                          </button>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          or 3 X Rs.300 with card
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pageNumbers.length > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-full ${currentPage === number ? 'bg-green-500 text-white' : 'bg-white border'}`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div  >
        <Footer/>
      </div>
    </div>
    </div>
  );
};

export default Products;