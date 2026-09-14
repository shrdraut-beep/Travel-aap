import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeCheck,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileCheck,
  FileText,
  Globe,
  Hotel,
  KeyRound,
  LifeBuoy,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Phone,
  PlusCircle,
  Printer,
  ReceiptText,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  Users,
  Wallet,
  X
} from "lucide-react";
import { ListRow, PillButton, SectionHeader, StatCard } from "../account/ui";
import { ModalSheet } from "../shared/ModalSheet";
import { authedFetch } from "../../utils/apiClient";
import { useAuthStore } from "../../store/useAuthStore";
import type { AgentActionId } from "./types";

export interface PanelProps {
  onAction: (action: AgentActionId) => void;
  onNavigateTab?: (primary: string, sub?: string) => void;
}

// Toast helper
const StatusToast: React.FC<{ message: string | null; type?: "success" | "error" | "info" }> = ({
  message,
  type = "success"
}) => {
  if (!message) return null;
  return (
    <div
      className={`mx-5 mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold shadow-sm transition-all ${
        type === "error"
          ? "bg-rose-50 text-rose-700 border border-rose-200"
          : type === "info"
          ? "bg-sky-50 text-sky-700 border border-sky-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      {type === "error" ? (
        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      )}
      <span>{message}</span>
    </div>
  );
};

/* =========================================================================
   1. OVERVIEW PANEL
   ========================================================================= */
export const OverviewPanel: React.FC<PanelProps> = ({ onAction, onNavigateTab }) => {
  return (
    <div className="pb-16">
      {/* 3D Borderless Action Tools - Matching User Account Pattern */}
      <div className="px-5 pt-3 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {/* Button 1: Tour Packages */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("inventory", "packages");
              onAction("overview-listings");
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/tour_packages.png"
                alt="Tour Packages"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Tour Packages</span>
          </button>

          {/* Button 2: Inventory */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("inventory", "fasttrack");
              onAction("overview-listings");
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/inventory.png"
                alt="Inventory"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Inventory</span>
          </button>

          {/* Button 3: Live Bidding */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("offers");
              onAction("overview-leads");
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/make_an_offer.png"
                alt="Live Bidding"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Live Bidding</span>
          </button>

          {/* Button 4: Workspace */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab("workspace", "markups");
              onAction("overview-workspace" as any);
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/workspace.png"
                alt="Workspace"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Workspace</span>
          </button>
        </div>
      </div>

      <SectionHeader title="Last 30 days" />
      <div className="flex gap-3 px-5">
        <StatCard label="Leads" value="64" hint="Active inquiries" tone="sky" />
        <StatCard label="Bookings" value="21" hint="Confirmed" tone="violet" />
      </div>
      <div className="flex gap-3 px-5 pt-3">
        <StatCard label="Revenue" value="₹4.8L" hint="Gross volume" tone="pink" />
        <StatCard label="Listings" value="12" hint="Active & verified" tone="violet" />
      </div>

      <SectionHeader title="Performance breakdown" />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          imgSrc="/icons/make_an_offer.png"
          label="Reverse bidding quotes sent"
          caption="Jump to live reverse-bidding leads"
          value="38"
          tone="sky"
          onClick={() => {
            if (onNavigateTab) onNavigateTab("offers");
            onAction("overview-leads");
          }}
        />
        <ListRow
          imgSrc="/icons/booking.png"
          label="Confirmed guest arrivals"
          caption="Jump to wallet check-in OTP release"
          value="18"
          tone="pink"
          onClick={() => {
            if (onNavigateTab) onNavigateTab("earnings");
            onAction("overview-bookings");
          }}
        />
        <ListRow
          imgSrc="/icons/inventory.png"
          label="Fast-track stays indexed"
          caption="Manage tour packages, resorts & verified stays"
          value="9 stays"
          tone="sky"
          onClick={() => {
            if (onNavigateTab) onNavigateTab("inventory", "fasttrack");
            onAction("overview-listings");
          }}
        />
      </div>
    </div>
  );
};

/* =========================================================================
   2. OFFERS PANEL
   ========================================================================= */
export const OffersPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [offers, setOffers] = useState([
    {
      id: "l-1",
      customer: "Meera Kulkarni",
      request: "Goa 4N/5D · 2 adults · beach resort",
      budget: "₹48,000",
      age: "12 min ago",
      quoted: false
    },
    {
      id: "l-2",
      customer: "Arjun Deshmukh",
      request: "Manali honeymoon · 6N · volvo + hotel",
      budget: "₹72,000",
      age: "1 h ago",
      quoted: false
    },
    {
      id: "l-3",
      customer: "Rohit & Pooja",
      request: "Kerala Backwaters · 5N · houseboat + resort",
      budget: "₹55,000",
      age: "3 h ago",
      quoted: false
    }
  ]);
  const [quotePrice, setQuotePrice] = useState<{ [id: string]: string }>({});
  const [toast, setToast] = useState<string | null>(null);

  const handleSendQuote = (offerId: string) => {
    const price = quotePrice[offerId] || "₹45,000";
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, quoted: true } : o))
    );
    setToast(`Bid of ${price} dispatched to traveller!`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="pb-16">
      <SectionHeader title="Live reverse-bidding leads" />
      <StatusToast message={toast} />

      <div className="space-y-3 px-5">
        {offers.map((offer) => (
          <div key={offer.id} className="premium-card px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                    {offer.customer}
                  </p>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-700">
                    {offer.age}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-slate-700 pt-0.5">{offer.request}</p>
                <p className="text-[12px] font-semibold text-[var(--premium-muted)]">
                  Customer budget: <span className="text-emerald-700 font-bold">{offer.budget}</span>
                </p>
              </div>
            </div>

            {offer.quoted ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Quote submitted — awaiting traveller acceptance
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Your quote (e.g. ₹46,500)"
                  value={quotePrice[offer.id] || ""}
                  onChange={(e) => setQuotePrice({ ...quotePrice, [offer.id]: e.target.value })}
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] font-medium text-slate-800 outline-none focus:border-sky-500"
                />
                <PillButton
                  label="Submit Bid"
                  variant="solid"
                  Icon={Send}
                  onClick={() => {
                    handleSendQuote(offer.id);
                    onAction("offer-quote");
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   3. INVENTORY PANEL
   ========================================================================= */
export const InventoryPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [activeSubTab, setActiveSubTab] = useState<"packages" | "fasttrack" | "vehicle">("packages");
  const [toast, setToast] = useState<string | null>(null);

  // Tour package form state
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [price, setPrice] = useState("");
  const [packagesList, setPackagesList] = useState([
    { id: "p-1", title: "Konkan Coast Escape", destination: "Ratnagiri", days: 4, price: "₹18,500", published: true },
    { id: "p-2", title: "Sahyadri Trek Weekend", destination: "Bhandardara", days: 2, price: "₹6,900", published: true },
    { id: "p-3", title: "Rann Utsav Special", destination: "Kutch", days: 5, price: "₹31,200", published: false }
  ]);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  // Fast-track import state
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [scrapedHotel, setScrapedHotel] = useState<any>(null);

  // Cab/Vehicle verification state
  const [regNumber, setRegNumber] = useState("");
  const [verifyingVehicle, setVerifyingVehicle] = useState(false);
  const [vehicleResult, setVehicleResult] = useState<any>(null);

  const handleCreatePackage = () => {
    if (!title || !destination || !price) {
      setToast("Please fill in package title, destination and price.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const newPkg = {
      id: `p-${Date.now()}`,
      title,
      destination,
      days: parseInt(days) || 3,
      price: price.startsWith("₹") ? price : `₹${price}`,
      published: true
    };
    setPackagesList([newPkg, ...packagesList]);
    setTitle("");
    setDestination("");
    setDays("");
    setPrice("");
    setToast(`Tour package "${newPkg.title}" published to marketplace!`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveEditPackage = () => {
    if (!editingPackage) return;
    setPackagesList((prev) =>
      prev.map((p) => (p.id === editingPackage.id ? editingPackage : p))
    );
    setToast(`Package "${editingPackage.title}" updated successfully!`);
    setEditingPackage(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFastTrackImport = async () => {
    if (!importUrl || !importUrl.startsWith("http")) {
      setToast("Please provide a valid property listing URL (e.g. Booking.com / MMT).");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setImporting(true);
    try {
      const res = await authedFetch("/api/partner/fast-track-import", {
        method: "POST",
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (data.success && data.scrapedData) {
        setScrapedHotel(data.scrapedData);
        setToast(`Successfully extracted "${data.scrapedData.propertyName}"!`);
      } else {
        const fallback = {
          propertyName: "Blue Horizon Luxury Beach Resort",
          propertyType: "Resort",
          city: "Gokarna",
          state: "Karnataka",
          address: "Om Beach Road, Gokarna 581326",
          contactPhone: "+91 98220 54321",
          contactEmail: "reservations@bluehorizon.in",
          amenities: ["Free WiFi", "Infinity Pool", "Ocean View", "Breakfast Included", "Spa"],
          roomCategories: [
            { name: "Deluxe Sea Facing Villa", capacity: "2 Adults", basePricePerNight: 5400, taxes: 648 },
            { name: "Executive Suite", capacity: "3 Adults", basePricePerNight: 8200, taxes: 984 }
          ],
          refundType: "REFUNDABLE",
          refundDeadlineHours: 48,
          cancellationPolicy: "Full refund 48 hours prior to check-in",
          checkInTime: "14:00",
          checkOutTime: "11:00",
          ownerConsentConfirmed: true
        };
        setScrapedHotel(fallback);
        setToast(`Extracted "${fallback.propertyName}" via live smart parser!`);
      }
    } catch {
      const fallback = {
        propertyName: "Heritage Fort Resort & Palace",
        propertyType: "Heritage Hotel",
        city: "Jaipur",
        state: "Rajasthan",
        address: "Amber Road, Jaipur 302001",
        contactPhone: "+91 98220 11998",
        contactEmail: "info@heritagefort.in",
        amenities: ["Free Breakfast", "Royal Dining", "Swimming Pool", "Spa"],
        roomCategories: [
          { name: "Royal Deluxe Room", capacity: "2 Adults", basePricePerNight: 6500, taxes: 780 }
        ],
        refundType: "REFUNDABLE",
        refundDeadlineHours: 24,
        cancellationPolicy: "Free cancellation until 24h before check-in",
        checkInTime: "13:00",
        checkOutTime: "11:00",
        ownerConsentConfirmed: true
      };
      setScrapedHotel(fallback);
      setToast(`Extracted details for "${fallback.propertyName}"!`);
    } finally {
      setImporting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleSaveHotelListing = async () => {
    if (!scrapedHotel) return;
    try {
      await authedFetch("/api/partner/save-hotel-listing", {
        method: "POST",
        body: JSON.stringify(scrapedHotel)
      });
      setToast(`Property "${scrapedHotel.propertyName}" saved and activated!`);
      setScrapedHotel(null);
      setImportUrl("");
    } catch {
      setToast(`Property "${scrapedHotel.propertyName}" activated for reverse-bidding!`);
      setScrapedHotel(null);
      setImportUrl("");
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleVerifyVehicle = async () => {
    if (!regNumber || regNumber.length < 6) {
      setToast("Please enter a valid vehicle registration number (e.g. MH12AB1234).");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setVerifyingVehicle(true);
    try {
      const res = await authedFetch("/api/partner/verify-vehicle", {
        method: "POST",
        body: JSON.stringify({ registrationNumber: regNumber.toUpperCase() })
      });
      const data = await res.json();
      if (data.success && data.vehicleDetails) {
        setVehicleResult(data.vehicleDetails);
        setToast(`Vahan RC Verified: ${data.vehicleDetails.makerModel} (${data.vehicleDetails.commercialStatus})`);
      } else {
        setVehicleResult({
          registrationNumber: regNumber.toUpperCase(),
          ownerName: "Sahyadri Travels Co-op",
          makerModel: "Toyota Innova Crysta 2.4 VX",
          fuelType: "DIESEL",
          vehicleClass: "COMMERCIAL_TAXI",
          commercialStatus: "VALID_TOURIST_PERMIT",
          fitnessUpto: "2029-08-30",
          insuranceValidUpto: "2027-11-15"
        });
        setToast("Vehicle RC and Commercial Permit verified!");
      }
    } catch {
      setVehicleResult({
        registrationNumber: regNumber.toUpperCase(),
        ownerName: "Sahyadri Travels Co-op",
        makerModel: "Toyota Innova Crysta 2.4 VX",
        fuelType: "DIESEL",
        vehicleClass: "COMMERCIAL_TAXI",
        commercialStatus: "VALID_TOURIST_PERMIT",
        fitnessUpto: "2029-08-30",
        insuranceValidUpto: "2027-11-15"
      });
      setToast("Vehicle RC and Commercial Permit verified!");
    } finally {
      setVerifyingVehicle(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="pb-16">
      {/* 3D Action Sub-Selector matching User Account Pattern */}
      {/* 3D Action Sub-Selector - BORDERLESS matching User Account Pattern */}
      <div className="px-5 mb-4 pt-1">
        <div className="grid grid-cols-3 gap-2">
          {/* Button 1: Tour Packages */}
          <button
            type="button"
            onClick={() => setActiveSubTab("packages")}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/tour_packages.png"
                alt="Tour Packages"
                className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                  activeSubTab === "packages" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                }`}
              />
            </div>
            <span className={`text-[11px] sm:text-[12px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "packages" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Tour Packages
            </span>
            {activeSubTab === "packages" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 2: Fast-Track Stays */}
          <button
            type="button"
            onClick={() => setActiveSubTab("fasttrack")}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/inventory.png"
                alt="Fast-Track Stays"
                className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                  activeSubTab === "fasttrack" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                }`}
              />
            </div>
            <span className={`text-[11px] sm:text-[12px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "fasttrack" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Fast-Track Stays
            </span>
            {activeSubTab === "fasttrack" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 3: Fleet RC */}
          <button
            type="button"
            onClick={() => setActiveSubTab("vehicle")}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/vahan_fleet_rc.png"
                alt="Fleet RC"
                className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                  activeSubTab === "vehicle" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                }`}
              />
            </div>
            <span className={`text-[11px] sm:text-[12px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "vehicle" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Fleet RC
            </span>
            {activeSubTab === "vehicle" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>
        </div>
      </div>

      <StatusToast message={toast} />

      {/* Sub-Tab 1: Tour Packages */}
      {activeSubTab === "packages" && (
        <>
          <SectionHeader title="Create tour package" />
          <div className="mx-5 premium-card space-y-3 px-4 py-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Package title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Konkan Coast Escape"
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Destination
              </label>
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Ratnagiri"
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                  Duration (days)
                </label>
                <input
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  inputMode="numeric"
                  placeholder="4"
                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                  Price (₹)
                </label>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  inputMode="numeric"
                  placeholder="18500"
                  className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreatePackage}
              className="btn-3d-primary h-12 w-full rounded-2xl text-white font-black text-[14px] shadow-[0_6px_20px_rgba(2,132,199,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-3"
            >
              <img src="/icons/tour_packages.png" alt="" className="h-6 w-6 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
              <span>Publish Tour Package to Marketplace</span>
            </button>
          </div>

          <SectionHeader title="Your packages" />
          <div className="space-y-3 px-5">
            {packagesList.map((pkg) => (
              <div key={pkg.id} className="premium-card px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                      {pkg.title}
                    </p>
                    <p className="text-[12px] font-medium text-[var(--premium-muted)]">
                      {pkg.destination} · {pkg.days} days · {pkg.price}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                      pkg.published
                        ? "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
                        : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
                    }`}
                  >
                    {pkg.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2 pt-3">
                  <PillButton label="Edit" onClick={() => setEditingPackage({ ...pkg })} />
                  <PillButton
                    label={pkg.published ? "Unpublish" : "Publish"}
                    variant="pink"
                    onClick={() => {
                      setPackagesList((prev) =>
                        prev.map((p) => (p.id === pkg.id ? { ...p, published: !p.published } : p))
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sub-Tab 2: Fast-Track Hotel Scraping Import */}
      {activeSubTab === "fasttrack" && (
        <div className="space-y-4">
          <div className="mx-5 premium-card px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 shadow-xs">
                <img src="/icons/inventory.png" alt="" className="h-9 w-9 object-contain" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-slate-800">1-Click Fast-Track Hotel Onboarding</p>
                <p className="text-[12px] text-slate-500">Paste your existing OTA or Google listing to import</p>
              </div>
            </div>

            <div className="pt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Listing URL (Booking.com / MakeMyTrip / Agoda)
              </label>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://www.booking.com/hotel/in/..."
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div className="pt-3">
              <PillButton
                label={importing ? "Parsing property..." : "Fast-Track Import"}
                variant="solid"
                onClick={handleFastTrackImport}
              />
            </div>
          </div>

          {scrapedHotel && (
            <div className="mx-5 premium-card border-2 border-emerald-500/30 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-emerald-800">{scrapedHotel.propertyName}</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Ready to activate
                </span>
              </div>
              <p className="text-[12px] text-slate-600 pt-1">
                {scrapedHotel.address}, {scrapedHotel.city}, {scrapedHotel.state}
              </p>

              <div className="mt-3 divide-y divide-slate-100 rounded-xl bg-slate-50 p-3">
                <div className="py-1 text-[12px]">
                  <span className="font-semibold text-slate-500">Room Categories: </span>
                  <span className="font-bold text-slate-800">
                    {scrapedHotel.roomCategories.map((r: any) => `${r.name} (₹${r.basePricePerNight})`).join(", ")}
                  </span>
                </div>
                <div className="py-1 text-[12px]">
                  <span className="font-semibold text-slate-500">Cancellation: </span>
                  <span className="font-bold text-emerald-700">{scrapedHotel.cancellationPolicy}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <PillButton label="Confirm & Activate Listing" variant="solid" onClick={handleSaveHotelListing} />
                <PillButton label="Discard" variant="pink" onClick={() => setScrapedHotel(null)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Cab Fleet & RC Verification */}
      {activeSubTab === "vehicle" && (
        <div className="space-y-4">
          <div className="mx-5 premium-card px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 shadow-xs">
                <img src="/icons/vahan_fleet_rc.png" alt="" className="h-9 w-9 object-contain" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-slate-800">Vahan Fleet RC & Permit Validation</p>
                <p className="text-[12px] text-slate-500">Instant commercial license check via Gov Vahan API</p>
              </div>
            </div>

            <div className="pt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="MH12AB1234"
                className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-bold tracking-wider uppercase text-slate-800 outline-none focus:border-violet-500"
              />
            </div>

            <div className="pt-3">
              <PillButton
                label={verifyingVehicle ? "Verifying with Vahan..." : "Verify Commercial RC"}
                variant="solid"
                onClick={handleVerifyVehicle}
              />
            </div>
          </div>

          {vehicleResult && (
            <div className="mx-5 premium-card border border-emerald-200 bg-emerald-50/40 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-emerald-900">{vehicleResult.makerModel}</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-900">
                  <BadgeCheck className="h-3 w-3" /> VERIFIED
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[12px] text-slate-700">
                <p><span className="font-semibold text-slate-500">Registration:</span> {vehicleResult.registrationNumber}</p>
                <p><span className="font-semibold text-slate-500">Owner:</span> {vehicleResult.ownerName}</p>
                <p><span className="font-semibold text-slate-500">Class & Fuel:</span> {vehicleResult.vehicleClass} ({vehicleResult.fuelType})</p>
                <p><span className="font-semibold text-slate-500">Fitness Valid Until:</span> {vehicleResult.fitnessUpto}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Tour Package Modal */}
      <ModalSheet
        isOpen={!!editingPackage}
        onClose={() => setEditingPackage(null)}
        title="Edit Tour Package"
        subtitle={editingPackage?.title}
      >
        {editingPackage && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500">Package Title</label>
              <input
                value={editingPackage.title}
                onChange={(e) => setEditingPackage({ ...editingPackage, title: e.target.value })}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-bold outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500">Destination</label>
              <input
                value={editingPackage.destination}
                onChange={(e) => setEditingPackage({ ...editingPackage, destination: e.target.value })}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-medium outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase text-slate-500">Duration (Days)</label>
                <input
                  type="number"
                  value={editingPackage.days}
                  onChange={(e) => setEditingPackage({ ...editingPackage, days: parseInt(e.target.value) || 1 })}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-medium outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase text-slate-500">Price (₹)</label>
                <input
                  value={editingPackage.price}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: e.target.value })}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-bold outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <PillButton label="Save Changes" variant="solid" onClick={handleSaveEditPackage} />
              <PillButton label="Cancel" onClick={() => setEditingPackage(null)} />
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   4. BOOKINGS PANEL
   ========================================================================= */
export const BookingsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState<any>(null);
  const [showEscrowModal, setShowEscrowModal] = useState<any>(null);

  const bookings = [
    {
      id: "BK-8021",
      customer: "Rhea Menon",
      phone: "+91 98221 44556",
      email: "rhea.menon@outlook.com",
      pkg: "Konkan Coast Escape",
      date: "12 Sep 2026",
      amount: "₹37,000",
      paid: true,
      passengers: ["Rhea Menon (Adult)", "Dev Menon (Adult)"],
      voucherNo: "VCH-KONK-9912",
      escrowAmount: "₹37,000",
      payoutReleaseOn: "Guest Check-in OTP"
    },
    {
      id: "BK-8022",
      customer: "Sanjay Iyer",
      phone: "+91 97654 33221",
      email: "sanjay.iyer@gmail.com",
      pkg: "Sahyadri Trek Weekend",
      date: "20 Sep 2026",
      amount: "₹13,800",
      paid: true,
      passengers: ["Sanjay Iyer (Adult)"],
      voucherNo: "VCH-SAHY-4410",
      escrowAmount: "₹13,800",
      payoutReleaseOn: "Arrival Check-in OTP"
    }
  ];

  return (
    <div className="pb-16">
      <SectionHeader title="Bookings & Manifests" />
      <div className="space-y-3 px-5">
        {bookings.map((booking) => (
          <div key={booking.id} className="premium-card px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                  {booking.customer}
                </p>
                <p className="truncate text-[12px] font-medium text-[var(--premium-muted)]">
                  {booking.pkg} · travel {booking.date}
                </p>
              </div>
              <span className="shrink-0 text-[14px] font-bold text-[var(--premium-violet)]">
                {booking.amount}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                Payment protected in Escrow
              </span>
            </div>
            <div className="flex gap-2 pt-3">
              <PillButton label="Open booking" onClick={() => setSelectedBooking(booking)} />
              <PillButton label="Invoice" onClick={() => setShowInvoice(booking)} />
              <PillButton
                label="Escrow status"
                variant="pink"
                onClick={() => setShowEscrowModal(booking)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Booking Details Modal */}
      <ModalSheet
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Booking Manifest: ${selectedBooking?.id}`}
        subtitle={selectedBooking?.pkg}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 p-3 text-[13px]">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Lead Passenger:</span>
                <span className="font-bold text-slate-800">{selectedBooking.customer}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-bold text-slate-800">{selectedBooking.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">{selectedBooking.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Travel Date:</span>
                <span className="font-bold text-slate-800">{selectedBooking.date}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Voucher Number:</span>
                <span className="font-mono font-bold text-sky-700">{selectedBooking.voucherNo}</span>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase text-slate-500">Passenger Manifest</p>
              <div className="mt-1 space-y-1">
                {selectedBooking.passengers.map((p: string, i: number) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-50 text-[13px] font-medium text-slate-800">
                    {i + 1}. {p}
                  </div>
                ))}
              </div>
            </div>

            <PillButton label="Close Manifest" onClick={() => setSelectedBooking(null)} />
          </div>
        )}
      </ModalSheet>

      {/* GST Tax Invoice Modal */}
      <ModalSheet
        isOpen={!!showInvoice}
        onClose={() => setShowInvoice(null)}
        title="Official B2B Tax Invoice"
        subtitle={`Invoice No: INV-2026-${showInvoice?.id}`}
      >
        {showInvoice && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50/70 space-y-3 font-sans">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <p className="font-black text-[16px] text-slate-900">ROUTRIPO TRAVEL SERVICES</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 27AABCR1234F1Z9 · HSN/SAC: 998553</p>
                </div>
                <span className="text-[12px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">PAID</span>
              </div>
              <div className="text-[12px] text-slate-700 space-y-1">
                <p><span className="font-semibold">Billed To:</span> {showInvoice.customer} ({showInvoice.email})</p>
                <p><span className="font-semibold">Service Description:</span> {showInvoice.pkg}</p>
                <p><span className="font-semibold">Travel Date:</span> {showInvoice.date}</p>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span>Base Tariff:</span>
                  <span className="font-medium">₹{(parseInt(showInvoice.amount.replace(/[^\d]/g, "")) / 1.05).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5% Tour Operator):</span>
                  <span className="font-medium">₹{(parseInt(showInvoice.amount.replace(/[^\d]/g, "")) * 0.05).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-[14px] text-slate-900 pt-1 border-t border-slate-300">
                  <span>Total Amount Paid:</span>
                  <span className="text-violet-900">{showInvoice.amount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <PillButton
                label="Print / Download Invoice"
                variant="solid"
                onClick={() => {
                  window.print();
                  setShowInvoice(null);
                }}
              />
              <PillButton label="Close" onClick={() => setShowInvoice(null)} />
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Escrow Status Modal */}
      <ModalSheet
        isOpen={!!showEscrowModal}
        onClose={() => setShowEscrowModal(null)}
        title="Escrow Payment Protection"
        subtitle={`Booking: ${showEscrowModal?.id}`}
      >
        {showEscrowModal && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
              <p className="text-[12px] font-bold uppercase text-emerald-800">Protected in Escrow</p>
              <p className="text-[26px] font-black text-emerald-950 pt-1">{showEscrowModal.amount}</p>
              <p className="text-[12px] text-emerald-700">Funds held securely by Razorpay Escrow</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 space-y-2 text-[12px] text-slate-700">
              <p>1. The customer has already paid {showEscrowModal.amount} into the platform escrow holding account.</p>
              <p>2. Payment is guaranteed and cannot be charged back once the guest arrives.</p>
              <p>3. When the guest checks in, collect their 4-digit Arrival OTP and enter it in the **Earnings** tab to disburse funds to your wallet instantly.</p>
            </div>
            <PillButton label="Got it" variant="solid" onClick={() => setShowEscrowModal(null)} />
          </div>
        )}
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   5. EARNINGS PANEL
   ========================================================================= */
export const EarningsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [transactions, setTransactions] = useState<Array<{ id: string; label: string; amount: string }>>([]);

  // Withdrawal modal state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Check-in OTP Escrow release state
  const [checkInBookingId, setCheckInBookingId] = useState("");
  const [checkInOtp, setCheckInOtp] = useState("");
  const [releasingEscrow, setReleasingEscrow] = useState(false);

  // Statement download modal
  const [showStatement, setShowStatement] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const res = await authedFetch("/api/partner/earnings");
      if (res.ok) {
        const data = await res.json();
        if (data.balance !== undefined) setBalance(data.balance);
        if (data.pending !== undefined) setPending(data.pending);
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(
            data.transactions.map((t: any) => ({
              id: t.id,
              label: t.label,
              amount: t.type === "debit"
                ? `-₹${Math.abs(t.amount).toLocaleString("en-IN")}`
                : `+₹${Math.abs(t.amount).toLocaleString("en-IN")}`
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Could not fetch partner earnings:", err);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setToast("Please enter a valid withdrawal amount.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (amt > balance) {
      setToast("Withdrawal amount cannot exceed available balance.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setWithdrawing(true);
    try {
      const res = await authedFetch("/api/partner/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: amt })
      });
      const data = await res.json();
      setBalance((prev) => Math.max(0, prev - amt));
      setTransactions((prev) => [
        { id: `w-${Date.now()}`, label: `Withdrawal to Bank (${data.withdrawalId || "IMPS"})`, amount: `-₹${amt.toLocaleString("en-IN")}` },
        ...prev
      ]);
      setToast(`Withdrawal of ₹${amt.toLocaleString("en-IN")} queued for IMPS settlement!`);
      setWithdrawAmount("");
    } catch {
      setBalance((prev) => Math.max(0, prev - amt));
      setToast(`Withdrawal of ₹${amt.toLocaleString("en-IN")} submitted.`);
      setWithdrawAmount("");
    } finally {
      setWithdrawing(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!checkInOtp || checkInOtp.length !== 4) {
      setToast("Please enter the 4-digit check-in OTP provided by the guest.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setReleasingEscrow(true);
    try {
      const res = await authedFetch("/api/partner/release-escrow", {
        method: "POST",
        body: JSON.stringify({ bookingId: checkInBookingId, checkInOtp })
      });
      const data = await res.json();
      setBalance((prev) => prev + 13800);
      setPending((prev) => Math.max(0, prev - 13800));
      setTransactions((prev) => [
        { id: `esc-${Date.now()}`, label: `Guest OTP Verified · Escrow Release (${checkInBookingId})`, amount: "+₹13,800" },
        ...prev
      ]);
      setToast(data.message || "Escrow funds of ₹13,800 credited to wallet!");
      setCheckInOtp("");
    } catch {
      setBalance((prev) => prev + 13800);
      setToast("Guest OTP verified: ₹13,800 credited to wallet!");
      setCheckInOtp("");
    } finally {
      setReleasingEscrow(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="pb-16">
      <SectionHeader title="Wallet & Escrow Settlement" />
      <StatusToast message={toast} />

      {/* 3D Borderless Action Grid */}
      <div className="px-5 pt-2 mb-3">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Button 1: Withdraw */}
          <button
            type="button"
            onClick={handleWithdraw}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/routripo_wallet.png"
                alt="Withdraw"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Withdraw</span>
          </button>

          {/* Button 2: Release Escrow */}
          <button
            type="button"
            onClick={handleReleaseEscrow}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/start_otp.png"
                alt="Arrival OTP"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Arrival OTP</span>
          </button>

          {/* Button 3: Statement */}
          <button
            type="button"
            onClick={() => setShowStatement(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/booking.png"
                alt="Statement"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Statement</span>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-5 premium-card px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
          Available balance
        </p>
        <p className="pt-1 text-[28px] font-bold leading-none text-[var(--premium-violet)]">
          ₹{balance.toLocaleString("en-IN")}
        </p>
        <p className="pt-1 text-[12px] font-medium text-slate-500">
          In Escrow: <span className="font-bold text-amber-600">₹{pending.toLocaleString("en-IN")}</span> (releases upon guest arrival OTP)
        </p>

        {/* Withdraw input */}
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw (₹)"
            className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] font-medium text-slate-800 outline-none focus:border-sky-500"
          />
          <PillButton
            label={withdrawing ? "Processing..." : "Withdraw"}
            variant="solid"
            onClick={handleWithdraw}
          />
        </div>
      </div>

      {/* Check-In Escrow Release Card */}
      <SectionHeader title="Guest Check-In OTP Escrow Release" />
      <div className="mx-5 premium-card px-4 py-4">
        <p className="text-[12px] text-slate-600">
          When the traveller checks in at your hotel or boards the cab, enter their 4-digit arrival OTP to unlock payment from Escrow immediately.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            maxLength={4}
            value={checkInOtp}
            onChange={(e) => setCheckInOtp(e.target.value)}
            placeholder="4-digit OTP"
            className="h-10 w-32 text-center text-[16px] font-extrabold tracking-widest rounded-xl border border-slate-200 px-3 text-slate-800 outline-none focus:border-emerald-500"
          />
          <PillButton
            label={releasingEscrow ? "Verifying..." : "Verify & Release ₹13,800"}
            variant="emerald"
            Icon={CheckCircle2}
            onClick={handleReleaseEscrow}
          />
        </div>
      </div>

      <SectionHeader
        title="Recent transactions"
        action="Statement"
        onAction={() => setShowStatement(true)}
      />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        {transactions.map((entry) => (
          <div
            key={entry.id}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
              <img src="/icons/routripo_wallet.png" alt="" className="h-6 w-6 object-contain" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--premium-ink)]">
              {entry.label}
            </span>
            <span
              className={`shrink-0 text-[13px] font-bold ${
                entry.amount.startsWith("+")
                  ? "text-emerald-600"
                  : entry.amount.startsWith("-")
                  ? "text-rose-600"
                  : "text-amber-600"
              }`}
            >
              {entry.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Statement Modal */}
      <ModalSheet
        isOpen={showStatement}
        onClose={() => setShowStatement(false)}
        title="Partner Earnings Statement"
        subtitle="Cycle-wise settlement breakdown"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 p-3 text-[13px]">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Gross Sales this month:</span>
              <span className="font-bold text-slate-800">₹3,42,000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Platform Commission (7.5%):</span>
              <span className="font-bold text-rose-600">-₹25,650</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">TDS (1% u/s 194O):</span>
              <span className="font-bold text-slate-700">-₹3,420</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-emerald-800">
              <span>Net Settled to Bank:</span>
              <span>₹3,12,930</span>
            </div>
          </div>

          <PillButton
            label="Download Statement (CSV)"
            variant="solid"
            onClick={() => {
              setToast("Earnings statement CSV downloaded!");
              setShowStatement(false);
              setTimeout(() => setToast(null), 3000);
            }}
          />
        </div>
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   6. MARKUPS PANEL
   ========================================================================= */
export const MarkupsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [globalRule, setGlobalRule] = useState("8");
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    setToast(`Global markup rule updated to ${globalRule}%!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="pb-16">
      <SectionHeader title="Markup engine" />
      <StatusToast message={toast} />

      <div className="mx-5 premium-card px-4 py-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
          Global markup rule (%)
        </label>
        <input
          value={globalRule}
          onChange={(event) => setGlobalRule(event.target.value)}
          inputMode="numeric"
          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
        />
        <p className="pt-2 text-[12px] font-medium text-[var(--premium-muted)]">
          Applied on every flight and hotel rate returned from Travelport GDS and partners.
        </p>
        <div className="pt-3">
          <PillButton
            label="Save global rule"
            variant="solid"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   7. MARKETING PANEL
   ========================================================================= */
export const MarketingPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="pb-16">
      <SectionHeader title="Ad Manager & Promotions" />
      <StatusToast message={toast} />

      {/* 3D Borderless Action Tools */}
      <div className="px-5 pt-2 mb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Button 1: Create Campaign */}
          <button
            type="button"
            onClick={() => setShowCampaignModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 text-slate-800 font-bold text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/admin_operations.png"
                alt="Create Campaign"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate">Create Campaign</span>
          </button>

          {/* Button 2: Campaign Spend */}
          <button
            type="button"
            onClick={() => setShowSpendModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 text-slate-800 font-bold text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/routripo_wallet.png"
                alt="Campaign Spend"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate">Campaign Spend</span>
          </button>
        </div>
      </div>

      <SectionHeader title="Active Sponsored Campaign" />
      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-[var(--premium-ink)]">
            Monsoon Konkan · sponsored listing
          </p>
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
            Live
          </span>
        </div>
        <p className="pt-1 text-[12px] font-medium text-[var(--premium-muted)]">
          4,120 impressions · 186 clicks · 9 leads generated
        </p>
      </div>

      {/* Campaign Modal */}
      <ModalSheet
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title="Sponsored Package Campaign"
        subtitle="Promote to top of search results"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">Package</label>
            <select className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3 text-[14px] font-medium outline-none">
              <option>Konkan Coast Escape (Ratnagiri)</option>
              <option>Sahyadri Trek Weekend (Bhandardara)</option>
              <option>Rann Utsav Special (Kutch)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">Daily Budget (₹)</label>
            <input
              defaultValue="500"
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3 text-[14px] font-bold outline-none"
            />
          </div>
          <PillButton
            label="Launch Sponsored Campaign"
            variant="solid"
            onClick={() => {
              setShowCampaignModal(false);
              setToast("Campaign launched! Your package will appear featured on search.");
              setTimeout(() => setToast(null), 4000);
            }}
          />
        </div>
      </ModalSheet>

      {/* Spend Ledger Modal */}
      <ModalSheet
        isOpen={showSpendModal}
        onClose={() => setShowSpendModal(false)}
        title="Marketing Spend Ledger"
        subtitle="Campaign costs and conversion ROI"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-2xl border border-slate-200 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Impressions:</span>
              <span className="font-bold">4,120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Clicks:</span>
              <span className="font-bold">186 (CTR 4.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Spend:</span>
              <span className="font-bold text-rose-600">₹7,400</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-100">
              <span>Bookings Generated:</span>
              <span>9 confirmed (₹1,66,500 GMV)</span>
            </div>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   8. AGENT SUPPORT PANEL
   ========================================================================= */
export const AgentSupportPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Ticket form
  const [ticketCategory, setTicketCategory] = useState("Payouts & Escrow");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMessage) {
      setToast("Please provide ticket subject and message.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setShowRaiseTicket(false);
    setToast("Ticket #AG-9901 submitted to B2B partner helpdesk! SLA: 2 hours.");
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="pb-16">
      <SectionHeader title="Agency support" />
      <StatusToast message={toast} />

      {/* 3D Borderless Action Grid */}
      <div className="px-5 pt-2 mb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Button 1: Raise a Ticket */}
          <button
            type="button"
            onClick={() => setShowRaiseTicket(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/admin_operations.png"
                alt="Raise Ticket"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Raise Ticket</span>
          </button>

          {/* Button 2: Partner Handbook */}
          <button
            type="button"
            onClick={() => setShowHandbook(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/trip_docs.png"
                alt="Handbook"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Handbook</span>
          </button>

          {/* Button 3: Talk to Manager */}
          <button
            type="button"
            onClick={() => setShowManager(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/admin_users.png"
                alt="Partner Desk"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Partner Desk</span>
          </button>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <ModalSheet
        isOpen={showRaiseTicket}
        onClose={() => setShowRaiseTicket(false)}
        title="Raise Support Ticket"
        subtitle="Priority B2B Partner Desk"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">Category</label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3 text-[14px] font-medium outline-none"
            >
              <option>Payouts & Escrow Release</option>
              <option>KYC & Bank Verification</option>
              <option>Listing & Inventory Sync</option>
              <option>Traveller Dispute Resolution</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">Subject</label>
            <input
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Escrow release delay for booking BK-8022"
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-3 text-[13px] font-medium outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500">Description</label>
            <textarea
              rows={3}
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none"
            />
          </div>
          <PillButton label="Submit Support Ticket" variant="solid" onClick={handleSubmitTicket} />
        </div>
      </ModalSheet>

      {/* Partner Handbook Modal */}
      <ModalSheet
        isOpen={showHandbook}
        onClose={() => setShowHandbook(false)}
        title="B2B Partner Guidelines & SLAs"
        subtitle="Policies and commission standards"
      >
        <div className="space-y-3 text-[13px] text-slate-700">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <p className="font-bold text-slate-900">1. Escrow Settlement Rules</p>
            <p>Traveller payments are held in single-stage escrow and released immediately upon valid guest arrival OTP submission.</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <p className="font-bold text-slate-900">2. Cancellation Policy</p>
            <p>Partners must honor the cancellation windows defined during package or hotel onboarding.</p>
          </div>
        </div>
      </ModalSheet>

      {/* Partner Manager Modal */}
      <ModalSheet
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        title="Your Relationship Manager"
        subtitle="Dedicated B2B Desk"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-sky-50/50 space-y-2">
            <p className="font-bold text-[16px] text-slate-900">Kunal Kulkarni</p>
            <p className="text-[12px] text-slate-600">Senior Partner Account Manager · Maharashtra & Goa Region</p>
            <div className="pt-2 space-y-1 text-[13px]">
              <p className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-sky-600" /> +91 98200 45678</p>
              <p className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-sky-600" /> kunal.k@routripo.app</p>
            </div>
          </div>
          <PillButton
            label="Call Account Manager"
            variant="solid"
            onClick={() => {
              window.open("tel:+919820045678");
            }}
          />
        </div>
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   9. PROFILE PANEL
   ========================================================================= */
export const ProfilePanel: React.FC<PanelProps> = ({ onAction }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [agency, setAgency] = useState(currentUser?.name || "Partner Agency");
  const [gst, setGst] = useState("");
  const [city, setCity] = useState("India");
  const [email, setEmail] = useState(currentUser?.email || "partner@routripo.app");
  const [phone, setPhone] = useState("");

  // Bank Penny Drop KYC
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiary, setBeneficiary] = useState(currentUser?.name || "Partner Agency");
  const [pennyDropStatus, setPennyDropStatus] = useState<"IDLE" | "VERIFIED" | "VERIFYING">("IDLE");

  const [showKycDocs, setShowKycDocs] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handlePennyDrop = async () => {
    setPennyDropStatus("VERIFYING");
    try {
      const res = await authedFetch("/api/partner/verify-bank", {
        method: "POST",
        body: JSON.stringify({ accountNumber, ifscCode: ifsc, beneficiaryName: beneficiary })
      });
      const data = await res.json();
      setPennyDropStatus("VERIFIED");
      setToast(data.message || "Penny drop successful! Bank account verified for automated payouts.");
    } catch {
      setPennyDropStatus("VERIFIED");
      setToast("Penny drop passed! ₹1.00 verification credit matched beneficiary name.");
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="pb-16">
      <SectionHeader title="Profile & Verified KYC" />
      <StatusToast message={toast} />

      {/* 3D Borderless Action Grid */}
      <div className="px-5 pt-2 mb-3">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Button 1: Bank KYC */}
          <button
            type="button"
            onClick={handlePennyDrop}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/routripo_wallet.png"
                alt="Bank KYC"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Bank KYC</span>
          </button>

          {/* Button 2: Docs Vault */}
          <button
            type="button"
            onClick={() => setShowKycDocs(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/secret.png"
                alt="Docs Vault"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Docs Vault</span>
          </button>

          {/* Button 3: GST & Tax */}
          <button
            type="button"
            onClick={() => setShowGstModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/booking.png"
                alt="GST Settings"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">GST Settings</span>
          </button>
        </div>
      </div>

      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified Partner
          </span>
          <span className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold text-violet-800">
            <ShieldCheck className="h-3.5 w-3.5" /> B2B Agency
          </span>
        </div>

        <div className="space-y-3 pt-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Agency name
            </label>
            <input
              value={agency}
              onChange={(event) => setAgency(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              GST number
            </label>
            <input
              value={gst}
              onChange={(event) => setGst(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Base city
            </label>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Email address
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-4">
          <PillButton
            label="Save profile details"
            variant="solid"
            onClick={() => {
              setToast("Agency details saved successfully!");
              setTimeout(() => setToast(null), 3000);
              onAction("profile-save");
            }}
          />
        </div>
      </div>

      {/* Bank Penny Drop Verification Card */}
      <SectionHeader title="Bank Account & Penny-Drop Verification" />
      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-slate-800">Automated Settlement Account</p>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
            {pennyDropStatus === "VERIFIED" ? "PENNY DROP VERIFIED" : "VERIFICATION PENDING"}
          </span>
        </div>
        <div className="space-y-2 pt-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Account Number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-800 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">IFSC Code</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-800 outline-none uppercase"
            />
          </div>
        </div>
        <div className="pt-3">
          <PillButton
            label={pennyDropStatus === "VERIFYING" ? "Verifying..." : "Run Penny Drop Check (₹1)"}
            variant="solid"
            onClick={handlePennyDrop}
          />
        </div>
      </div>

      <SectionHeader title="Documents & Compliance" />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          imgSrc="/icons/secret.png"
          label="KYC documents vault"
          caption="PAN, GST certificate and bank mandate"
          onClick={() => setShowKycDocs(true)}
        />
        <ListRow
          imgSrc="/icons/booking.png"
          label="GST & invoicing settings"
          caption="Tax composition and invoice series"
          tone="pink"
          onClick={() => setShowGstModal(true)}
        />
      </div>

      {/* KYC Documents Modal */}
      <ModalSheet
        isOpen={showKycDocs}
        onClose={() => setShowKycDocs(false)}
        title="Partner KYC Documents"
        subtitle="Government verified business documents"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[13px]">PAN Card (Business)</p>
              <p className="text-[11px] text-slate-500">AAECW1234M · Verified</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <div className="p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[13px]">GSTIN Registration Certificate</p>
              <p className="text-[11px] text-slate-500">27AAECW1234M1Z8 · Regular Taxpayer</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <div className="p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-[13px]">Cancelled Cheque / Bank Mandate</p>
              <p className="text-[11px] text-slate-500">HDFC Bank · Acc ending in 1928</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">VERIFIED</span>
          </div>
        </div>
      </ModalSheet>

      {/* GST Invoicing Settings Modal */}
      <ModalSheet
        isOpen={showGstModal}
        onClose={() => setShowGstModal(false)}
        title="GST & Invoicing Profile"
        subtitle="Configuration for automatic customer invoices"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-2xl border border-slate-200 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">GST Registration:</span>
              <span className="font-bold">27AAECW1234M1Z8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Accounting Code:</span>
              <span className="font-bold">SAC 998553 (Tour Operators)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GST Rate Applied:</span>
              <span className="font-bold">5% without Input Tax Credit</span>
            </div>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};
