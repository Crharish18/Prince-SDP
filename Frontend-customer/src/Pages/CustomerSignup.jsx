import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sprout, Lock, Mail, User, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';

function Signup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_num: '',
    address: '',
    national_id: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation - only letters and more than 3 characters
    if (!/^[A-Za-z]{3,}$/.test(formData.first_name)) {
      newErrors.first_name = 'Please enter a valid first name with at least 3 letters (no numbers or special characters)';
    }
    
    // Last name validation - only letters and more than 3 characters
    if (!/^[A-Za-z]{3,}$/.test(formData.last_name)) {
      newErrors.last_name = 'Please enter a valid last name with at least 3 letters (no numbers or special characters)';
    }
    
    // Phone number validation - 10 digits
    if (!/^\d{10}$/.test(formData.phone_num)) {
      newErrors.phone_num = 'Please enter a valid 10-digit phone number';
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
    }
    
    // Address validation - more than 5 characters
    if (formData.address.length < 5) {
      newErrors.address = 'Please provide a complete address with at least 5 characters';
    }
    
    // National ID validation - between 10 to 12 characters
    if (formData.national_id.length < 9 || formData.national_id.length > 13) {
      newErrors.national_id = 'National ID must contain between 10 to 12 characters';
    }
    
    // Date of birth validation - must be in the past
    const today = new Date();
    const dobDate = new Date(formData.dob);
    if (dobDate >= today) {
      newErrors.dob = 'Date of birth must be in the past';
    }
    
    // Password validation - at least 8 characters
    if (formData.password.length < 8) {
      newErrors.password = 'Please create a secure password with at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please try again';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/customers', formData);
      console.log('Customer signed up:', response.data);
      setMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/CustomerLogin');
      }, 2000);

    } catch (err) {
      console.error('Error during sign up:', err);
      setMessage('Error creating account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?ixlib=rb-1.2.1&auto=format&fit=crop&q=80"
            alt="Organic farming"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent">
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Join Prince Lanka</h2>
              <p className="text-green-50">Start your journey to better farming today</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Sprout className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create Account</h2>
              <p className="mt-2 text-sm text-gray-600">Join our community of successful farmers</p>
            </div>

            {/* Success/Error Message */}
            {message && <div className="text-center text-green-500 mb-4">{message}</div>}

            {/* Signup Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.first_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.last_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone_num"
                      type="tel"
                      required
                      value={formData.phone_num}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.phone_num ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Phone number"
                    />
                  </div>
                  {errors.phone_num && <p className="mt-1 text-xs text-red-500">{errors.phone_num}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Your address"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>

                {/* National ID */}
                <div>
                  <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                    National ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="nationalId"
                      name="national_id"
                      type="text"
                      required
                      value={formData.national_id}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.national_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="National ID number"
                    />
                  </div>
                  {errors.national_id && <p className="mt-1 text-xs text-red-500">{errors.national_id}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dob"
                      name="dob"
                      type="date"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                    />
                  </div>
                  {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Create password"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-10 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm`}
                      placeholder="Confirm password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Create Account
                </button>
              </div>

              <div className="text-center mt-4 text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/CustomerLogin" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
