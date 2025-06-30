

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import HeaderPages from '../Components/HeaderPages';    
import Footer from '../Components/Footer';
import axios from 'axios'; 

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_num: '',
    subject: '',
    message: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null });
    
    try {
      // Send data to your backend API
      const response = await axios.post('http://localhost:5000/api/messages', formData);
      console.log('Form submitted successfully:', response.data);
      setSubmitStatus({ loading: false, success: true, error: null });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone_num: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.error || 'Failed to send message. Please try again.' 
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["No 21, Courtlodge", "Kandapola", "Nuwaraeliya, SriLanka"]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+94 77 567 0258"]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["princelankaagenciespvtltd@gmail.com"]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Saturday: 7:00 AM - 5:00 PM", "Sunday: 8:00 AM - 1:00 PM"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
   
      <HeaderPages />

      {/* Contact Us Section */}
      {/* Hero Section */}
      <div className="relative h-[300px]">
        <img
          src="https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Contact us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <info.icon className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold ml-4">{info.title}</h3>
                </div>
                <div className="space-y-2">
                  {info.details.map((detail) => (
                    <p key={detail} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              
              {submitStatus.success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  Your message has been sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {submitStatus.error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {submitStatus.error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_num" 
                      value={formData.phone_num}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
