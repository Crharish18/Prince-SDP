import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Calendar, Shield, MapPin } from 'lucide-react';
import axios from 'axios';

const ProfileInfo = ({ customerData, loading }) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    dob: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setFormData({
        firstName: customerData.first_name || '',
        lastName: customerData.last_name || '',
        email: customerData.email || '',
        phone: customerData.phone_num || '',
        nationalId: customerData.national_id || '',
        dob: customerData.dob ? customerData.dob.split('T')[0] : '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [customerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        setUpdateStatus('error');
        setUpdateMessage('Authentication required');
        return;
      }

      const response = await axios.put(
        'http://localhost:5000/api/auth/customer-profile',
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nationalId: formData.nationalId,
          dob: formData.dob
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUpdateStatus('success');
      setUpdateMessage('Profile updated successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateStatus('error');
      setUpdateMessage(error.response?.data?.message || 'Error updating profile');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus('');
      }, 3000);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Handle password change logic here
    setShowPasswordChange(false);
  };

  // Default addresses if not available in customerData
  const addresses = customerData?.addresses || {
    shipping: {
      street: '123 Main Street',
      city: 'Paris',
      state: 'Île-de-France',
      zipCode: '75001',
      country: 'France'
    },
    billing: {
      street: '123 Main Street',
      city: 'Paris',
      state: 'Île-de-France',
      zipCode: '75001',
      country: 'France'
    }
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-xl">Loading profile data...</p>
        </div>
      ) : (
        <>
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Personal Information</h3>
              <button 
                onClick={handleSaveChanges}
                className="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition"
              >
                Save Changes
              </button>
            </div>
            
            {/* Status message */}
            {updateMessage && (
              <div className={`mb-6 p-4 rounded-lg ${updateStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {updateMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-2xl font-bold mb-8">Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 text-green-500 mr-2" />
                    <h4 className="text-lg font-semibold">Shipping Address</h4>
                  </div>
                  <button className="text-green-500 hover:text-green-600 font-medium">Edit</button>
                </div>
                <div className="space-y-3 text-gray-600">
                  <p className="font-medium text-gray-800">{`${formData.firstName} ${formData.lastName}`}</p>
                  <p>{addresses.shipping.street}</p>
                  <p>{addresses.shipping.city}, {addresses.shipping.state} {addresses.shipping.zipCode}</p>
                  <p>{addresses.shipping.country}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                    <h4 className="text-lg font-semibold">Billing Address</h4>
                  </div>
                  <button className="text-green-500 hover:text-green-600 font-medium">Edit</button>
                </div>
                <div className="space-y-3 text-gray-600">
                  <p className="font-medium text-gray-800">{`${formData.firstName} ${formData.lastName}`}</p>
                  <p>{addresses.billing.street}</p>
                  <p>{addresses.billing.city}, {addresses.billing.state} {addresses.billing.zipCode}</p>
                  <p>{addresses.billing.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-2xl font-bold">Password & Security</h3>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-200 transition"
              >
                Change Password
              </button>
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition font-medium"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileInfo;
