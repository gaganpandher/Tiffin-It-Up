import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/chef/dashboard', icon: '📊' },
    { name: 'Store Profile', path: '/chef/profile', icon: '🏪' },
    { name: 'Live Orders', path: '/chef/orders', icon: '📦' },
    { name: 'Manage Menus', path: '/chef/menus', icon: '🍲' },
    { name: 'Pricing Plans', path: '/chef/plans', icon: '💳' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-full transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[var(--primary)]">Chef Portal</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
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
          onClick={() => { localStorage.removeItem('token'); window.location.href='/'; }}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium">
          Logout
        </button>
      </div>
    </aside>
  );
}
