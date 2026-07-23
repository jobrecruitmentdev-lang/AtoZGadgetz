'use client';

import { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';

interface ProductActionsProps {
  productId: number;
  productDescription: string;
  productName: string;
}

export function ProductActions({ productId, productDescription, productName }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${productName}\n\n${productDescription}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity & Add to Cart */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center border border-black/10 dark:border-white/10 rounded-full h-14 w-32 bg-surface">
          <button 
            type="button" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-full text-center bg-transparent focus:outline-none font-medium appearance-none"
            style={{ MozAppearance: 'textfield' }}
          />
          <button 
            type="button" 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>
        
        <AddToCartButton productId={productId} quantity={quantity} />
        
        <button className="w-14 h-14 shrink-0 flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:bg-surface transition-colors text-muted hover:text-red-500">
          <Heart size={20} />
        </button>
      </div>

    </div>
  );
}
