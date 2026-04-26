import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { ChefHat } from 'lucide-react';

export default function AdminChefs() {
  const [chefs, setChefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest('/admin/chefs')
      .then(setChefs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-32 text-gray-400 font-medium animate-pulse">Loading Chefs...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-rose-100 rounded-xl">
          <ChefHat className="text-rose-600" size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Registered Chefs</h2>
          <p className="text-gray-500 mt-1">Manage and view all chefs on the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {chefs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No chefs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">ID</th>
                  <th className="py-4 px-6 font-bold">Name</th>
                  <th className="py-4 px-6 font-bold">Email</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {chefs.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">#{user.id}</td>
                    <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">{user.full_name}</td>
                    <td className="py-4 px-6 text-gray-500">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
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
