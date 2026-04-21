import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted:  'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = { pending: '⏳', accepted: '✅', completed: '🎉', rejected: '❌' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders/me')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="text-center py-24 text-gray-400">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Orders 📦</h2>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400 text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg dark:text-white">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 capitalize">{order.delivery_type === 'delivery' ? '🚚' : '📦'} {order.delivery_type} · {order.time_slot}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-bold border capitalize ${STATUS_STYLES[order.status]}`}>
                  {STATUS_ICONS[order.status]} {order.status}
                </span>
              </div>

              <div className="flex justify-between items-end flex-wrap gap-4">
                <div className="space-y-1">
                  {order.items?.map(item => (
                    <p key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                      × {item.quantity} — Item #{item.menu_item_id} @ ${item.unit_price.toFixed(2)}
                      {item.combo_label && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded-full font-bold">{item.combo_label}</span>}
                    </p>
                  ))}
                </div>
                <div className="text-right">
                  {order.discount_applied > 0 && (
                    <p className="text-xs text-emerald-500 font-semibold">🎉 ${order.discount_applied.toFixed(2)} saved</p>
                  )}
                  <p className="text-xl font-extrabold text-blue-600">${order.total_price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
