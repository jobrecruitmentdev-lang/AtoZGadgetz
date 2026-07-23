'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles } from 'lucide-react';

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const galleryImages = images && images.length > 0 ? images : ['/placeholder.svg'];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 sticky top-24">
      {/* Main Pinterest Hero Card */}
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="relative aspect-[4/3] md:aspect-square bg-gradient-to-b from-surface to-background rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 group cursor-zoom-in shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
            <SafeImage 
              src={galleryImages[currentIndex]} 
              alt={productName} 
              fill 
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider text-accent border border-foreground/10 flex items-center gap-1 shadow-sm">
            <Sparkles size={12} /> Premium Gallery
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground hover:scale-110 transition-transform shadow-md border border-foreground/10"
            title="Expand image"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Carousel Prev/Next Overlay Controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md opacity-0 group-hover:opacity-100 flex items-center justify-center text-foreground hover:scale-110 transition-all shadow-lg border border-foreground/10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md opacity-0 group-hover:opacity-100 flex items-center justify-center text-foreground hover:scale-110 transition-all shadow-lg border border-foreground/10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {currentIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* Pinterest Grid Thumbnails Bar */}
      {galleryImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3 pt-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                currentIndex === idx 
                  ? 'border-accent ring-2 ring-accent/40 shadow-md scale-105' 
                  : 'border-black/5 dark:border-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <SafeImage src={img} alt={`Gallery thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-50 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
              <SafeImage 
                src={galleryImages[currentIndex]} 
                alt={productName} 
                fill 
                className="object-contain" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
