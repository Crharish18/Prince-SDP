import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Get productId from URL
import axios from 'axios';
import HeaderPages from '../Components/HeaderPages';
import Footer from '../Components/Footer';
import { Minus, Plus, Heart, Share2, Info } from 'lucide-react';  // Import the icons

const ProductDetail = () => {
  const { productId } = useParams();  // Get productId from URL params
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);  // State for quantity

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${productId}`); // Use correct endpoint
          setProduct(response.data);
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      };

    fetchProduct();
  }, [productId]);

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) return null;

  return (
    <div>
      <HeaderPages />
      <div className="pt-16 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative ">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-[400px] h-[400px] object-contain rounded-lg mt-[60px] shadow-md transition-transform transform hover:scale-105"
                />
                <div className="absolute top-4 right-4 space-x-2">
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6 ">
                <div className='text-left'>
                  <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
                  <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 mt-[15px]">
                    <span className="text-2xl font-bold ">Rs.{parseFloat(product.price).toFixed(2)}</span>
                    <span className="text-sm text-gray-500 text-green-500 font-bold text-[21px]">In Stock</span>
                  </div>
                </div>


                 {/* Bulk Discount Info */}
                 <div className="bg-green-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center text-green-700">
                            <Info className="h-5 w-5 mr-2" />
                            <h3 className="font-semibold">Bulk Purchase Discounts</h3>
                          </div>
                          <ul className="space-y-1 text-sm text-green-600">
                            <li className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${quantity >= product.min_quantity ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              Minimum Quantity for Discount: {product.min_quantity}
                            </li>
                            <li className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${quantity >= product.min_quantity ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              Discount Percentage: {product.discount_percentage}%
                            </li>
                          </ul>
                        </div>

                {/* Dynamic Description */}
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold mt-[10px]">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold">Key Features</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>High-quality agrochemicals for effective results</li>
                    <li>Fast delivery and bulk purchase discounts</li>
                    <li>Comprehensive range of products</li>
                    <li>Products sourced from trusted sources</li>
                  </ul>
                </div>

                {/* Display the Min Quantity and Discount Percentage */}
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">Quantity:</span>
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={decreaseQuantity}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 border-x">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition">
                      Add to Cart - Rs.{(product.price * quantity).toFixed(2)}
                    </button>
                  </div>
                  {/* Similar Products Section */}
<div className="mt-12">
  <h2 className="text-2xl font-semibold mb-6">Similar Products</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Similar Product Card */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img
        src="https://img.freepik.com/free-vector/bag-potting-mix_1308-39601.jpg?t=st=1743417113~exp=1743420713~hmac=66379d97039758cb429b0d06ddb3e86688855b986a936de492afc720efbf6c31&w=740"
        alt="Similar Product"
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">Product Name</h3>
        <p className="text-sm text-gray-500">Category Name</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold">Rs. 500.00</span>
          <button className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition">
            View Details
          </button>
        </div>
      </div>
    </div>

    {/* Similar Product Card */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img
        src="https://via.placeholder.com/200"
        alt="Similar Product"
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">Product Name</h3>
        <p className="text-sm text-gray-500">Category Name</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold">Rs. 600.00</span>
          <button className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition">
            View Details
          </button>
        </div>
      </div>
    </div>

    {/* Similar Product Card */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <img
        src="https://via.placeholder.com/200"
        alt="Similar Product"
        className="w-full h-[200px] object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">Product Name</h3>
        <p className="text-sm text-gray-500">Category Name</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold">Rs. 700.00</span>
          <button className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

                


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
