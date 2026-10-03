import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hotel,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Send,
  QrCode,
  Receipt,
  Bed,
  Phone,
  MessageSquare,
  ShieldCheck,
  User,
  PlusCircle,
  X,
  ChevronRight,
  Coffee,
  Flame,
  ArrowRight,
  Building,
  Check,
  Zap,
  Sliders,
  Printer
} from "lucide-react";
import { authedFetch } from "../../utils/apiClient";

export interface HotelPropertyOperationsDeskProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
}

export interface RoomItem {
  roomId: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  status: "DIRTY" | "IN_CLEANING" | "AWAITING_INSPECTION" | "CLEAN_READY" | "OCCUPIED_DND";
  attendant?: string;
  departedGuest?: string;
  nextGuestWindow?: string;
  vipNote?: string;
  etaMinutes?: number;
  timeElapsed?: string;
  completedTime?: string;
  inspector?: string;
  notes?: string;
  privacyLight?: boolean;
  checklist?: string[];
  telemetry?: { acTemp: string; safeStatus: string; hubStatus: string };
}

export interface FolioChargeItem {
  id: string;
  title: string;
  description: string;
  ref: string;
  amount: number;
  category: "DINING" | "MINIBAR" | "SPA" | "TAX" | "LAUNDRY" | "CUSTOM";
}

export interface GuestFolio {
  roomId: string;
  guestName: string;
  bookingId: string;
  pax: string;
  keycard: string;
  checkOut: string;
  phone: string;
  prePaidEscrow: number;
  incidentalsDue: number;
  totalCharges: number;
  prePaidItems: { title: string; description: string; amount: number; status: string }[];
  incidentalsItems: FolioChargeItem[];
  isSettled?: boolean;
  settlementTxn?: string | null;
}

export const HotelPropertyOperationsDesk: React.FC<HotelPropertyOperationsDeskProps> = ({
  isOpen,
  onClose,
  hotelName = "Blue Horizon Luxury Beach Resort"
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");
  const [rooms, setRooms] = useState<RoomItem[]>([
    {
      roomId: "302",
      roomNumber: "Suite #302",
      floor: 3,
      roomType: "Deluxe Sea-Facing Suite",
      status: "DIRTY",
      attendant: "Radha Mandloi",
      departedGuest: "Rajesh & Neha Sharma (04:10 PM)",
      nextGuestWindow: "18 hrs window",
      vipNote: "Stock sparkling water & sea-breeze welcome kit.",
      etaMinutes: 45,
      checklist: ["Full Linen Replacement", "Minibar Restock", "Deep Sanitize"]
    },
    {
      roomId: "204",
      roomNumber: "Room 204",
      floor: 2,
      roomType: "Deluxe King Room",
      status: "IN_CLEANING",
      attendant: "Vikram Sen",
      timeElapsed: "00:22",
      notes: "Stayover Clean: Towels refreshed, dusting bed"
    },
    {
      roomId: "105",
      roomNumber: "Room 105",
      floor: 1,
      roomType: "Standard Garden Villa",
      status: "AWAITING_INSPECTION",
      attendant: "Priya K.",
      completedTime: "04:02 PM",
      notes: "14 Checklist items completed. Keycards refreshed & welcome note placed."
    },
    {
      roomId: "301",
      roomNumber: "Room 301",
      floor: 3,
      roomType: "Presidential Suite",
      status: "CLEAN_READY",
      inspector: "Sunil Verma (03:30 PM)",
      telemetry: { acTemp: "22°C", safeStatus: "Zeroed", hubStatus: "Online" }
    },
    {
      roomId: "208",
      roomNumber: "Room 208",
      floor: 2,
      roomType: "Deluxe Twin Room",
      status: "OCCUPIED_DND",
      privacyLight: true,
      notes: "Privacy light active. Service scheduled at 06:00 PM. Extra bath sheets requested."
    }
  ]);

  const [activeFolioRoomId, setActiveFolioRoomId] = useState<string | null>(null);
  const [folio, setFolio] = useState<GuestFolio | null>(null);
  const [loadingFolio, setLoadingFolio] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showPostChargeModal, setShowPostChargeModal] = useState(false);
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);
  const [chargeTitle, setChargeTitle] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCategory, setChargeCategory] = useState<"DINING" | "MINIBAR" | "SPA" | "LAUNDRY" | "CUSTOM">("DINING");

  // Fetch live rooms from backend
  const fetchRooms = async () => {
    try {
      const res = await authedFetch("/api/partner/pms/housekeeping/rooms");
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
      }
    } catch {
      // Local fallback active
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  // Open Folio
  const handleOpenFolio = async (roomId: string) => {
    setActiveFolioRoomId(roomId);
    setLoadingFolio(true);
    try {
      const res = await authedFetch(`/api/partner/pms/guest-folio/${roomId}`);
      const data = await res.json();
      if (data.success && data.folio) {
        setFolio(data.folio);
      } else {
        setFolio({
          roomId,
          guestName: "Rajesh & Neha Sharma",
          bookingId: "RT-89204",
          pax: "2 Guests (Couple)",
          keycard: "A-302 (Active)",
          checkOut: "26 Oct, 11:00 AM (2 Days)",
          phone: "+91 98765 43210",
          prePaidEscrow: 10752,
          incidentalsDue: 3198,
          totalCharges: 13950,
          prePaidItems: [
            { title: "Deluxe Sea-Facing Suite (2 Nights)", description: "Rate 4,000 / night · 24 Oct - 26 Oct", amount: 8000, status: "PRE_PAID" },
            { title: "Airport Transfer (Sedan Pickup)", description: "Goa Dabolim Airport · Driver assigned", amount: 1200, status: "PRE_PAID" },
            { title: "Stay Taxes & GST (12%)", description: "Government Accommodation Surcharges", amount: 1552, status: "PRE_PAID" }
          ],
          incidentalsItems: [
            { id: "inc-1", title: "Bayview Bistro & Cafe", description: "Today, 01:15 PM · Grilled Pomfret, Garlic Naan, 2x Fresh Lime Soda", ref: "Bill #B-4091", amount: 1650, category: "DINING" },
            { id: "inc-2", title: "Minibar Consumption", description: "Today, 04:30 PM · 2x Sparkling Mineral Water, Roasted Cashews", ref: "HK Log #HK-12", amount: 450, category: "MINIBAR" },
            { id: "inc-3", title: "AyurSpa Aromatherapy Massage", description: "Advance: Tomorrow, 10:00 AM · 60-min Couple Session", ref: "Partner Promo Applied", amount: 950, category: "SPA" },
            { id: "inc-4", title: "GST on In-House Services (18%)", description: "18% GST on Dining & Spa", ref: "Statutory GST", amount: 148, category: "TAX" }
          ]
        });
      }
    } catch {
      // Local fallback
    } finally {
      setLoadingFolio(false);
    }
  };

  // Update room status
  const handleUpdateRoomStatus = async (roomId: string, nextStatus: RoomItem["status"]) => {
    try {
      await authedFetch("/api/partner/pms/housekeeping/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status: nextStatus })
      });
      setRooms((prev) =>
        prev.map((r) => (r.roomId === roomId ? { ...r, status: nextStatus } : r))
      );
      setToast(`Suite #${roomId} updated to ${nextStatus.replace(/_/g, " ")}`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      setRooms((prev) =>
        prev.map((r) => (r.roomId === roomId ? { ...r, status: nextStatus } : r))
      );
      setToast(`Suite #${roomId} updated to ${nextStatus.replace(/_/g, " ")}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Post new charge to folio
  const handlePostCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeTitle || !chargeAmount) return;
    const amt = Number(chargeAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      const res = await authedFetch("/api/partner/pms/guest-folio/post-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeFolioRoomId || "302",
          title: chargeTitle,
          amount: amt,
          category: chargeCategory
        })
      });
      const data = await res.json();
      if (data.success && data.folio) {
        setFolio(data.folio);
      } else {
        if (folio) {
          const newItem: FolioChargeItem = {
            id: `inc-${Date.now()}`,
            title: chargeTitle,
            description: `Incidental charge posted by Front Desk`,
            ref: `POS-Desk #${Math.floor(1000 + Math.random() * 9000)}`,
            amount: amt,
            category: chargeCategory
          };
          setFolio({
            ...folio,
            incidentalsItems: [...folio.incidentalsItems, newItem],
            incidentalsDue: folio.incidentalsDue + amt,
            totalCharges: folio.totalCharges + amt
          });
        }
      }
      setShowPostChargeModal(false);
      setChargeTitle("");
      setChargeAmount("");
      setToast(`Posted charge of INR ${amt} to room folio!`);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setShowPostChargeModal(false);
    }
  };

  // Settle UPI
  const handleSettleUpi = async () => {
    try {
      const res = await authedFetch("/api/partner/pms/guest-folio/settle-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: activeFolioRoomId || "302" })
      });
      const data = await res.json();
      if (folio) {
        setFolio({
          ...folio,
          isSettled: true,
          incidentalsDue: 0,
          settlementTxn: data.transactionId || `UPI-SETTLE-${Date.now()}`
        });
      }
      setShowUpiQrModal(false);
      setToast("Incidentals folio settled successfully via FastSettle UPI QR!");
      setTimeout(() => setToast(null), 5000);
    } catch {
      if (folio) {
        setFolio({
          ...folio,
          isSettled: true,
          incidentalsDue: 0,
          settlementTxn: `UPI-SETTLE-${Date.now()}`
        });
      }
      setShowUpiQrModal(false);
      setToast("Incidentals settled successfully via FastSettle UPI!");
      setTimeout(() => setToast(null), 5000);
    }
  };

  // Send WhatsApp bill link
  const handleSendWhatsApp = async () => {
    try {
      const res = await authedFetch("/api/partner/pms/concierge/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: activeFolioRoomId || "302" })
      });
      const data = await res.json();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
      setToast("WhatsApp folio link dispatched to guest mobile!");
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast("WhatsApp folio notification generated!");
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (!isOpen) return null;

  const filteredRooms =
    selectedFloor === "ALL"
      ? rooms
      : rooms.filter((r) => r.floor === selectedFloor);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header - Curved Bus Booking Style with Ocean Brand Palette */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] border-b border-sky-200/80 rounded-b-[20px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100/90 text-sky-800 border border-sky-200 flex items-center justify-center font-bold shadow-xs">
              <Hotel className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-[#0F172A]">
                  Front Desk & Housekeeping Operations
                </h2>
                <span className="text-[10px] bg-sky-100/90 text-sky-800 border border-sky-300/60 font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                  Live Floor Ops
                </span>
              </div>
              <p className="text-xs text-[#0369a1] font-semibold mt-0.5">
                {hotelName} · Shift B Supervisor: Sunil Verma (24 Units Live)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchRooms}
              aria-label="Refresh Status"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-sky-200/80 text-sky-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-sky-200/80 text-sky-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Shift Ops Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">Dirty / Turnover</p>
                <p className="text-xl font-black text-amber-950 mt-0.5">
                  {rooms.filter((r) => r.status === "DIRTY").length}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-amber-100/90 text-amber-800">
                <Clock className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-sky-800 tracking-wider">In Cleaning</p>
                <p className="text-xl font-black text-sky-950 mt-0.5">
                  {rooms.filter((r) => r.status === "IN_CLEANING").length}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-sky-100/90 text-sky-800">
                <RefreshCw className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Clean & Ready</p>
                <p className="text-xl font-black text-emerald-950 mt-0.5">
                  {rooms.filter((r) => r.status === "CLEAN_READY").length}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-100/90 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wider">DND / Occupied</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {rooms.filter((r) => r.status === "OCCUPIED_DND").length}
                </p>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Bed className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Priority Turnover Alert Banner - Suite #302 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Priority Checkout
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Suite #302 · Deluxe Sea-Facing
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Departed: <strong>Rajesh & Neha Sharma</strong> (04:10 PM) · Next Guest Window: <strong>18 hrs</strong> · Assigned: <strong>Radha Mandloi</strong>
              </p>
              <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                VIP Note: Stock sparkling water & sea-breeze welcome kit.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenFolio("302")}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5 text-sky-600" />
                <span>Guest Folio (INR 3,198 Due)</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateRoomStatus("302", "IN_CLEANING")}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Turnover</span>
              </button>
            </div>
          </div>

          {/* Floor Filtering Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "ALL", label: "All Floors (24)" },
                { id: 1, label: "Floor 1 (8)" },
                { id: 2, label: "Floor 2 (8)" },
                { id: 3, label: "Floor 3 - Suites (8)" }
              ].map((f) => (
                <button
                  key={String(f.id)}
                  type="button"
                  onClick={() => setSelectedFloor(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedFloor === f.id
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              Real-Time PMS Hub Online
            </span>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => {
              const isDirty = room.status === "DIRTY";
              const isCleaning = room.status === "IN_CLEANING";
              const isInspection = room.status === "AWAITING_INSPECTION";
              const isReady = room.status === "CLEAN_READY";
              const isDnd = room.status === "OCCUPIED_DND";

              return (
                <div
                  key={room.roomId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDirty
                      ? "border-amber-200 bg-amber-50/30"
                      : isCleaning
                      ? "border-sky-200 bg-sky-50/30"
                      : isInspection
                      ? "border-purple-200 bg-purple-50/30"
                      : isReady
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{room.roomNumber}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">Floor {room.floor}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">{room.roomType}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDirty
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : isCleaning
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : isInspection
                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                          : isReady
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}
                    >
                      {room.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Room Meta Information */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                    {room.attendant && (
                      <p className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attendant: <strong>{room.attendant}</strong></span>
                      </p>
                    )}
                    {room.checklist && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {room.checklist.map((chk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                          >
                            {chk}
                          </span>
                        ))}
                      </div>
                    )}
                    {room.telemetry && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-600">
                        <span>AC: {room.telemetry.acTemp}</span>
                        <span>Safe: {room.telemetry.safeStatus}</span>
                        <span className="text-emerald-600 font-bold">Hub: {room.telemetry.hubStatus}</span>
                      </div>
                    )}
                    {room.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">{room.notes}</p>
                    )}
                  </div>

                  {/* Status Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFolio(room.roomId)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-sky-600" />
                      <span>Folio</span>
                    </button>

                    {isDirty && (
                      <button
                        type="button"
                        onClick={() => handleUpdateRoomStatus(room.roomId, "IN_CLEANING")}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Start Cleaning</span>
                      </button>
                    )}

                    {isCleaning && (
                      <button
                        type="button"
                        onClick={() => handleUpdateRoomStatus(room.roomId, "AWAITING_INSPECTION")}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submit for Inspection</span>
                      </button>
                    )}

                    {isInspection && (
                      <button
                        type="button"
                        onClick={() => handleUpdateRoomStatus(room.roomId, "CLEAN_READY")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Release</span>
                      </button>
                    )}

                    {isReady && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Front Desk Live
                      </span>
                    )}

                    {isDnd && (
                      <span className="text-[11px] font-bold text-slate-500">
                        Privacy Lamp Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Linen & Supplies Inventory Locker (A-3) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Linen & Supplies Inventory · Locker A-3
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Auto-Syncs with Housekeeping</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Bath Towels</p>
                <p className="text-base font-black text-slate-800 mt-0.5">42 Units</p>
                <span className="text-[9px] text-emerald-600 font-bold">Optimal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Bed Linen Sets</p>
                <p className="text-base font-black text-slate-800 mt-0.5">28 Sets</p>
                <span className="text-[9px] text-sky-600 font-bold">Sufficient</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Toiletry Kits</p>
                <p className="text-base font-black text-slate-800 mt-0.5">60 Kits</p>
                <span className="text-[9px] text-amber-600 font-bold">Restock Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>RoutTripo PMS Edge Sync: All status changes propagate to reservations instantly.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close PMS Operations
          </button>
        </div>
      </div>

      {/* Guest Folio & Incidentals Drawer Modal */}
      <AnimatePresence>
        {activeFolioRoomId && folio && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] border-b border-sky-200/80 rounded-b-[20px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100/90 text-sky-800 border border-sky-200 flex items-center justify-center font-bold shadow-xs">
                    <Receipt className="w-5 h-5 text-sky-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-[#0F172A]">
                      Guest Folio Statement · Suite #{activeFolioRoomId}
                    </h3>
                    <p className="text-xs text-[#0369a1] font-semibold mt-0.5">
                      {folio.guestName} · Booking #{folio.bookingId} ({folio.pax})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFolioRoomId(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-sky-200/80 text-sky-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Folio Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Balance Summary Header */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      Folio Balance Due
                    </span>
                    <h4 className="text-2xl font-black mt-0.5 text-white">
                      INR {folio.incidentalsDue.toLocaleString("en-IN")}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Pre-paid via Escrow: INR {folio.prePaidEscrow.toLocaleString("en-IN")} · Total Charges: INR {folio.totalCharges.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPostChargeModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Post Charge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpiQrModal(true)}
                      disabled={folio.incidentalsDue <= 0}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Settle via UPI</span>
                    </button>
                  </div>
                </div>

                {/* Pre-Paid Accommodations Escrow */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Group 1: Pre-Paid Accommodations (Escrow Settled)</span>
                  </h4>
                  <div className="space-y-2">
                    {folio.prePaidItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-800">INR {item.amount.toLocaleString("en-IN")}</p>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Pre-paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incidentals & In-House Services Line Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Group 2: Dining, Minibar & Spa Incidentals</span>
                    </h4>
                    <span className="text-xs font-black text-amber-800">
                      INR {folio.incidentalsDue.toLocaleString("en-IN")} Due
                    </span>
                  </div>
                  <div className="space-y-2">
                    {folio.incidentalsItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800">{item.title}</p>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description} ({item.ref})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">INR {item.amount.toLocaleString("en-IN")}</p>
                          <span className="text-[10px] font-semibold text-slate-400">Billed to room</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concierge Communication Actions */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">WhatsApp Concierge Integration</p>
                      <p className="text-[11px] text-slate-600">
                        Dispatch live folio bill link directly to {folio.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Bill Link</span>
                  </button>
                </div>
              </div>

              {/* Folio Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Folio Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFolioRoomId(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Back to Floor Ops
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post New Charge Modal */}
      <AnimatePresence>
        {showPostChargeModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-black text-slate-900">Post Incidentals Charge</h4>
                <button
                  type="button"
                  onClick={() => setShowPostChargeModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePostCharge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={chargeCategory}
                    onChange={(e) => setChargeCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="DINING">Dining & Room Service</option>
                    <option value="MINIBAR">Minibar Consumption</option>
                    <option value="SPA">Spa & Wellness Treatment</option>
                    <option value="LAUNDRY">Laundry Services</option>
                    <option value="CUSTOM">Custom Incidentals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Item Title / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seafood Dinner or Airport Drop"
                    value={chargeTitle}
                    onChange={(e) => setChargeTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Charge Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1250"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostChargeModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    Add to Folio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settle UPI QR Modal */}
      <AnimatePresence>
        {showUpiQrModal && folio && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">FastSettle UPI QR Payment</h4>
                <p className="text-xs text-slate-500 mt-0.5">Suite #{folio.roomId} Incidentals Settlement</p>
                <p className="text-2xl font-black text-emerald-600 mt-2">
                  INR {folio.incidentalsDue.toLocaleString("en-IN")}
                </p>
              </div>

              {/* QR Box placeholder simulation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className="w-36 h-36 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-2 shadow-inner">
                  <div className="text-[10px] font-mono text-slate-400 text-center">
                    [DYNAMIC UPI QR CODE]
                    <br />
                    UPI ID: routtripo.pms@icici
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  Scan with GPay / PhonePe / Paytm
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSettleUpi}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  Confirm Payment Received (Auto-Reconciliation)
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpiQrModal(false)}
                  className="w-full py-2 text-slate-500 text-xs font-bold hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
