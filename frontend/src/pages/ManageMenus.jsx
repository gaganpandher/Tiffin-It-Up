import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function ManageMenus() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = () => {
    apiRequest('/chef/menus').then(setMenus).catch(console.error);
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    formData.append('is_active', true);
    if (image) formData.append('image', image);

    try {
      await apiRequest('/chef/menus', { method: 'POST', body: formData });
      setName('');
      setDescription('');
      setImage(null);
      loadMenus();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Menus</h2>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Meal</h3>
        <form onSubmit={handleCreateMenu} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Meal Name</label>
            <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-950 dark:border-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-950 dark:border-gray-800 dark:text-white" rows="3"></textarea>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Image Upload (Local)</label>
            <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="w-full text-gray-700 dark:text-gray-300" />
          </div>
          <button type="submit" className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">Add Meal</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {menus.map(menu => (
          <div key={menu.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {menu.image_url ? (
              <img src={`http://localhost:8000${menu.image_url}`} alt={menu.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="p-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{menu.name}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{menu.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
