import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface SheetProps {
  open: boolean;
  title?: string;
  /** `full` covers the screen (city search), `bottom` slides a panel up. */
  variant?: "bottom" | "full";
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Mobile sheet used for every picker. Pickers are never popovers on a phone -
 * they take over the screen the way native travel apps do.
 */
export const Sheet: React.FC<SheetProps> = ({
  open,
  title,
  variant = "bottom",
  onClose,
  children,
  footer
}) => {
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
          className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-950/60 backdrop-blur-[3px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
            className={`mx-auto flex w-full max-w-[520px] flex-col overflow-hidden bg-white shadow-2xl ${
              variant === "full"
                ? "h-full"
                : "max-h-[88vh] rounded-t-[32px] pb-[env(safe-area-inset-bottom)]"
            }`}
          >
            {variant === "bottom" && (
              <div className="pt-2.5 pb-1 flex justify-center">
                <span className="h-1.5 w-12 rounded-full bg-slate-200" />
              </div>
            )}
            <div className="relative flex shrink-0 items-center justify-between border-b border-slate-100/80 px-5 py-3">
              <p className="text-[17px] font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                {title}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
