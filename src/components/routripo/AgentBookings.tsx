import React, { useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, RippleButton, TopBar, useScrolled, Stagger } from "./SharedUI";

export function AgentBookings({ onLogout, onSOS }: { onLogout: () => void, onSOS: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null); const scrolled = useScrolled(scrollRef);
  const [tab, setTab] = useState<"pending" | "confirmed">("pending");
  const [data, setData] = useState<{ pending: any[], confirmed: any[] }>({
    pending: [],
    confirmed: [],
  });
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar title="Bookings" sub="Manage requests" scrolled={scrolled} avatarGrad="from-sky-400 to-sky-600" initial="V" onLogout={onLogout} onSOS={onSOS} />
      <div className="px-5 mt-2 flex bg-slate-100 rounded-2xl p-1">
        {(["pending", "confirmed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white shadow text-sky-600" : "text-slate-500"}`}>{t}</button>
        ))}
      </div>
      <div className="px-5 mt-4 space-y-3">
        {data[tab].length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 mt-2">
            <p className="text-sm font-bold text-slate-600">No {tab} bookings</p>
            <p className="text-xs text-slate-400 mt-1">New booking requests from travelers will appear here.</p>
          </div>
        ) : (
          data[tab].map((b, i) => (
            <Stagger key={i} delay={i * 100}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{b.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800">{b.name}</p><p className="text-[11px] text-slate-400">{b.pkg} · {b.pax} pax · {b.date}</p></div>
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <RippleButton className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Accept</RippleButton>
                    <RippleButton className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" />Decline</RippleButton>
                  </div>
                )}
              </Card>
            </Stagger>
          ))
        )}
      </div>
    </div>
  );
}
