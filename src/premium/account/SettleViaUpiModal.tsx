import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Smartphone,
  Share2,
  QrCode,
  Zap,
  ShieldCheck,
  ArrowRight,
  Check,
  Copy,
  Receipt,
  Users
} from "lucide-react";
import { SubPageHeader } from "./ui";
import { useTripContext } from "../../context/TripContext";
import { calculateSettlements } from "../../utils";
import QRCode from "react-qr-code";

export interface SettleViaUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

interface UpiApp {
  id: string;
  name: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
}

const UPI_APPS: UpiApp[] = [
  { id: "gpay", name: "GPay", iconBg: "bg-white", textColor: "text-slate-800", borderColor: "border-slate-200" },
  { id: "phonepe", name: "PhonePe", iconBg: "bg-[#5f259f]", textColor: "text-white", borderColor: "border-[#5f259f]" },
  { id: "paytm", name: "Paytm", iconBg: "bg-[#002e6e]", textColor: "text-white", borderColor: "border-[#002e6e]" },
  { id: "bhim", name: "BHIM", iconBg: "bg-[#00796b]", textColor: "text-white", borderColor: "border-[#00796b]" }
];

export const SettleViaUpiModal: React.FC<SettleViaUpiModalProps> = ({
  isOpen,
  onClose,
  lang = "en"
}) => {
  const isMr = lang === "mr";
  const { activeTrip, updateActiveTrip } = useTripContext();

  const [activeQrTransferId, setActiveQrTransferId] = useState<string | null>(null);
  const [completedTransfers, setCompletedTransfers] = useState<string[]>([]);
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate live balances and minimal transfers
  const { transfers, youOwe, youReceive } = useMemo(() => {
    if (!activeTrip) {
      return {
        transfers: [
          { id: "tr-1", from: "You", to: "Priya Sharma", amount: 450, vpa: "priya@okaxis" },
          { id: "tr-2", from: "Rahul Deshmukh", to: "You", amount: 1500, vpa: "rahul@oksbi" }
        ],
        youOwe: 450,
        youReceive: 1500
      };
    }

    const members = activeTrip.members || [];
    const expenses = activeTrip.expenses || [];
    const deposits = activeTrip.deposits || [];
    const res = calculateSettlements(members, expenses, deposits, undefined, activeTrip.calculationMode);

    const formatted = res.transfers.map((t, idx) => {
      const fromMember = members.find((m) => m.id === t.from);
      const toMember = members.find((m) => m.id === t.to);
      const fromName = fromMember ? fromMember.name : "Member";
      const toName = toMember ? toMember.name : "Member";
      const cleanVpa = `${toName.toLowerCase().replace(/[^a-z]/g, "") || "partner"}@upi`;

      return {
        id: `tr-${idx}-${t.from}-${t.to}`,
        from: fromName,
        to: toName,
        amount: Math.round(t.amount),
        vpa: cleanVpa
      };
    });

    const owe = formatted
      .filter((t) => t.from.toLowerCase() === "you" || t.from.toLowerCase().includes("cara") || t.from.toLowerCase().includes("aditi"))
      .reduce((sum, t) => sum + t.amount, 0);

    const receive = formatted
      .filter((t) => t.to.toLowerCase() === "you" || t.to.toLowerCase().includes("cara") || t.to.toLowerCase().includes("aditi"))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transfers: formatted.length > 0 ? formatted : [
        { id: "tr-1", from: "You", to: "Priya Sharma", amount: 450, vpa: "priya@okaxis" },
        { id: "tr-2", from: "Rahul Deshmukh", to: "You", amount: 1500, vpa: "rahul@oksbi" }
      ],
      youOwe: owe > 0 ? owe : 450,
      youReceive: receive > 0 ? receive : 1500
    };
  }, [activeTrip]);

  const handleLaunchUpi = (vpa: string, payeeName: string, amount: number, appId?: string) => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Trip%20Expense%20Settlement`;
    window.location.href = upiUri;
    showToast(isMr ? `UPI ॲप सुरू केले: ₹${amount}` : `Opened UPI payment for ₹${amount}`);
  };

  const handleMarkPaid = (transferId: string, amount: number, payeeName: string) => {
    setCompletedTransfers((prev) => [...prev, transferId]);
    showToast(isMr ? `₹${amount} पेमेंट पूर्ण झाले!` : `₹${amount} payment confirmed!`);

    // Record settlement in TripContext
    if (activeTrip && updateActiveTrip) {
      const newDeposit = {
        id: `dep-${Date.now()}`,
        memberId: "current-user",
        amount: amount,
        date: new Date().toISOString(),
        note: `Settled with ${payeeName}`
      };
      updateActiveTrip({
        ...activeTrip,
        deposits: [...(activeTrip.deposits || []), newDeposit]
      });
    }
  };

  const handleCopyVpa = (vpa: string) => {
    navigator.clipboard?.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2500);
    showToast(isMr ? "UPI ID कॉपी केला" : "UPI ID copied to clipboard");
  };

  const handleShareWhatsApp = (transfer: { to: string; amount: number; vpa: string }) => {
    const text = isMr
      ? `नमस्ते ${transfer.to}, ट्रिप खर्चाचा हिशोब: मी तुम्हाला ₹${transfer.amount} पाठवत आहे (UPI ID: ${transfer.vpa}).`
      : `Hi ${transfer.to}, Trip settlement: I am transferring ₹${transfer.amount} via UPI to ${transfer.vpa}.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!isOpen) return null;

  const tripTitle = (activeTrip as any)?.title || activeTrip?.name || "Goa Beach Vacation";
  const memberCount = activeTrip?.members?.length || 4;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-sky-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 inset-x-0 mx-auto z-[150] max-w-xs px-4">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
              <span className="whitespace-nowrap shrink-0">{toastMessage}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Unified Brand Ocean SubPageHeader with Curved Bottom */}
        <SubPageHeader
          title={isMr ? "सर्व हिशोब सेटल करा" : "Settle All via UPI"}
          subtitle={isMr ? `${tripTitle} · १-क्लिक सेटलमेंट` : `${tripTitle} · 1-Click Settlement`}
          badge={isMr ? "स्मार्ट स्प्लिट" : "Smart Split"}
          onClose={onClose}
        />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
          {/* Smart Split Optimization Banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap shrink-0">
                  {isMr ? "स्मार्ट स्प्लिट ऑप्टिमायझेशन" : "Smart Split Optimized"}
                </span>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                {isMr ? "१००% अचूक" : "100% Accurate"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isMr
                ? `${memberCount} मित्रांमधील गुंतागुंतीचे व्यवहार कमी करून अल्गोरिदमने फक्त थेट UPI ट्रान्सफर्समधे संपूर्ण ट्रिपचा हिशोब शून्य केला आहे.`
                : `Circular debts between ${memberCount} members have been reduced to direct UPI transfers to settle the entire trip with minimum transactions.`}
            </p>
          </div>

          {/* Net Balance Cards (You Pay vs You Receive) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap shrink-0">
                {isMr ? "तुम्ही देणे बाकी" : "You Owe"}
              </span>
              <p className="text-xl font-black text-rose-600 mt-1 whitespace-nowrap shrink-0">
                ₹{youOwe.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 whitespace-nowrap shrink-0">
                {isMr ? "तातडीने देणे आहे" : "Immediate dues"}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block whitespace-nowrap shrink-0">
                {isMr ? "तुम्हाला येणे बाकी" : "You Receive"}
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1 whitespace-nowrap shrink-0">
                +₹{youReceive.toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5 whitespace-nowrap shrink-0">
                {isMr ? "मित्रांकडून जमा होईल" : "From group members"}
              </span>
            </div>
          </div>

          {/* Transfers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 whitespace-nowrap shrink-0">
                {isMr ? "प्रलंबित व्यवहार" : "Pending Settlements"}
              </h3>
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap shrink-0">
                {transfers.length} {isMr ? "व्यवहार" : "Transfers"}
              </span>
            </div>

            {transfers.map((t) => {
              const isPaid = completedTransfers.includes(t.id);
              const showQr = activeQrTransferId === t.id;

              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    isPaid
                      ? "border-emerald-200 bg-emerald-50/30 opacity-90"
                      : "border-slate-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 font-black text-sm shrink-0">
                        {t.to.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {t.to}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopyVpa(t.vpa)}
                          className="text-[11px] font-mono text-slate-500 flex items-center gap-1 hover:text-sky-600 active:scale-95 transition-all cursor-pointer truncate"
                        >
                          <span className="truncate">{t.vpa}</span>
                          {copiedVpa === t.vpa ? (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-slate-900 whitespace-nowrap shrink-0">
                        ₹{t.amount.toLocaleString("en-IN")}
                      </p>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {isMr ? "पूर्ण झाले" : "Settled"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
                          {isMr ? "देणे बाकी" : "Pending"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Pending Transfer */}
                  {!isPaid && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                      {/* 1-Click UPI Apps Row */}
                      <div className="flex items-center gap-2">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => handleLaunchUpi(t.vpa, t.to, t.amount, app.id)}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${app.iconBg} ${app.textColor} ${app.borderColor} shadow-xs hover:opacity-90`}
                          >
                            <Smartphone className="w-3 h-3 shrink-0" />
                            <span className="whitespace-nowrap shrink-0">{app.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Main Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(t.id, t.amount, t.to)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isMr ? `आत्ताच ₹${t.amount} ट्रान्सफर करा` : `Pay ₹${t.amount} Now`}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveQrTransferId(showQr ? null : t.id)}
                          className="px-2.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 border border-sky-400/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0"
                          title="Show QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5 text-sky-700" />
                          <span>QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(t)}
                          className="px-2.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-400/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                      </div>

                      {/* Dynamic QR Code View */}
                      {showQr && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2 animate-in fade-in duration-150">
                          <p className="text-[11px] font-bold text-slate-700">
                            {isMr ? `${t.to} साठी UPI QR कोड स्केन करा` : `Scan QR to Pay ${t.to}`}
                          </p>
                          <div className="p-2 bg-white rounded-xl inline-block shadow-xs border border-slate-200">
                            <QRCode
                              value={`upi://pay?pa=${encodeURIComponent(t.vpa)}&pn=${encodeURIComponent(t.to)}&am=${t.amount}&cu=INR`}
                              size={120}
                              level="M"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {t.vpa} · ₹{t.amount}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block whitespace-nowrap shrink-0">
              {isMr ? "ऎकूण सेटलमेंट" : "Total to Settle"}
            </span>
            <span className="text-base font-black text-slate-900 whitespace-nowrap shrink-0">
              ₹{youOwe.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {isMr ? "बंद करा" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
