import { NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CustomerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const links = [
    { name: 'Browse Meals',    path: '/customer/dashboard', icon: '🍽️' },
    { name: 'My Cart',         path: '/customer/cart',      icon: '🛒', badge: itemCount },
    { name: 'My Orders',       path: '/customer/orders',    icon: '📦' },
    { name: 'Subscriptions',   path: '/customer/subscriptions', icon: '📅' },
    { name: 'My Profile',      path: '/customer/profile',   icon: '👤' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden" onClick={onClose} />
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
          <h2 className="text-2xl font-bold text-blue-500">Tiffin It Up</h2>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <span>{link.icon}</span>{link.name}
              </span>
              {link.badge > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{link.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
          >Logout</button>
        </div>
      </aside>
    </>
  );
}
