import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Calendar, Shield, MapPin, Edit2 } from 'lucide-react';
import axios from 'axios';

// Create a separate component for AddressForm to maintain its own state
const AddressFormComponent = ({ type, initialData, onSave, onCancel }) => {
  const [localForm, setLocalForm] = useState({
    ...initialData,
    // Set country to Sri Lanka for shipping addresses
    ...(type === 'shipping' && { country: 'Sri Lanka' })
  });

  useEffect(() => {
    setLocalForm({
      ...initialData,
      // Ensure country is always Sri Lanka for shipping addresses
      ...(type === 'shipping' && { country: 'Sri Lanka' })
    });
  }, [initialData, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Don't allow country changes for shipping addresses
    if (type === 'shipping' && name === 'country') {
      return;
    }
    
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Full Name</label>
        <input
          type="text"
          name="fullname"
          value={localForm.fullname || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Street Address</label>
        <input
          type="text"
          name="street"
          value={localForm.street || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Apartment/Unit (Optional)</label>
        <input
          type="text"
          name="apartment"
          value={localForm.apartment || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">City</label>
          <input
            type="text"
            name="city"
            value={localForm.city || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Province</label>
          <input
            type="text"
            name="province"
            value={localForm.province || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={localForm.postal_code || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-left"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Country</label>
          <input
            type="text"
            name="country"
            value={type === 'shipping' ? 'Sri Lanka' : (localForm.country || '')}
            onChange={handleChange}
            disabled={type === 'shipping'}
            className={`w-full px-3 py-2 border rounded-lg text-left ${type === 'shipping' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-500 focus:border-transparent'}`}
          />
        </div>
      </div>
      <input type="hidden" name="type" value={type} />
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave({ ...localForm, type, ...(type === 'shipping' && { country: 'Sri Lanka' }) })}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Save Address
        </button>
      </div>
    </div>
  );
};

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
  const [editingAddress, setEditingAddress] = useState(null); // 'shipping', 'billing', or null
  const [addresses, setAddresses] = useState({
    shipping: null,
    billing: null
  });
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressForm, setAddressForm] = useState({
    fullname: '',
    street: '',
    apartment: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
    type: ''
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
          shipping: null,
          billing: null
        };
        
        if (response.data && response.data.length > 0) {
          response.data.forEach(address => {
            if (address.type === 'shipping') {
              addressData.shipping = address;
            } else if (address.type === 'billing') {
              addressData.billing = address;
            }
          });
        }
        
        setAddresses(addressData);
        setAddressesLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddressesLoading(false);
      }
    };
    
    fetchAddresses();
  }, []);

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

  // Address handling functions
  const handleEditAddress = (type) => {
    setEditingAddress(type);
    
    // Pre-fill form with existing address data if available
    if (addresses[type]) {
      setAddressForm({
        ...addresses[type],
        // Ensure shipping address always has Sri Lanka as country
        ...(type === 'shipping' && { country: 'Sri Lanka' })
      });
    } else {
      // Initialize with empty values and the correct type
      setAddressForm({
        fullname: customerData ? `${customerData.first_name} ${customerData.last_name}` : '',
        street: '',
        apartment: '',
        city: '',
        province: '',
        postal_code: '',
        // Set country to Sri Lanka for shipping addresses
        country: type === 'shipping' ? 'Sri Lanka' : '',
        type: type
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  const handleSaveAddress = async (formData) => {
    try {
      const token = localStorage.getItem('customerToken');
      
      if (!token) {
        setUpdateStatus('error');
        setUpdateMessage('Authentication required');
        return;
      }
      
      // Ensure shipping address always has Sri Lanka as country
      const dataToSend = {
        ...formData,
        ...(formData.type === 'shipping' && { country: 'Sri Lanka' })
      };
      
      const method = dataToSend.address_id ? 'put' : 'post';
      const endpoint = dataToSend.address_id 
        ? `http://localhost:5000/api/auth/customer-addresses/${dataToSend.address_id}`
        : 'http://localhost:5000/api/auth/customer-addresses';
      
      const response = await axios[method](endpoint, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update addresses state with the new/updated address
      setAddresses(prev => ({
        ...prev,
        [dataToSend.type]: response.data
      }));
      
      setEditingAddress(null);
      setUpdateStatus('success');
      setUpdateMessage('Address updated successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus('');
      }, 3000);
      
      // Refresh addresses
      const addressResponse = await axios.get('http://localhost:5000/api/auth/customer-addresses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Organize addresses by type
      const addressData = {
        shipping: null,
        billing: null
      };
      
      if (addressResponse.data && addressResponse.data.length > 0) {
        addressResponse.data.forEach(address => {
          if (address.type === 'shipping') {
            addressData.shipping = address;
          } else if (address.type === 'billing') {
            addressData.billing = address;
          }
        });
      }
      
      setAddresses(addressData);
    } catch (error) {
      console.error('Error saving address:', error);
      setUpdateStatus('error');
      setUpdateMessage(error.response?.data?.message || 'Error saving address');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus('');
      }, 3000);
    }
  };

  // Address display component
  const AddressDisplay = ({ address, type }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-3 text-gray-600 text-left">
        {address ? (
          <>
            <p className="font-medium text-gray-800 text-left">{address.fullname}</p>
            <p className="text-left">{address.street}</p>
            {address.apartment && <p className="text-left">{address.apartment}</p>}
            <p className="text-left">{address.city}, {address.province} {address.postal_code}</p>
            <p className="text-left">{address.country}</p>
          </>
        ) : (
          <div className="text-gray-500 italic text-left">
            <p className="text-left">No {type} address saved yet.</p>
          </div>
        )}
      </div>
      
      {/* Edit button positioned at the bottom */}
      <div className="mt-auto pt-4 text-left">
        <button
          onClick={() => handleEditAddress(type)}
          className="text-green-500 hover:text-green-600 font-medium flex items-center"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          {address ? 'Edit Address' : 'Add Address'}
        </button>
      </div>
    </div>
  );

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
            <h3 className="text-2xl font-bold mb-8 text-left">Addresses</h3>
            {addressesLoading ? (
              <div className="text-center py-8">
                <p>Loading addresses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[250px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-6 w-6 text-green-500 mr-2" />
                      <h4 className="text-lg font-semibold text-left">Shipping Address</h4>
                    </div>
                  </div>
                  {editingAddress === 'shipping' ? (
                    <AddressFormComponent 
                      type="shipping"
                      initialData={addressForm}
                      onSave={handleSaveAddress}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <AddressDisplay address={addresses.shipping} type="shipping" />
                  )}
                </div>

                {/* Billing Address */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[250px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-green-500 mr-2" />
                      <h4 className="text-lg font-semibold text-left">Billing Address</h4>
                    </div>
                  </div>
                  {editingAddress === 'billing' ? (
                    <AddressFormComponent 
                      type="billing"
                      initialData={addressForm}
                      onSave={handleSaveAddress}
                      onCancel={handleCancelEdit}
                    />
                  ) : (
                    <AddressDisplay address={addresses.billing} type="billing" />
                  )}
                </div>
              </div>
            )}
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
