'use client';
import { ShoppingCart } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { fetchApi } from "@/lib/api-client";
import { useCart } from "@/components/storefront/CartContext";
import { useState } from "react";

export function AddToCartButton({ productId, quantity = 1 }: { productId: string | number, quantity?: number }) {
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: Number(productId), quantity })
      });
      await refreshCart();
      // maybe open drawer? not required right now
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('Authorization') || e.message?.includes('auth')) {
        alert("Please log in to add items to your cart.");
        window.location.href = '/login';
      } else {
        alert("Failed to add to cart: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MagneticButton 
      onClick={handleAdd}
      className="flex-1 bg-foreground text-background py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-accent transition-colors"
    >
      <ShoppingCart size={20} />
      {loading ? 'Adding...' : 'Add to Cart'}
    </MagneticButton>
  );
}
