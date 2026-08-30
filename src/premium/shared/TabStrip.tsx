import React from "react";
import type { LucideIcon } from "lucide-react";

export interface TabDescriptor<T extends string> {
  id: T;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

export interface TabStripProps<T extends string> {
  tabs: TabDescriptor<T>[];
  active: T;
  onSelect: (id: T) => void;
}

/**
 * Horizontally scrollable pill tabs, used by portals that carry more sections
 * than fit across a phone screen.
 */
export function TabStrip<T extends string>({
  tabs,
  active,
  onSelect
}: TabStripProps<T>) {
  return (
    <div className="premium-card overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-1">
        {tabs.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active === id}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold whitespace-nowrap transition ${
              active === id
                ? "premium-gradient-pink text-white"
                : "text-[var(--premium-muted)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {badge ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active === id
                    ? "bg-white/25 text-white"
                    : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
