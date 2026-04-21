import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest, setAuthToken, parseJwt } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      setAuthToken(res.access_token);
      
      const payload = parseJwt(res.access_token);
      if (payload && payload.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (payload && payload.role === 'chef') {
        navigate('/chef/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', email); // OAuth2 expects 'username' field
      formData.append('password', password);

      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: formData,
      });

      setAuthToken(res.access_token);
      
      const payload = parseJwt(res.access_token);
      if (payload && payload.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (payload && payload.role === 'chef') {
        navigate('/chef/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Tiffin It Up</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Sign in to your Chef account</p>
        
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 outline-none pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full py-3 mt-2 bg-[var(--secondary)] hover:bg-teal-600 text-white font-semibold rounded-xl shadow-md transition-colors">
            Sign In
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          First time here? <Link to="/signup" className="text-[var(--primary)] hover:underline font-medium">Create an account</Link>
        </p>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Or continue with</p>
          <button 
            type="button" 
            onClick={() => handleGoogleSuccess({ credential: 'dummy_google_token' })}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Mock Google Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
