import React, { useState, useRef } from 'react';
import { User, Package, Bell, LogOut, ChevronRight, Edit2, Star, Heart } from 'lucide-react';
import axios from 'axios';

const ProfileSidebar = ({ activeTab, setActiveTab, customerData, loading, ordersCount, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const menuItems = [
    { icon: User, label: 'My Profile', id: 'profile' },
    { icon: Package, label: 'My Orders', id: 'orders' },
    { icon: Heart, label: 'My Wishlist', id: 'wishlist' },
    { icon: Bell, label: 'Notifications', id: 'notifications' }
  ];

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('customerToken');
      if (!token) {
        setUploading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/customer-upload-profile-picture', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Call the callback to update the parent component's state
      if (onProfileUpdate) {
        onProfileUpdate(response.data);
      }
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploading(false);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  return (
    <div className="md:col-span-3">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* User Info */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-25"></div>
            <div className="relative">
              {customerData?.profile_pic ? (
                <img
                  src={customerData.profile_pic}
                  alt={customerData?.first_name || "User"}
                  className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto ring-4 ring-white bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-500" />
                </div>
              )}
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <button 
                className="absolute bottom-0 right-0 bg-green-500 p-3 rounded-full text-white hover:bg-green-600 transition shadow-lg"
                onClick={handleProfilePictureClick}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Edit2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{loading ? "Loading..." : `${customerData?.first_name || ''} ${customerData?.last_name || ''}`}</h2>
          <p className="text-gray-500">{customerData?.email || ''}</p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Member since</p>
            <p className="font-medium">March 2024</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-green-50 text-green-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`h-5 w-5 mr-3 ${
                  activeTab === item.id ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${
                activeTab === item.id ? 'transform rotate-90' : ''
              }`} />
            </button>
          ))}
          <button className="w-full flex items-center px-6 py-4 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <Package className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{ordersCount || 0}</p>
          <p className="text-sm text-gray-500">Orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center">
          <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">4.8</p>
          <p className="text-sm text-gray-500">Rating</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
