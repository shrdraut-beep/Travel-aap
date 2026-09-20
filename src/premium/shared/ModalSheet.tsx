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

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/90 backdrop-blur-sm shrink-0">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="text-[15px] font-bold tracking-tight text-slate-900 truncate">{title}</h3>
                {subtitle && <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
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
