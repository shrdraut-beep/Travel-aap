import React, { useRef } from "react";
import { TopBar, useScrolled, Stagger, Card } from "./SharedUI";

export function AgentLeads({ onLogout, onSOS }: { onLogout: () => void, onSOS: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null); const scrolled = useScrolled(scrollRef);
  const [leads, setLeads] = React.useState<any[]>([]);
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar title="Leads" sub={`${leads.filter((l) => l.unread).length} unread`} scrolled={scrolled} avatarGrad="from-sky-400 to-sky-600" initial="V" onLogout={onLogout} onSOS={onSOS} />
      <div className="px-5 mt-2 space-y-2.5">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 mt-4">
            <p className="text-sm font-bold text-slate-600">No active leads</p>
            <p className="text-xs text-slate-400 mt-1">Customer inquiries and messages will show up here.</p>
          </div>
        ) : (
          leads.map((l, i) => (
            <Stagger key={i} delay={i * 100}>
              <Card className="p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{l.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${l.unread ? "font-bold text-slate-800" : "font-semibold text-slate-600"}`}>{l.name}</p>
                    <span className="text-[10px] text-slate-400">{l.time}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 truncate">{l.msg}</p>
                </div>
                {l.unread && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
              </Card>
            </Stagger>
          ))
        )}
      </div>
    </div>
  );
}
