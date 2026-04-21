import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Store, 
  Package, 
  UtensilsCrossed, 
  CreditCard, 
  Key,
  LogOut
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard',       path: '/chef/dashboard', icon: <BarChart3 size={20} /> },
    { name: 'Store Profile',   path: '/chef/profile',   icon: <Store size={20} /> },
    { name: 'Live Orders',     path: '/chef/orders',    icon: <Package size={20} /> },
    { name: 'Manage Menus',    path: '/chef/menus',     icon: <UtensilsCrossed size={20} /> },
    { name: 'Pricing Plans',   path: '/chef/plans',     icon: <CreditCard size={20} /> },
    { name: 'Change Password', path: '/chef/password',  icon: <Key size={20} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        flex flex-col h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tiffin It Up</h2>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold shadow-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
