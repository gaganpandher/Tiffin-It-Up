import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../services/api';

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
      navigate('/customer/orders');
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Browse meals and add something delicious!</p>
        <button onClick={() => navigate('/customer/dashboard')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Browse Meals</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Cart 🛒</h2>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-semibold">Clear Cart</button>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Items List */}
        <div className="md:col-span-3 space-y-3">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              {item.image_url
                ? <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                : <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0">🍲</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-blue-600 font-bold text-sm">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 font-bold flex items-center justify-center">−</button>
                <span className="w-6 text-center font-bold dark:text-white">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 font-bold flex items-center justify-center">+</button>
                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm ml-1">✕</button>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-bold shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          {/* Custom Combo Label */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">🍱 Name your combo (optional)</p>
            <input
              type="text"
              placeholder="e.g. My Lunch Special"
              value={comboLabel}
              onChange={e => setComboLabel(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-700 outline-none dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Summary Panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-lg dark:text-white">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-600 font-semibold"><span>🎉 10% Discount</span><span>−${discount.toFixed(2)}</span></div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-extrabold text-lg dark:text-white"><span>Total</span><span className="text-blue-600">${total.toFixed(2)}</span></div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Type</p>
              <div className="flex gap-2">
                {['delivery','pickup'].map(type => (
                  <button key={type} onClick={() => setDeliveryType(type)} className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${deliveryType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {type === 'delivery' ? '🚚' : '📦'} {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Slot</p>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-transparent focus:border-blue-500 outline-none dark:text-white text-sm">
                <option value="">Select a time slot</option>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button onClick={handleCheckout} disabled={isPlacing} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50">
              {isPlacing ? 'Placing Order...' : 'Place Order →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
