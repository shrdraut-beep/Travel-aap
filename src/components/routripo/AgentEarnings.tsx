import React, { useRef, useState, useEffect } from "react";
import { TrendingUp, Banknote, Clock, IndianRupee } from "lucide-react";
import { Card, RippleButton, SectionTitle, TopBar, useScrolled, Stagger } from "./SharedUI";

function Donut({ segments, size = 128, stroke = 14 }: { segments: any[], size?: number, stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const [animate, setAnimate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 100); return () => clearTimeout(t); }, []);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * c;
        const dash = animate ? `${len} ${c - len}` : `0 ${c}`;
        const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="round" style={{ transition: `stroke-dasharray 1s cubic-bezier(.4,0,.2,1) ${i * 150}ms` }} />;
        offset += len;
        return el;
      })}
    </svg>
  );
}

export function AgentEarnings({ onLogout, onSOS }: { onLogout?: () => void, onSOS?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null); const scrolled = useScrolled(scrollRef);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const totalCommission = history.reduce((sum, h) => sum + (h.amount || 0), 0);
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 px-5 pt-8 pb-16 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-white/70 text-xs font-[Poppins] relative z-10">This month</p>
        <h1 className="text-white text-2xl font-bold font-[Poppins] mt-1 relative z-10">Earnings</h1>
        <div className="mt-6 bg-white/15 backdrop-blur-md rounded-3xl p-5 ring-1 ring-white/25 relative z-10 flex items-center gap-4">
          <Donut segments={breakdown.length > 0 ? breakdown : [{ pct: 100, color: "rgba(255,255,255,0.2)" }]} size={92} stroke={11} />
          <div className="flex-1">
            <p className="text-white/70 text-[11px]">Total commission</p>
            <p className="text-white text-2xl font-bold font-[Poppins] flex items-center"><IndianRupee className="w-5 h-5" />{totalCommission.toLocaleString("en-IN")}</p>
            <p className="text-white/70 text-[11px] mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Commission earnings</p>
          </div>
        </div>
      </div>
      <div className="px-5 -mt-8 relative z-10">
        <RippleButton className="w-full py-3.5 rounded-2xl bg-white shadow-lg border border-slate-100 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2">
          <Banknote className="w-4 h-4 text-sky-500" />Withdraw to bank
        </RippleButton>
      </div>
      <div className="px-5 mt-5">
        <SectionTitle icon={Clock} accent="text-sky-500">Payout history</SectionTitle>
        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-600">No payout history</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Completed trip payouts will appear here.</p>
            </div>
          ) : (
            history.map((h, i) => (
              <Stagger key={i} delay={i * 100}>
                <Card className="p-3.5 flex items-center justify-between">
                  <span className="text-sm text-slate-600">{h.label}</span>
                  <span className="text-sm font-bold text-emerald-600">+₹{h.amount.toLocaleString("en-IN")}</span>
                </Card>
              </Stagger>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
