import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, MessageSquare, Star, Trash2, FileText } from 'lucide-react';
import ReviewModal from './ReviewModal';
import axios from 'axios';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../../assets/logoBlack.png';

const OrderHistory = ({ orders, loading }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [reviewsMap, setReviewsMap] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const [orderAddresses, setOrderAddresses] = useState({});

  const calculateDiscountPercentage = (originalPrice, discount) => {
    if (!originalPrice || originalPrice === 0) return 0;
    return Math.round((discount / originalPrice) * 100);
  };

  const checkExistingReview = async (productId, orderId) => {
    const key = `${orderId}-${productId}`;
    setReviewsLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/check/${orderId}/${productId}`);
      if (response.data.exists) {
        setReviewsMap(prev => ({
          ...prev,
          [key]: response.data.review
        }));
      }
      setReviewsLoading(prev => ({ ...prev, [key]: false }));
      return response.data.exists;
    } catch (error) {
      setReviewsLoading(prev => ({ ...prev, [key]: false }));
      return false;
    }
  };

  const handleDeleteReview = async (reviewId, productId, orderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
      const key = `${orderId}-${productId}`;
      setReviewsMap(prev => {
        const newMap = { ...prev };
        delete newMap[key];
        return newMap;
      });
    } catch (error) {}
  };

  const handleOpenReviewModal = (item, orderID) => {
    setSelectedProduct({
      id: item.product_id,
      name: item.product_name || `Product ${item.product_id}`,
      image: item.image_url || "https://via.placeholder.com/80",
      price: Number(item.price)
    });
    setOrderId(orderID);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    await checkExistingReview(selectedProduct.id, orderId);
  };

  // Fetch order addresses when an order is expanded
  const fetchOrderAddresses = async (orderId) => {
    if (orderAddresses[orderId]) return; // Already fetched
    
    try {
      const response = await axios.get(`http://localhost:5000/api/order_address/${orderId}`);
      setOrderAddresses(prev => ({
        ...prev,
        [orderId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching order addresses:', error);
    }
  };

  useEffect(() => {
    if (expandedOrder && orders) {
      const order = orders.find(o => o.order_id === expandedOrder);
      if (order && order.items) {
        order.items.forEach(item => {
          checkExistingReview(item.product_id, order.order_id);
        });
        fetchOrderAddresses(order.order_id);
      }
    }
  }, [expandedOrder, orders]);

  // Function to generate invoice PDF for a specific order
  const generateInvoicePDF = (order) => {
    const addresses = orderAddresses[order.order_id] || [];
    const billingAddress = addresses.find(addr => addr.type === 'billing');
    const shippingAddress = addresses.find(addr => addr.type === 'shipping');
    const shipMethod = shippingAddress?.shipment_method || 'pickup';
    
    // Calculate shipping cost based on method
    const shippingCost = shipMethod === 'standard shipping' ? 500 : 0;
    
    // Calculate subtotal (before discount)
    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price), 0);
    
    // Calculate total discount
    const totalDiscount = order.items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    
    // Generate the PDF
    const doc = new jsPDF();
    
    // Add company logo at the top
    const imgWidth = 60;
    const imgHeight = 50;
    // Add logo if available, otherwise use text
    try {
      const logoData = logo;
      doc.addImage(logoData, 'PNG', 10, -9, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error adding logo:', error);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Prince Lanka', 15, 25);
    }

    // Company details with improved styling
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80); // Darker gray for better readability
    doc.setFont('helvetica', 'normal');
    doc.text('No 21,', 14, 26);
    doc.text('Courtlodge, Kandapola', 14, 31);
    doc.text('Nuwaraeliya, Sri Lanka', 14, 36);
    doc.text('Tel: +94 77 567 0258', 14, 41);
    doc.text('Email: princelankaagenciespvtltd@gmail.com', 14, 46);
    
    // Add invoice title and order number with improved styling
    doc.setFontSize(22); // Larger font size for invoice title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50); // Green color to match table header
    doc.text('INVOICE', 170, 13);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Order #: ${order.order_id}`, 170, 18);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 170, 23);
    
    // Add horizontal line
    doc.setDrawColor(46, 125, 50); // Green line to match branding
    doc.setLineWidth(0.7); // Slightly thicker line
    doc.line(15, 50, 195, 50);
    
    // Customer details section with improved styling
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50); // Green headers
    doc.text('Billing Details:', 15, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60); // Dark gray for text
    if (billingAddress) {
      doc.setFont('helvetica', 'bold');
      doc.text(billingAddress.fullname, 15, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(billingAddress.street, 15, 75);
      if (billingAddress.apartment) {
        doc.text(billingAddress.apartment, 15, 80);
        doc.text(`${billingAddress.city}, ${billingAddress.province} - ${billingAddress.postal_code}`, 15, 85);
        doc.text(billingAddress.country, 15, 90);
      } else {
        doc.text(`${billingAddress.city}, ${billingAddress.province} - ${billingAddress.postal_code}`, 15, 80);
        doc.text(billingAddress.country, 15, 85);
      }
    }
    
    // Shipping details section with improved styling
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50); // Green headers
    doc.text('Shipping Details:', 110, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60); // Dark gray for text
    if (shipMethod === 'standard shipping' && shippingAddress) {
      doc.setFont('helvetica', 'bold');
      doc.text(shippingAddress.fullname, 110, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(shippingAddress.street, 110, 75);
      if (shippingAddress.apartment) {
        doc.text(shippingAddress.apartment, 110, 80);
        doc.text(`${shippingAddress.city}, ${shippingAddress.province} - ${shippingAddress.postal_code}`, 110, 85);
        doc.text(shippingAddress.country, 110, 90);
      } else {
        doc.text(`${shippingAddress.city}, ${shippingAddress.province} - ${shippingAddress.postal_code}`, 110, 80);
        doc.text(shippingAddress.country, 110, 85);
      }
      doc.setFont('helvetica', 'italic');
      doc.text(`Shipping Method: Standard Shipping`, 110, 95);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Pickup from store', 110, 70);
      doc.setFont('helvetica', 'italic');
      doc.text('Shipping Method: Pickup', 110, 75);
    }
    
    // Add horizontal line before table
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 100, 195, 100);

    // Order items table
    const tableColumn = ['#', 'Product', 'Qty', 'Price', 'Discount', 'Final Price'];
    const tableRows = [];

    // Add items to table
    order.items.forEach((item, index) => {
      const itemData = [
        (index + 1).toString(),
        item.product_name || `Product ${item.product_id}`,
        item.qty.toString(),
        `Rs.${Number(item.price).toFixed(2)}`,
        `Rs.${Number(item.discount || 0).toFixed(2)}`,
        `Rs.${Number(item.final_price).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    // Generate the table with improved styling
    autoTable(doc, {
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center',
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70, halign: 'left' },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240]
      },
      margin: { left: 15, right: 15 }
    });
    
    // Calculate the Y position for the summary section
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Summary section with improved styling
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    // Add a subtle background for the summary section
    doc.setFillColor(248, 248, 248);
    doc.rect(130, finalY - 5, 65, 35, 'F');
    
    // Subtotal
    doc.text('Subtotal:', 140, finalY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });
    
    // Discount
    doc.setTextColor(220, 53, 69); // Red color for discount
    doc.text('Discount:', 140, finalY + 7);
    doc.text(`Rs. ${totalDiscount.toFixed(2)}`, 195, finalY + 7, { align: 'right' });
    
    // Shipping
    doc.setTextColor(80, 80, 80);
    doc.text('Shipping:', 140, finalY + 14);
    doc.text(`Rs. ${shippingCost.toFixed(2)}`, 195, finalY + 14, { align: 'right' });
    
    // Total with improved styling
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50); // Green for total
    doc.setFontSize(12);
    doc.text('Total:', 140, finalY + 24);
    doc.text(`Rs. ${Number(order.total_price).toFixed(2)}`, 195, finalY + 24, { align: 'right' });
    
    // Add a thank you note with improved styling
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(46, 125, 50);
    doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });
    
    // Add decorative element
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.5);
    doc.line(65, finalY + 43, 145, finalY + 43);
    
    // Add shipping note if standard shipping is selected
    if (shipMethod === 'standard shipping') {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(220, 53, 69); // Red color for the note
      doc.text('Note: Shipping charges may increase based on the total weight of the products ordered and will be payable upon delivery.', 
        105, finalY + 55, { align: 'center', maxWidth: 170 });
    }
    
    // Add footer with improved styling
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Prince Lanka Agencies- Premium Agricultural Products', 105, pageHeight - 15, { align: 'center' });
    doc.text('© 2025 Prince Lanka Agencies Pvt(Ltd)', 105, pageHeight - 10, { align: 'center' });
    
    // Save the PDF with a filename including the order ID
    doc.save(`Invoice_Order_${order.order_id}.pdf`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h3 className="text-2xl font-bold mb-8">Order History</h3>
      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
              >
                <div>
                  <p className="font-medium">Order #{order.order_id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="font-medium">Rs {Number(order.total_price).toFixed(2)}</div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedOrder === order.order_id ? 'transform rotate-180' : ''
                  }`} />
                </div>
              </div>
              {expandedOrder === order.order_id && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Order Items</h4>
                    <button
                      onClick={() => generateInvoicePDF(order)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      View Bill
                    </button>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const reviewKey = `${order.order_id}-${item.product_id}`;
                      const hasReview = reviewsMap[reviewKey];
                      const isLoading = reviewsLoading[reviewKey];
                      return (
                        <div key={item.order_item_id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start">
                            {/* Product Image */}
                            <div className="w-20 h-20 mr-4 flex-shrink-0">
                              <img
                                src={item.image_url || "https://via.placeholder.com/80"}
                                alt={item.product_name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            {/* Product Details */}
                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium text-lg">{item.product_name || `Product ${item.product_id}`}</h5>
                                  <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                                </div>
                                <div className="text-right">
                                  {item.discount > 0 ? (
                                    <>
                                      <p className="text-sm text-gray-500 line-through">
                                        Rs {Number(item.total_price).toFixed(2)}
                                      </p>
                                      <p className="font-medium text-green-600">
                                        Rs {Number(item.final_price).toFixed(2)}
                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          {calculateDiscountPercentage(item.total_price, item.discount)}% OFF
                                        </span>
                                      </p>
                                    </>
                                  ) : (
                                    <p className="font-medium">Rs {Number(item.total_price).toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                <div className="flex justify-between w-full">
                                  <p>Unit price: Rs {Number(item.price).toFixed(2)}</p>
                                  {item.discount > 0 && (
                                    <p>Savings: Rs {Number(item.discount).toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                              {/* Review Section */}
                              <div className="mt-3">
                                {isLoading ? (
                                  <div className="text-center py-2 text-sm text-gray-500">Checking review status...</div>
                                ) : hasReview ? (
                                  <div className="bg-gray-100 p-3 rounded-lg">
                                    <div className="flex items-start">
                                      <div className="flex-grow pr-2">
                                        <div className="flex items-center mb-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`h-4 w-4 ${
                                                star <= hasReview.rating
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        {/* Review text with robust wrapping */}
                                        <p className="text-sm break-all whitespace-pre-wrap">
                                          {hasReview.review_text}
                                        </p>
                                        {/* Show review images if any */}
                                        {hasReview.images && hasReview.images.length > 0 && (
                                          <div className="flex mt-2 space-x-2 flex-wrap">
                                            {hasReview.images.map((image, idx) => (
                                              <img
                                                key={idx}
                                                src={image}
                                                alt={`Review ${idx + 1}`}
                                                className="w-12 h-12 object-cover rounded flex-shrink-0"
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleDeleteReview(
                                          hasReview.review_id,
                                          item.product_id,
                                          order.order_id
                                        )}
                                        className="ml-2 p-1 text-red-500 hover:text-red-700 flex-shrink-0 self-start"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenReviewModal(item, order.order_id);
                                      }}
                                      className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      Write Review
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {order.total_discount > 0 && (
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <p>Original price:</p>
                        <p>Rs {Number(order.original_price).toFixed(2)}</p>
                      </div>
                    )}
                    {order.total_discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <p>Total discount:</p>
                        <p>-Rs {Number(order.total_discount).toFixed(2)}</p>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg">
                      <p>Total:</p>
                      <p>Rs {Number(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium mb-2">No orders yet</p>
          <p className="text-gray-400">Your order history will appear here</p>
        </div>
      )}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={selectedProduct || {}}
        orderId={orderId}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default OrderHistory;
