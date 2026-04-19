import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ChefDashboard() {
  const [profile, setProfile] = useState(null);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest('/chef/profile'),
      apiRequest('/chef/menus'),
      apiRequest('/orders/chef'),
    ]).then(([profileData, menuData, orderData]) => {
      setProfile(profileData);
      setMenus(menuData);
      setOrders(orderData);
    }).catch(console.error);
  }, []);

  const handleToggleService = async () => {
    if (!profile) return;
    setIsToggling(true);
    try {
      const updated = await apiRequest('/chef/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, service_active: !profile.service_active })
      });
      setProfile(updated);
    } catch (err) {
      alert("Failed to toggle service: " + err.message);
    } finally {
      setIsToggling(false);
    }
  };

  const activeMenus = menus.filter(m => m.is_active).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_price, 0);

  const stats = [
    { label: 'Active Meals', value: activeMenus, color: 'text-emerald-500', bg: 'from-emerald-50 to-emerged-100 dark:from-emerald-900/20', icon: '🍲', link: '/chef/menus' },
    { label: 'Total Orders', value: orders.length, color: 'text-blue-500', bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20', icon: '📦', link: '/chef/orders' },
    { label: 'Pending Orders', value: pendingOrders, color: 'text-yellow-500', bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20', icon: '⏳', link: '/chef/orders' },
    { label: 'Revenue Earned', value: `$${totalRevenue.toFixed(2)}`, color: 'text-purple-500', bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20', icon: '💰', link: null },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Kitchen Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back! Here's your live overview.</p>
        </div>

        {/* Service Active Toggle */}
        <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-300 ${
          profile?.service_active
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700'
            : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
        }`}>
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Service</span>
          <button
            onClick={handleToggleService}
            disabled={isToggling}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              profile?.service_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              profile?.service_active ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
          <span className={`font-bold text-sm ${profile?.service_active ? 'text-emerald-600' : 'text-gray-400'}`}>
            {profile?.service_active ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-gradient-to-br ${stat.bg} bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 ${stat.link ? 'cursor-pointer hover:-translate-y-1' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h3>
          <button onClick={() => navigate('/chef/orders')} className="text-sm font-semibold text-blue-600 hover:underline">View All →</button>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet. Share your chef link to get started!</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center py-4">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">Order #{order.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{order.delivery_type} · {order.time_slot}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-600">${order.total_price.toFixed(2)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
