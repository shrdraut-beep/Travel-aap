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
          className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className={`mx-auto flex w-full max-w-[520px] flex-col overflow-hidden bg-white ${
              variant === "full"
                ? "h-full"
                : "max-h-[88vh] rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
            }`}
          >
            <div className="relative flex shrink-0 items-center justify-center border-b border-slate-100 px-4 py-3.5">
              {variant === "bottom" ? (
                <span className="absolute top-1.5 h-1 w-10 rounded-full bg-slate-200" />
              ) : null}
              <p className="text-[15px] font-bold tracking-tight text-slate-900">
                {title}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
              >
                <X className="h-5 w-5" />
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
