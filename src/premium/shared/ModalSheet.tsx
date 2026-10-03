import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-[480px]"
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={`relative flex max-h-[92vh] w-full max-w-[520px] flex-col rounded-t-3xl rounded-b-none bg-white shadow-2xl overflow-hidden z-10`}
          >
            {/* Native Pull Handle */}
            <div className="pt-2.5 pb-1 flex justify-center bg-slate-50/90 border-b border-slate-100/50 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Modal Header - Curved Bus Booking Style with Ocean Brand Palette */}
            <div className="flex items-center justify-between border-b border-sky-200/80 rounded-b-[20px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] px-5 py-3.5 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] backdrop-blur-md shrink-0">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="text-[15px] font-black tracking-tight text-[#0F172A] truncate">{title}</h3>
                {subtitle && <p className="text-[11px] font-semibold text-[#0369a1] line-clamp-1">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 border border-sky-200/80 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Content (scrollable) */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 text-slate-800">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
