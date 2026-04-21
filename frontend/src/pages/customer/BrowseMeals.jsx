import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';

const SPICE_LABELS = ['', 'Mild', 'Low', 'Medium', 'Hot', 'Extreme'];

export default function BrowseMeals() {
  const [meals, setMeals] = useState([]);
  const [filters, setFilters] = useState({ search: '', is_veg: '', delivery_available: '', max_price: '', spice_level: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => { loadMeals(); }, [filters]);

  const loadMeals = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.is_veg !== '') params.append('is_veg', filters.is_veg);
    if (filters.delivery_available !== '') params.append('delivery_available', filters.delivery_available);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.spice_level) params.append('spice_level', filters.spice_level);

    try {
      const data = await apiRequest(`/marketplace/meals?${params.toString()}`);
      setMeals(data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAddToCart = (meal) => {
    const err = addToCart(meal);
    if (err) {
      setToast({ type: 'error', text: err.error });
    } else {
      setToast({ type: 'success', text: `${meal.name} added to cart!` });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.text}
        </div>
      )}

      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Browse Meals 🍽️</h2>

      {/* Search + Filters */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍  Search meals by name..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all"
          />
          <button 
            onClick={loadMeals}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={filters.is_veg} onChange={e => setFilter('is_veg', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-sm">
            <option value="">🥗 All Types</option>
            <option value="true">🥦 Veg Only</option>
            <option value="false">🥩 Non-Veg Only</option>
          </select>
          <select value={filters.delivery_available} onChange={e => setFilter('delivery_available', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-sm">
            <option value="">🚚 Any Delivery</option>
            <option value="true">🚚 Delivery Available</option>
            <option value="false">📦 Pickup Only</option>
          </select>
          <select value={filters.spice_level} onChange={e => setFilter('spice_level', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-sm">
            <option value="">🌶️ Any Spice</option>
            {[1,2,3,4,5].map(l => <option key={l} value={l}>{SPICE_LABELS[l]} or less</option>)}
          </select>
          <input type="number" placeholder="💰 Max Price ($)" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-sm" />
        </div>
      </div>

      {/* Meal Cards */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-20 text-lg">Loading meals...</div>
      ) : meals.length === 0 ? (
        <div className="text-center text-gray-400 py-20 text-lg">No meals found matching your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {meals.map(meal => (
            <div key={meal.id} className="group bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1">
              {/* Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {meal.image_url
                  ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🍲</div>
                }
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${meal.is_veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {meal.is_veg ? '🥦 VEG' : '🥩 NON-VEG'}
                  </span>
                  {meal.is_combo && <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">🍱 COMBO</span>}
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5 flex-col items-end">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${meal.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {meal.is_active ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${meal.chef_delivery_available ? 'bg-sky-500 text-white' : 'bg-orange-400 text-white'}`}>
                    {meal.chef_delivery_available ? '🚚 Delivery' : '📦 Pickup'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{meal.name}</h3>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 ml-2 shrink-0">${meal.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{meal.description}</p>

                {/* Chef info */}
                <div className="flex items-center gap-2 mb-4">
                  {meal.chef_avatar
                    ? <img src={meal.chef_avatar} alt={meal.chef_name} className="w-7 h-7 rounded-full object-cover" />
                    : <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">👨‍🍳</div>
                  }
                  <span className="text-sm text-gray-500 dark:text-gray-400">{meal.chef_name}</span>
                  <span className="ml-auto text-orange-500 text-sm">{'🌶️'.repeat(meal.spice_level)}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(meal)}
                  disabled={!meal.is_active}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-blue-600/20"
                >
                  {meal.is_active ? '+ Add to Cart' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
