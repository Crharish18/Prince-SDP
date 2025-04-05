import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([
    // Sample cart data (replace with real data)
    {
      id: 1,
      name: 'Agrotec Dora Boat Water Pump',
      price: 44000,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
    },
  ]);

  // Calculate discount (10% of price)
  const calculateDiscount = (price) => {
    return price * 0.1;
  };

  // Calculate total price
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = items.reduce((sum, item) => sum + calculateDiscount(item.price) * item.quantity, 0);
  const finalTotal = total - totalDiscount;

  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update quantity
  const handleUpdateQuantity = (itemId, quantity) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  // Clear the cart
  const handleClearCart = () => {
    setItems([]);
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
        className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
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
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemDiscount = calculateDiscount(item.price);
                  const itemTotal = item.price * item.quantity;
                  const itemDiscountTotal = itemDiscount * item.quantity;
                  const itemFinalTotal = itemTotal - itemDiscountTotal;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white p-4 rounded-lg shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className='text-left'>
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-500">
                                Price: Rs.{item.price.toFixed(2)}
                              </p>
                              <p className="text-green-600">
                                Discount: -Rs.{itemDiscount.toFixed(2)}
                              </p>
                              
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 h-10 w-10 mt-[20px]"
                          >
                            <X className="h-4 w-4 ml-[-7px]" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
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
                                handleUpdateQuantity(item.id, item.quantity + 1)
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
              className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={items.length === 0}
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
