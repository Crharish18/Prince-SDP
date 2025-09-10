import React from 'react';
import { Truck, Phone, Clipboard, Tractor, BarChart, Leaf } from 'lucide-react';
import HeaderPages from '../Components/HeaderPages';
import Footer from '../Components/Footer';

// Services component
const Services = () => {
  const services = [
    {
      icon: Tractor,
      title: "Agricultural Equipment Sales",
      description: "We offer a wide range of agricultural equipment, including tools, pesticides machines, and other similar tools and macinery for both retail and wholesale(Small scale).",
      features: ["Tools & Harvesters", "Soil cultivation tools", "Pesticides machines", "Full agricultural equipment range"]
    },
    {
      icon: BarChart,
      title: "Fertilizer Sales",
      description: "Providing high-quality fertilizers to optimize your crop production. Available for both retail and wholesale customers.",
      features: ["Organic & chemical fertilizers", "Soil health solutions", "Custom fertilizer options", "Bulk pricing available"]
    },
    {
      icon: Truck,
      title: "Delivery Service",
      description: "We offer reliable delivery services for all products, ensuring that your orders arrive on time, no matter where you are.",
      features: ["Fast delivery", "Nationwide service", "Custom delivery scheduling", "Affordable shipping rates"]
    },
    {
      icon: Phone,
      title: "Customer Support",
      description: "Our customer support team is ready to assist you with any questions or concerns. We ensure a smooth and hassle-free shopping experience.",
      features: ["24/7 support", "Order tracking", "Product inquiries", "Post-purchase assistance"]
    },
    {
      icon: Leaf,
      title: "Pesticides & Herbicides",
      description: "We provide a full range of pesticides and herbicides to protect your crops from pests, weeds, and diseases.",
      features: ["Insecticides", "Herbicides", "Fungicides", "Custom solutions"]
    },
    {
      icon: Clipboard,
      title: "Chemical Sales",
      description: "Supplying agricultural chemicals, including pesticides and fertilizers, to optimize crop yield and maintain soil health.",
      features: ["Pesticides", "Herbicides", "Soil conditioning chemicals", "Bulk pricing"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <HeaderPages />
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Farm services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Comprehensive agricultural solutions to help your farm thrive
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <service.icon className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold ml-4">{service.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
