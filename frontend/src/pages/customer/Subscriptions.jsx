import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { 
  CalendarDays, 
  Sun, 
  Calendar, 
  Moon,
  ChevronRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';

const PLAN_MAP = {
  daily:   { icon: <Sun size={32} />,   color: 'from-orange-400 to-red-400' },
  weekly:  { icon: <Calendar size={32} />, color: 'from-blue-400 to-indigo-500' },
  monthly: { icon: <Moon size={32} />,  color: 'from-emerald-400 to-teal-500' },
};

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

  if (isLoading) return <div className="text-center py-32 text-gray-400 font-medium animate-pulse">Loading plans...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Meal Subscriptions</h2>

      {/* My Active Subscriptions */}
      {mySubscriptions.filter(s => s.status === 'active').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 ml-1">My Active Subscriptions</h3>
          <div className="grid gap-4">
            {mySubscriptions.filter(s => s.status === 'active').map(sub => (
              <div key={sub.id} className="flex justify-between items-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg dark:text-white capitalize">{sub.plan?.plan_type} plan — {sub.plan?.chef_name}</p>
                    <p className="text-emerald-600 font-bold">CA${sub.plan?.price?.toFixed(2)} billed {sub.plan?.plan_type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCancel(sub.id)} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 ml-1">Explore Available Plans</h3>
        {plans.length === 0 ? (
          <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
             <CalendarDays className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
             <p className="text-gray-500 dark:text-gray-400">No plans available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2">
                <div className={`h-28 bg-gradient-to-br ${PLAN_MAP[plan.plan_type]?.color} flex items-center justify-center text-white`}>
                  {PLAN_MAP[plan.plan_type]?.icon}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {plan.chef_avatar
                      ? <img src={plan.chef_avatar} alt={plan.chef_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-50 dark:ring-gray-800" />
                      : <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-600 uppercase">CH</div>
                    }
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{plan.chef_name}</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white capitalize leading-tight">{plan.plan_type} Plan</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2 min-h-[2.5rem]">{plan.description || 'Fresh home-cooked meals delivered to your door.'}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">CA${plan.price.toFixed(2)} <span className="text-xs font-bold text-gray-400 tracking-wider">/ {plan.plan_type.toUpperCase()}</span></p>
                  </div>

                  {isSubscribed(plan.id) ? (
                    <div className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl text-center text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      Active Subscription
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan.id)} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      Subscribe Now
                      <ChevronRight size={18} />
                    </button>
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
