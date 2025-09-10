import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/auth/customer-wishlist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setWishlistItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId, e) => {
    // Stop event propagation to prevent navigation when clicking remove button
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) return;
      
      await axios.post('http://localhost:5000/api/auth/toggle-wishlist', 
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh wishlist after removal
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const addToCart = async (productId, price, discountPercentage, e) => {
    // Stop event propagation to prevent navigation when clicking add to cart button
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        alert("Please log in to add items to your cart.");
        return;
      }
      
      // Get the decoded token data
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const customerId = tokenData.id;
      
      if (!customerId) {
        alert("Customer ID not found in token.");
        return;
      }
      
      // Calculate discount amount
      const discountAmount = discountPercentage > 0 ? (price * (discountPercentage / 100)) : 0;
      
      // Send request to backend to add product to the cart
      const response = await axios.post('http://localhost:5000/api/cart', {
        customer_id: customerId,
        product_id: productId,
        quantity: 1,
        price: price,
        discount: discountAmount,
        status: 'active'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error('Error adding product to cart:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const navigateToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 flex justify-center items-center min-h-[300px]">
        <Loader className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h3 className="text-2xl font-bold mb-8">My Wishlist</h3>
      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
          <p className="text-gray-400">Save items you love to your wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div 
              key={item.wishlist_id} 
              className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigateToProductDetails(item.product_id)}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-2 text-lg">{item.name}</h4>
                <div className="flex items-center mb-4">
                  <p className="text-green-600 font-bold">Rs.{parseFloat(item.price).toFixed(2)}</p>
                  {item.discount_percentage > 0 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {parseFloat(item.discount_percentage).toFixed(2)}% OFF
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => handleRemoveFromWishlist(item.product_id, e)}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={(e) => addToCart(item.product_id, item.price, item.discount_percentage, e)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
