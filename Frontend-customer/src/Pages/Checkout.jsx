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
  
  // PDF preview states
  const [pdfUrl, setPdfUrl] = useState('');
  const [orderId, setOrderId] = useState(null);
  
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

  // Clean up PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

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
      
      // Get the billing address
      let billingAddress;
      
      if (tempBillingAddress) {
        billingAddress = tempBillingAddress;
      } else {
        billingAddress = addresses.billing.find(addr => addr.address_id === selectedBillingAddress);
      }
      
      if (!billingAddress) {
        alert("Please select or add a billing address.");
        return;
      }

      // Only validate shipping address if not using pickup
      if (selectedShipping === 'standard shipping') {
        let shippingAddress;
        
        if (tempShippingAddress) {
          shippingAddress = tempShippingAddress;
        } else {
          shippingAddress = addresses.shipping.find(addr => addr.address_id === selectedShippingAddress);
        }
        
        if (!shippingAddress) {
          alert("Please select or add a shipping address.");
          return;
        }
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
        const newOrderId = orderResponse.data.order_id;
        setOrderId(newOrderId);
        
        // Only save shipping address if not using pickup
        if (selectedShipping === 'standard shipping') {
          // Get the shipping address
          let shippingAddress;
          
          if (tempShippingAddress) {
            shippingAddress = tempShippingAddress;
          } else {
            shippingAddress = addresses.shipping.find(addr => addr.address_id === selectedShippingAddress);
          }
          
          // Save shipping address to order_address table
          const shippingAddressData = {
            order_id: newOrderId,
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
        }
        
        // Save billing address to order_address table
        const billingAddressData = {
          order_id: newOrderId,
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
          order_id: newOrderId,
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
          
          // Generate PDF invoice with preview in new window
          generateInvoicePDFWithPreview({
            orderId: newOrderId,
            cartItems,
            total,
            shippingCost,
            grandTotal: totalPrice,
            shipMethod,
            billingAddress,
            shippingAddress: selectedShipping === 'standard shipping' 
              ? (tempShippingAddress || addresses.shipping.find(addr => addr.address_id === selectedShippingAddress))
              : null
          });
          
          // Clear cart after successful order
          await axios.delete(`http://localhost:5000/api/cart/customer/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Redirect happens after user views PDF in new window
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

  function generateInvoicePDFWithPreview({
    orderId,
    cartItems,
    total,
    shippingCost,
    grandTotal,
    shipMethod,
    billingAddress,
    shippingAddress
  }) {
    console.log("Generating new PDF format");
    
    const doc = new jsPDF();
    
    // Set white background for the entire page
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
    
    // Add blue sidebar on the left
    doc.setFillColor(0, 83, 156); // Blue color
    doc.rect(0, 0, 15, doc.internal.pageSize.getHeight(), 'F');
    
    // Add purple accent at the bottom of the sidebar
    doc.setFillColor(128, 0, 128); // Purple color
    doc.rect(0, doc.internal.pageSize.getHeight() - 40, 15, 40, 'F');
    
    // Company name and logo
    doc.setTextColor(0, 83, 156); // Blue color for company name
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("DOTS & LINES", 62, 30);
    
    // Company address and contact info
    doc.setTextColor(70, 70, 70); // Dark gray for address
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("2262 Portland Avenue", 62, 40);
    doc.text("Fond Du Lac, WI 54935", 62, 50);
    doc.text("920-377-0987", 62, 60);
    doc.text("www.dotsandlines.com", 62, 70);
    doc.text("info@dotsandlines.com", 62, 80);
    
    // Order details in a gray box
    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(247, 247, 247);
    doc.roundedRect(140, 20, 60, 30, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Order: #${orderId}`, 145, 30);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}`, 145, 40);
    
    // SUMMARY header with blue underline
    doc.setTextColor(0, 83, 156); // Blue color
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 62, 100);
    doc.setDrawColor(0, 83, 156);
    doc.setLineWidth(0.5);
    doc.line(62, 102, 195, 102);
    
    // Get customer name from localStorage or use default
    let customerName = "Customer";
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData && userData.username) {
        customerName = userData.username;
      }
    } catch (e) {
      console.error("Error getting customer data:", e);
    }
    
    // Shipping and Billing Address headers
    doc.setTextColor(0, 0, 0); // Black color
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SHIPPING ADDRESS", 62, 115);
    doc.text("BILLING ADDRESS", 140, 115);
    
    // Shipping Address details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Use customer name as fallback if no address name is available
    const shippingName = shippingAddress?.fullname || customerName;
    const billingName = billingAddress?.fullname || customerName;
    
    if (shipMethod === 'standard shipping' && shippingAddress) {
      doc.text(shippingName, 62, 125);
      doc.text(shippingAddress.street || "", 62, 132);
      if (shippingAddress.apartment) {
        doc.text(shippingAddress.apartment, 62, 139);
        doc.text(`${shippingAddress.city || ""}, ${shippingAddress.province || ""} ${shippingAddress.postal_code || ""}`, 62, 146);
        doc.text(shippingAddress.country || "", 62, 153);
      } else {
        doc.text(`${shippingAddress.city || ""}, ${shippingAddress.province || ""} ${shippingAddress.postal_code || ""}`, 62, 139);
        doc.text(shippingAddress.country || "", 62, 146);
      }
    } else {
      doc.text(customerName, 62, 125);
      doc.text("Pickup", 62, 132);
    }
    
    // Billing Address details
    if (billingAddress) {
      doc.text(billingName, 140, 125);
      doc.text(billingAddress.street || "", 140, 132);
      if (billingAddress.apartment) {
        doc.text(billingAddress.apartment, 140, 139);
        doc.text(`${billingAddress.city || ""}, ${billingAddress.province || ""} ${billingAddress.postal_code || ""}`, 140, 146);
        doc.text(billingAddress.country || "", 140, 153);
      } else {
        doc.text(`${billingAddress.city || ""}, ${billingAddress.province || ""} ${billingAddress.postal_code || ""}`, 140, 139);
        doc.text(billingAddress.country || "", 140, 146);
      }
    }
    
    // Product table with blue headers
    const tableStartY = 165;
    
    // Prepare table headers and data
    const headers = [
      { content: 'PRODUCT', styles: { fillColor: [0, 83, 156], textColor: [255, 255, 255], halign: 'left' } },
      { content: 'TYPE', styles: { fillColor: [0, 83, 156], textColor: [255, 255, 255], halign: 'center' } },
      { content: 'QUANTITY', styles: { fillColor: [0, 83, 156], textColor: [255, 255, 255], halign: 'center' } },
      { content: 'UNIT PRICE', styles: { fillColor: [0, 83, 156], textColor: [255, 255, 255], halign: 'right' } },
      { content: 'TOTAL', styles: { fillColor: [0, 83, 156], textColor: [255, 255, 255], halign: 'right' } }
    ];
    
    // Create table data
    const tableData = cartItems.map((item) => [
      item.name,
      'Product', // Assuming all are products, replace with actual type if available
      item.quantity.toString(),
      `Rs.${Number(item.price).toFixed(2)}`,
      `Rs.${Number(item.total_price).toFixed(2)}`
    ]);
    
    // Generate table
    autoTable(doc, {
      startY: tableStartY,
      head: [headers.map(header => header.content)],
      body: tableData,
      headStyles: {
        fillColor: [0, 83, 156], // Blue color
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [240, 240, 250] // Light blue-ish for alternate rows
      },
      margin: { left: 62, right: 30 }
    });
    
    // Add totals section
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Right-aligned totals
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text("Sub-Total:", 160, finalY);
    doc.text(`Rs.${Number(total).toFixed(2)}`, 195, finalY, { align: 'right' });
    
    doc.text("Shipping Charge:", 160, finalY + 7);
    doc.text(`Rs.${Number(shippingCost).toFixed(2)}`, 195, finalY + 7, { align: 'right' });
    
    doc.text("Promo Code:", 160, finalY + 14);
    doc.text(`Rs.0`, 195, finalY + 14, { align: 'right' });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 160, finalY + 24);
    doc.text(`Rs.${Number(grandTotal).toFixed(2)}`, 195, finalY + 24, { align: 'right' });
    
    // Add social media icons (represented as colored circles)
    const pageHeight = doc.internal.pageSize.getHeight();
    const iconY = pageHeight - 20;
    
    doc.setFillColor(59, 89, 152); // Facebook blue
    doc.circle(105, iconY, 4, 'F');
    
    doc.setFillColor(29, 161, 242); // Twitter blue
    doc.circle(115, iconY, 4, 'F');
    
    doc.setFillColor(0, 119, 181); // LinkedIn blue
    doc.circle(125, iconY, 4, 'F');
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Privacy Policy | Terms & Conditions | Contact", 105, pageHeight - 10, { align: 'center' });
    doc.text("© Dots and Lines - All Rights Reserved", 105, pageHeight - 5, { align: 'center' });
    
    // Create a blob and open it in a new window
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    // Store the URL for cleanup later
    setPdfUrl(url);
    
    // Open PDF in a new window
    const newWindow = window.open(url, '_blank');
    
    // If the window was blocked, alert the user
    if (!newWindow) {
      alert("The invoice was generated but the popup was blocked. Please allow popups to view your invoice.");
    }
    
    // Redirect to order confirmation after a short delay
    setTimeout(() => {
      window.location.href = '/order-confirmation';
    }, 2000);
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 pt-16">
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
              {/* Shipping Address - Only show if standard shipping is selected */}
              {selectedShipping === 'standard shipping' && (
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
              )}

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

            {/* Right Column - Order Summary and Shipping Method */}
            <div className="space-y-8">
              {/* Order Summary */}
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

              {/* Shipping Method - Moved under Order Summary */}
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
