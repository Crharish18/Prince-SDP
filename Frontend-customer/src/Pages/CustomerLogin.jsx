import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail } from 'lucide-react';
import axios from 'axios';

function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function to redirect

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send email, password, and role (customer) to backend for authentication
      const response = await axios.post('http://localhost:5000/api/auth/Customerlogin', { 
        email, 
        password
    });

      // If login is successful, save the JWT token (for example, in localStorage)
      localStorage.setItem('token', response.data.token);

      // Show a success message and navigate to the dashboard or home page
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/'); // Replace '/dashboard' with the appropriate route
      }, 2000);

    } catch (err) {
      console.error('Error during login:', err);
      setMessage('Invalid email or password');
    }
  };

  return (
    <div className="max-w-5xl w-full flex rounded-2xl shadow-2xl overflow-hidden ml-[100px] mt-[50px]">
      {/* Left Side Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&q=80"
          alt="Fertilizer and plants"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent">
          <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-3xl font-bold mb-2 text-left">Grow Better</h2>
            <p className="text-green-50">Your trusted partner in agricultural success</p>
          </div>
        </div>
      </div>

      {/* Right Side Login Form */}
      <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12">
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Sprout className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to access your GreenGrow account</p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Message */}
            {message && <div className="text-center text-green-500 mb-4">{message}</div>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign in
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/CustomerSignup" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Sign up now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
