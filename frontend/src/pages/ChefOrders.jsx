import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiRequest('/orders/chef');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiRequest(`/orders/${orderId}/status?status_update=${newStatus}`, {
        method: 'PUT'
      });
      loadOrders();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Live Kitchen Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 text-center rounded-2xl shadow-sm">
          <p className="text-gray-500 text-lg">No orders have hit your kitchen yet!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white/80 backdrop-blur-md dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition hover:shadow-md">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">{order.delivery_type.toUpperCase()} • {order.time_slot}</p>
                  {order.delivery_type === 'delivery' && order.delivery_address && (
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800 w-fit">
                      📍 {order.delivery_address}
                    </p>
                  )}
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-bold border capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-semibold text-xl text-emerald-600 dark:text-emerald-400">CA${order.total_price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">Customer ID: {order.customer_id}</p>
                </div>
                
                <div className="space-x-3">
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(order.id, 'rejected')} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl font-bold transition">Reject</button>
                      <button onClick={() => handleUpdateStatus(order.id, 'accepted')} className="px-5 py-2 bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 rounded-xl font-bold transition">Accept Order</button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="px-5 py-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 rounded-xl font-bold transition">Mark Delivered</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
