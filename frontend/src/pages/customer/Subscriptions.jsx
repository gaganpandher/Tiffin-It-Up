import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';

const PLAN_ICONS = { daily: '☀️', weekly: '📅', monthly: '🗓️' };
const PLAN_COLORS = { daily: 'from-orange-400 to-red-400', weekly: 'from-blue-400 to-indigo-500', monthly: 'from-emerald-400 to-teal-500' };

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [planData, subData] = await Promise.all([
        apiRequest('/marketplace/plans'),
        apiRequest('/marketplace/subscriptions/me'),
      ]);
      setPlans(planData);
      setMySubscriptions(subData);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleSubscribe = (planId) => {
    navigate(`/customer/checkout/subscription?plan_id=${planId}`);
  };

  const handleCancel = async (subId) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      await apiRequest(`/marketplace/subscriptions/${subId}`, { method: 'DELETE' });
      await loadAll();
    } catch (err) { alert(err.message); }
  };

  const isSubscribed = (planId) => mySubscriptions.some(s => s.plan_id === planId && s.status === 'active');

  if (isLoading) return <div className="text-center py-24 text-gray-400">Loading plans...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Meal Subscriptions 📅</h2>

      {/* My Active Subscriptions */}
      {mySubscriptions.filter(s => s.status === 'active').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">My Active Subscriptions</h3>
          {mySubscriptions.filter(s => s.status === 'active').map(sub => (
            <div key={sub.id} className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <div>
                <p className="font-bold dark:text-white capitalize">{sub.plan?.plan_type} plan — {sub.plan?.chef_name}</p>
                <p className="text-emerald-600 font-bold">${sub.plan?.price?.toFixed(2)}</p>
              </div>
              <button onClick={() => handleCancel(sub.id)} className="text-sm text-red-500 hover:text-red-600 font-bold px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Cancel</button>
            </div>
          ))}
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">Available Plans</h3>
        {plans.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No plans available yet. Check back when chefs add their plans!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`h-24 bg-gradient-to-br ${PLAN_COLORS[plan.plan_type]} flex items-center justify-center`}>
                  <span className="text-5xl">{PLAN_ICONS[plan.plan_type]}</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    {plan.chef_avatar
                      ? <img src={plan.chef_avatar} alt={plan.chef_name} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">👨‍🍳</div>
                    }
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{plan.chef_name}</span>
                  </div>
                  <h4 className="text-xl font-extrabold dark:text-white capitalize">{plan.plan_type} Plan</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{plan.description || 'Fresh home-cooked meals delivered to your door.'}</p>
                  <p className="text-3xl font-extrabold text-blue-600">${plan.price.toFixed(2)} <span className="text-sm font-normal text-gray-400">/{plan.plan_type}</span></p>

                  {isSubscribed(plan.id) ? (
                    <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-center text-sm">✅ Subscribed</div>
                  ) : (
                    <button onClick={() => handleSubscribe(plan.id)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-blue-600/20">Subscribe →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
