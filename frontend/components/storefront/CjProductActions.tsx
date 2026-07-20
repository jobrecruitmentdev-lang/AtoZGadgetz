'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useCart } from '@/components/storefront/CartContext';

interface Variant {
  name: string;
  value: string;
  price: number;
}

interface Props {
  cjPid: string;
  productName: string;
  variants: Variant[];
}

export function CjProductActions({ cjPid, productName, variants }: Props) {
  const { refreshCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] ?? null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddToCart = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const imported = await fetchApi<{ productId: number }>('/api/cj/products/auto-import', {
        method: 'POST',
        body: JSON.stringify({ cjPid }),
      });
      await fetchApi('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: imported.productId, quantity }),
      });
      await refreshCart();
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add to cart. Please try again.');
      setStatus('error');
    }
  };

  // Group variants by name (e.g. Color, Size)
  const variantGroups = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    (acc[v.name] = acc[v.name] || []).push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(variantGroups).map(([groupName, options]) => (
        <div key={groupName}>
          <p className="text-sm font-semibold mb-2">{groupName}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((v) => (
              <button
                key={v.value}
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  selectedVariant?.value === v.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-foreground/20 hover:border-accent/60'
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-foreground/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-lg hover:bg-foreground/5 transition-colors"
          >
            −
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2.5 text-lg hover:bg-foreground/5 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={status === 'loading' || status === 'done'}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors disabled:opacity-70"
        >
          {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
          {status === 'done' && <Check size={18} />}
          {status === 'loading' ? 'Adding…' : status === 'done' ? 'Added to Cart!' : (
            <><ShoppingCart size={18} /> Add to Cart</>
          )}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
