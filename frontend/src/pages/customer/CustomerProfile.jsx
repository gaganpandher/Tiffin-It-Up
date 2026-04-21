import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { parseJwt, getAuthToken } from '../../services/api';

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState(null);
  const [show, setShow] = useState(false);

  const avatarRef = useRef(null);

  useEffect(() => {
    Promise.all([
      apiRequest('/users/me'),
      apiRequest('/customer/profile'),
    ]).then(([u, p]) => {
      setUser(u);
      setProfile(p);
      setFullName(u.full_name || '');
      setAddress(p.address || '');
    }).catch(console.error);
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest('/customer/profile', { method: 'PUT', body: JSON.stringify({ address }) });
      await apiRequest('/users/me', { method: 'PUT', body: JSON.stringify({ full_name: fullName }) }).catch(() => {});
      alert('Profile updated!');
    } catch (err) { alert(err.message); }
    finally { setIsSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const updated = await apiRequest('/customer/profile/avatar', { method: 'POST', headers: {}, body: formData });
      setProfile(updated);
    } catch (err) { alert(err.message); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    setIsUploading(true);
    try {
      const updated = await apiRequest('/customer/profile/avatar', { method: 'DELETE' });
      setProfile(updated);
    } catch (err) { alert(err.message); }
    finally { setIsUploading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage(null);
    if (newPassword !== confirmPassword) { setPwdMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPassword.length < 8) { setPwdMessage({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }
    try {
      await apiRequest('/users/change-password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) });
      setPwdMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { setPwdMessage({ type: 'error', text: err.message }); }
  };

  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Profile 👤</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer w-24 h-24 shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-blue-100">
            {profile?.profile_picture_url
              ? <img src={profile.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-blue-500 font-extrabold text-3xl">{user?.full_name?.charAt(0) || '?'}</div>
            }
            {isUploading && <Spinner />}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
            <button type="button" onClick={() => avatarRef.current?.click()} className="text-white text-xl hover:scale-110 transition-transform" title="Change photo">📷</button>
            {profile?.profile_picture_url && (
              <button type="button" onClick={handleDeleteAvatar} className="text-red-300 text-xl hover:scale-110 transition-transform" title="Remove">🗑️</button>
            )}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-xl font-bold dark:text-white">{user?.full_name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{user?.role}</span>
        </div>
      </div>

      {/* Profile Info Form */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-5 dark:text-white">Account Information</h3>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl dark:text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Address</label>
            <textarea rows="2" value={address} onChange={e => setAddress(e.target.value)} placeholder="Where should meals be delivered?"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white resize-none transition-all" />
          </div>
          <button type="submit" disabled={isSaving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-5 dark:text-white">Change Password 🔑</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {['currentPassword','newPassword','confirmPassword'].map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {['Current Password','New Password','Confirm New Password'][i]}
              </label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={[currentPassword,newPassword,confirmPassword][i]}
                  onChange={e => [setCurrentPassword,setNewPassword,setConfirmPassword][i](e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all"
                  placeholder={['Enter current password','Min 8 characters','Repeat new password'][i]} />
                {i === 0 && <button type="button" onClick={() => setShow(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{show ? '🙈' : '👁️'}</button>}
              </div>
            </div>
          ))}
          {pwdMessage && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwdMessage.type === 'success' ? '✅ ' : '❌ '}{pwdMessage.text}
            </div>
          )}
          <button type="submit" className="w-full py-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
