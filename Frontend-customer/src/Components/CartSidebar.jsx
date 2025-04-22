import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // Initialize navigate using useNavigate

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (!token) {
          alert("Please log in to see your cart.");
          return;
        }
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get user info
        const customerId = decodedToken.id;

        const response = await axios.get(`http://localhost:5000/api/cart/${customerId}`);
        setCartItems(response.data);  // Update cart items in the sidebar
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    if (isOpen) {
      fetchCart(); // Fetch the cart data when the sidebar opens
    }
  }, [isOpen]);

  // Function to calculate discount based on quantity and min_quantity
  const calculateDiscount = (price, quantity, minQuantity, discountPercentage) => {
    if (quantity >= minQuantity) {
      // Apply discount if quantity is greater than or equal to min_quantity
      return (price * discountPercentage / 100) * quantity;
    }
    return 0;  // No discount if quantity is less than min_quantity
  };
  
  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + calculateDiscount(parseFloat(item.price), item.quantity, item.min_quantity, item.discount_percentage), 0);
  const finalTotal = total - totalDiscount;
  
  // Remove item from cart
  const handleRemoveItem = async (cartId) => {
    try {
      // Call API to remove the item from the database
      await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
      
      // Update the local state to remove the item
      setCartItems(cartItems.filter((item) => item.cart_id !== cartId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleUpdateQuantity = async (cartId, quantity) => {
    const updatedQuantity = Math.max(quantity, 1); // Ensure quantity is at least 1
    
    try {
      // Use the cart_id to update the quantity in the database
      const response = await axios.put(`http://localhost:5000/api/cart/${cartId}`, {
        quantity: updatedQuantity,
      });
  
      // Check if the response was successful
      if (response.status === 200) {
        // Update the cartItems state with the new quantity
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.cart_id === cartId
              ? { ...item, quantity: updatedQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };
  
  // Clear the cart
  const handleClearCart = async () => {
    try {
      // You might want to add an API endpoint to clear all cart items at once
      // For now, we'll just remove each item individually
      for (const item of cartItems) {
        await axios.delete(`http://localhost:5000/api/cart/${item.cart_id}`);
      }
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

    // Handle redirect to Checkout page
    const handleCheckout = () => {
      navigate('/checkout'); // Redirect to the Checkout page
    };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearCart}
                className="p-2 hover:bg-red-50 rounded-full text-red-500"
                title="Clear Cart"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = parseFloat(item.price); // Ensure item price is a number
                const itemDiscount = calculateDiscount(itemPrice, item.quantity, item.min_quantity, item.discount_percentage);
                const itemTotal = itemPrice * item.quantity;
                const itemFinalTotal = itemTotal - itemDiscount;

                  return (
                    <div key={item.cart_id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="text-left">
                            <h3 className="font-medium text-sm">{item.name}</h3>  {/* Display product name */}
                            <div className="text-sm space-y-1">
                              <p className="text-gray-500">
                                Price: Rs.{itemPrice.toFixed(2)}
                              </p>
                              <p className="text-green-600">
                                Discount: -Rs.{itemDiscount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.cart_id)}
                            className="text-gray-400 hover:text-red-500 h-10 w-10 mt-[20px]"
                          >
                            <X className="h-4 w-4 ml-[-7px]" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.cart_id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="mx-2 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.cart_id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-gray-500 line-through">
                              Rs.{itemTotal.toFixed(2)}
                            </p>
                            <p className="font-medium">
                              Rs.{itemFinalTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal:</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span>-Rs.{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>Rs.{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              Checkout
            </button>
            <p className="text-sm text-gray-500 text-center">
              or 3 X Rs.{(finalTotal / 3).toFixed(2)} with KOKO
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;