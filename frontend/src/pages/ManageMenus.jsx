import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function ManageMenus() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(1);
  const [isVeg, setIsVeg] = useState(true);
  const [isCombo, setIsCombo] = useState(false);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = () => {
    apiRequest('/chef/menus').then(setMenus).catch(console.error);
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    formData.append('is_active', true);
    formData.append('spice_level', spiceLevel);
    formData.append('is_veg', isVeg);
    formData.append('is_combo', isCombo);
    formData.append('price', price);
    if (image) formData.append('image', image);

    try {
      await apiRequest('/chef/menus', { method: 'POST', headers: {}, body: formData });
      setName('');
      setDescription('');
      setSpiceLevel(1);
      setIsVeg(true);
      setIsCombo(false);
      setPrice(0);
      setImage(null);
      loadMenus();
    } catch (err) {
      alert("Failed to create meal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this meal?")) return;
    try {
      await apiRequest(`/chef/menus/${id}`, { method: 'DELETE' });
      loadMenus();
    } catch (err) {
      alert(err.message);
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await apiRequest(`/chef/menus/${id}/toggle`, { method: 'PATCH' });
      setMenus(prev => prev.map(m => m.id === id ? updated : m));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 overflow-x-hidden">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Culinary Control Center</h2>

      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Launch New Menu Item</h3>
        <form onSubmit={handleCreateMenu} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meal Name</label>
              <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl dark:text-white transition-all outline-none" placeholder="e.g. Authentic Paneer Tikka"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl dark:text-white transition-all outline-none" rows="3" placeholder="Describe the flavors..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Meal Photograph</label>
              <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors" />
            </div>
          </div>

          <div className="space-y-6 bg-gray-50/50 dark:bg-gray-950/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (USD $)</label>
              <input type="number" step="0.50" min="0" value={price} onChange={e=>setPrice(parseFloat(e.target.value)||0)} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-emerald-500 rounded-xl dark:text-white transition-all outline-none" placeholder="e.g. 8.50"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Spice Level ({spiceLevel}/5)</label>
              <input type="range" min="1" max="5" value={spiceLevel} onChange={e=>setSpiceLevel(parseInt(e.target.value))} className="w-full accent-emerald-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>Mild</span><span>Medium</span><span>Extreme</span>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={isVeg} onChange={() => setIsVeg(true)} className="w-5 h-5 text-emerald-500 focus:ring-emerald-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">Vegetarian 🥦</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={!isVeg} onChange={() => setIsVeg(false)} className="w-5 h-5 text-red-500 focus:ring-red-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">Non-Veg 🥩</span>
              </label>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer">
              <input type="checkbox" checked={isCombo} onChange={(e) => setIsCombo(e.target.checked)} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">Make this a Combo Deal 🍱</span>
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition disabled:opacity-50 hover:-translate-y-1">
              {isSubmitting ? 'Uploading to Cloudinary...' : 'Add to Menu Catalog'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
        {menus.map(menu => (
          <div key={menu.id} className="group relative bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-2">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {menu.is_veg ? (
                <span className="px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">VEG</span>
              ) : (
                <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">NON-VEG</span>
              )}
              {menu.is_combo && <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">COMBO</span>}
            </div>

            <div className="h-56 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
              {menu.image_url ? (
                <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Photography</div>
              )}
              {/* Dark Gradient Overlay for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{menu.name}</h4>
                <div className="flex font-bold text-orange-500 text-sm ml-2">
                   {Array(menu.spice_level).fill('🌶️').join('')}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 line-clamp-2 leading-relaxed">{menu.description}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-2">
                 <button
                   onClick={() => handleToggle(menu.id)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                     menu.is_active
                       ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400'
                       : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                   }`}
                 >
                   <span className={`w-2 h-2 rounded-full ${menu.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                   {menu.is_active ? 'Available' : 'Unavailable'}
                 </button>
                 <button onClick={() => handleDelete(menu.id)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                    Delete
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
