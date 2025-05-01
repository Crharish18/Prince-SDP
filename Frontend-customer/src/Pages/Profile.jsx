import React, { useState } from 'react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    address: "123 Farming Valley, Agricultural District",
    phone: "+1 234 567 890",
    orders: [
      {
        id: "ORD001",
        date: "2024-03-15",
        status: "Delivered",
        total: 28500.00,
        items: ["Agrotech Brush Cutter BG 328 A"]
      },
      {
        id: "ORD002",
        date: "2024-03-10",
        status: "In Transit",
        total: 16900.00,
        items: ["Agrospray Electric Sprayer", "Premium Fertilizer Pack"]
      }
    ]
  };

  const menuItems = [
    { label: 'Profile', id: 'profile' },
    { label: 'Orders', id: 'orders' },
    { label: 'Notifications', id: 'notifications' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 ml-[-150px] w-[1530px] mt-[-30px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-[1500px] ml-[-50px]">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              {/* User Info */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-green-50"
                  />
                  <button className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white hover:bg-green-600 transition shadow-lg">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12h3M12 15l-3-3 3-3m9 3a9 9 0 11-9 9 9 9 0 019-9z" /></svg>
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200 ${activeTab === item.id ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c2.5 0 5-1.5 5-5S14.5 4 12 4 7 5.5 7 10s2.5 4 5 4zM12 16c-3.5 0-7 1.5-7 3v2h14v-2c0-1.5-3.5-3-7-3z" /></svg>
                      <span>{item.label}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
                <button className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm p-6 w-[1000px]">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          defaultValue={user.phone}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          defaultValue={user.address}
                          rows="4"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        ></textarea>
                      </div>
                      <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Your Orders</h3>
                  <div className="space-y-4">
                    {user.orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Order #{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{order.items.join(", ")}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{order.date}</span>
                          <span className="font-medium">Rs.{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Notifications</h3>
                  <div className="text-gray-500 text-center py-8">
                    No new notifications
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
