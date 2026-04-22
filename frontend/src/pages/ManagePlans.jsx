import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [type, setType] = useState('daily');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    apiRequest('/chef/plans').then(setPlans).catch(console.error);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/chef/plans', {
        method: 'POST',
        body: JSON.stringify({
          plan_type: type,
          price: parseFloat(price),
          description: description,
          is_veg: isVeg
        })
      });
      setPrice('');
      setDescription('');
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing Plans</h2>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Define New Plan</h3>
        <form onSubmit={handleCreatePlan} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Plan Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-950 dark:border-gray-800 dark:text-white">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
            <input type="number" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-950 dark:border-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Food Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsVeg(true)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isVeg ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>🥦 Veg</button>
              <button type="button" onClick={() => setIsVeg(false)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isVeg ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>🥩 Non-Veg</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-950 dark:border-gray-800 dark:text-white" rows="2"></textarea>
          </div>
          <button type="submit" className="px-6 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-red-500 transition-colors">Create Plan</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {plans.map(plan => (
          <div key={plan.id} className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center overflow-hidden">
            <span className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-xl ${plan.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {plan.is_veg ? 'VEG' : 'NON-VEG'}
            </span>
            <h4 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{plan.plan_type}</h4>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">${plan.price}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-4">{plan.description || 'No description provided.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
