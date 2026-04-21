import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../services/api';
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  X, 
  Truck, 
  Package,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const TIME_SLOTS = [
  "Morning (8:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 4:00 PM)",
  "Evening (4:00 PM - 8:00 PM)",
  "Night (8:00 PM - 12:00 AM)",
];

export default function Cart() {
  const { cartItems, cartChefId, removeFromCart, updateQuantity, clearCart, subtotal, discount, total, comboLabel, setComboLabel } = useCart();
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [timeSlot, setTimeSlot] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!timeSlot) { alert('Please select a time slot.'); return; }
    if (cartItems.length === 0) { alert('Your cart is empty.'); return; }
    setIsPlacing(true);
    try {
      await apiRequest('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          chef_id: cartChefId,
          items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity, combo_label: comboLabel || null })),
          delivery_type: deliveryType,
          time_slot: timeSlot,
        }),
      });
      clearCart();
      alert("🎉 Order placed successfully! You can track it in 'My Orders'.");
      navigate('/customer/orders');
    } catch (err) {
      alert('Checkout failed: ' + (err.message || 'Unknown error. Please try again.'));
      console.error(err);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Explore our marketplace to find delicious meals prepared fresh for you!</p>
        <button 
          onClick={() => navigate('/customer/dashboard')} 
          className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8">
      <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Review Order</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Items prepared by your selected chef</p>
        </div>
        <button onClick={clearCart} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-bold bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg transition-colors">
          <Trash2 size={16} />
          Empty Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-5 p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase text-[10px]">No Image</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{item.name}</p>
                  <p className="text-blue-600 font-bold text-sm">CA${item.price.toFixed(2)} / unit</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center transition-all"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold dark:text-white text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center transition-all"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"><X size={16} /></button>
                </div>
                <span className="text-gray-900 dark:text-white font-black text-lg shrink-0 pl-2">CA${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Custom Combo Label */}
          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-blue-500" size={18} />
              <p className="font-bold text-blue-900 dark:text-blue-300">Name your custom combo</p>
            </div>
            <input
              type="text"
              placeholder="e.g. Wednesday Special Lunch"
              value={comboLabel}
              onChange={e => setComboLabel(e.target.value)}
              className="w-full px-5 py-3 bg-white dark:bg-gray-950 rounded-xl border border-blue-200 dark:border-blue-900/50 outline-none dark:text-white focus:border-blue-500 transition-all shadow-sm"
            />
            <p className="text-xs text-blue-600/70 dark:text-blue-400/50 mt-2 ml-1">Give this selection a name for easier future ordering.</p>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">Order Summary</h3>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>CA${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1.5">Combo Discount (10%)</span>
                <span>−CA${discount.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between font-black text-2xl dark:text-white">
                <span>Total</span>
                <span className="text-blue-600 dark:text-blue-400">CA${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Fulfillment Type</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeliveryType('delivery')} 
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all outline-none ${deliveryType === 'delivery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                >
                  <Truck size={18} />
                  Delivery
                </button>
                <button 
                  onClick={() => setDeliveryType('pickup')} 
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all outline-none ${deliveryType === 'pickup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                >
                  <Package size={18} />
                  Pickup
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Arrival Window</p>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full pl-5 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white text-sm font-semibold transition-all">
                <option value="">Select Time Slot</option>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={isPlacing} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isPlacing ? 'Processing...' : (
                <>
                  Checkout Securely
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
