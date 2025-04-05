import { useState, useEffect } from 'react'; // Import necessary hooks
import axios from 'axios'; // Import axios for HTTP requests
import Footer from '../Components/Footer'; // Import Footer component
import HeaderPages from '../Components/HeaderPages';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);  // Separate loading for categories
  const [loadingProducts, setLoadingProducts] = useState(true);      // Separate loading for products
  const [sortBy, setSortBy] = useState('default');
  
  // Price filter state
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(165000); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filtered, setFiltered] = useState(false); // Track if the filter is applied

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);  // Display 12 products per page

  // Fetch categories from the API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories'); // Your backend API endpoint
        setCategories(response.data); // Store the categories in state
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false); // Set loading to false once the request is complete
      }
    };

    fetchCategories();
  }, []); // Empty dependency array ensures it runs once when the component mounts

  // Fetch products from the API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products'); // Your backend API endpoint
        setProducts(response.data); // Store the products in state
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false); // Set loading to false once the request is complete
      }
    };

    fetchProducts();
  }, []); // Empty dependency array ensures it runs once when the component mounts

  // Apply filters
  const applyFilter = () => {
    const filtered = products.filter(product => 
      parseFloat(product.price) >= minPrice && parseFloat(product.price) <= maxPrice
    );
    setFilteredProducts(filtered);
    setFiltered(true);
    setCurrentPage(1); // Reset to page 1 after filtering
  };

  // Reset filter
  const resetFilter = () => {
    setMinPrice(0);
    setMaxPrice(165000);
    setFiltered(false);
    setFilteredProducts([]); // Reset filtered products
    setCurrentPage(1); // Reset to page 1 after resetting the filter
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter products by search query
  const searchFilteredProducts = (products) => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
  const totalProducts = filtered ? filteredProducts.length : searchFilteredProducts(products).length;
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50" style={{ width: "100vw", marginLeft: '-160px' }}>
      <HeaderPages />

      <div>
      <div className="bg-white border-b mt-[-10px]">
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
          <div className="w-full md:w-64 flex-shrink-0 ml-[-60px] mr-[50px]">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">PRODUCT CATEGORIES</h2>
              <ul className="space-y-3">
                {loadingCategories ? (
                  <p>Loading categories...</p>  
                ) : (
                  categories.map((category) => (
                    <li key={category.category_id}>
                      <button className="w-full text-left flex items-center justify-between text-gray-00 hover:text-white bg-gray-300">
                        <span>{category.category_name}</span>
                        <span className="text-sm text-gray-400">({category.count})</span>
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
                    className="bg-blue-500 text-white py-2 px-4 rounded-md"
                  >
                    Filter
                  </button>

                  <button 
                    onClick={resetFilter}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 mr-[0px]">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-[1000px] h-[53px] mr-[-38px] p-4 rounded-[20px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600">Showing {indexOfFirstProduct + 1}-{indexOfLastProduct} of {totalProducts} results</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mr-[-40px] ">
              {loadingProducts ? (
                <p>Loading products...</p> 
              ) : (
                currentProducts.map((product) => (
                  <div key={product.product_id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative pb-[100%]">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-[230px] h-[240px] ml-[40px] mt-[40px] "
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-[18px] font-medium mb-2 hover:text-green-600 mt-[-15px] mb-[22px]">
                        <Link className='text-black' to={`/product/${product.product_id}`}>{product.name}</Link>  {/* Link to product detail page */}
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
                        or 3 X Rs.{isNaN(product.price) || product.price === null ? 'N/A' : (parseFloat(product.price) / 3).toFixed(2)} with KOKO
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
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
          </div>
        </div>
      </div>
    </div>
    <div className='ml=5' style={{marginLeft: '165px'}}>
    <Footer/>
    </div>
    </div>
  );
};

export default Products;
