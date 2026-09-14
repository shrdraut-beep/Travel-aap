// src/components/common/FastImage.tsx
// High-Performance Aggressive Image Caching & WebP Optimization Component

import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  aspectRatio?: string;
  containerClassName?: string;
}

// In-memory LRU Image URL cache to avoid redundant network decodes
const inMemoryCache = new Set<string>();

/**
 * Transforms external image URLs to use compressed WebP format where available
 */
export function optimizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Unsplash URLs: enforce webp & optimal compression
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('auto=format')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}auto=format&fit=crop&q=80&fm=webp`;
    }
    // Ensure fm=webp is added if not present
    if (!url.includes('fm=webp') && !url.includes('format=webp')) {
      return `${url}&fm=webp`;
    }
  }

  // Pexels URLs
  if (url.includes('images.pexels.com')) {
    if (!url.includes('auto=compress')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}auto=compress&cs=tinysrgb&fm=webp`;
    }
  }

  return url;
}

export const FastImage: React.FC<FastImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80&fm=webp',
  priority = false,
  aspectRatio,
  containerClassName = '',
  style,
  ...props
}) => {
  const optimizedSrc = optimizeImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(optimizedSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(inMemoryCache.has(optimizedSrc));
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextUrl = optimizeImageUrl(src);
    setCurrentSrc(nextUrl);
    setHasError(false);

    if (inMemoryCache.has(nextUrl)) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    // Aggressive Cache pre-fetch via Image() constructor or CacheStorage
    const preloadImg = new Image();
    preloadImg.src = nextUrl;
    preloadImg.onload = () => {
      inMemoryCache.add(nextUrl);
      setIsLoaded(true);
    };
    preloadImg.onerror = () => {
      // If primary WebP fails, try fallback
      if (fallbackSrc && nextUrl !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else {
        setHasError(true);
      }
    };
  }, [src, fallbackSrc]);

  return (
    <div
      className={`relative overflow-hidden bg-slate-800/20 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio, ...style } : style}
    >
      {/* Shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800/40 animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-slate-800/0 via-slate-700/20 to-slate-800/0 animate-[shimmer_1.5s_infinite]" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-2 text-center">
          <ImageOff className="w-6 h-6 mb-1 text-slate-600" />
          <span className="text-[10px] text-slate-500 font-medium">Image unavailable</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => {
            inMemoryCache.add(currentSrc);
            setIsLoaded(true);
          }}
          onError={() => {
            if (currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
            } else {
              setHasError(true);
            }
          }}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
