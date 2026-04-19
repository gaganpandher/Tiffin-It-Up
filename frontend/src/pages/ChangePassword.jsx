import { useState } from 'react';
import { apiRequest } from '../services/api';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const Eye = ({ show, toggle }) => (
    <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
      {show ? '🙈' : '👁️'}
    </button>
  );

  return (
    <div className="max-w-md mx-auto pt-8 pb-16">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Change Password</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Keep your account secure with a strong password.</p>

      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl dark:text-white outline-none transition-all"
                placeholder="Enter current password"
              />
              <Eye show={showCurrent} toggle={() => setShowCurrent(v => !v)} />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl dark:text-white outline-none transition-all"
                placeholder="Min 8 characters"
              />
              <Eye show={showNew} toggle={() => setShowNew(v => !v)} />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border rounded-xl dark:text-white outline-none transition-all ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900'
                }`}
                placeholder="Repeat new password"
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
