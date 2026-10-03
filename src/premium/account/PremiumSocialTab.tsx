import React, { useState } from "react";
import {
  MessageCircle,
  Users,
  BarChart2,
  UserPlus,
  Share2,
  Crown,
  Shield,
  Plus,
  CheckCircle2,
  Copy,
  Sparkles
} from "lucide-react";
import { ListRow, SectionHeader, PillButton, SubPageHeader } from "./ui";

export const PremiumSocialTab = ({ trip }: any) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const tripTitle = trip?.title || trip?.name || "Goa Beach Vacation";
  const groupCode = trip?.joinCode || "ROUT-789";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(groupCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    showToast("Group code copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const text = `Join our trip "${tripTitle}" on RouTripo! Use code ${groupCode} or open: ${window.location.origin}/join/${groupCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    showToast("Opening WhatsApp to invite friends...");
  };

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent("open-trip-chat"));
    showToast("Connecting to group chat...");
  };

  const handleOpenPolls = () => {
    window.dispatchEvent(new CustomEvent("open-trip-polls"));
    showToast("Opening group decision polls...");
  };

  return (
    <div className="p-5 pb-24 space-y-6 font-['Outfit',sans-serif]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[150] max-w-xs px-4">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span className="whitespace-nowrap shrink-0">{toastMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </div>
        </div>
      )}

      {/* Group Members Hub Card */}
      <div className="premium-card p-4 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/90 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Group Members</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex h-8 items-center justify-center rounded-full bg-sky-50 px-3.5 text-xs font-extrabold text-sky-700 border border-sky-200/80 transition-all hover:bg-sky-100 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Invite</span>
          </button>
        </div>

        {/* Member Avatars Horizontal Scroll */}
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pt-1 pb-1">
          {trip?.members?.length ? (
            trip.members.map((m: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-13 h-13 rounded-full bg-sky-50 border border-sky-200 shadow-2xs flex items-center justify-center relative">
                  {idx === 0 && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-2xs">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                  <span className="font-black text-sky-800 text-[15px]">
                    {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[65px] text-center">
                  {m.name ? m.name.split(" ")[0] : "User"}
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-13 h-13 rounded-full bg-sky-50 border border-sky-200 shadow-2xs flex items-center justify-center relative">
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-2xs">
                  <Crown className="w-3 h-3" />
                </div>
                <span className="font-black text-sky-800 text-[15px]">Y</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 truncate max-w-[65px] text-center">
                You
              </span>
            </div>
          )}

          {/* Add member button */}
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-13 h-13 rounded-full border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-100/50 flex items-center justify-center text-sky-600 transition-colors">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-sky-700">Add</span>
          </button>
        </div>
      </div>

      {/* Group Activity Section */}
      <div className="space-y-3">
        <SectionHeader title="Group Activity & Collaboration" />
        <div className="space-y-2.5">
          {/* Trip Chat */}
          <div
            onClick={handleOpenChat}
            className="premium-card p-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/90 rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-[0.99] hover:border-sky-300 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-slate-900">Trip Chat</h4>
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Direct group coordination & updates
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
          </div>

          {/* Active Polls */}
          <div
            onClick={handleOpenPolls}
            className="premium-card p-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/90 rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-[0.99] hover:border-sky-300 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-slate-900">Decision Polls</h4>
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Vote on stays, activities, and dining spots
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] shrink-0">
              Active
            </span>
          </div>

          {/* Share Trip */}
          <div
            onClick={handleShareWhatsApp}
            className="premium-card p-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/90 rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-[0.99] hover:border-emerald-300 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-slate-900">Share on WhatsApp</h4>
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Send trip invite link with one click
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls Info Box */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Trip Admin Permissions
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Only designated trip admins can approve members and lock group expenses. You can adjust permissions in trip settings.
          </p>
        </div>
      </div>

      {/* Invite Modal with Unified SubPageHeader */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-sky-200 overflow-hidden flex flex-col max-h-[90vh]">
            <SubPageHeader
              title="Invite Group Members"
              subtitle={tripTitle}
              badge="Invite"
              onClose={() => setIsInviteModalOpen(false)}
            />

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Trip Join Code
                </span>
                <p className="text-2xl font-mono font-black text-sky-700 tracking-wider">
                  {groupCode}
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
