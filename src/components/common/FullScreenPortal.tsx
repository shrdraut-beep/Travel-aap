import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ZLayer = 'dropdown' | 'bottomSheet' | 'modal' | 'modalStacked' | 'toast' | 'critical';

const Z_VAR: Record<ZLayer, string> = {
  dropdown: 'var(--z-dropdown)',
  bottomSheet: 'var(--z-bottom-sheet)',
  modal: 'var(--z-modal)',
  modalStacked: 'var(--z-modal-stacked)',
  toast: 'var(--z-toast)',
  critical: 'var(--z-critical)',
};

export interface FullScreenPortalProps {
  /** Controls mount/unmount — parent still owns open/close state. */
  isOpen: boolean;
  children: React.ReactNode;
  /** Which layer this belongs to — see the --z-* scale in premium.css. Defaults to 'modal'. */
  layer?: ZLayer;
  /** Extra classes for the backdrop wrapper (e.g. custom background/blur/flex alignment). */
  backdropClassName?: string;
  /** Called when the backdrop itself is clicked (not its children) — typically closes the overlay. */
  onBackdropClick?: () => void;
  /** Resets the portal's own scroll to top on open — prevents "opens scrolled to the
   * middle" when reopened after a previous scroll position. Defaults to true. */
  resetScrollOnOpen?: boolean;
}

/**
 * Renders children into a React Portal attached directly to document.body, with
 * position: fixed covering the full viewport.
 *
 * WHY THIS EXISTS: none of the ~49 modal files in this app use a Portal — they render
 * as normal nested children. `position: fixed` is normally relative to the viewport,
 * but if ANY ancestor element has a CSS transform, filter, perspective, or
 * will-change:transform (all common in this app: hover/active :scale-, animate-in,
 * backdrop-blur on a wrapping element), that ancestor becomes the fixed positioning
 * context instead of the viewport — the "full-screen" modal then gets clipped/embedded
 * inside that ancestor's box instead of covering the screen. Portaling to document.body
 * makes the overlay immune to this regardless of where it's triggered from in the tree.
 *
 * USAGE (migrating an existing modal):
 *   Before:
 *     if (!isOpen) return null;
 *     return <div className="fixed inset-0 z-[100] ...">...</div>;
 *
 *   After:
 *     return (
 *       <FullScreenPortal isOpen={isOpen} layer="modal" onBackdropClick={onClose}>
 *         <div className="...">...</div>
 *       </FullScreenPortal>
 *     );
 *   (Drop the manual `fixed inset-0 z-[...]` — FullScreenPortal's own wrapper handles it.)
 */
export const FullScreenPortal: React.FC<FullScreenPortalProps> = ({
  isOpen,
  children,
  layer = 'modal',
  backdropClassName = 'flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md',
  onBackdropClick,
  resetScrollOnOpen = true,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && resetScrollOnOpen) {
      wrapperRef.current?.scrollTo(0, 0);
    }
  }, [isOpen, resetScrollOnOpen]);

  // Lock background scroll while any full-screen portal is open, so the page behind
  // it can't be scrolled — a common companion bug to the embedded-modal issue.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={wrapperRef}
      className={`fixed inset-0 overflow-y-auto ${backdropClassName}`}
      style={{ zIndex: Z_VAR[layer] as any }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdropClick?.();
      }}
    >
      {children}
    </div>,
    document.body
  );
};
