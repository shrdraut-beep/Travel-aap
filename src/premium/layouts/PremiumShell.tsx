import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export interface PremiumShellProps {
  title: string;
  subtitle: string;
  avatarChar?: string;
  tabs: { id: string; label: string; Icon?: any; imgSrc?: string }[];
  activeTab: string;
  onChangeTab: (id: string) => void;
  onBack?: () => void;
  children: React.ReactNode;
  renderFab?: React.ReactNode;
}

export const PremiumShell: React.FC<PremiumShellProps> = ({
  title,
  subtitle,
  avatarChar,
  tabs,
  activeTab,
  onChangeTab,
  onBack,
  children,
  renderFab
}) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div
      ref={bodyRef}
      className="mx-auto flex h-[100dvh] w-full max-w-[520px] flex-col bg-[var(--premium-page)] overflow-y-auto overscroll-contain relative"
    >
      <header className="premium-sky-panel px-5 py-4 shadow-sm">
        {onBack ? (
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shadow-sm active:scale-95 text-white text-xs font-bold shrink-0 border border-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Trips</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-tight text-white">
                {title}
              </h1>
              <p className="truncate text-[12px] font-medium text-white/85 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center gap-3 text-left">
            <span className="premium-gradient-pink flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-[17px] font-bold text-white shadow-md shrink-0">
              {avatarChar || title.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[19px] font-extrabold leading-tight tracking-tight text-white">
                {title}
              </span>
              <span className="block truncate text-[12px] font-medium text-white/85 mt-0.5">
                {subtitle}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Screen Content with thumb-safe bottom clearance */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Floating Action Button */}
      {renderFab && (
        <div className="fixed bottom-20 right-5 z-50">
          {renderFab}
        </div>
      )}

      {/* Clean, Borderless Bottom Navigation Bar with Large 3D Icons */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-[#e8e2d5]/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_24px_rgba(2,132,199,0.08)]">
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map(({ id, label, Icon, imgSrc }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTab(id)}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-150 active:scale-95 outline-none border-none bg-transparent"
              >
                <div className="relative flex items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={label}
                      className={`h-9 w-9 object-contain transition-transform duration-200 ${
                        isActive ? "scale-110 drop-shadow-md" : "opacity-75 hover:opacity-100 grayscale-[15%]"
                      }`}
                    />
                  ) : Icon ? (
                    <Icon
                      className={`h-6 w-6 transition-transform duration-200 ${
                        isActive ? "scale-110 text-sky-600 stroke-[2.4]" : "text-slate-400 stroke-[1.8]"
                      }`}
                    />
                  ) : null}
                </div>
                <span
                  className={`text-[11px] tracking-tight leading-none transition-colors ${
                    isActive ? "font-black text-sky-600" : "font-semibold text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-sky-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
