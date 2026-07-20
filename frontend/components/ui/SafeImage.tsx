'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
  maxRetries?: number;
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.png', // Assuming there's a placeholder, or we render an icon
  maxRetries = 2,
  className,
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      // Retry by appending a timestamp to bust the browser cache for the broken image
      const separator = typeof currentSrc === 'string' && currentSrc.includes('?') ? '&' : '?';
      setCurrentSrc(`${src}${separator}retry=${Date.now()}`);
      setRetryCount(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 text-muted ${className}`}>
        <ImageOff size={24} className="mb-2 opacity-50" />
        <span className="text-xs font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
