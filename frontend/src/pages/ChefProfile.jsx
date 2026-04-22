import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/api';

export default function ChefProfile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [baseDeliveryPrice, setBaseDeliveryPrice] = useState(0);
  const [timeSlotsDelivery, setTimeSlotsDelivery] = useState('');
  const [timeSlotsPickup, setTimeSlotsPickup] = useState('');
  const [isUploading, setIsUploading] = useState(null); // 'avatar' | 'cover' | null
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState('');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const TIME_SLOT_OPTIONS = [
    "Morning (8:00 AM - 12:00 PM)",
    "Afternoon (12:00 PM - 4:00 PM)",
    "Evening (4:00 PM - 8:00 PM)",
    "Night (8:00 PM - 12:00 AM)",
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [pData, uData] = await Promise.all([
        apiRequest('/chef/profile'),
        apiRequest('/users/me')
      ]);
      setProfile(pData);
      setBio(pData.bio || '');
      setPickupAddress(pData.pickup_address || '');
      setDeliveryAvailable(pData.delivery_available);
      setBaseDeliveryPrice(pData.base_delivery_price || 0);
      setTimeSlotsDelivery(pData.time_slots_delivery || '');
      setTimeSlotsPickup(pData.time_slots_pickup || '');
      setPhone(uData.phone_number || '');
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Image Upload ─────────────────────────────────────────────────────────
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(type);
    const formData = new FormData();
    if (type === 'avatar') formData.append('profile_picture', file);
    if (type === 'cover')  formData.append('cover_image', file);
    try {
      const updated = await apiRequest('/chef/profile/images', {
        method: 'POST',
        headers: {},
        body: formData,
      });
      setProfile(updated);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(null);
      e.target.value = '';
    }
  };

  // ─── Image Delete ─────────────────────────────────────────────────────────
  const handleDeleteImage = async (target) => {
    if (!window.confirm(`Remove this ${target === 'avatar' ? 'profile picture' : 'cover banner'}?`)) return;
    setIsUploading(target);
    try {
      const updated = await apiRequest(`/chef/profile/images?target=${target}`, { method: 'DELETE' });
      setProfile(updated);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setIsUploading(null);
    }
  };

  // ─── Profile Save ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest('/chef/profile', {
        method: 'PUT',
        body: JSON.stringify({
          bio,
          pickup_address: pickupAddress,
          delivery_available: deliveryAvailable,
          base_delivery_price: parseFloat(baseDeliveryPrice),
          time_slots_delivery: timeSlotsDelivery,
          time_slots_pickup: timeSlotsPickup,
          service_active: profile?.service_active ?? true,
        }),
      });
      await apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ phone_number: phone })
      });
      alert('Profile saved!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Shared Overlay Spinner ───────────────────────────────────────────────
  const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-inherit z-20">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Storefront Configuration</h2>

      {/* ── Cover Banner ─────────────────────────────────────────────── */}
      <div className="relative group w-full h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 shadow-lg cursor-pointer">
        {profile?.cover_image_url && (
          <img src={profile.cover_image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 z-10">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold rounded-xl border border-white/30 transition-all"
          >
            <span className="text-lg">📷</span> Change Banner
          </button>
          {profile?.cover_image_url && (
            <button
              type="button"
              onClick={() => handleDeleteImage('cover')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/70 hover:bg-red-600/80 backdrop-blur-sm text-white text-sm font-bold rounded-xl border border-red-400/30 transition-all"
            >
              <span className="text-lg">🗑️</span> Remove
            </button>
          )}
        </div>

        {isUploading === 'cover' && <Spinner />}

        {/* Hidden file input */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e, 'cover')}
        />

        {/* Avatar — sits on top of the banner */}
        <div className="absolute -bottom-8 left-6 z-10">
          <div className="relative group/avatar w-24 h-24 rounded-full border-4 border-white dark:border-gray-950 overflow-hidden bg-emerald-100 shadow-xl cursor-pointer">
            {profile?.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-600 font-extrabold text-3xl">
                {profile ? '?' : '...'}
              </div>
            )}

            {/* Avatar hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 rounded-full">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Change photo"
                className="text-white text-xl hover:scale-110 transition-transform"
              >
                📷
              </button>
              {profile?.profile_picture_url && (
                <button
                  type="button"
                  onClick={() => handleDeleteImage('avatar')}
                  title="Remove photo"
                  className="text-red-300 text-xl hover:scale-110 transition-transform"
                >
                  🗑️
                </button>
              )}
            </div>

            {isUploading === 'avatar' && <Spinner />}

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, 'avatar')}
            />
          </div>
        </div>

        {/* Hint text for empty state */}
        {!profile?.cover_image_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 pointer-events-none">
          </div>
        )}
        {!profile?.cover_image_url && (
          <p className="absolute bottom-4 right-4 text-white/60 text-xs font-medium pointer-events-none">
            Hover to upload a cover banner
          </p>
        )}
      </div>

      {/* ── Contact Details ─────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Contact Details</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input
            type="text" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-xl dark:text-white outline-none transition-all"
          />
        </div>
      </div>

      {/* ── Config Form ──────────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Operations Config</h3>
        <form onSubmit={handleSave} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Biography</label>
            <textarea
              rows="3" value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Tell customers about your cooking style..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl dark:text-white outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Offer Delivery</span>
            <input type="checkbox" checked={deliveryAvailable} onChange={e => setDeliveryAvailable(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded" />
          </div>

          {deliveryAvailable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Delivery Fee ($)</label>
                <input
                  type="number" step="0.5" value={baseDeliveryPrice} onChange={e => setBaseDeliveryPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-xl dark:text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Time Slot</label>
                <select value={timeSlotsDelivery} onChange={e => setTimeSlotsDelivery(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-xl dark:text-white outline-none transition-all">
                  <option value="">Select slot</option>
                  {TIME_SLOT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pickup Address</label>
            <textarea
              rows="2" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)}
              placeholder="Where can customers pick up orders?"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl dark:text-white outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pickup Time Slot</label>
            <select value={timeSlotsPickup} onChange={e => setTimeSlotsPickup(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-transparent focus:border-emerald-500 rounded-xl dark:text-white outline-none transition-all">
              <option value="">Select slot</option>
              {TIME_SLOT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
