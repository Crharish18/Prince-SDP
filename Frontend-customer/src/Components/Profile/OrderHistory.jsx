import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, MessageSquare, Star, Trash2 } from 'lucide-react';
import ReviewModal from './ReviewModal';
import axios from 'axios';

const OrderHistory = ({ orders, loading }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [reviewsMap, setReviewsMap] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});

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

  useEffect(() => {
    if (expandedOrder && orders) {
      const order = orders.find(o => o.order_id === expandedOrder);
      if (order && order.items) {
        order.items.forEach(item => {
          checkExistingReview(item.product_id, order.order_id);
        });
      }
    }
  }, [expandedOrder, orders]);

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
                  <h4 className="font-medium mb-4">Order Items</h4>
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
