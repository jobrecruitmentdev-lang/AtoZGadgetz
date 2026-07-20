'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddToCartButton } from './AddToCartButton';

interface StickyMobileCTAProps {
  productId: string | number;
  productName: string;
  price: string;
}

export function StickyMobileCTA({ productId, productName, price }: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-black/5 dark:border-white/5 p-4 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{productName}</span>
            <span className="font-bold">${parseFloat(price).toFixed(2)}</span>
          </div>
          <div className="w-[150px] shrink-0">
            <AddToCartButton productId={productId} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
