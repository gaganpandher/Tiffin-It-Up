import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Timer
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { style: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Timer size={16} /> },
  accepted:  { style: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle2 size={16} /> },
  completed: { style: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={16} /> },
  rejected:  { style: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={16} /> },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders/me')
      .then(setOrders)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="text-center py-32 text-gray-400 font-medium animate-pulse">Loading your order history...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-32 bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
          <Package className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8 transition-all hover:shadow-md">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">
                <div>
                  <h3 className="font-bold text-xl dark:text-white mb-1">Order #{order.id}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                      {order.delivery_type === 'delivery' ? <Truck size={14} /> : <MapPin size={14} />}
                      <span className="capitalize">{order.delivery_type}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                      <Clock size={14} />
                      {order.time_slot}
                    </span>
                  </div>
                </div>
                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${STATUS_CONFIG[order.status]?.style}`}>
                  {STATUS_CONFIG[order.status]?.icon}
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-end flex-wrap gap-6">
                <div className="space-y-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">{item.quantity}</div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Meal #{item.menu_item_id} — CA${item.unit_price.toFixed(2)}
                      </p>
                      {item.combo_label && (
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] px-2.5 py-1 rounded-full font-black border border-blue-100 dark:border-blue-900/50 uppercase tracking-tight">
                          Combo: {item.combo_label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  {order.discount_applied > 0 && (
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">
                      Discount Applied: −CA${order.discount_applied.toFixed(2)}
                    </p>
                  )}
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">CA${order.total_price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
