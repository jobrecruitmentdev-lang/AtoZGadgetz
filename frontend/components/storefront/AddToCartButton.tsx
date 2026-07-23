'use client';

import { ShoppingCart, Check } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { fetchApi } from "@/lib/api-client";
import { useCart } from "@/components/storefront/CartContext";
import { useState } from "react";

export function AddToCartButton({ productId, quantity = 1 }: { productId: string | number; quantity?: number }) {
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: Number(productId), quantity })
      });
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e: any) {
      console.error('Add to cart error:', e);
      const msg = String(e.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('authorization') || msg.includes('auth') || msg.includes('unauthorized')) {
        alert("Please log in to add items to your shopping cart.");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      } else {
        alert("Could not add item to cart. Please try logging in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MagneticButton 
      onClick={handleAdd}
      className={`flex-1 py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
        added 
          ? 'bg-emerald-600 text-white' 
          : 'bg-foreground text-background hover:bg-accent hover:text-foreground'
      }`}
    >
      {added ? <Check size={20} /> : <ShoppingCart size={20} />}
      {loading ? 'Adding...' : added ? 'Added to Cart!' : 'Add to Cart'}
    </MagneticButton>
  );
}
