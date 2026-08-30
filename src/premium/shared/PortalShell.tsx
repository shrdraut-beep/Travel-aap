import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { TabStrip, type TabDescriptor } from "./TabStrip";

export interface PortalShellProps<T extends string> {
  open: boolean;
  title: string;
  heading: string;
  subheading: string;
  initial: string;
  tabs: TabDescriptor<T>[];
  active: T;
  onSelectTab: (id: T) => void;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Full-screen phone shell shared by the admin and agent portals: sky panel
 * header, scrollable tab strip overlapping it, and an independently scrolling
 * body that resets to the top whenever the tab changes.
 */
export function PortalShell<T extends string>({
  open,
  title,
  heading,
  subheading,
  initial,
  tabs,
  active,
  onSelectTab,
  onClose,
  children
}: PortalShellProps<T>) {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="premium-root fixed inset-0 z-[80] bg-slate-900/40"
        >
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[var(--premium-page)]"
          >
            <header className="premium-sky-panel shrink-0 px-5 pb-10 pt-5">
              <div className="flex items-center gap-3 text-white">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="flex-1 text-center text-[17px] font-bold tracking-tight">
                  {title}
                </p>
                <span className="h-9 w-9" />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <span className="premium-gradient-pink flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-[20px] font-bold text-white">
                  {initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[20px] font-bold leading-tight tracking-tight text-white">
                    {heading}
                  </span>
                  <span className="block truncate text-[12px] font-medium text-white/85">
                    {subheading}
                  </span>
                </span>
              </div>
            </header>

            <nav className="-mt-6 shrink-0 px-5">
              <TabStrip tabs={tabs} active={active} onSelect={onSelectTab} />
            </nav>

            <div
              ref={bodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              {children}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
