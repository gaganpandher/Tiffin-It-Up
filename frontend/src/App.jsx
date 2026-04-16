import { Routes, Route, BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 text-center">
          <h1 className="text-4xl font-extrabold text-[var(--primary)] tracking-tight">Tiffin-It-Up</h1>
          <p className="text-gray-500 text-lg">Phase 1 Foundation Setup Complete!</p>
          
          <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[var(--secondary)] hover:bg-teal-600 transition-colors shadow-sm cursor-pointer">
            System Online
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
