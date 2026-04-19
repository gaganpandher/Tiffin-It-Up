export default function Topbar({ onMenuOpen }) {
  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
          <span className="block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome, Chef!</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg border-2 border-white dark:border-gray-800" />
      </div>
    </header>
  );
}
