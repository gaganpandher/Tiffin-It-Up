import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { CreditCard, Filter } from 'lucide-react';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [activeOnly]);

  const fetchSubscriptions = () => {
    setIsLoading(true);
    apiRequest(`/admin/subscriptions?active_only=${activeOnly}`)
      .then(setSubscriptions)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <CreditCard className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Subscriptions</h2>
            <p className="text-gray-500 mt-1">Manage and view all customer subscriptions.</p>
          </div>
        </div>

        <button
          onClick={() => setActiveOnly(!activeOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border ${
            activeOnly
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          <Filter size={18} />
          {activeOnly ? 'Showing Active Only' : 'Showing All'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
           <p className="text-gray-400 text-center py-12 animate-pulse font-medium">Loading Subscriptions...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No subscriptions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">ID</th>
                  <th className="py-4 px-6 font-bold">Customer ID</th>
                  <th className="py-4 px-6 font-bold">Plan ID</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold">Allergies/Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">#{sub.id}</td>
                    <td className="py-4 px-6 text-gray-500">Cust {sub.customer_id}</td>
                    <td className="py-4 px-6 text-gray-500">Plan {sub.plan_id}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                        sub.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-[200px] truncate text-xs text-gray-500">
                      {sub.allergies && <span className="block text-red-500 font-semibold mb-0.5">⚠️ {sub.allergies}</span>}
                      {sub.notes && <span className="block italic text-gray-400">📝 {sub.notes}</span>}
                      {!sub.allergies && !sub.notes && <span className="text-gray-300">None</span>}
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
