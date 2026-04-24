import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';

export default function SubscriptionCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = new URLSearchParams(location.search).get('plan_id');

  useEffect(() => {
    if (!planId) {
      navigate('/customer/subscriptions');
      return;
    }
    // Fetch all plans and find the one we need (marketplace/plans)
    apiRequest('/marketplace/plans')
      .then(plans => {
        const p = plans.find(p => p.id === parseInt(planId));
        if (p) setPlan(p);
        else navigate('/customer/subscriptions');
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [planId]);

  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirmSubscription = async () => {
    setIsProcessing(true);
    try {
      await apiRequest('/marketplace/subscribe', {
        method: 'POST',
        body: JSON.stringify({ 
          plan_id: parseInt(planId),
          allergies,
          notes
        })
      });
      navigate('/customer/subscriptions');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="text-center py-24 text-gray-400">Loading plan details...</div>;
  if (!plan) return null;

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Subscription Checkout 💳</h2>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{plan.plan_type} Plan</h3>
            <p className="text-gray-500 mt-1">Kitchen: {plan.chef_name}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white ${plan.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {plan.is_veg ? '🥗 VEG' : '🥩 NON-VEG'}
          </span>
        </div>

        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Subscription Fee</span>
            <span className="text-3xl font-extrabold text-blue-600">${plan.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-blue-500 mt-2">Billed {plan.plan_type === 'daily' ? 'per day' : plan.plan_type === 'weekly' ? 'per week' : 'per month'}.</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🥗 Health & Preferences
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Allergies (e.g. Nuts, Gluten)</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="List any allergies..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Special Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other preferences or comments?"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Payment Method (Mock)</p>
          <div className="p-4 border-2 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md flex items-center justify-center text-white font-bold text-[10px]">VISA</div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500">Exp: 12/26</p>
            </div>
            <span className="text-emerald-500">✅</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleConfirmSubscription}
            disabled={isProcessing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Confirm & Subscribe for $${plan.price.toFixed(2)} →`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">By subscribing, you agree to the recurring billing terms.</p>
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="w-full py-2 text-gray-500 font-medium hover:text-gray-700">← Go Back</button>
    </div>
  );
}
