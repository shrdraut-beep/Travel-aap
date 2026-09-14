import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export interface MaskedSensitiveTextProps {
  value: string | number | null | undefined;
  type?: "text" | "phone" | "email" | "card" | "id" | "token";
  maskChar?: string;
  className?: string;
  badge?: boolean;
  copyable?: boolean;
}

export function MaskedSensitiveText({
  value,
  type = "text",
  maskChar = "•",
  className = "",
  badge = false
}: MaskedSensitiveTextProps) {
  const [revealed, setRevealed] = useState(false);

  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400 italic text-xs">N/A</span>;
  }

  const raw = String(value);

  // Formats string into a secure masked placeholder
  const getMaskedValue = (val: string): string => {
    if (type === "phone") {
      // "+91 9876543210" -> "+91 ••••• ••210"
      if (val.length > 4) {
        const lastFour = val.slice(-4);
        return `••••• ••${lastFour}`;
      }
      return "••••••••••";
    }

    if (type === "email") {
      // "john.doe@example.com" -> "j•••••@example.com"
      const atIndex = val.indexOf("@");
      if (atIndex > 1) {
        const domain = val.slice(atIndex);
        const nameInitial = val[0];
        return `${nameInitial}•••••${domain}`;
      }
      return "••••@••••.com";
    }

    if (type === "card") {
      // "1234-5678-9012-3456" -> "••••-••••-••••-3456"
      const clean = val.replace(/\D/g, "");
      if (clean.length >= 4) {
        return `••••-••••-••••-${clean.slice(-4)}`;
      }
      return "••••-••••-••••-••••";
    }

    if (type === "id") {
      // Passport/Aadhaar: "ABC1234567" -> "••••••4567"
      if (val.length > 4) {
        return `${maskChar.repeat(Math.max(4, val.length - 4))}${val.slice(-4)}`;
      }
      return maskChar.repeat(8);
    }

    // Default general text masking
    if (val.length <= 4) {
      return maskChar.repeat(val.length);
    }
    return `${val.slice(0, 1)}${maskChar.repeat(Math.max(4, val.length - 2))}${val.slice(-1)}`;
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      {badge && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-premium-sky-soft text-premium-sky-deep border border-premium-sky-deep text-[10px] font-sans font-semibold">
          <ShieldCheck className="w-3 h-3 text-premium-sky-deep" />
          Masked
        </span>
      )}

      <span className={revealed ? "text-slate-900 font-semibold" : "text-slate-600 font-medium select-none"}>
        {revealed ? raw : getMaskedValue(raw)}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setRevealed(!revealed);
        }}
        title={revealed ? "Hide sensitive data" : "Click to reveal sensitive data"}
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
}
