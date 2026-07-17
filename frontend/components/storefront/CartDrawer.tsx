'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/storefront/CartContext';
import { fetchApi } from '@/lib/api-client';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, refreshCart } = useCart();
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + parseFloat(String((item.product as any)?.price ?? 0)) * item.quantity, 0);

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty <= 0) return removeItem(itemId);
    try {
      await fetchApi(`/api/cart/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQty })
      });
      refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await fetchApi(`/api/cart/item/${itemId}`, { method: 'DELETE' });
      refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tighter">Your Cart</h2>
              <button onClick={onClose} aria-label="Close Cart" className="hover:text-accent transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-6 pr-2">
              <AnimatePresence>
                {items.length === 0 && (
                  <p className="text-muted text-center pt-10">Your cart is empty.</p>
                )}
                {items.map((item) => {
                  const p = item.product as any;
                  return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-4 border-b border-black/5 dark:border-white/5 pb-6"
                  >
                    <div className="relative w-24 h-24 bg-surface rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={String(p?.thumbnail_image || p?.images?.[0]?.url || '/placeholder.svg')}
                        alt={String(p?.name || 'Product')}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="font-medium leading-tight mb-1">{String(p?.name || '')}</h3>
                        <p className="text-muted text-sm">${parseFloat(String(p?.price ?? 0)).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3 border border-black/10 dark:border-white/10 rounded-full px-3 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-muted hover:text-foreground">-</button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-muted hover:text-foreground">+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="pt-6 border-t border-black/10 dark:border-white/10 mt-auto">
              <div className="flex justify-between mb-6">
                <span className="font-medium text-lg">Subtotal</span>
                <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted mb-6 text-center">Shipping & taxes calculated at checkout.</p>
              <Link href="/checkout" onClick={onClose} className="block w-full">
                <button className="w-full bg-foreground text-background py-4 rounded-full font-medium hover:bg-accent hover:text-white transition-colors">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
