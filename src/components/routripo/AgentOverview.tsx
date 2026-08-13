import React, { useRef, useState } from "react";
import { Inbox, Ticket, Banknote, PackagePlus, MessageSquare, LayoutDashboard, Sparkles } from "lucide-react";
import { Card, RippleButton, SectionTitle, TopBar, useScrolled, Stagger } from "./SharedUI"; // Reusing components

export function AgentOverview({ setActive, onLogout, onSOS }: { setActive: (tab: string) => void, onLogout: () => void, onSOS: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null); const scrolled = useScrolled(scrollRef);
  const stats = [
    { label: "New leads", value: 0, icon: Inbox, grad: "from-sky-400 to-sky-600" },
    { label: "Bookings today", value: 0, icon: Ticket, grad: "from-indigo-400 to-indigo-600" },
    { label: "This month", value: 0, prefix: "₹", icon: Banknote, grad: "from-emerald-400 to-emerald-600", wide: true },
  ];
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar sub="Partner dashboard" title="Namaste, Partner 🧳" scrolled={scrolled} avatarGrad="from-sky-400 to-sky-600" initial="P" onLogout={onLogout} onSOS={onSOS} />
      <div className="px-5 mt-2 grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => { const SIcon = s.icon; return (
          <Stagger key={i} delay={i * 90}>
            <Card className={`p-3.5 ${s.wide ? "col-span-2" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">{s.label}</p>
                  <p className="text-lg font-bold text-slate-800 font-[Poppins] flex items-center">{s.prefix}{s.value.toLocaleString("en-IN")}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center`}><SIcon className="w-4.5 h-4.5 text-white" /></div>
              </div>
            </Card>
          </Stagger>
        );})}
      </div>
      <div className="px-5 mt-5">
        <SectionTitle icon={Sparkles} accent="text-sky-500">Quick actions</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <RippleButton onClick={() => setActive("packages")} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shrink-0"><PackagePlus className="w-4.5 h-4.5 text-white" /></div>
            <span className="text-sm font-semibold text-slate-700 text-left">Add package</span>
          </RippleButton>
          <RippleButton onClick={() => setActive("leads")} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shrink-0"><MessageSquare className="w-4.5 h-4.5 text-white" /></div>
            <span className="text-sm font-semibold text-slate-700 text-left">View leads</span>
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
