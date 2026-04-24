import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Image as ImageIcon,
  Flame,
  Utensils,
  GlassWater,
  IceCream,
  PackagePlus,
  Sparkles
} from 'lucide-react';

export default function ManageMenus() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(1);
  const [isVeg, setIsVeg] = useState(true);
  const [isCombo, setIsCombo] = useState(false);
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('meal');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSubItemIds, setSelectedSubItemIds] = useState([]);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = () => {
    apiRequest('/chef/menus').then(setMenus).catch(console.error);
  };

  const handleEdit = (menu) => {
    setEditingId(menu.id);
    setName(menu.name);
    setDescription(menu.description || '');
    setSpiceLevel(menu.spice_level);
    setIsVeg(menu.is_veg);
    setIsCombo(menu.is_combo);
    setPrice(menu.price);
    setCategory(menu.category || 'meal');
    setSelectedSubItemIds(menu.sub_items?.map(si => si.id) || []);
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSpiceLevel(1);
    setIsVeg(true);
    setIsCombo(false);
    setPrice(0);
    setCategory('meal');
    setSelectedSubItemIds([]);
    setImage(null);
  };

  const handleSubmit = async (e) => {
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
    formData.append('category', category);
    formData.append('sub_item_ids', JSON.stringify(selectedSubItemIds));
    if (image) formData.append('image', image);

    try {
      const url = editingId ? `/chef/menus/${editingId}` : '/chef/menus';
      const method = editingId ? 'PUT' : 'POST';
      
      await apiRequest(url, { method, headers: {}, body: formData });
      handleCancelEdit();
      loadMenus();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await apiRequest(`/chef/menus/${id}`, { method: 'DELETE' });
      loadMenus();
    } catch (err) { alert(err.message); }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await apiRequest(`/chef/menus/${id}/toggle`, { method: 'PATCH' });
      setMenus(prev => prev.map(m => m.id === id ? updated : m));
    } catch (err) { alert(err.message); }
  }

  const toggleSubItem = (id) => {
    setSelectedSubItemIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24 px-4 overflow-x-hidden">
      <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Culinary Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Create masterpiece meals and manage your menu selection</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-xl shadow-gray-200/20 dark:shadow-black/20 border border-gray-100 dark:border-gray-800">
        <h3 className="text-2xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-3">
          {editingId ? <Edit3 className="text-blue-500" /> : <Plus className="text-emerald-500" />}
          {editingId ? 'Edit Menu Item' : 'Launch New Creation'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Dish Name</label>
              <input type="text" required value={name} onChange={e=>setName(e.target.value)} 
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-[1.5rem] dark:text-white transition-all outline-none font-semibold text-lg" 
                placeholder="e.g. Signature Butter Chicken"/>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Description</label>
              <textarea required value={description} onChange={e=>setDescription(e.target.value)} 
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-[1.5rem] dark:text-white transition-all outline-none resize-none font-medium" 
                rows="4" placeholder="Describe the soul of this dish..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Dish Type & Dietary</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'meal', label: 'Meal', icon: Utensils },
                  { id: 'sweet', label: 'Sweet Dish', icon: IceCream },
                  { id: 'drink', label: 'Drink', icon: GlassWater },
                ].map(type => (
                  <button key={type.id} type="button" onClick={() => setCategory(type.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${category === type.id ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-950 border-transparent text-gray-400'}`}>
                    <type.icon size={20} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Dish Photograph</label>
              <div className="relative group overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors">
                {image ? (
                  <p className="text-emerald-500 font-bold flex items-center gap-2"><ImageIcon size={18} /> {image.name}</p>
                ) : (
                  <>
                    <ImageIcon className="text-gray-300 dark:text-gray-600" size={32} />
                    <p className="text-gray-400 text-sm font-bold">Select high-quality PNG or JPG</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem] space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (CA$)</label>
                  <input type="number" step="0.50" min="0" value={price} onChange={e=>setPrice(parseFloat(e.target.value)||0)} 
                    className="w-full px-5 py-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-emerald-500 text-lg font-black dark:text-white transition-all outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Dietary Group</label>
                  <div className="flex bg-white dark:bg-gray-950 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={() => setIsVeg(true)} className={`flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase transition-all ${isVeg ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>Veg</button>
                    <button type="button" onClick={() => setIsVeg(false)} className={`flex-1 py-3 px-3 rounded-xl text-xs font-black uppercase transition-all ${!isVeg ? 'bg-red-500 text-white' : 'text-gray-400'}`}>Non-Veg</button>
                  </div>
                </div>
              </div>

              {category === 'meal' && (
                <div>
                  <label className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 items-center">
                    <span>Spice Intensity</span>
                    <span className="bg-orange-100 dark:bg-orange-950 text-orange-600 px-3 py-1 rounded-full text-xs font-black tracking-widest">{spiceLevel}/5</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Flame className={spiceLevel > 3 ? 'text-red-500' : 'text-gray-300'} size={24} />
                    <input type="range" min="1" max="5" value={spiceLevel} onChange={e=>setSpiceLevel(parseInt(e.target.value))} 
                      className="flex-1 accent-emerald-500 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer group">
                  <input type="checkbox" checked={isCombo} onChange={(e) => setIsCombo(e.target.checked)} 
                    className="w-6 h-6 rounded-lg text-blue-500 border-gray-200 focus:ring-blue-500 transition-all" />
                  <span className="font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <PackagePlus className="text-blue-500" size={20} />
                    Create as Combo Selection
                  </span>
                </label>

                {isCombo && (
                  <div className="p-6 bg-white dark:bg-gray-950 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Select Included Items</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {menus.filter(m => !m.is_combo && m.id !== editingId).map(m => (
                        <div key={m.id} onClick={() => toggleSubItem(m.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedSubItemIds.includes(m.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
                          <span className="text-sm font-bold dark:text-white truncate">{m.name}</span>
                          {selectedSubItemIds.includes(m.id) ? <CheckCircle2 className="text-blue-500" size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-gray-800" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="px-8 py-5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2">
                  <XCircle size={20} />
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition disabled:opacity-50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg">
                <Sparkles size={24} />
                {isSubmitting ? 'Syncing...' : (editingId ? 'Update Masterpiece' : 'Publish to Catalog')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mt-16">
        {menus.map(menu => (
          <div key={menu.id} className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:-translate-y-3">
            <div className="absolute top-5 right-5 flex flex-col gap-2 z-10 transition-transform group-hover:translate-x-1">
              <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest ${menu.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {menu.is_veg ? 'Veg' : 'Meat'}
              </span>
              {menu.is_combo && <span className="px-4 py-1.5 bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest">Combo</span>}
              <span className="px-4 py-1.5 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest border border-white/20">
                {menu.category || 'Meal'}
              </span>
            </div>

            <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
              {menu.image_url ? (
                <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon size={48} className="opacity-20 mb-2" />
                  <span className="text-xs font-black uppercase tracking-tighter opacity-40">Awaiting Visuals</span>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight pr-4">{menu.name}</h4>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">CA${menu.price?.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed min-h-[3rem] font-medium italic">"{menu.description}"</p>
              
              {menu.category === 'meal' && (
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Heat Level:</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-orange-950/10 ${i < menu.spice_level ? 'bg-orange-500 shadow-sm shadow-orange-500/50' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    ))}
                  </div>
                </div>
              )}

              {menu.is_combo && menu.sub_items?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {menu.sub_items.map(si => (
                    <span key={si.id} className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                       + {si.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-3">
                 <button
                   onClick={() => handleToggle(menu.id)}
                   className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                     menu.is_active
                       ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                       : 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border border-transparent'
                   }`}
                 >
                   <div className={`w-2 h-2 rounded-full ${menu.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                   {menu.is_active ? 'Live' : 'Paused'}
                 </button>
                 
                 <div className="flex gap-2">
                   <button onClick={() => handleEdit(menu)} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Edit Item">
                      <Edit3 size={18} />
                   </button>
                   <button onClick={() => handleDelete(menu.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Delete permanently">
                      <Trash2 size={18} />
                   </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
