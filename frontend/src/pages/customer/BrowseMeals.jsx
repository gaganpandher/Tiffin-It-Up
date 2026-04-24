import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';

import { 
  Search as SearchIcon, 
  ShoppingCart, 
  Leaf, 
  Flame, 
  Truck, 
  ShoppingBag,
  Info
} from 'lucide-react';

const SPICE_LABELS = ['', 'Mild', 'Low', 'Medium', 'Hot', 'Extreme'];

export default function BrowseMeals() {
  const [meals, setMeals] = useState([]);
  const [filters, setFilters] = useState({ search: '', is_veg: '', delivery_available: '', max_price: '', spice_level: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();
  
  // Interaction States
  const [activeChef, setActiveChef] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (err) { 
      console.error(err);
      setToast({ type: 'error', text: "Failed to load the marketplace. Please refresh." });
    } finally { setIsLoading(false); }
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiRequest('/feedback/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: activeChef.id, content: msgContent })
      });
      setToast({ type: 'success', text: 'Message sent!' });
      setShowMsgModal(false);
      setMsgContent('');
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleRateKitchen = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/feedback/reviews', {
        method: 'POST',
        body: JSON.stringify({ chef_id: activeChef.id, rating, comment })
      });
      setToast({ type: 'success', text: 'Review submitted!' });
      setShowReviewModal(false);
      setComment('');
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all animate-in fade-in slide-in-from-right-4 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.text}
        </div>
      )}

      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Marketplace</h2>

      {/* Search + Filters */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by meal name..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={loadMeals}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm"
          >
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={filters.is_veg} onChange={e => setFilter('is_veg', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-xs font-semibold uppercase tracking-wider">
            <option value="">Dietary: All</option>
            <option value="true">Veg Only</option>
            <option value="false">Non-Veg Only</option>
          </select>
          <select value={filters.delivery_available} onChange={e => setFilter('delivery_available', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-xs font-semibold uppercase tracking-wider">
            <option value="">Service: Any</option>
            <option value="true">Delivery Available</option>
            <option value="false">Pickup Only</option>
          </select>
          <select value={filters.spice_level} onChange={e => setFilter('spice_level', e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-xs font-semibold uppercase tracking-wider">
            <option value="">Spice: Any</option>
            {[1,2,3,4,5].map(l => <option key={l} value={l}>{SPICE_LABELS[l]} or less</option>)}
          </select>
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">CA$</span>
             <input type="number" placeholder="Max Price" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-xs font-semibold" />
          </div>
        </div>
      </div>

      {/* Meal Cards */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-24 text-lg animate-pulse font-medium">Preparing fresh meals for you...</div>
      ) : meals.length === 0 ? (
        <div className="text-center py-24 bg-white/50 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
          <Info className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No meals found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map(meal => (
            <div key={meal.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:-translate-y-3">
              {/* Image */}
              <div className="relative h-60 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {meal.image_url
                  ? <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-xs">No Image</div>
                }
                {/* Badges */}
                <div className="absolute top-5 left-5 flex gap-2 flex-wrap z-10 transition-transform group-hover:translate-x-1">
                  <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md text-white shadow-lg ${meal.is_veg ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
                    {meal.is_veg ? 'Veg' : 'Meat'}
                  </span>
                  {meal.is_combo && <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md bg-blue-500/90 text-white shadow-lg">Combo</span>}
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md bg-gray-900/80 text-white shadow-lg border border-white/20">
                    {meal.category || 'Meal'}
                  </span>
                </div>
                <div className="absolute top-5 right-5 flex gap-2 flex-col items-end z-10">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md text-white shadow-sm ${meal.is_active ? 'bg-emerald-600/90' : 'bg-gray-500/90'}`}>
                    {meal.is_active ? 'Available' : 'Paused'}
                  </span>
                  {meal.chef_delivery_available && (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md bg-sky-500/90 text-white shadow-sm flex items-center gap-1.5 transition-all animate-in fade-in slide-in-from-right-2">
                      <Truck size={10} />
                      Delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">{meal.name}</h3>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 ml-4 shrink-0">CA${meal.price?.toFixed(2)}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 min-h-[3rem] leading-relaxed mb-6 font-medium italic opacity-80">"{meal.description}"</p>

                {meal.is_combo && meal.sub_items?.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {meal.sub_items.map(si => (
                      <span key={si.id} className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
                        + {si.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Chef info */}
                <div className="flex items-center gap-3 mb-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                  {meal.chef_avatar
                    ? <img src={meal.chef_avatar} alt={meal.chef_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50 dark:ring-blue-900 shadow-sm" />
                    : <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs ring-2 ring-emerald-50">CH</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 dark:text-gray-200 truncate leading-none mb-1">{meal.chef_name}</p>
                    
                    {(meal.category === 'meal' || !meal.category) && (
                      <div className="flex items-center gap-1.5">
                         <span className="text-[9px] font-black uppercase text-orange-500 tracking-tighter">Heat Level:</span>
                         <div className="flex gap-0.5">
                           {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-1.5 h-3 rounded-full ${i < meal.spice_level ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-gray-200 dark:bg-gray-800'}`} />
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => { setActiveChef({ id: meal.chef_id, name: meal.chef_name }); setShowMsgModal(true); }}
                    className="flex-1 py-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    💬 Message
                  </button>
                  <button 
                    onClick={() => { setActiveChef({ id: meal.chef_id, name: meal.chef_name }); setShowReviewModal(true); }}
                    className="flex-1 py-2 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    ⭐ Review
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(meal)}
                  disabled={!meal.is_active}
                  className="group/btn w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:cursor-not-allowed text-white font-black rounded-[1.5rem] transition-all hover:shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                >
                  <ShoppingCart className="group-hover/btn:scale-110 transition-transform" size={20} />
                  {meal.is_active ? 'Add to Cart' : 'Currently Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modals */}
      {showMsgModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold dark:text-white mb-2">Message {activeChef?.name}</h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea 
                required value={msgContent} onChange={e=>setMsgContent(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 outline-none dark:text-white"
                rows="4"
              />
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowMsgModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold dark:text-white mb-2">Rate {activeChef?.name}'s Kitchen</h3>
            <form onSubmit={handleRateKitchen} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={()=>setRating(s)} className={`w-10 h-10 rounded-full text-xl transition-all ${rating >= s ? 'grayscale-0 scale-110' : 'grayscale'}`}>⭐</button>
                  ))}
                </div>
              </div>
              <textarea 
                value={comment} onChange={e=>setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 outline-none dark:text-white"
                rows="3"
              />
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowReviewModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-2 px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
