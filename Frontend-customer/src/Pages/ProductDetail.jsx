import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';
import HeaderPages from '../Components/HeaderPages';
import Footer from '../Components/Footer';
import { Minus, Plus, Heart, Share2, Info, Star, User } from 'lucide-react';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);  
  const [totalPrice, setTotalPrice] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        // Fetch reviews for this specific product with customer information
        const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    // Check if product is in wishlist
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (!token || !product) return;

        const response = await axios.get(`http://localhost:5000/api/auth/check-wishlist/${product.product_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsInWishlist(response.data.inWishlist);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [product]);

  // Recalculate total price whenever the quantity changes
  useEffect(() => {
    if (product) {
      let discountedPrice = parseFloat(product.price);
      // Apply discount if the quantity is greater than or equal to the min quantity for discount
      if (quantity >= product.min_quantity) {
        discountedPrice = discountedPrice - (discountedPrice * (product.discount_percentage / 100));
      }
      setTotalPrice(discountedPrice * quantity);
    }
  }, [product, quantity]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    // Check if increasing would exceed available stock
    if (product && quantity < product.stock_qty) {
      setQuantity(quantity + 1);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        alert("Please log in to add items to your wishlist.");
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/toggle-wishlist', {
        product_id: product.product_id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setIsInWishlist(response.data.inWishlist);
      // No alert messages for successful wishlist toggle
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // No alert for error
    }
  };

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
  
      if (!token) {
        alert("Please log in to add items to your cart.");
        return;
      }
  
      if (!userData) {
        alert("No user data found.");
        return;
      }
      
      // Check if requested quantity exceeds stock
      if (quantity > product.stock_qty) {
        alert(`Cannot add more than ${product.stock_qty} items to the cart.`);
        return;
      }
  
      // Send request to backend to add product to the cart
      const response = await axios.post('http://localhost:5000/api/cart', {
        customer_id: userData.id,
        product_id: product.product_id,
        quantity: quantity,
        price: product.price,
        discount: product.discount_percentage > 0 ? (product.price * (product.discount_percentage / 100)) : 0,
        status: 'active'
      });
  
      console.log('Product added to cart:', response.data);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) return null;

  // Function to display stock status based on quantity
  const renderStockStatus = () => {
    if (product.stock_qty <= 0) {
      return 'Out of Stock';
    } else if (product.stock_qty <= 10) {
      return `In Stock (${product.stock_qty} available)`;
    } else {
      return 'In Stock';
    }
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <HeaderPages />
      <div className="pt-16 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-[400px] h-[400px] object-contain rounded-lg mt-[60px] transition-transform transform hover:scale-105 shadow-xl shadow-green-400/50"
                />
                <div className="absolute top-4 right-4 space-x-2">
                  <button
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full shadow-md ${isInWishlist ? 'bg-red-100' : 'bg-white hover:bg-gray-100'}`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                  </button>
                  
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div className="text-left">
                  <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
                  <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-4 mt-[15px]">
                    <span className="text-2xl font-bold">Rs.{parseFloat(totalPrice).toFixed(2)}</span>
                    <span className="text-sm text-gray-500 text-green-500 font-bold text-[21px]">
                      {renderStockStatus()}
                    </span>
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

                {/* Product Description */}
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold mt-[10px]">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Key Features */}
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold">Key Features</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>High-quality agrochemicals for effective results</li>
                    <li>Fast delivery and bulk purchase discounts</li>
                    <li>Comprehensive range of products</li>
                    <li>Products sourced from trusted sources</li>
                  </ul>
                </div>

                {/* Quantity & Add to Cart */}
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
                        className={`p-2 hover:bg-gray-100 ${quantity >= product.stock_qty ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={quantity >= product.stock_qty}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={addToCart}
                      className={`w-full py-3 rounded-md transition ${
                        product.stock_qty > 0 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={product.stock_qty === 0}
                    >
                      {product.stock_qty > 0 
                        ? `Add to Cart - Rs.${(totalPrice).toFixed(2)}` 
                        : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews Section - Now with customer names and profile pics */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

            {/* Individual Reviews */}
            <div className="space-y-8">
              {reviewsLoading ? (
                <p className="text-gray-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500">No reviews available for this product.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-8">
                    <div className="flex items-start mb-4">
                      {review.profile_pic ? (
                        <img
                          src={review.profile_pic}
                          alt={`${review.first_name} ${review.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold"
                        style={{ display: review.profile_pic ? 'none' : 'flex' }}
                      >
                        <User className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-left">{review.first_name} {review.last_name}</h4>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-left">{review.review_text}</p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-4">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Review ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
