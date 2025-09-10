import React, { useState, useEffect } from 'react';
import HeaderPages from '../Components/HeaderPages';
import ProfileSidebar from '../Components/Profile/ProfileSidebar';
import ProfileInfo from '../Components/Profile/ProfileInfo';
import OrderHistory from '../Components/Profile/OrderHistory';
import Notifications from '../Components/Profile/Notifications';
import Wishlist from '../Components/Profile/Wishlist';
import axios from 'axios';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Fetch customer data when component mounts
  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/auth/customer-profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCustomerData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setLoading(false);
    }
  };

  // Add this useEffect to fetch orders
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (activeTab === 'orders') {
        try {
          const token = localStorage.getItem('customerToken');
          
          if (!token) {
            setOrdersLoading(false);
            return;
          }
          
          const response = await axios.get('http://localhost:5000/api/auth/customer-orders', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setOrders(response.data);
          setOrdersLoading(false);
        } catch (error) {
          console.error('Error fetching customer orders:', error);
          setOrdersLoading(false);
        }
      }
    };
    
    fetchCustomerOrders();
  }, [activeTab]);

  // Add this useEffect to fetch wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (activeTab === 'wishlist') {
        try {
          setWishlistLoading(true);
          const token = localStorage.getItem('customerToken');
          
          if (!token) {
            setWishlistLoading(false);
            return;
          }
          
          const response = await axios.get('http://localhost:5000/api/auth/customer-wishlist', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setWishlistItems(response.data);
          setWishlistLoading(false);
        } catch (error) {
          console.error('Error fetching wishlist items:', error);
          setWishlistLoading(false);
        }
      }
    };
    
    fetchWishlistItems();
  }, [activeTab]);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/auth/customer-wishlist/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update wishlist items after removal
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  // Handle profile update after profile picture upload
  const handleProfileUpdate = (updatedData) => {
    setCustomerData({
      ...customerData,
      profile_pic: updatedData.profile_pic
    });
  };

  return (
    <div className='w-[]'>
      <HeaderPages />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-9 ml-[-60px]">
            <ProfileSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              customerData={customerData} 
              loading={loading}
              ordersCount={orders.length}
              onProfileUpdate={handleProfileUpdate}
            />
            
            <div className="md:col-span-9">
              {activeTab === 'profile' && (
                <ProfileInfo 
                  customerData={customerData} 
                  loading={loading} 
                />
              )}
              
              {activeTab === 'orders' && (
                <OrderHistory 
                  orders={orders} 
                  loading={ordersLoading} 
                />
              )}
              
              {activeTab === 'notifications' && (
                <Notifications />
              )}

              {activeTab === 'wishlist' && (
                <Wishlist 
                  wishlistItems={wishlistItems} 
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                  loading={wishlistLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
