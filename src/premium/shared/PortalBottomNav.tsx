import React from "react";

export interface PortalTabItem<T extends string = string> {
  id: T;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  imgSrc?: string;
  badge?: number;
}

export interface PortalBottomNavProps<T extends string = string> {
  tabs: PortalTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  accentColor?: "sky" | "pink" | "violet";
}

export function PortalBottomNav<T extends string>({
  tabs,
  active,
  onChange,
  accentColor = "sky"
}: PortalBottomNavProps<T>) {
  const accentClass =
    accentColor === "pink"
      ? "text-pink-600"
      : accentColor === "violet"
      ? "text-violet-600"
      : "text-sky-600";

  const dotBgClass =
    accentColor === "pink"
      ? "bg-pink-600"
      : accentColor === "violet"
      ? "bg-violet-600"
      : "bg-sky-600";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-[#e8e2d5]/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_24px_rgba(2,132,199,0.08)]">
      <ul className="flex items-center justify-around px-1 py-1.5">
        {tabs.map(({ id, label, Icon, imgSrc, badge }) => {
          const selected = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? "page" : undefined}
                className="group relative flex w-full flex-col items-center justify-center gap-1 py-1 transition-all duration-150 active:scale-95 border-none outline-none bg-transparent cursor-pointer"
              >
                <div className="relative flex h-11 w-11 items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={label}
                      className={`h-10 w-10 object-contain transition-all duration-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] ${
                        selected
                          ? "scale-115 opacity-100"
                          : "opacity-80 hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`h-6 w-6 transition-transform ${
                        selected
                          ? `scale-110 ${accentClass} stroke-[2.4]`
                          : "text-slate-400 stroke-[1.8] group-hover:text-slate-600"
                      }`}
                    />
                  )}

                  {typeof badge === "number" && badge > 0 && (
                    <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white animate-pulse">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] tracking-tight leading-none transition-colors ${
                    selected
                      ? `${accentClass} font-black`
                      : "text-slate-500 font-semibold hover:text-slate-700"
                  }`}
                >
                  {label}
                </span>
                {selected && (
                  <span className={`h-1 w-2 rounded-full ${dotBgClass} mt-0.5 shadow-sm`} />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
