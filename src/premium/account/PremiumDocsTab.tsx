import React, { useState, useEffect } from "react";
import {
  Ticket,
  FileText,
  Download,
  ShieldCheck,
  Hotel,
  Plane,
  Plus,
  Eye,
  Check,
  CheckCircle2,
  X,
  Share2,
  FileCheck
} from "lucide-react";
import { ListRow, SectionHeader, PillButton, SubPageHeader } from "./ui";

interface TravelDocument {
  id: string;
  title: string;
  category: "flight" | "hotel" | "insurance" | "visa" | "id";
  pnrOrNumber: string;
  docCount: string;
  dateAdded: string;
  iconImg: string;
}

const DEFAULT_DOCUMENTS: TravelDocument[] = [
  {
    id: "doc-1",
    title: "Flight Tickets",
    category: "flight",
    pnrOrNumber: "PNR: R8T9WP",
    docCount: "2 Docs",
    dateAdded: "Oct 2026",
    iconImg: "/icons/flight.png"
  },
  {
    id: "doc-2",
    title: "Hotel Vouchers",
    category: "hotel",
    pnrOrNumber: "Taj Resort",
    docCount: "1 Doc",
    dateAdded: "Oct 2026",
    iconImg: "/icons/hotel_vouchers.png"
  },
  {
    id: "doc-3",
    title: "Travel Insurance",
    category: "insurance",
    pnrOrNumber: "Policy: TROP-9982",
    docCount: "Group Coverage",
    dateAdded: "Oct 2026",
    iconImg: "/icons/travel_insurance.png"
  }
];

export const PremiumDocsTab = ({ trip }: any) => {
  const [documents, setDocuments] = useState<TravelDocument[]>(() => {
    try {
      const saved = localStorage.getItem("routtripo_vault_documents");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load documents", e);
    }
    return DEFAULT_DOCUMENTS;
  });

  const [selectedDoc, setSelectedDoc] = useState<TravelDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Document Form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TravelDocument["category"]>("flight");
  const [newNumber, setNewNumber] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const iconMap: Record<TravelDocument["category"], string> = {
      flight: "/icons/flight.png",
      hotel: "/icons/hotel_vouchers.png",
      insurance: "/icons/travel_insurance.png",
      visa: "/icons/visa.png",
      id: "/icons/id_badge.png"
    };

    const newDoc: TravelDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      pnrOrNumber: newNumber.trim() || "DOC-VERIFIED",
      docCount: "1 Doc",
      dateAdded: "Today",
      iconImg: iconMap[newCategory] || "/icons/flight.png"
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    try {
      localStorage.setItem("routtripo_vault_documents", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save doc to storage", e);
    }

    setNewTitle("");
    setNewNumber("");
    setIsUploadModalOpen(false);
    showToast("Document saved to your travel vault!");
  };

  const handleDownload = (doc: TravelDocument) => {
    showToast(`Downloading ${doc.title} (${doc.pnrOrNumber})...`);
    // Simulated instant download
    const blob = new Blob([`ROUTTRIPO TRAVEL VAULT CERTIFIED DOCUMENT
Title: ${doc.title}
Ref: ${doc.pnrOrNumber}
Status: Verified Offline Available`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 pb-24 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[150] max-w-xs px-4">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span className="whitespace-nowrap shrink-0">{toastMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </div>
        </div>
      )}

      {/* Vault Header & Action */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Travel Documents Vault" />
          <PillButton label="Upload" variant="frosted" onClick={() => setIsUploadModalOpen(true)} />
        </div>

        {/* Documents Cards List */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="premium-card p-3.5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-200/90 rounded-2xl flex items-center gap-3.5 cursor-pointer active:scale-[0.99] hover:border-sky-300 transition-all"
            >
              <img
                src={doc.iconImg}
                alt={doc.title}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
                className="h-10 w-10 object-contain drop-shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-slate-900 truncate">{doc.title}</h4>
                <p className="text-[12px] font-medium text-slate-500 truncate">
                  {doc.pnrOrNumber} · {doc.docCount}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(doc);
                }}
                className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Document dashed card */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full p-3.5 bg-white border border-dashed border-sky-300 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-2 text-sky-700 font-bold text-xs shadow-2xs hover:bg-sky-50/50 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Travel Document</span>
          </button>
        </div>
      </div>

      {/* Security & Offline Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-800">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-wider">End-to-End Vault Encryption</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          All group boarding passes, hotel vouchers, and ID proof documents are encrypted and synchronized for offline airport access.
        </p>
      </div>

      {/* Upload Document Modal with Unified Brand Ocean SubPageHeader */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-sky-200 overflow-hidden flex flex-col max-h-[90vh]">
            <SubPageHeader
              title="Upload Travel Document"
              subtitle="Add e-Tickets, vouchers, or ID proofs"
              badge="Vault"
              onClose={() => setIsUploadModalOpen(false)}
            />

            <form onSubmit={handleSaveDoc} className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Indigo Return Ticket, Taj Booking Voucher"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Document Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:border-sky-500 shadow-2xs"
                >
                  <option value="flight">Flight Ticket</option>
                  <option value="hotel">Hotel Voucher</option>
                  <option value="insurance">Travel Insurance</option>
                  <option value="visa">Visa & Entry Permit</option>
                  <option value="id">Government ID / Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  PNR or Reference Number
                </label>
                <input
                  type="text"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. PNR: 6E-8821, Ref: HTL-9402"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save to Vault</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Preview Modal with SubPageHeader */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-sky-200 overflow-hidden flex flex-col max-h-[90vh]">
            <SubPageHeader
              title={selectedDoc.title}
              subtitle={`${selectedDoc.pnrOrNumber} · Verified`}
              badge="Encrypted"
              onClose={() => setSelectedDoc(null)}
            />

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <img src={selectedDoc.iconImg} alt={selectedDoc.title} className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedDoc.title}</h3>
                    <p className="text-xs text-sky-700 font-bold">{selectedDoc.pnrOrNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Added</span>
                    <span className="text-slate-800 font-bold">{selectedDoc.dateAdded}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Status</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Offline Cached
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
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
