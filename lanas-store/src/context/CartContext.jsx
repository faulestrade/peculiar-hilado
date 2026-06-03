import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.variantId === action.payload.variantId);
      if (existing) {
        return state.map(i =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE':
      return state.filter(i => i.variantId !== action.variantId);
    case 'UPDATE_QTY':
      return state.map(i =>
        i.variantId === action.variantId ? { ...i, quantity: action.quantity } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(
    cartReducer,
    [],
    () => {
      try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
    }
  );

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  const addItem = (item) => dispatch({ type: 'ADD', payload: item });
  const removeItem = (variantId) => dispatch({ type: 'REMOVE', variantId });
  const updateQty = (variantId, quantity) => dispatch({ type: 'UPDATE_QTY', variantId, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ items, total, count, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
