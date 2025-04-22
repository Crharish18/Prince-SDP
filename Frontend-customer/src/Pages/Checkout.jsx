import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderPages from '../Components/HeaderPages';
import { CreditCard, Truck, MapPin, ArrowLeft } from 'lucide-react';
import Footer from '../Components/Footer';

const Checkout = ({ onBack }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [shippingCost, setShippingCost] = useState(500);  // Default to 500 for Standard Shipping
  const [selectedShipping, setSelectedShipping] = useState('standard');  // Default to 'standard' shipping


  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (!token) {
          alert("Please log in to see your cart.");
          return;
        }
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get user info
        const customerId = decodedToken.id;

        const response = await axios.get(`http://localhost:5000/api/cart/${customerId}`);
        setCartItems(response.data);  // Update cart items

        // Calculate total based on fetched cart items
        const calculatedTotal = response.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(calculatedTotal);  // Set the total
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems(); // Fetch the user's cart when the component mounts
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        alert("Please log in.");
        return;
      }
  
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const customerId = decodedToken.id;
  
      // Collect shipping details from the form
      const first_name = document.querySelector('input[name="firstName"]').value;
      const last_name = document.querySelector('input[name="lastName"]').value;
      const phone = document.querySelector('input[name="phone"]').value;
      const address = document.querySelector('textarea[name="address"]').value;
      const city = document.querySelector('input[name="city"]').value;
      const province = document.querySelector('input[name="state"]').value;
      const postalcode = document.querySelector('input[name="pincode"]').value;
  
      // Set the shipping method
      const shipMethod = selectedShipping === 'standard' ? 'Standard Shipping' : 'Pickup';
  
      // Prepare order total (add shipping cost to the total)
      const totalPrice = total + shippingCost;
  
      // 1. Send shipping details to backend (saving in shipping_details)
      const shippingResponse = await axios.post('http://localhost:5000/api/shipping_details', {
        first_name,
        last_name,
        phone,
        address,
        city,
        province,
        postalcode,
        customer_id: customerId,
        Ship_method: shipMethod,
      });
  
      if (shippingResponse.status !== 201) {
        alert('Failed to save shipping details.');
        return;
      }
  
      // 2. Create the order in the order table
      const orderResponse = await axios.post('http://localhost:5000/api/orders', {
        customer_id: customerId,
        total_price: totalPrice,
        status: 'Pending',
      });
  
      if (orderResponse.status === 201) {
        const orderId = orderResponse.data.order_id;
  
        // 3. Insert order items into the order_item table
        const orderItems = cartItems.map(item => ({ 
          order_id: orderId,
          product_id: item.product_id,
          qty: item.quantity,
          price: item.price,
        }));
  
        const orderItemsResponse = await axios.post('http://localhost:5000/api/order_items', orderItems);
  
        if (orderItemsResponse.status === 201) {
          alert('Order placed successfully!');
          // Optionally: Redirect or clear form
        } else {
          alert('Failed to save order items.');
        }
      } else {
        alert('Failed to place order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };
  

    // Update shipping cost based on selected shipping method
    const handleShippingChange = (event) => {
      const selectedMethod = event.target.value;
      setSelectedShipping(selectedMethod);
      if (selectedMethod === "standard") {
        setShippingCost(500); // Standard shipping costs Rs. 500
      } else {
        setShippingCost(0); // Pickup is free
      }
    };


  return (
    <div className="min-h-screen bg-gray-50 pt-16 w-[1520px] ml-[-150px]">
      <HeaderPages />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form (Shipping Information & Payment Information) */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm ml-[-50px]">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    name="state"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postalcode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Payment Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-left">Order Summary</h2>
              <div className="space-y-4">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.cart_id} className="flex items-center gap-4 text-left" >
                        <img
                          src={item.image_url}  // Display the image using image_url from backend
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p>No items in the cart</p>
                  )}
                </div>

                <div className="border-t mt-6 pt-6 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs.{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Rs.{shippingCost.toFixed(2)}</span> {/* Show dynamic shipping cost */}
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs.{(total + shippingCost).toFixed(2)}</span> {/* Update total with shipping cost */}
                  </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Method</h2>
              </div>
              <div className="space-y-2">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="shipping" 
                    className="mr-3" 
                    value="standard"
                    onChange={handleShippingChange}
                    defaultChecked 
                  />
                  <div>
                    <p className="font-medium">Standard Shipping</p>
                    <p className="text-sm text-gray-500">Free • 3-5 business days</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="shipping" 
                    className="mr-3" 
                    value="pickup" 
                    onChange={handleShippingChange} 
                  />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-gray-500">Monday - Saturday 8.00am to 6.00pm</p>
                  </div>
                </label>
              </div>
            </div>


            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white py-4 rounded-md hover:bg-green-600 transition font-medium"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
