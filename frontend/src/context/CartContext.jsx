import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tiffin_cart')) || []; }
    catch { return []; }
  });
  const [cartChefId, setCartChefId] = useState(() => sessionStorage.getItem('tiffin_cart_chef') || null);
  const [comboLabel, setComboLabel] = useState('');

  useEffect(() => {
    sessionStorage.setItem('tiffin_cart', JSON.stringify(cartItems));
    sessionStorage.setItem('tiffin_cart_chef', cartChefId || '');
  }, [cartItems, cartChefId]);

  const addToCart = (item) => {
    // Lock to one chef at a time
    if (cartChefId && String(cartChefId) !== String(item.chef_id)) {
      return { error: `Your cart already has items from another chef. Clear your cart first.` };
    }
    setCartChefId(item.chef_id);
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    return null;
  };

  const removeFromCart = (id) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      if (updated.length === 0) setCartChefId(null);
      return updated;
    });
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartChefId(null);
    setComboLabel('');
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round(subtotal * 0.10 * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartChefId, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, discount, total, itemCount, comboLabel, setComboLabel }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
