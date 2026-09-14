import React from "react";
import { MessageCircle, Users, BarChart2, UserPlus, Share2, Crown, Shield, Plus } from "lucide-react";
import { ListRow, SectionHeader, PillButton } from "./ui";

export const PremiumSocialTab = ({ trip }) => {
  return (
    <div className="p-5 pb-24 space-y-6">
      
      <div className="premium-card p-3.5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-[16px] flex items-center gap-2">
               <Users className="w-5 h-5 text-pink-500" />
               Group Members
            </h3>
            <button className="flex h-8 items-center justify-center rounded-full bg-pink-50 px-4 text-[12px] font-bold text-pink-600 transition-colors hover:bg-pink-100">
               <UserPlus className="w-3.5 h-3.5 mr-1.5" />
               Invite
            </button>
         </div>
         
         <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pt-2 pb-2">
            {trip?.members?.length ? trip.members.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                 <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center relative">
                    {idx === 0 && <div className="absolute -top-1 -right-1 bg-orange-400 text-white rounded-full p-0.5 shadow-sm"><Crown className="w-3 h-3" /></div>}
                    <span className="font-bold text-slate-600 text-[16px]">
                       {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                    </span>
                 </div>
                 <span className="text-[11px] font-bold text-slate-600 truncate max-w-[60px] text-center">
                    {m.name ? m.name.split(' ')[0] : 'User'}
                 </span>
              </div>
            )) : (
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                 <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center relative">
                    <div className="absolute -top-1 -right-1 bg-orange-400 text-white rounded-full p-0.5 shadow-sm"><Crown className="w-3 h-3" /></div>
                    <span className="font-bold text-slate-600 text-[16px]">Y</span>
                 </div>
                 <span className="text-[11px] font-bold text-slate-600 truncate max-w-[60px] text-center">You</span>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform">
                 <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                    <Plus className="w-5 h-5" />
                 </div>
                 <span className="text-[11px] font-bold text-slate-400">Add</span>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <SectionHeader title="Group Activity" />
        <div className="space-y-3">
           <div className="premium-card p-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
              <div className="w-12 h-12 rounded-[16px] bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                 <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-[14px] font-bold text-slate-800">Trip Chat</h4>
                 <p className="text-[12px] font-medium text-slate-500 truncate">3 unread messages</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
           </div>

           <div className="premium-card p-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
              <div className="w-12 h-12 rounded-[16px] bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                 <BarChart2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-[14px] font-bold text-slate-800">Active Polls</h4>
                 <p className="text-[12px] font-medium text-slate-500 truncate">Vote on tomorrow's dinner</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
           </div>

           <div className="premium-card p-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-98 transition-transform">
              <div className="w-12 h-12 rounded-[16px] bg-pink-50 text-[var(--premium-pink)] flex items-center justify-center shrink-0">
                 <Share2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-[14px] font-bold text-slate-800">Share Trip</h4>
                 <p className="text-[12px] font-medium text-slate-500 truncate">Send WhatsApp invite link</p>
              </div>
           </div>
        </div>
      </div>
      
      <div className="rounded-[24px] bg-slate-50 border border-dashed border-slate-200 p-5 flex items-start gap-4 mt-6">
         <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-1">
            <Shield className="w-5 h-5" />
         </div>
         <div>
            <h4 className="text-[13px] font-bold text-slate-700">Admin Controls</h4>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Only admins can modify the core itinerary and approve new members. You can change this in settings.</p>
         </div>
      </div>

    </div>
  );
};
