import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import { CartProvider } from '../context/CartContext';

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 font-sans">
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
                <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
                <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome back! 👋</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 shadow-lg border-2 border-white dark:border-gray-800" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
