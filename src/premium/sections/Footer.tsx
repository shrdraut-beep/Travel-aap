import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";

const COLUMNS: Array<{ title: string; links: string[] }> = [
  { title: "Company", links: ["About us", "Careers", "Press", "Partners"] },
  { title: "Book", links: ["Flights", "Hotels", "Trains", "Cabs", "Holidays"] },
  { title: "Support", links: ["Help centre", "Cancellations", "Refunds", "Contact"] },
  { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Grievance"] }
];

export const Footer: React.FC<{ onLink?: (label: string) => void }> = ({
  onLink
}) => (
  <footer className="bg-slate-950 text-slate-300">
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/routripo_header_logo.svg"
              alt="RouTripO"
              className="h-9 w-auto"
            />
            <span className="text-[19px] font-bold tracking-tight text-white">
              RouTripO
            </span>
          </div>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-slate-400">
            Plan, book and manage every part of your trip in one premium
            experience.
          </p>
          <div className="mt-6 flex gap-2">
            {[Instagram, Twitter, Facebook].map((Icon, index) => (
              <button
                key={index}
                type="button"
                aria-label="Social link"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {column.title}
            </p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    onClick={() => onLink?.(link)}
                    className="text-[14px] font-medium text-slate-400 transition-colors hover:text-white"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-slate-500">
          © {new Date().getFullYear()} RouTripO. All rights reserved.
        </p>
        <p className="text-[13px] text-slate-500">
          Made for travellers, in India.
        </p>
      </div>
    </div>
  </footer>
);
