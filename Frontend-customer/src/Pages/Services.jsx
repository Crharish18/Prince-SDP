import React from 'react';
import { Tractor, Sprout, Users, Wrench, BarChart, Leaf } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Tractor,
      title: "Equipment Rental",
      description: "Access modern farming equipment without the heavy investment. Our rental service includes tractors, harvesters, and specialized tools.",
      features: ["Daily, weekly & monthly rentals", "Maintenance included", "Delivery available", "Operator training"]
    },
    {
      icon: Sprout,
      title: "Crop Consulting",
      description: "Expert guidance for optimal crop yields. Our agronomists provide personalized solutions for your farming needs.",
      features: ["Soil analysis", "Crop planning", "Pest management", "Yield optimization"]
    },
    {
      icon: Users,
      title: "Farm Management",
      description: "Comprehensive farm management services to help you maximize efficiency and productivity.",
      features: ["Resource planning", "Labor management", "Cost optimization", "Production tracking"]
    },
    {
      icon: Wrench,
      title: "Equipment Maintenance",
      description: "Professional maintenance and repair services for all your agricultural equipment.",
      features: ["Regular servicing", "Emergency repairs", "Parts replacement", "Performance upgrades"]
    },
    {
      icon: BarChart,
      title: "Market Analysis",
      description: "Stay ahead with our market intelligence and price forecasting services.",
      features: ["Price trends", "Market reports", "Demand forecasting", "Trade recommendations"]
    },
    {
      icon: Leaf,
      title: "Sustainable Farming",
      description: "Guidance on implementing sustainable farming practices for better yields and environmental protection.",
      features: ["Organic certification", "Water conservation", "Soil health", "Bio-diversity"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
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
              <button className="w-full mt-6 py-2 border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-50 transition">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
