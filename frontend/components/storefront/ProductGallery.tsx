'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductGallery({ images, productName }: { images: string[], productName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="space-y-4 sticky top-24">
      <div className="relative aspect-square bg-surface rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 group cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <SafeImage 
              src={images[currentIndex]} 
              alt={productName} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start ${
              currentIndex === idx 
                ? 'border-accent ring-2 ring-accent/30' 
                : 'border-transparent hover:border-black/10 dark:hover:border-white/10'
            }`}
          >
            <SafeImage src={img} alt={`Gallery thumbnail ${idx+1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
