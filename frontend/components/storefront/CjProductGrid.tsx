'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useCart } from '@/components/storefront/CartContext';

export interface CjProduct {
  pid: string;
  name: string;
  imageUrl: string;
  price: number;
  currency?: string;
}

export function CjProductGrid({ products }: { products: CjProduct[] }) {
  const { refreshCart } = useCart();
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const handleAddToCart = async (product: CjProduct) => {
    setAdding((prev) => ({ ...prev, [product.pid]: true }));
    try {
      // 1. Auto-import the CJ product into our DB
      const imported = await fetchApi<{ productId: number }>('/api/cj/products/auto-import', {
        method: 'POST',
        body: JSON.stringify({ cjPid: product.pid }),
      });

      // 2. Add to cart using our standard cart endpoint
      await fetchApi('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: imported.productId, quantity: 1 }),
      });

      await refreshCart();
      setDone((prev) => ({ ...prev, [product.pid]: true }));
      setTimeout(() => setDone((prev) => ({ ...prev, [product.pid]: false })), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAdding((prev) => ({ ...prev, [product.pid]: false }));
    }
  };

  const unique = products
    .filter((p) => p.imageUrl && p.imageUrl.trim() !== '')
    .filter((p, i, arr) => arr.findIndex((x) => x.pid === p.pid) === i);

  if (!unique.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {unique.map((product) => {
        const price = typeof product.price === 'number'
          ? product.price
          : parseFloat(String(product.price || 0));
        const isAdding = adding[product.pid];
        const isDone = done[product.pid];

        return (
          <div
            key={product.pid}
            className="group bg-background border border-foreground/8 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Link href={`/product/cj-${product.pid}`} className="block">
              <div className="relative aspect-square bg-foreground/3 overflow-hidden">
                <SafeImage
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            </Link>

            <div className="p-3">
              <Link href={`/product/cj-${product.pid}`}>
                <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-2 min-h-[2.5rem] hover:text-accent transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-base text-accent">${(price * 2).toFixed(2)}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding || isDone}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-70 shrink-0"
                >
                  {isAdding ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : isDone ? (
                    '✓ Added'
                  ) : (
                    <>
                      <ShoppingCart size={13} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
