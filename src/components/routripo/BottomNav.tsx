import React from "react";
import { LucideIcon } from "lucide-react";

export function BottomNav({ items, active, setActive, grad, glow }: { 
  items: { key: string, label: string, icon: LucideIcon }[], 
  active: string, 
  setActive: (key: string) => void, 
  grad: string, 
  glow: string 
}) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-30">
      <div className="bg-white/85 backdrop-blur-xl rounded-[1.75rem] shadow-xl shadow-slate-300/40 border border-white flex items-center justify-between px-1.5 py-2">
        {items.map((n) => {
          const Icon = n.icon;
          const isActive = active === n.key;
          return (
            <button key={n.key} onClick={() => setActive(n.key)} className="relative flex-1 flex flex-col items-center gap-0.5 py-1">
              {isActive && <span className={`absolute -top-1 w-1.5 h-1.5 rounded-full animate-[popIn_0.3s_ease]`} style={{ background: "currentColor" }} />}
              <div className={`w-8.5 h-8.5 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? `bg-gradient-to-br ${grad} shadow-md ${glow} scale-110 -translate-y-0.5` : ""}`}>
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-400"}`} />
              </div>
              <span className={`text-[9px] font-medium transition-colors ${isActive ? "text-slate-800" : "text-slate-400"}`}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
