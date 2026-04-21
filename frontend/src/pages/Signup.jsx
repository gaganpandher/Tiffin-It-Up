import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest, setAuthToken, parseJwt } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      // Signup logs them in and redirects them
      setAuthToken(res.access_token);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
          role: role
        })
      });
      // Redirect to login page on success
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-center text-[var(--primary)] mb-2">Tiffin It Up</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Create your account to get started</p>
        
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] outline-none"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] outline-none pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I want to join as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border rounded-xl p-4 text-center transition-colors ${role === 'customer' ? 'border-[var(--secondary)] bg-teal-50 dark:bg-teal-900/20 text-[var(--secondary)]' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <input type="radio" className="sr-only" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} />
                <span className="font-semibold block">Customer</span>
                <span className="text-xs mt-1 block">To order meals</span>
              </label>
              <label className={`cursor-pointer border rounded-xl p-4 text-center transition-colors ${role === 'chef' ? 'border-[var(--primary)] bg-red-50 dark:bg-red-900/20 text-[var(--primary)]' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <input type="radio" className="sr-only" name="role" value="chef" checked={role === 'chef'} onChange={() => setRole('chef')} />
                <span className="font-semibold block">Chef</span>
                <span className="text-xs mt-1 block">To sell meals</span>
              </label>
            </div>
          </div>

          <button type="submit" className="w-full py-3 mt-4 bg-[var(--primary)] hover:bg-red-500 text-white font-semibold rounded-xl shadow-md transition-colors">
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-[var(--secondary)] hover:underline font-medium">Log in</Link>
        </p>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Or sign up with</p>
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
            Mock Google Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
