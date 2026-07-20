'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchApi } from '@/lib/api-client';
import { useAuth } from '@/components/auth/AuthContext';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price?: number | string;
  product?: Record<string, unknown>;
  variant?: Record<string, unknown>;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchApi<Cart>('/api/cart');
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
