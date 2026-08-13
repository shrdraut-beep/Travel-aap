import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Copy, Check, Tag } from 'lucide-react';
import { useOfferStore } from '../../store/useOfferStore';
import { Offer } from '../../types';

interface TopBannerCarouselProps {
  tab?: string;
  activeOffers?: Offer[];
}

export const TopBannerCarousel: React.FC<TopBannerCarouselProps> = ({ tab = 'all', activeOffers }) => {
  const allOffers = useOfferStore(state => state.offers);
  const offersList = activeOffers || allOffers;
  
  const banners = offersList.filter(o => {
    if (!o.isActive || o.category !== 'Banner') return false;
    if (!tab || tab === 'all') return true;
    return !o.targetTab || o.targetTab === 'all' || o.targetTab === tab;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Touch & Swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 35;

  // Auto slide every 4.5 seconds
  useEffect(() => {
    if (banners.length <= 1 || isDragging) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length, isDragging]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex % banners.length];

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleTouchStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchEndX(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDragging || touchStartX === null) return;
    setTouchEndX(clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || touchStartX === null || touchEndX === null) {
      setIsDragging(false);
      return;
    }
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next slide
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev slide
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-slate-200 bg-slate-900 my-3 group select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      onMouseDown={(e) => handleTouchStart(e.clientX)}
      onMouseMove={(e) => handleTouchMove(e.clientX)}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => {
        if (isDragging) handleTouchEnd();
      }}
    >
      {/* Banner Image with Overlay */}
      <div className="relative h-38 sm:h-44 w-full overflow-hidden">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out group-hover:scale-105"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent flex flex-col justify-between p-4 sm:p-5 text-white">
          <div className="space-y-1 max-w-[75%] sm:max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3 text-slate-950" />
              {currentBanner.discountBadge || 'SPECIAL OFFER'}
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-1 drop-shadow-xs">
              {currentBanner.title}
            </h3>
            <p className="text-xs text-slate-200 line-clamp-2 font-medium">
              {currentBanner.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            {currentBanner.couponCode && (
              <div 
                onClick={(e) => handleCopyCode(e, currentBanner.couponCode!)}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                  Code: {currentBanner.couponCode}
                </span>
                {copiedCode === currentBanner.couponCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-200 hover:text-white" />
                )}
              </div>
            )}

            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-0.5 hover:underline cursor-pointer ml-auto">
              Book Now <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows for desktop / tap */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Swipe Badge & Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-3 flex items-center gap-2 z-10">
          <span className="text-[9px] font-bold text-slate-300/80 tracking-wider uppercase hidden sm:inline-block">
            Swipe ↔
          </span>
          <div className="flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

