import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { 
  User, 
  Camera, 
  Trash2, 
  Save, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

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
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Settings</h2>

      {/* Avatar Section */}
      <div className="flex items-center gap-8 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative group cursor-pointer w-28 h-28 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-lg bg-blue-50 dark:bg-blue-900/20">
            {profile?.profile_picture_url
              ? <img src={profile.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-blue-500 font-extrabold text-4xl">{user?.full_name?.charAt(0) || '?'}</div>
            }
            {isUploading && <Spinner />}
          </div>
          <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
            <button type="button" onClick={() => avatarRef.current?.click()} className="text-white hover:scale-125 transition-transform" title="Change photo"><Camera size={24} /></button>
            {profile?.profile_picture_url && (
              <button type="button" onClick={handleDeleteAvatar} className="text-red-400 hover:scale-125 transition-transform" title="Remove"><Trash2 size={24} /></button>
            )}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-gray-900 dark:text-white truncate">{user?.full_name}</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">{user?.email}</p>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-100 dark:border-blue-800">{user?.role} Account</span>
        </div>
      </div>

      {/* Profile Info Form */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">Personal Information</h3>
        <form onSubmit={handleSaveInfo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2 ml-1">Legal Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2 ml-1">Delivery Address</label>
              <textarea rows="3" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full home or office address..."
                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-blue-500 outline-none dark:text-white resize-none transition-all font-medium" />
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={20} />
            {isSaving ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8">
        <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">Security & Privacy</h3>
        <form onSubmit={handleChangePassword} className="space-y-6">
          {['currentPassword','newPassword','confirmPassword'].map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2 ml-1">
                {['Current Password','New Password','Confirm New Password'][i]}
              </label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={[currentPassword,newPassword,confirmPassword][i]}
                  onChange={e => [setCurrentPassword,setNewPassword,setConfirmPassword][i](e.target.value)}
                  className="w-full px-5 py-3 pr-14 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-transparent focus:border-blue-500 outline-none dark:text-white transition-all font-mono"
                  placeholder={['••••••••','Min 8 characters','Repeat new password'][i]} />
                {i === 0 && (
                  <button type="button" onClick={() => setShow(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors">
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pwdMessage && (
            <div className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold ${pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {pwdMessage.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {pwdMessage.text}
            </div>
          )}
          <button type="submit" className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-gray-900/10 hover:-translate-y-1 flex items-center justify-center gap-2">
            <Key size={20} />
            Update Access Password
          </button>
        </form>
      </div>
    </div>
  );
}
