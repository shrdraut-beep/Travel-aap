import React from "react";
import { LucideIcon, Compass } from "lucide-react";
import { SectionTitle } from "./SharedUI";

export interface DashboardCard {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  gradient: string;
  subtitleColorClass?: string;
  onClick: () => void;
}

export interface DashboardGridItem {
  label: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  isActive?: boolean;
}

export interface TabDashboardLayoutProps {
  cards?: DashboardCard[];
  gridTitle?: string;
  gridIcon?: LucideIcon;
  gridItems?: DashboardGridItem[];
  children?: React.ReactNode;
}

export function TabDashboardLayout({
  cards = [],
  gridTitle = "Explore Services",
  gridIcon = Compass,
  gridItems = [],
  children
}: TabDashboardLayoutProps) {
  const GridIconComponent = gridIcon;
  
  return (
    <div className="px-2.5 sm:px-4 mt-2 space-y-5">
      {/* Top Cards */}
      {cards && cards.length > 0 && (
        <div className={`grid ${cards.length === 3 ? 'grid-cols-3 gap-1.5 sm:gap-2.5' : 'grid-cols-2 gap-3'} w-full`}>
          {cards.map((card, idx) => {
            const CardIcon = card.icon;
            const isThree = cards.length === 3;
            return (
              <button
                key={idx}
                type="button"
                onClick={card.onClick}
                className={`${isThree ? 'p-2 sm:p-3' : 'p-3.5'} bg-gradient-to-br ${card.gradient} text-white rounded-2xl shadow-md flex ${isThree ? 'flex-col sm:flex-row items-center' : 'items-center'} gap-2 sm:gap-3 active:scale-95 transition-all cursor-pointer group text-left w-full`}
              >
                <div className={`${isThree ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <CardIcon className={`${isThree ? 'w-4 h-4' : 'w-5 h-5'} stroke-[3] ${card.iconColor || 'text-white'}`} />
                </div>
                <div className="min-w-0 w-full text-center sm:text-left">
                  <h4 className={`font-black uppercase tracking-wider leading-tight ${isThree ? 'text-[9px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
                    {card.title}
                  </h4>
                  <p className={`font-bold truncate mt-0.5 ${isThree ? 'text-[8px] sm:text-[9px]' : 'text-[10px]'} ${card.subtitleColorClass || 'text-white/80'}`}>
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3-Column Grid */}
      {gridItems && gridItems.length > 0 && (
        <div className="space-y-4">
          <SectionTitle icon={GridIconComponent}>{gridTitle}</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            {gridItems.map((item, i) => {
              const ItemIcon = item.icon;
              const active = item.isActive;

              const isGradient = item.color && (item.color.includes('from-') || item.color.includes('to-'));
              const isBg = item.color && item.color.includes('bg-');
              const isText = item.color && item.color.includes('text-');

              let bgClasses = 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white';
              if (isGradient) {
                bgClasses = `bg-gradient-to-br ${item.color} text-white`;
              } else if (isBg) {
                bgClasses = `${item.color} text-white`;
              } else if (isText) {
                bgClasses = `bg-slate-100 ${item.color} border border-slate-200`;
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-2 text-center cursor-pointer group active:scale-95 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl ${bgClasses} flex items-center justify-center shadow-md transition-all ${
                    active 
                      ? 'ring-4 ring-indigo-600/40 scale-105 shadow-indigo-500/20 border-2 border-white' 
                      : 'group-hover:scale-110 opacity-90 hover:opacity-100'
                  }`}>
                    <ItemIcon className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className={`text-xs font-bold transition-colors ${active ? 'text-indigo-600 font-extrabold scale-105' : 'text-slate-800'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of the tab content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
