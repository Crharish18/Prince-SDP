import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h3 className="text-2xl font-bold mb-8">Notifications</h3>
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Bell className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-xl font-medium mb-2">No new notifications</p>
        <p className="text-gray-400">We'll notify you when something arrives</p>
      </div>
    </div>
  );
};

export default Notifications;
