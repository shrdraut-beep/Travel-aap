import React from 'react';
import { ArrowLeft, Siren, X } from 'lucide-react';
import { BrandLogo, LogoName } from '../routripo/SharedUI';

export interface BrandHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
  onSOS?: () => void;
  rightElement?: React.ReactNode;
  showLogo?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onClose,
  onSOS,
  rightElement,
  showLogo = true,
  className = '',
  badge
}) => {
  return (
    <header className={`w-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white sticky top-0 z-40 shadow-md flex-shrink-0 font-[Inter] ${className}`}>
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5">
        
        {/* Left Side: Back button + Brand Logo + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Go Back"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            {/* Logo Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {showLogo && (
                <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-xs border border-white/20 shadow-2xs shrink-0">
                  <span className="font-black text-xs font-[Poppins] tracking-wide text-white flex items-center">
                    <span className="text-white drop-shadow-xs">Rou</span>
                    <span className="bg-white text-rose-600 px-1 py-0.2 mx-0.5 rounded-sm font-black text-[10px]">T</span>
                    <span className="text-pink-100 drop-shadow-xs">rip</span>
                    <span className="text-pink-100 font-extrabold">O</span>
                  </span>
                </div>
              )}

              {badge && (
                <div className="shrink-0">{badge}</div>
              )}
            </div>

            {/* Title & Subtitle */}
            {title && (
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate mt-0.5">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-white/90 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side Actions: Custom elements / SOS / Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {rightElement}

          {onSOS && (
            <button
              type="button"
              onClick={onSOS}
              title="Emergency SOS"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <Siren className="w-4 h-4 text-white animate-pulse" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
