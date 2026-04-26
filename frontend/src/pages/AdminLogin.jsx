import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, setAuthToken, parseJwt } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      
      const payload = parseJwt(res.access_token);
      if (payload && payload.roles.split(',').includes('admin')) {
        setAuthToken(res.access_token);
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized: You are not an administrator.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl text-white">⚙️</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Admin Portal</h1>
        <p className="text-gray-400 text-center mb-8">Secure system access</p>
        
        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors">
            Authorize Gateway
          </button>
        </form>
      </div>
    </div>
  );
}
