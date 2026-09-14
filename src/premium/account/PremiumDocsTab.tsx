import React from "react";
import { Ticket, FileText, Download, ShieldCheck, Hotel, Plane, CloudSun, Briefcase, Plus } from "lucide-react";
import { ListRow, SectionHeader, PillButton } from "./ui";

export const PremiumDocsTab = ({ trip }) => {
  return (
    <div className="p-5 pb-24 space-y-8">
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Travel Documents" />
          <PillButton label="Upload" onClick={() => {}} />
        </div>
        
        <div className="space-y-2.5">
            <div className="premium-card p-3.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
               <img src="/icons/flight.png" alt="Flight Tickets" className="h-11 w-11 object-contain drop-shadow-md shrink-0" />
               <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-800">Flight Tickets</h4>
                  <p className="text-[12px] font-medium text-slate-500 truncate">PNR: R8T9WP • 2 Docs</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Download className="w-4 h-4" />
               </div>
            </div>

            <div className="premium-card p-3.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
               <img src="/icons/hotel_vouchers.png" alt="Hotel Vouchers" className="h-11 w-11 object-contain drop-shadow-md shrink-0" />
               <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-800">Hotel Vouchers</h4>
                  <p className="text-[12px] font-medium text-slate-500 truncate">Taj Resort • 1 Doc</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Download className="w-4 h-4" />
               </div>
            </div>

            <div className="premium-card p-3.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
               <img src="/icons/travel_insurance.png" alt="Travel Insurance" className="h-11 w-11 object-contain drop-shadow-md shrink-0" />
               <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-800">Travel Insurance</h4>
                  <p className="text-[12px] font-medium text-slate-500 truncate">Active coverage • Group</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Download className="w-4 h-4" />
               </div>
            </div>
           
           <div className="premium-card p-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100">
              <Plus className="w-5 h-5" />
              <span className="text-[14px] font-bold">Add Document</span>
           </div>
        </div>
      </div>
      
      <div className="rounded-[24px] bg-[var(--premium-accent-soft)] p-6">
        <div className="flex items-center gap-3 mb-2">
           <ShieldCheck className="w-5 h-5 text-[var(--premium-accent)]" />
           <h3 className="text-[14px] font-bold text-[var(--premium-accent)]">Store safely</h3>
        </div>
        <p className="text-[12px] font-medium text-[var(--premium-accent)]/80 leading-relaxed">
          All your group's IDs, visas, and tickets are stored securely with end-to-end encryption. They are automatically available offline so you never lose access during your trip.
        </p>
      </div>

    </div>
  );
};
