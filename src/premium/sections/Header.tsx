import React, { useEffect, useState } from "react";
import { Globe, Menu, UserCircle2, X } from "lucide-react";
import { PremiumButton } from "../ui/primitives";

const NAV = [
  { label: "Flights", href: "#flights" },
  { label: "Stays", href: "#stays" },
  { label: "Trains", href: "#trains" },
  { label: "Holidays", href: "#holidays" },
  { label: "Offers", href: "#offers" }
];

export interface HeaderProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onNavigate?: (href: string) => void;
}

/**
 * Transparent over the hero, solid once scrolled. Brand mark and name are the
 * app's existing assets and must not be restyled away.
 */
export const Header: React.FC<HeaderProps> = ({
  onSignIn,
  onSignUp,
  onNavigate
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5"
          onClick={() => onNavigate?.("#top")}
        >
          <img
            src="/routripo_header_logo.svg"
            alt="RouTripO"
            className="h-9 w-auto"
          />
          <span
            className={`text-[19px] font-bold tracking-tight ${
              scrolled ? "text-slate-900" : "text-white drop-shadow-sm"
            }`}
          >
            RouTripO
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
                scrolled
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Change language and currency"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              scrolled
                ? "text-slate-600 hover:bg-slate-100"
                : "text-white hover:bg-white/15"
            }`}
          >
            <Globe className="h-[18px] w-[18px]" />
          </button>
          <PremiumButton
            variant={scrolled ? "ghost" : "ghost"}
            size="sm"
            onClick={onSignIn}
            className={scrolled ? "" : "text-white hover:bg-white/15"}
          >
            Sign in
          </PremiumButton>
          <PremiumButton
            variant={scrolled ? "primary" : "secondary"}
            size="sm"
            icon={<UserCircle2 className="h-4 w-4" />}
            onClick={onSignUp}
          >
            Create account
          </PremiumButton>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={`flex h-10 w-10 items-center justify-center rounded-full sm:hidden ${
            scrolled ? "text-slate-900" : "text-white"
          }`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  onNavigate?.(item.href);
                  setMenuOpen(false);
                }}
                className="rounded-xl px-3 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            <PremiumButton
              variant="secondary"
              className="flex-1"
              onClick={onSignIn}
            >
              Sign in
            </PremiumButton>
            <PremiumButton className="flex-1" onClick={onSignUp}>
              Create account
            </PremiumButton>
          </div>
        </div>
      ) : null}
    </header>
  );
};
