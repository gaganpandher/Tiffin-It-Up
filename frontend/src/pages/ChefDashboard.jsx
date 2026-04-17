import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function ChefDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiRequest('/chef/profile').then(setProfile).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Active Menu Items</h3>
          <p className="text-4xl font-bold text-emerald-500 mt-2">12</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Orders</h3>
          <p className="text-4xl font-bold text-blue-500 mt-2">48</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Delivery Status</h3>
          <p className="text-2xl font-bold text-purple-500 mt-3">
             {profile?.delivery_available ? 'Active' : 'Paused'}
          </p>
        </div>
      </div>
    </div>
  );
}
