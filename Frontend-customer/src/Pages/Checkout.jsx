import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderPages from '../Components/HeaderPages';
import { CreditCard, Truck, ArrowLeft, MapPin, Plus } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../assets/logoBlack.png';
import Footer from '../Components/Footer';

// Create a separate component for the address form to maintain its own state
const AddressFormComponent = ({ type, initialData, onSave, onCancel }) => {
  const [localFormData, setLocalFormData] = useState(initialData);

  // Update local form when initialData changes
  useEffect(() => {
    setLocalFormData(initialData);
  }, [initialData]);

  const handleLocalChange = (field, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSave(localFormData);
  };

  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Full Name</label>
        <input
          type="text"
          value={localFormData.fullname || ''}
          onChange={(e) => handleLocalChange('fullname', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Street Address</label>
        <input
          type="text"
          value={localFormData.street || ''}
          onChange={(e) => handleLocalChange('street', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Apartment/Unit (Optional)</label>
        <input
          type="text"
          value={localFormData.apartment || ''}
          onChange={(e) => handleLocalChange('apartment', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">City</label>
          <input
            type="text"
            value={localFormData.city || ''}
            onChange={(e) => handleLocalChange('city', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Province</label>
          <input
            type="text"
            value={localFormData.province || ''}
            onChange={(e) => handleLocalChange('province', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Postal Code</label>
          <input
            type="text"
            value={localFormData.postal_code || ''}
            onChange={(e) => handleLocalChange('postal_code', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Country</label>
          <input
            type="text"
            value={type === 'Shipping' ? 'Sri Lanka' : (localFormData.country || '')}
            onChange={(e) => handleLocalChange('country', e.target.value)}
            disabled={type === 'Shipping'}
            className={`w-full px-3 py-2 border rounded-md text-left ${type === 'Shipping' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-transparent'}`}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Use This Address
        </button>
      </div>
    </div>
  );
};

const Checkout = ({ onBack }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(500);  // Default to 500 for Standard Shipping
  const [selectedShipping, setSelectedShipping] = useState('standard shipping');  // Default to 'standard shipping'
  
  // Address states
  const [addresses, setAddresses] = useState({
    shipping: [],
    billing: []
  });
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  
  // Temporary address states
  const [tempShippingAddress, setTempShippingAddress] = useState(null);
  const [tempBillingAddress, setTempBillingAddress] = useState(null);
  
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);
  const [formData, setFormData] = useState({
    newShippingAddress: {
      fullname: '',
      street: '',
      apartment: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Sri Lanka',
      type: 'shipping',
      isTemporary: true
    },
    newBillingAddress: {
      fullname: '',
      street: '',
      apartment: '',
      city: '',
      province: '',
      postal_code: '',
      country: '',
      type: 'billing',
      isTemporary: true
    }
  });

  // Fetch cart items when component mounts
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

        // Calculate total based on the total_price field from cart table
        const calculatedTotal = response.data.reduce(
          (sum, item) => sum + Number(item.total_price), 
          0
        );
        setTotal(calculatedTotal);  // Set the total
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems(); // Fetch the user's cart when the component mounts
  }, []);

  // Fetch customer addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressesLoading(true);
        const token = localStorage.getItem('customerToken');
        
        if (!token) {
          setAddressesLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/auth/customer-addresses', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Organize addresses by type
        const addressData = {
          shipping: [],
          billing: []
        };
        
        if (response.data && response.data.length > 0) {
          response.data.forEach(address => {
            if (address.type === 'shipping') {
              addressData.shipping.push(address);
            } else if (address.type === 'billing') {
              addressData.billing.push(address);
            }
          });
        }
        
        setAddresses(addressData);
        
        // Set default selected addresses if available
        if (addressData.shipping.length > 0) {
          setSelectedShippingAddress(addressData.shipping[0].address_id);
        }
        
        if (addressData.billing.length > 0) {
          setSelectedBillingAddress(addressData.billing[0].address_id);
        }
        
        setAddressesLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddressesLoading(false);
      }
    };
    
    fetchAddresses();
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
    
    // Get the selected shipping and billing addresses
    let shippingAddress;
    let billingAddress;
    
    if (tempShippingAddress) {
      shippingAddress = tempShippingAddress;
    } else {
      shippingAddress = addresses.shipping.find(addr => addr.address_id === selectedShippingAddress);
    }
    
    if (tempBillingAddress) {
      billingAddress = tempBillingAddress;
    } else {
      billingAddress = addresses.billing.find(addr => addr.address_id === selectedBillingAddress);
    }
    
    if (!shippingAddress) {
      alert("Please select or add a shipping address.");
      return;
    }
    
    if (!billingAddress) {
      alert("Please select or add a billing address.");
      return;
    }

    // Set the shipping method - match the enum values exactly
    const shipMethod = selectedShipping === 'standard shipping' ? 'standard shipping' : 'pickup';

    // Calculate all required values
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalDiscount = cartItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    const totalPrice = Number(total) + Number(shippingCost);
    
    // Create the order with only the required fields that match the server expectations
    const orderData = {
      customer_id: customerId,
      price: subtotal,
      total_discount: totalDiscount,
      total_price: totalPrice,
      status: 'Pending'
    };

    console.log("Sending order data:", orderData);
    
    const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData);

    if (orderResponse.status === 201) {
      const orderId = orderResponse.data.order_id;
      
      // Save shipping address to order_address table
      const shippingAddressData = {
        order_id: orderId,
        fullname: shippingAddress.fullname,
        street: shippingAddress.street,
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city,
        province: shippingAddress.province,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country,
        shipment_method: shipMethod,
        type: 'shipping'
      };
      
      await axios.post('http://localhost:5000/api/order_address', shippingAddressData);
      
      // Save billing address to order_address table
      const billingAddressData = {
        order_id: orderId,
        fullname: billingAddress.fullname,
        street: billingAddress.street,
        apartment: billingAddress.apartment || '',
        city: billingAddress.city,
        province: billingAddress.province,
        postal_code: billingAddress.postal_code,
        country: billingAddress.country,
        shipment_method: shipMethod,
        type: 'billing'
      };
      
      await axios.post('http://localhost:5000/api/order_address', billingAddressData);

      // Insert order items into the order_item table
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        qty: item.quantity,
        price: Number(item.price) * item.quantity, // Unit price × quantity (before discount)
        discount: Number(item.discount || 0), // Total discount for this product (not multiplied)
        final_price: Number(item.total_price) // Final price after discount
      }));

      // POST the order items
      const orderItemsResponse = await axios.post('http://localhost:5000/api/order_items', orderItems);

      if (orderItemsResponse.status === 201) {
        // Reduce inventory using FIFO method
        const inventoryItems = cartItems.map(item => ({
          product_id: item.product_id,
          qty: item.quantity
        }));
        
        await axios.post('http://localhost:5000/api/inventory/reduce-stock', { items: inventoryItems });
        
        // Generate PDF invoice
        generateInvoicePDF({
          orderId,
          cartItems,
          total,
          shippingCost,
          grandTotal: totalPrice,
          shipMethod,
        });
        
        // Clear cart after successful order
        await axios.delete(`http://localhost:5000/api/cart/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Order placed successfully!');
        // Optionally: Redirect to order confirmation page
        window.location.href = '/order-confirmation';
      } else {
        alert('Failed to save order items.');
      }
    } else {
      alert('Failed to place the order.');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    alert('Failed to place order: ' + (error.response?.data?.error || error.message));
  }
};


  
  // Update shipping cost based on selected shipping method
  const handleShippingChange = (event) => {
    const selectedMethod = event.target.value;
    setSelectedShipping(selectedMethod);
    if (selectedMethod === "standard shipping") {
      setShippingCost(500); // Standard shipping costs Rs. 500
    } else {
      setShippingCost(0); // Pickup is free
    }
  };

  // Address form handling
  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`new${type}Address`]: {
        ...prev[`new${type}Address`],
        [field]: value
      }
    }));
  };

  // Save temporary address (not to database)
  const handleSaveTempAddress = (formData, type) => {
    // Validate required fields
    if (!formData.fullname || !formData.street || !formData.city || 
        !formData.province || !formData.postal_code) {
      alert(`Please fill in all required fields for the ${type.toLowerCase()} address.`);
      return;
    }
    
    // Create a temporary address with a unique ID
    const tempAddress = {
      ...formData,
      temp_id: `temp-${Date.now()}`, // Create a unique ID for the temporary address
      isTemporary: true,
      type: type.toLowerCase()
    };
    
    if (type === 'Shipping') {
      setTempShippingAddress(tempAddress);
      setSelectedShippingAddress(null); // Deselect any saved address
      setShowNewShippingForm(false);
    } else {
      setTempBillingAddress(tempAddress);
      setSelectedBillingAddress(null); // Deselect any saved address
      setShowNewBillingForm(false);
    }
  };

  const SavedAddressCard = ({ address, selected, onSelect }) => (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition text-left ${
        selected ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className={`w-4 h-4 mt-1 rounded-full border-2 mr-3 ${
          selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
        }`} />
        <div>
          <p className="font-medium">{address.fullname}</p>
          <p className="text-gray-600">{address.street}</p>
          {address.apartment && <p className="text-gray-600">{address.apartment}</p>}
          <p className="text-gray-600">{address.city}, {address.province} {address.postal_code}</p>
          <p className="text-gray-600">{address.country}</p>
          {address.isTemporary && <p className="text-xs text-blue-500 mt-1">Temporary Address</p>}
        </div>
      </div>
    </div>
  );

  function generateInvoicePDF({
    orderId,
    cartItems,
    total,
    shippingCost,
    grandTotal,
    shipMethod,
  }) {
    const doc = new jsPDF();
  
    // Add logo (adjust width/height as needed)
    doc.addImage(logo, 'PNG', 10, 10, 40, 20);
  
    // Company Name and Invoice Title
    doc.setFontSize(18);
    doc.text("Prince Lanka Agencies", 60, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 150, 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 22);
  
    // Shipping Method
    doc.setFontSize(13);
    doc.text("Shipping Method:", 14, 40);
    doc.setFontSize(11);
    doc.text(`${shipMethod}`, 14, 46);
  
    // Table for Order Items
    autoTable(doc, {
      startY: 60,
      head: [['#', 'Product', 'Qty', 'Price', 'Discount', 'Final Price']],
      body: cartItems.map((item, idx) => [
        idx + 1,
        item.name,
        item.quantity,
        `Rs.${Number(item.price).toFixed(2)}`,
        `Rs.${Number(item.discount || 0).toFixed(2)}`,
        `Rs.${Number(item.total_price).toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }, // Tailwind green-500
      styles: { halign: 'center' },
    });
  
    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Subtotal: Rs.${cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}`, 130, finalY);
    doc.text(`Discount: Rs.${cartItems.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2)}`, 130, finalY + 7);
    doc.text(`Shipping: Rs.${Number(shippingCost).toFixed(2)}`, 130, finalY + 14);
    doc.setFontSize(14);
    doc.text(`Total: Rs.${Number(grandTotal).toFixed(2)}`, 130, finalY + 21);
  
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "Thank you for shopping with Prince Lanka Agencies!",
      14,
      285
    );
    doc.text("www.princelanka.com | +94 763810245", 14, 292);
  
    doc.save(`Invoice_Order_${orderId}.pdf`);
  }

  return (
    <div>
    <div className="min-h-screen bg-gray-50 pt-16 ">
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
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-left">Shipping Address</h2>
              </div>
              
              {addressesLoading ? (
                <div className="text-center py-4">
                  <p>Loading addresses...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Saved addresses */}
                  {addresses.shipping.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">Saved Addresses</h3>
                      <div className="space-y-3">
                        {addresses.shipping.map(address => (
                          <SavedAddressCard
                            key={address.address_id}
                            address={address}
                            selected={selectedShippingAddress === address.address_id && !tempShippingAddress}
                            onSelect={() => {
                              setSelectedShippingAddress(address.address_id);
                              setTempShippingAddress(null);
                              setShowNewShippingForm(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Temporary address if exists */}
                  {tempShippingAddress && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">Temporary Address</h3>
                      <SavedAddressCard
                        address={tempShippingAddress}
                        selected={true}
                        onSelect={() => {}} // Already selected
                      />
                    </div>
                  )}
                  
                  {/* Add new address option - only show if no temporary address exists */}
                  {!tempShippingAddress && (
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        showNewShippingForm ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'
                      }`}
                      onClick={() => {
                        setShowNewShippingForm(!showNewShippingForm);
                      }}
                    >
                      <div className="flex items-center">
                        <Plus className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-left">Use a Different Address</span>
                      </div>
                    </div>
                  )}

                  {/* New address form */}
                  {showNewShippingForm && (
                    <div className="mt-4">
                      <AddressFormComponent
                        type="Shipping"
                        initialData={formData.newShippingAddress}
                        onSave={(data) => handleSaveTempAddress(data, 'Shipping')}
                        onCancel={() => setShowNewShippingForm(false)}
                      />
                    </div>
                  )}
                  
                  {/* No addresses message */}
                  {addresses.shipping.length === 0 && !tempShippingAddress && !showNewShippingForm && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 italic">No shipping addresses available.</p>
                      <button
                        onClick={() => setShowNewShippingForm(true)}
                        className="mt-2 text-green-500 hover:text-green-600"
                      >
                        Add a shipping address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-left">Billing Address</h2>
              </div>
              
              {addressesLoading ? (
                <div className="text-center py-4">
                  <p>Loading addresses...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Saved addresses */}
                  {addresses.billing.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">Saved Addresses</h3>
                      <div className="space-y-3">
                        {addresses.billing.map(address => (
                          <SavedAddressCard
                            key={address.address_id}
                            address={address}
                            selected={selectedBillingAddress === address.address_id && !tempBillingAddress}
                            onSelect={() => {
                              setSelectedBillingAddress(address.address_id);
                              setTempBillingAddress(null);
                              setShowNewBillingForm(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Temporary address if exists */}
                  {tempBillingAddress && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 text-left">Temporary Address</h3>
                      <SavedAddressCard
                        address={tempBillingAddress}
                        selected={true}
                        onSelect={() => {}} // Already selected
                      />
                    </div>
                  )}
                  
                  {/* Add new address option - only show if no temporary address exists */}
                  {!tempBillingAddress && (
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition ${
                        showNewBillingForm ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'
                      }`}
                      onClick={() => {
                        setShowNewBillingForm(!showNewBillingForm);
                      }}
                    >
                      <div className="flex items-center">
                        <Plus className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium text-left">Use a Different Address</span>
                      </div>
                    </div>
                  )}

                  {/* New address form */}
                  {showNewBillingForm && (
                    <div className="mt-4">
                      <AddressFormComponent
                        type="Billing"
                        initialData={formData.newBillingAddress}
                        onSave={(data) => handleSaveTempAddress(data, 'Billing')}
                        onCancel={() => setShowNewBillingForm(false)}
                      />
                    </div>
                  )}
                  
                  {/* No addresses message */}
                  {addresses.billing.length === 0 && !tempBillingAddress && !showNewBillingForm && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 italic">No billing addresses available.</p>
                      <button
                        onClick={() => setShowNewBillingForm(true)}
                        className="mt-2 text-green-500 hover:text-green-600"
                      >
                        Add a billing address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-left">Payment Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-left"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 text-left"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-left">Order Summary</h2>
              <div className="space-y-4">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.cart_id} className="flex items-center gap-4 text-left" >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm text-red-500">Discount: Rs.{Number(item.discount || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rs.{(Number(item.price) * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-red-500">-Rs.{Number(item.discount || 0).toFixed(2)}</p>
                          <p className="font-semibold">Rs.{Number(item.total_price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No items in the cart</p>
                  )}
                </div>

                <div className="border-t mt-6 pt-6 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs.{cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-Rs.{cartItems.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>After Discount</span>
                    <span>Rs.{Number(total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Rs.{Number(shippingCost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs.{(Number(total) + Number(shippingCost)).toFixed(2)}</span>
                  </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-left">Shipping Method</h2>
              </div>
              <div className="space-y-2">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="shipping" 
                    className="mr-3" 
                    value="standard shipping"
                    onChange={handleShippingChange}
                    defaultChecked 
                  />
                  <div className="text-left">
                    <p className="font-medium">Standard Shipping</p>
                    <p className="text-sm text-gray-500">Rs.500 • 3-5 business days</p>
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
                  <div className="text-left">
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-gray-500">Free • Monday - Saturday 8.00am to 6.00pm</p>
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
      
    </div>
    <Footer />
    </div>
  );
};

export default Checkout;
