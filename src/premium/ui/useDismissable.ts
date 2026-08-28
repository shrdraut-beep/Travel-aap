import { useEffect, useRef } from "react";

/**
 * Closes a popover on outside pointer press or Escape. Returns the ref that must
 * wrap both the trigger and the floating panel.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onDismiss]);

  return ref;
}
