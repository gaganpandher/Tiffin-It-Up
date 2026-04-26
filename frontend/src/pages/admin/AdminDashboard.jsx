import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Users,
  ChefHat,
  Package,
  DollarSign,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/admin/stats'),
      apiRequest('/admin/recent-orders')
    ])
    .then(([statsData, ordersData]) => {
      setStats(statsData);
      setRecentOrders(ordersData);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-32 text-gray-400 font-medium animate-pulse">Loading Platform Statistics...</div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `CA$${stats?.total_revenue.toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-100', icon: <DollarSign className="text-purple-600" /> },
    { label: 'Total Orders', value: stats?.total_orders, color: 'text-blue-600', bg: 'bg-blue-100', icon: <Package className="text-blue-600" /> },
    { label: 'Active Subscriptions', value: stats?.total_subscriptions, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: <CreditCard className="text-emerald-600" /> },
    { label: 'Registered Customers', value: stats?.total_customers, color: 'text-orange-600', bg: 'bg-orange-100', icon: <Users className="text-orange-600" /> },
    { label: 'Registered Chefs', value: stats?.total_chefs, color: 'text-rose-600', bg: 'bg-rose-100', icon: <ChefHat className="text-rose-600" /> },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Platform Statistics</h2>
        <p className="text-gray-500 mt-1">Overview of Tiffin It Up metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider">{stat.label}</p>
              <div className={`p-2 rounded-xl ${stat.bg} dark:bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-2xl font-black ${stat.color} dark:text-opacity-90`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Orders Activity</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No recent orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-4 font-bold">Order ID</th>
                  <th className="py-4 px-4 font-bold">Chef ID</th>
                  <th className="py-4 px-4 font-bold">Customer ID</th>
                  <th className="py-4 px-4 font-bold">Total</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">#{order.id}</td>
                    <td className="py-4 px-4 text-gray-500">Chef {order.chef_id}</td>
                    <td className="py-4 px-4 text-gray-500">Cust {order.customer_id}</td>
                    <td className="py-4 px-4 font-black text-blue-600 dark:text-blue-400">CA${order.total_price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
