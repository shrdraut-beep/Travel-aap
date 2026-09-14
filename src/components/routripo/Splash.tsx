import React, { useState, useEffect } from "react";
import { Compass } from "lucide-react";
import { BrandLogo } from "./SharedUI";

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`premium-root h-full w-full premium-gradient flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl animate-pulse [animation-delay:300ms]" />
      <div className="relative z-10 flex flex-col items-center animate-[popIn_0.6s_cubic-bezier(.34,1.56,.64,1)]">
        <div className="w-20 h-20 rounded-[24px] bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center shadow-2xl mb-4">
          <Compass className="w-10 h-10 text-white animate-[spin_3s_linear_infinite]" />
        </div>
        <BrandLogo className="text-4xl text-center justify-center"/>
        <p className="text-white/70 text-xs mt-1 tracking-[0.25em] uppercase">Plan · Split · Explore</p>
      </div>
      <div className="absolute bottom-14 w-32 h-1 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full w-1/2 bg-white rounded-full animate-[loadBar_1.5s_ease-in-out]" />
      </div>
    </div>
  );
}
