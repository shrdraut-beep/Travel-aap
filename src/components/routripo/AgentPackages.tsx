import React, { useRef } from "react";
import { Edit3, PackagePlus, IndianRupee } from "lucide-react";
import { Card, RippleButton, TopBar, useScrolled, Stagger } from "./SharedUI";

export function AgentPackages({ onLogout, onSOS }: { onLogout: () => void, onSOS: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null); const scrolled = useScrolled(scrollRef);
  const [pkgs, setPkgs] = React.useState<any[]>([]);
  
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar title="My Packages" sub={`${pkgs.length} listed`} scrolled={scrolled} avatarGrad="from-sky-400 to-sky-600" initial="V" onLogout={onLogout} onSOS={onSOS} />
      <div className="px-5 mt-2">
        <RippleButton className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-sky-500/30">
          <PackagePlus className="w-4 h-4" />Create new package
        </RippleButton>
      </div>
      <div className="px-5 mt-4 space-y-3">
        {pkgs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 mt-2">
            <p className="text-sm font-bold text-slate-600">No packages created yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Create new package" above to list your travel offers.</p>
          </div>
        ) : (
          pkgs.map((p, i) => (
            <Stagger key={i} delay={i * 100}>
              <Card className="overflow-hidden">
                <div className="flex">
                  <img src={p.img} className="w-24 h-24 object-cover shrink-0" alt={p.title} />
                  <div className="p-3 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{p.bookings} bookings</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-sky-600 flex items-center"><IndianRupee className="w-3.5 h-3.5" />{p.price.toLocaleString("en-IN")}</span>
                      <button className="text-slate-400"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            </Stagger>
          ))
        )}
      </div>
    </div>
  );
}
