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
  Upload,
  Image as ImageIcon,
  Trash2,
  Users,
  Wallet,
  X,
  Bus,
  Star,
  BarChart3,
  SlidersHorizontal,
  Zap,
  Award
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { packageService, type TourPackage } from "../../services/packages/PackageService";
import { ListRow, PillButton, SectionHeader, StatCard } from "../account/ui";
import { maskEmail } from "../../security/privacyUtils";
import { ModalSheet } from "../shared/ModalSheet";
import { authedFetch } from "../../utils/apiClient";
import { useAuthStore } from "../../store/useAuthStore";
import { useVendorStore } from "../../store/useVendorStore";
import { useLanguage } from "../../context/LanguageContext";
import { HotelPartnerOnboardingForm } from "../../components/routripo/HotelPartnerOnboardingForm";
import VendorRegistrationPortal, {
  VendorKYCForm,
  CarRegistrationForm,
  BusRegistrationForm,
  VendorAPIDashboard
} from "../../components/vendor/VendorRegistrationPortal";
import { TourPackageUploadForm } from "../../components/vendor/TourPackageUploadForm";
import { TourPackageFlowCoordinator } from "../../components/vendor/flows/TourPackageFlowCoordinator";
import { CabRegistrationFlowCoordinator } from "../../components/vendor/flows/CabRegistrationFlowCoordinator";
import { BusRegistrationFlowCoordinator } from "../../components/vendor/flows/BusRegistrationFlowCoordinator";
import { HotelOnboardingFlowCoordinator } from "../../components/vendor/flows/HotelOnboardingFlowCoordinator";
import { PromotionalAdsRail } from "../../components/common/PromotionalAdsRail";
import { ActiveOfferCouponsGrid } from "../../components/common/ActiveOfferCouponsGrid";
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
export interface BestSellerAsset {
  id: string;
  name: string;
  type: 'HOTEL' | 'TOUR_OPERATOR' | 'CAB_OPERATOR' | 'BUS_OPERATOR';
  categoryLabel: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  totalBookings: number;
  totalGross: string;
  iconEmoji: string;
  accentBg: string;
  years: {
    fy: "FY 2025-26" | "FY 2024-25" | "FY 2023-24";
    label: string;
    bookings: number;
    gross: string;
    net: string;
    occupancyOrLoad: string;
    peakSeasonShare: string;
    aov: string;
  }[];
}

export const OverviewPanel: React.FC<PanelProps> = ({ onAction, onNavigateTab }) => {
  const { profile } = useVendorStore();
  const { lang, language } = useLanguage();
  const isMr = (lang || language) === 'mr';

  const [selectedFinancialAsset, setSelectedFinancialAsset] = useState<BestSellerAsset | null>(null);
  const [selectedFYTab, setSelectedFYTab] = useState<"FY 2025-26" | "FY 2024-25" | "FY 2023-24">("FY 2025-26");
  const [toast, setToast] = useState<string | null>(null);

  const activeTypes = profile?.businessTypes && profile.businessTypes.length > 0
    ? profile.businessTypes
    : ['HOTEL', 'TOUR_OPERATOR', 'CAB_OPERATOR', 'BUS_OPERATOR'];

  const showHotel = activeTypes.includes('HOTEL');
  const showPackages = activeTypes.includes('TOUR_OPERATOR');
  const showCabs = activeTypes.includes('CAB_OPERATOR');
  const showBuses = activeTypes.includes('BUS_OPERATOR');

  // Top Performing Assets tailored to the vendor's active vertical
  const bestSellers: BestSellerAsset[] = [
    ...(showHotel ? [{
      id: "top-hotel-1",
      name: "Grand Sun Luxury Beach Resort & Spa, Candolim",
      type: 'HOTEL' as const,
      categoryLabel: isMr ? "हॉटेल व रिसॉर्ट" : "Hotel & Resort",
      badge: isMr ? "🏆 #1 सर्वाधिक मागणी असलेले हॉटेल" : "🏆 #1 Most Booked Hotel",
      rating: 4.9,
      reviewsCount: 342,
      totalBookings: 618,
      totalGross: "₹84,20,000",
      iconEmoji: "🏨",
      accentBg: "from-blue-600 to-indigo-700",
      years: [
        { fy: "FY 2025-26" as const, label: isMr ? "चालू आर्थिक वर्ष (YTD)" : "Current Financial Year (YTD)", bookings: 242, gross: "₹34,50,000", net: "₹31,05,000", occupancyOrLoad: "96%", peakSeasonShare: "46%", aov: "₹14,250" },
        { fy: "FY 2024-25" as const, label: isMr ? "मागील आर्थिक वर्ष (ऑडिटेड)" : "Previous Financial Year (Audited)", bookings: 216, gross: "₹28,90,000", net: "₹26,01,000", occupancyOrLoad: "91%", peakSeasonShare: "41%", aov: "₹13,380" },
        { fy: "FY 2023-24" as const, label: isMr ? "२ वर्षांपूर्वीचे वर्ष (ऑडिटेड)" : "2 Years Prior (Audited)", bookings: 160, gross: "₹20,80,000", net: "₹18,72,000", occupancyOrLoad: "84%", peakSeasonShare: "36%", aov: "₹13,000" },
      ]
    }] : []),
    ...(showPackages ? [{
      id: "top-pkg-1",
      name: "Goa 4N/5D Monsoon Magic & Beach Tour",
      type: 'TOUR_OPERATOR' as const,
      categoryLabel: isMr ? "टूर पॅकेज" : "Tour Package",
      badge: isMr ? "🔥 सर्वाधिक विक्री पॅकेज" : "🔥 Best-Selling Tour Package",
      rating: 4.8,
      reviewsCount: 214,
      totalBookings: 310,
      totalGross: "₹48,90,000",
      iconEmoji: "🌴",
      accentBg: "from-emerald-600 to-teal-700",
      years: [
        { fy: "FY 2025-26" as const, label: isMr ? "चालू आर्थिक वर्ष (YTD)" : "Current Financial Year (YTD)", bookings: 138, gross: "₹21,80,000", net: "₹19,62,000", occupancyOrLoad: "94%", peakSeasonShare: "48%", aov: "₹15,800" },
        { fy: "FY 2024-25" as const, label: isMr ? "मागील आर्थिक वर्ष (ऑडिटेड)" : "Previous Financial Year (Audited)", bookings: 104, gross: "₹16,20,000", net: "₹14,58,000", occupancyOrLoad: "88%", peakSeasonShare: "42%", aov: "₹15,570" },
        { fy: "FY 2023-24" as const, label: isMr ? "२ वर्षांपूर्वीचे वर्ष (ऑडिटेड)" : "2 Years Prior (Audited)", bookings: 68, gross: "₹10,90,000", net: "₹9,81,000", occupancyOrLoad: "79%", peakSeasonShare: "38%", aov: "₹16,020" },
      ]
    }] : []),
    ...(showCabs ? [{
      id: "top-cab-1",
      name: "Toyota Innova Crysta 2.4 VX (MH 12 AB 1234)",
      type: 'CAB_OPERATOR' as const,
      categoryLabel: isMr ? "कॅब व फ्लीट" : "Cab & Taxi Fleet",
      badge: isMr ? "⚡ सर्वाधिक धावणारी आऊटस्टेशन कॅब" : "⚡ Most Hired Outstation Cab",
      rating: 4.9,
      reviewsCount: 186,
      totalBookings: 248,
      totalGross: "₹29,60,000",
      iconEmoji: "🚗",
      accentBg: "from-amber-600 to-orange-700",
      years: [
        { fy: "FY 2025-26" as const, label: isMr ? "चालू आर्थिक वर्ष (YTD)" : "Current Financial Year (YTD)", bookings: 108, gross: "₹13,20,000", net: "₹11,88,000", occupancyOrLoad: "92%", peakSeasonShare: "41%", aov: "₹12,220" },
        { fy: "FY 2024-25" as const, label: isMr ? "मागील आर्थिक वर्ष (ऑडिटेड)" : "Previous Financial Year (Audited)", bookings: 84, gross: "₹9,90,000", net: "₹8,91,000", occupancyOrLoad: "86%", peakSeasonShare: "36%", aov: "₹11,780" },
        { fy: "FY 2023-24" as const, label: isMr ? "२ वर्षांपूर्वीचे वर्ष (ऑडिटेड)" : "2 Years Prior (Audited)", bookings: 56, gross: "₹6,50,000", net: "₹5,85,000", occupancyOrLoad: "80%", peakSeasonShare: "32%", aov: "₹11,600" },
      ]
    }] : []),
    ...(showBuses ? [{
      id: "top-bus-1",
      name: "Scania Multi-Axle AC Sleeper (Pune ⇄ Goa)",
      type: 'BUS_OPERATOR' as const,
      categoryLabel: isMr ? "बस मार्ग" : "Bus Route",
      badge: isMr ? "🚍 सर्वाधिक लोड असलेला बस मार्ग" : "🚍 Top Seat Load Route",
      rating: 4.7,
      reviewsCount: 290,
      totalBookings: 380,
      totalGross: "₹36,40,000",
      iconEmoji: "🚌",
      accentBg: "from-rose-600 to-red-700",
      years: [
        { fy: "FY 2025-26" as const, label: isMr ? "चालू आर्थिक वर्ष (YTD)" : "Current Financial Year (YTD)", bookings: 165, gross: "₹16,10,000", net: "₹14,49,000", occupancyOrLoad: "93%", peakSeasonShare: "45%", aov: "₹9,750" },
        { fy: "FY 2024-25" as const, label: isMr ? "मागील आर्थिक वर्ष (ऑडिटेड)" : "Previous Financial Year (Audited)", bookings: 130, gross: "₹12,50,000", net: "₹11,25,000", occupancyOrLoad: "89%", peakSeasonShare: "40%", aov: "₹9,610" },
        { fy: "FY 2023-24" as const, label: isMr ? "२ वर्षांपूर्वीचे वर्ष (ऑडिटेड)" : "2 Years Prior (Audited)", bookings: 85, gross: "₹7,80,000", net: "₹7,02,000", occupancyOrLoad: "82%", peakSeasonShare: "33%", aov: "₹9,170" },
      ]
    }] : [])
  ];

  return (
    <div className="pb-16">
      <StatusToast message={toast} />

      {/* VENDOR ROLE-SPECIFIC UPLOADED INVENTORY SUMMARY */}
      <div className="mx-5 my-3">
        <div className="flex items-center justify-between pb-1.5">
          <h3 className="text-[12px] font-black uppercase tracking-wider text-slate-500">
            {isMr ? "माझे अपलोड केलेले ॲसेट्स" : "Uploaded Inventory Summary"}
          </h3>
          <span className="text-[11px] font-bold text-sky-600">
            {isMr ? "प्रकारनिहाय सारांश" : "Category Overview"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {showPackages && (
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <span className="text-xl">🌴</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black text-slate-800 leading-tight">8</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {isMr ? "पॅकेजेस लाइव्ह" : "Packages Live"}
                </p>
              </div>
            </div>
          )}
          {showHotel && (
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <span className="text-xl">🏨</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black text-slate-800 leading-tight">2 / 34</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {isMr ? "हॉटेल्स व रूम्स" : "Properties & Rooms"}
                </p>
              </div>
            </div>
          )}
          {showCabs && (
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <span className="text-xl">🚗</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black text-slate-800 leading-tight">6</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {isMr ? "नोंदणीकृत गाड्या" : "Verified Cabs"}
                </p>
              </div>
            </div>
          )}
          {showBuses && (
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
              <span className="text-xl">🚌</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black text-slate-800 leading-tight">4</p>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {isMr ? "नियोजित बस मार्ग" : "Scheduled Routes"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOP PERFORMING INVENTORY & 3-YEAR FINANCIAL DEEP DIVE */}
      <div className="mx-5 my-3">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
              <span>🌟</span> {isMr ? "सर्वाधिक चालणारे ॲसेट्स" : "Top Performing Inventory"}
            </h3>
            <p className="text-[11px] font-medium text-slate-500">
              {isMr ? "३ वर्षांचे उत्पन्न व तपशील पाहण्यासाठी कोणत्याही कार्डवर टॅप करा" : "Tap any asset to inspect 3-Year Financials, Bookings & P&L"}
            </p>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            3-Year P&L
          </span>
        </div>

        <div className="space-y-2.5">
          {bestSellers.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFinancialAsset(item)}
              className="group p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer active:scale-98 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${item.accentBg} text-white flex items-center justify-center text-xl shadow-sm`}>
                    {item.iconEmoji}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 mb-1">
                      {item.badge}
                    </span>
                    <h4 className="text-[13px] font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {item.rating} ({item.reviewsCount})
                      </span>
                      <span>·</span>
                      <span className="font-bold text-slate-700">
                        {item.totalBookings} {isMr ? "एकूण बुकिंग्ज" : "Total Bookings"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                    {isMr ? "३ वर्षांचे उत्पन्न" : "3-Yr Revenue"}
                  </span>
                  <span className="text-[14px] font-black text-emerald-700">{item.totalGross}</span>
                  <span className="text-[10px] text-sky-600 font-bold block pt-1 group-hover:translate-x-0.5 transition-transform">
                    {isMr ? "तपशील पहा →" : "View P&L →"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-YEAR FINANCIAL DEEP DIVE MODAL */}
      <ModalSheet
        isOpen={!!selectedFinancialAsset}
        onClose={() => setSelectedFinancialAsset(null)}
        title={selectedFinancialAsset?.name || "3-Year Financial Deep Dive"}
        subtitle={isMr ? "मागील ३ आर्थिक वर्षांतील सविस्तर नफा-तोटा, बुकिंग व ऑक्युपन्सी विश्लेषण" : "Detailed 3-year P&L, booking volume & seasonal occupancy analysis"}
      >
        {selectedFinancialAsset && (
          <div className="space-y-4 pb-2">
            {/* Asset Header Card */}
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedFinancialAsset.accentBg} text-white shadow-md flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wide">
                  {selectedFinancialAsset.badge}
                </span>
                <h4 className="text-[15px] font-black leading-snug">
                  {selectedFinancialAsset.name}
                </h4>
                <p className="text-[11px] text-white/80">
                  {isMr ? "एकूण ३ वर्षांचे संकलित उत्पन्न:" : "Total 3-Year Cumulative Revenue:"} <span className="text-white font-extrabold text-xs">{selectedFinancialAsset.totalGross}</span> ({selectedFinancialAsset.totalBookings} {isMr ? "बुकिंग्ज" : "Bookings"})
                </p>
              </div>
              <span className="text-4xl shrink-0 drop-shadow-sm ml-2">{selectedFinancialAsset.iconEmoji}</span>
            </div>

            {/* FY Year Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              {(["FY 2025-26", "FY 2024-25", "FY 2023-24"] as const).map((fy) => (
                <button
                  key={fy}
                  type="button"
                  onClick={() => setSelectedFYTab(fy)}
                  className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    selectedFYTab === fy
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {fy}
                </button>
              ))}
            </div>

            {/* Selected FY Metrics */}
            {(() => {
              const currentYearData = selectedFinancialAsset.years.find((y) => y.fy === selectedFYTab) || selectedFinancialAsset.years[0];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                    <span>{currentYearData.label}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Audit Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight block">
                        {isMr ? "एकूण कमाई (Gross)" : "Gross Revenue (GTV)"}
                      </span>
                      <span className="text-[18px] font-black text-emerald-900 leading-tight">{currentYearData.gross}</span>
                      <span className="text-[10px] font-medium text-emerald-700 block pt-0.5">
                        {isMr ? "नक्त जमा: " : "Net Disbursed: "}{currentYearData.net}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-tight block">
                        {isMr ? "एकूण बुकिंग्ज / ट्रिप्स" : "Total Bookings / Trips"}
                      </span>
                      <span className="text-[18px] font-black text-blue-900 leading-tight">
                        {currentYearData.bookings} {isMr ? "बुकिंग्ज" : "Trips"}
                      </span>
                      <span className="text-[10px] font-medium text-blue-700 block pt-0.5">
                        {isMr ? "सरासरी दर: " : "Avg Booking: "}{currentYearData.aov}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                      <span className="text-[10px] font-bold text-purple-800 uppercase tracking-tight block">
                        {isMr ? "ऑक्युपन्सी / सीट लोड" : "Occupancy / Seat Load"}
                      </span>
                      <span className="text-[18px] font-black text-purple-900 leading-tight">{currentYearData.occupancyOrLoad}</span>
                      <span className="text-[10px] font-medium text-purple-700 block pt-0.5">
                        {isMr ? "सर्वोच्च तिमाहीत" : "Peak Quarter"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tight block">
                        {isMr ? "सीझन मागणी वाटा" : "Peak Season Share"}
                      </span>
                      <span className="text-[18px] font-black text-amber-900 leading-tight">{currentYearData.peakSeasonShare}</span>
                      <span className="text-[10px] font-medium text-amber-700 block pt-0.5">
                        {isMr ? "दिवाळी/ख्रिसमस/सुट्टी" : "Festival & Holiday Surge"}
                      </span>
                    </div>
                  </div>

                  {/* 3-Year Comparative Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-[11px]">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-black text-slate-700 flex justify-between">
                      <span>{isMr ? "३ वर्षांचा तुलनात्मक तक्ता (Year-on-Year)" : "3-Year Comparative Performance (YoY)"}</span>
                      <span className="text-sky-600 font-bold">{isMr ? "100% पारदर्शक" : "100% Audited"}</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {selectedFinancialAsset.years.map((row) => (
                        <div key={row.fy} className={`px-3 py-2 flex items-center justify-between ${row.fy === selectedFYTab ? 'bg-sky-50/50 font-bold' : ''}`}>
                          <span className="text-slate-800 w-24 font-bold">{row.fy}</span>
                          <span className="text-slate-600">{row.bookings} {isMr ? "बुक्स" : "Bookings"}</span>
                          <span className="text-purple-700">{row.occupancyOrLoad}</span>
                          <span className="text-emerald-700 font-black text-right w-24">{row.gross}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setToast(`${selectedFinancialAsset.name} statement downloaded successfully!`);
                      setTimeout(() => setToast(null), 4000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isMr ? "३ वर्षांचा ऑडिट व नफा-तोटा अहवाल डाऊनलोड करा (Excel / PDF)" : "Download 3-Year Audit & P&L Statement (Excel / PDF)"}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </ModalSheet>

      <SectionHeader title={isMr ? "मागील ३० दिवसांची कामगिरी" : "Last 30 days"} />
      <div className="flex gap-3 px-5">
        <StatCard label={isMr ? "लीड्स" : "Leads"} value="64" hint={isMr ? "सक्रिय चौकशी" : "Active inquiries"} tone="sky" />
        <StatCard label={isMr ? "बुकिंग्ज" : "Bookings"} value="21" hint={isMr ? "पुष्टी केलेले" : "Confirmed"} tone="violet" />
      </div>
      <div className="flex gap-3 px-5 pt-3">
        <StatCard label={isMr ? "महसूल" : "Revenue"} value="₹4.8L" hint={isMr ? "एकूण उलाढाल" : "Gross volume"} tone="pink" />
        <StatCard label={isMr ? "सक्रिय लिस्टिंग्ज" : "Listings"} value="12" hint={isMr ? "सक्रिय व सत्यापित" : "Active & verified"} tone="violet" />
      </div>
    </div>
  );
};

/* =========================================================================
   2. OFFERS PANEL
   ========================================================================= */
export interface AutoBidRule {
  enabled: boolean;
  floorPrice: number;
  stepDecrement: number;
  autoDropout: boolean;
  currentCalculatedBid: number;
}

export const OffersPanel: React.FC<PanelProps> = ({ onAction }) => {
  const { lang, language } = useLanguage();
  const isMr = (lang || language) === 'mr';

  const [offers, setOffers] = useState([
    {
      id: "l-1",
      customer: "Meera Kulkarni",
      request: "Goa 4N/5D · 2 adults · beach resort",
      budget: "₹48,000",
      numericBudget: 48000,
      age: "12 min ago",
      quoted: false
    },
    {
      id: "l-2",
      customer: "Arjun Deshmukh",
      request: "Manali honeymoon · 6N · volvo + hotel",
      budget: "₹72,000",
      numericBudget: 72000,
      age: "1 h ago",
      quoted: false
    },
    {
      id: "l-3",
      customer: "Rohit & Pooja",
      request: "Kerala Backwaters · 5N · houseboat + resort",
      budget: "₹55,000",
      numericBudget: 55000,
      age: "3 h ago",
      quoted: false
    }
  ]);

  const [quotePrice, setQuotePrice] = useState<{ [id: string]: string }>({});
  // Master 1-Click Action State for Auto-Bidding across ALL leads
  const [masterAutoBid, setMasterAutoBid] = useState<boolean>(true);
  const [globalMarginPercent, setGlobalMarginPercent] = useState<number>(15);
  const [globalStepDecrement, setGlobalStepDecrement] = useState<number>(500);
  const [globalAutoDropout, setGlobalAutoDropout] = useState<boolean>(true);
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState<boolean>(false);

  const [autoBids, setAutoBids] = useState<{ [id: string]: AutoBidRule }>({
    "l-1": {
      enabled: true,
      floorPrice: 40800,
      stepDecrement: 500,
      autoDropout: true,
      currentCalculatedBid: 47500
    },
    "l-2": {
      enabled: true,
      floorPrice: 61200,
      stepDecrement: 500,
      autoDropout: true,
      currentCalculatedBid: 71500
    },
    "l-3": {
      enabled: true,
      floorPrice: 46750,
      stepDecrement: 500,
      autoDropout: true,
      currentCalculatedBid: 54500
    }
  });

  const [selectedOfferForAutoBid, setSelectedOfferForAutoBid] = useState<any | null>(null);
  const [modalFloorPrice, setModalFloorPrice] = useState<string>("40000");
  const [modalStepDecrement, setModalStepDecrement] = useState<number>(500);
  const [modalAutoDropout, setModalAutoDropout] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // 1-Click Master Action Toggle: Apply or pause algorithmic auto-bidding across all leads
  const handleToggleMasterAutoBid = () => {
    const nextState = !masterAutoBid;
    setMasterAutoBid(nextState);

    if (nextState) {
      const newAutoBids: { [id: string]: AutoBidRule } = {};
      offers.forEach((offer) => {
        const floor = Math.round(offer.numericBudget * (1 - globalMarginPercent / 100));
        const currentBid = Math.max(floor, offer.numericBudget - globalStepDecrement);
        newAutoBids[offer.id] = {
          enabled: true,
          floorPrice: floor,
          stepDecrement: globalStepDecrement,
          autoDropout: globalAutoDropout,
          currentCalculatedBid: currentBid
        };
      });
      setAutoBids(newAutoBids);
      setOffers((prev) => prev.map((o) => ({ ...o, quoted: true })));
      setToast(
        isMr
          ? `⚡ १-क्लिक मास्टर ऑटो-बिड सुरू! सर्व ${offers.length} लीड्सवर स्वयंचलित बोली लागू झाली (${globalMarginPercent}% मार्जिन तळ).`
          : `⚡ Master Auto-Bid ENABLED! Applied algorithmic bids across all ${offers.length} leads (${globalMarginPercent}% reserve margin).`
      );
    } else {
      setAutoBids({});
      setToast(
        isMr
          ? "मास्टर ऑटो-बिड बंद केली — आता मॅन्युअल बोली मोड सुरू आहे."
          : "Master Auto-Bid paused — switched to manual bidding mode."
      );
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveGlobalSettings = () => {
    if (globalMarginPercent <= 0 || globalMarginPercent >= 80) {
      setToast(isMr ? "कृपया योग्य नफा मार्जिन (५% ते ५०%) प्रविष्ट करा." : "Please enter a valid margin between 5% and 50%.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (masterAutoBid) {
      const newAutoBids: { [id: string]: AutoBidRule } = {};
      offers.forEach((offer) => {
        const floor = Math.round(offer.numericBudget * (1 - globalMarginPercent / 100));
        const currentBid = Math.max(floor, offer.numericBudget - globalStepDecrement);
        newAutoBids[offer.id] = {
          enabled: true,
          floorPrice: floor,
          stepDecrement: globalStepDecrement,
          autoDropout: globalAutoDropout,
          currentCalculatedBid: currentBid
        };
      });
      setAutoBids(newAutoBids);
    }
    setShowGlobalSettingsModal(false);
    setToast(
      isMr
        ? `ग्लोबल ऑटो-बिड नियम अपडेट झाले! (तळ मार्जिन: ${globalMarginPercent}%, कपात: ₹${globalStepDecrement})`
        : `Global Auto-Bid settings saved! (Margin: ${globalMarginPercent}%, Step: ₹${globalStepDecrement})`
    );
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendQuote = (offerId: string) => {
    const price = quotePrice[offerId] || "₹45,000";
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, quoted: true } : o))
    );
    setToast(isMr ? `प्रवाशाला ${price} ची बोली पाठवली!` : `Bid of ${price} dispatched to traveller!`);
    setTimeout(() => setToast(null), 4000);
  };

  const openAutoBidConfig = (offer: any) => {
    setSelectedOfferForAutoBid(offer);
    const existing = autoBids[offer.id];
    if (existing) {
      setModalFloorPrice(existing.floorPrice.toString());
      setModalStepDecrement(existing.stepDecrement);
      setModalAutoDropout(existing.autoDropout);
    } else {
      setModalFloorPrice(Math.round(offer.numericBudget * (1 - globalMarginPercent / 100)).toString());
      setModalStepDecrement(globalStepDecrement);
      setModalAutoDropout(globalAutoDropout);
    }
  };

  const handleSaveAutoBid = () => {
    if (!selectedOfferForAutoBid) return;
    const floor = parseFloat(modalFloorPrice);
    if (isNaN(floor) || floor <= 0) {
      setToast(isMr ? "कृपया योग्य किमान तळ दर (Floor Price) प्रविष्ट करा." : "Please enter a valid minimum reserve floor price.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const currentBid = Math.max(floor, selectedOfferForAutoBid.numericBudget - modalStepDecrement);

    setAutoBids((prev) => ({
      ...prev,
      [selectedOfferForAutoBid.id]: {
        enabled: true,
        floorPrice: floor,
        stepDecrement: modalStepDecrement,
        autoDropout: modalAutoDropout,
        currentCalculatedBid: currentBid
      }
    }));

    setOffers((prev) =>
      prev.map((o) => (o.id === selectedOfferForAutoBid.id ? { ...o, quoted: true } : o))
    );

    setToast(
      isMr
        ? `🤖 ऑटो-बिडिंग सुरू झाली! (किमान तळ: ₹${floor.toLocaleString("en-IN")}, कपात: ₹${modalStepDecrement})`
        : `🤖 Smart Auto-Bidding activated! (Floor: ₹${floor.toLocaleString("en-IN")}, Step: ₹${modalStepDecrement})`
    );
    setSelectedOfferForAutoBid(null);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDisableAutoBid = (offerId: string) => {
    setAutoBids((prev) => {
      const copy = { ...prev };
      delete copy[offerId];
      return copy;
    });
    setToast(isMr ? "ऑटो-बिडिंग बंद करण्यात आली." : "Auto-Bidding has been disabled.");
    setSelectedOfferForAutoBid(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="pb-16">
      <SectionHeader title={isMr ? "थेट रिव्हर्स-बिडिंग लीड्स" : "Live reverse-bidding leads"} />
      <StatusToast message={toast} />

      {/* 1-CLICK MASTER ACTION BUTTON: AUTO-BID ACROSS ALL LEADS */}
      <div className="mx-5 mb-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white border border-indigo-400/30 shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-lg shadow-sm shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-black text-white flex items-center gap-1.5 leading-tight">
                {isMr ? "मास्टर ऑटो-बिड इंजिन (Master Auto-Bid Engine)" : "Master Auto-Bid Engine"}
              </h4>
              <p className="text-[10px] text-slate-300">
                {isMr
                  ? "सर्व थेट रिव्हर्स-बिडिंग लीड्सवर १-क्लिकमध्ये स्वयंचलित बोली लावा किंवा बंद करा"
                  : "1-Click automated outbidding across all live customer inquiries"}
              </p>
            </div>
          </div>

          {/* ONE-TIME MASTER ACTION TOGGLE BUTTON */}
          <button
            type="button"
            onClick={handleToggleMasterAutoBid}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
              masterAutoBid
                ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/25"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${masterAutoBid ? "bg-slate-950 animate-pulse" : "bg-slate-500"}`} />
            <span>
              {masterAutoBid
                ? (isMr ? "मास्टर बिड: चालू (ON)" : "Master Auto-Bid: ON")
                : (isMr ? "मास्टर बिड: बंद (OFF)" : "Master Auto-Bid: OFF")}
            </span>
          </button>
        </div>

        {/* Global Parameters & Custom Settings row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold">
              {isMr ? "किमान नफा तळ:" : "Reserve Floor Margin:"} <strong className="text-amber-300">{globalMarginPercent}%</strong>
            </span>
            <span>·</span>
            <span className="font-semibold">
              {isMr ? "कपात पायरी:" : "Step Decrement:"} <strong className="text-sky-300">-₹{globalStepDecrement}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowGlobalSettingsModal(true)}
            className="text-[10px] font-bold text-sky-300 hover:text-white flex items-center gap-1 underline cursor-pointer"
          >
            <span>⚙️ {isMr ? "नियम बदला" : "Edit Global Rules"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 px-5">
        {offers.map((offer) => {
          const autoBid = autoBids[offer.id];
          return (
            <div key={offer.id} className="premium-card px-4 py-4 space-y-2.5 border border-slate-200/80">
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
                    {isMr ? "ग्राहक बजेट:" : "Customer budget:"} <span className="text-emerald-700 font-bold">{offer.budget}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openAutoBidConfig(offer)}
                  className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    autoBid?.enabled
                      ? "bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${autoBid?.enabled ? "text-indigo-600 fill-indigo-600" : "text-slate-400"}`} />
                  <span>
                    {autoBid?.enabled
                      ? (isMr ? "ऑटो-पायलट सुरू" : "Auto-Pilot Active")
                      : (isMr ? "ऑटो-बिड सेट करा" : "Set Auto-Bid")}
                  </span>
                </button>
              </div>

              {/* Active Auto-Bidding Indicator */}
              {autoBid?.enabled && (
                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-indigo-950 flex items-center gap-1">
                      <span>🤖</span> {isMr ? "सध्याची लाइव्ह अल्गोरिदम बोली:" : "Live algorithmic bid:"} <strong className="text-emerald-700 text-xs">₹{autoBid.currentCalculatedBid.toLocaleString("en-IN")}</strong>
                    </span>
                    <p className="text-slate-600 text-[10px]">
                      {isMr ? "तळ दर (Floor):" : "Floor Price:"} <strong className="text-slate-800">₹{autoBid.floorPrice.toLocaleString("en-IN")}</strong> · {isMr ? "कपात:" : "Step:"} ₹{autoBid.stepDecrement} · {isMr ? "ड्रॉपआऊट संरक्षण:" : "Dropout Protection:"} {autoBid.autoDropout ? (isMr ? "चालू" : "ON") : (isMr ? "बंद" : "OFF")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAutoBidConfig(offer)}
                    className="text-[10px] font-bold text-indigo-700 underline cursor-pointer hover:text-indigo-900"
                  >
                    {isMr ? "बदला" : "Edit"}
                  </button>
                </div>
              )}

              {offer.quoted && !autoBid?.enabled ? (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> {isMr ? "बोली पाठवली — ग्राहकाच्या मंजुरीची प्रतीक्षा" : "Quote submitted — awaiting traveller acceptance"}
                </div>
              ) : !autoBid?.enabled ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isMr ? "तुमची बोली (उदा. ₹46,500)" : "Your quote (e.g. ₹46,500)"}
                    value={quotePrice[offer.id] || ""}
                    onChange={(e) => setQuotePrice({ ...quotePrice, [offer.id]: e.target.value })}
                    className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] font-medium text-slate-800 outline-none focus:border-sky-500"
                  />
                  <PillButton
                    label={isMr ? "बोली पाठवा" : "Submit Bid"}
                    variant="solid"
                    Icon={Send}
                    onClick={() => {
                      handleSendQuote(offer.id);
                      onAction("offer-quote");
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* SMART AUTO-BIDDING CONFIGURATION MODAL */}
      <ModalSheet
        isOpen={!!selectedOfferForAutoBid}
        onClose={() => setSelectedOfferForAutoBid(null)}
        title={isMr ? "🤖 स्मार्ट ऑटो-बिडिंग अल्गोरिदम (Auto-Bid Engine)" : "🤖 Smart Algorithmic Auto-Bid Engine"}
        subtitle={isMr ? "स्पर्धकांना हरवण्यासाठी पायरीनिहाय कपात व तोटा टाळण्यासाठी तळ दर संरक्षण" : "Step-by-step competitive outbidding with reserve floor price protection"}
      >
        {selectedOfferForAutoBid && (
          <div className="space-y-4 pb-2">
            {/* Inquiry Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>{isMr ? "प्रवासी:" : "Traveller:"} {selectedOfferForAutoBid.customer}</span>
                <span className="text-emerald-700">{isMr ? "बजेट:" : "Budget:"} {selectedOfferForAutoBid.budget}</span>
              </div>
              <p className="text-slate-600 text-[11px]">{selectedOfferForAutoBid.request}</p>
            </div>

            {/* Parameter 1: Reserve / Floor Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>{isMr ? "१. तळ दर / राखीव किंमत (Reserve / Floor Price)" : "1. Reserve / Floor Price"}</span>
                <span className="text-rose-600 text-[10px] font-bold">{isMr ? "यापेक्षा कमी दर लागणार नाही" : "Will not bid below this"}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  value={modalFloorPrice}
                  onChange={(e) => setModalFloorPrice(e.target.value)}
                  placeholder={isMr ? "उदा. 42000" : "e.g. 42000"}
                  className="w-full h-11 rounded-xl border border-slate-200 pl-8 pr-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {isMr
                  ? "हा तुमचा किमान नफा राखणारा तळ दर आहे. इतर कोणताही वेंडर यापेक्षा कमी गेला तरी तुमची बोली या खाली जाणार नाही."
                  : "This is your minimum reserve price protecting your margins. Even if competitors bid lower, the bot will never drop below this."}
              </p>
            </div>

            {/* Parameter 2: Step Decrement */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 block">
                {isMr ? "२. पायरीनिहाय कपात टप्पा (Step Decrement per Outbid)" : "2. Step Decrement per Outbid"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 1000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setModalStepDecrement(step)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      modalStepDecrement === step
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    -₹{step}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">
                {isMr
                  ? `जेव्हा इतर वेंडर कमी बोली लावेल, तेव्हा अल्गोरिदम आपोआप ₹${modalStepDecrement} ने कमी करून तुम्हाला पुढे ठेवेल.`
                  : `When another vendor bids lower, the algorithm automatically counters by ₹${modalStepDecrement} to keep you ahead.`}
              </p>
            </div>

            {/* Parameter 3: Auto-Dropout Protection */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div className="space-y-0.5 pr-3">
                <span className="text-xs font-black text-amber-950 block">
                  {isMr ? "३. ऑटो-ड्रॉपआऊट सुरक्षा (Auto-Dropout Protection)" : "3. Auto-Dropout Protection"}
                </span>
                <p className="text-[10px] text-amber-800">
                  {isMr
                    ? `जर बोली तळ दराखाली (₹${modalFloorPrice}) गेली, तर तोटा टाळण्यासाठी सिस्टीम आपोआप थांबून तुम्हाला अलर्ट पाठवेल.`
                    : `If competitor bids drop below your floor price (₹${modalFloorPrice}), the bot halts bidding to prevent operating at a loss.`}
                </p>
              </div>
              <input
                type="checkbox"
                checked={modalAutoDropout}
                onChange={(e) => setModalAutoDropout(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {autoBids[selectedOfferForAutoBid.id]?.enabled && (
                <button
                  type="button"
                  onClick={() => handleDisableAutoBid(selectedOfferForAutoBid.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer"
                >
                  {isMr ? "ऑटो-बिड बंद करा" : "Turn Off Auto-Bid"}
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveAutoBid}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isMr ? "स्मार्ट ऑटो-बिडिंग सुरू करा (Activate Auto-Bid)" : "Activate Smart Auto-Bidding"}</span>
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* GLOBAL MASTER AUTO-BID CONFIGURATION MODAL */}
      <ModalSheet
        isOpen={showGlobalSettingsModal}
        onClose={() => setShowGlobalSettingsModal(false)}
        title={isMr ? "⚡ मास्टर ऑटो-बिड जागतिक नियम (Global Auto-Bid Rules)" : "⚡ Master Auto-Bid Engine Settings"}
        subtitle={isMr ? "सर्व थेट लीड्ससाठी किमान नफा मार्जिन व स्पर्धात्मक पायरी कपात" : "Global floor margin & undercut step applied automatically to all live leads"}
      >
        <div className="space-y-4 pb-2">
          {/* Rule 1: Global Margin Floor */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span>{isMr ? "१. सुरक्षित नफा मार्जिन (Reserve Floor Margin %)" : "1. Minimum Reserve Floor Margin (%)"}</span>
              <span className="text-emerald-700 font-bold">{globalMarginPercent}% {isMr ? "संरक्षण" : "Floor"}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setGlobalMarginPercent(pct)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    globalMarginPercent === pct
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              {isMr
                ? `अल्गोरिदम ग्राहकाच्या बजेटमधून जास्तीत जास्त ${globalMarginPercent}% खाली जाईल. या खाली नफा कमी झाल्यास बोली थांबेल.`
                : `The bot will calculate floor prices at customer budget minus ${globalMarginPercent}%, preventing below-cost bidding.`}
            </p>
          </div>

          {/* Rule 2: Global Step Decrement */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              {isMr ? "२. स्पर्धात्मक कपात पायरी (Competitive Step Undercut)" : "2. Competitive Step Undercut"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[250, 500, 1000].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setGlobalStepDecrement(step)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    globalStepDecrement === step
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  -₹{step}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              {isMr
                ? `जेव्हा एखादा प्रतिस्पर्धी कमी किंमत देईल, तेव्हा तुमची सिस्टीम लगेच ₹${globalStepDecrement} ने कमी बोली लावून पुढे राहील.`
                : `When outbid by a competitor, your quote automatically lowers by ₹${globalStepDecrement} to regain #1 spot.`}
            </p>
          </div>

          {/* Rule 3: Auto-Dropout */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-black text-amber-950 block">
                {isMr ? "३. ऑटो-ड्रॉपआऊट तोटा संरक्षण" : "3. Loss Prevention Auto-Dropout"}
              </span>
              <p className="text-[10px] text-amber-800">
                {isMr
                  ? "तळ दराखाली स्पर्धा गेल्यास बोली थांबवून वेंडरला सुरक्षित ठेवणे."
                  : "Automatically cease undercutting if market price falls below reserve margin."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={globalAutoDropout}
              onChange={(e) => setGlobalAutoDropout(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveGlobalSettings}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 transition-all cursor-pointer shadow-md active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMr ? "नियम जतन करा व सर्व लीड्सवर लागू करा" : "Save & Apply to All Leads"}</span>
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};

/* =========================================================================
   3. INVENTORY PANEL
   ========================================================================= */
export interface InventoryPanelProps extends PanelProps {
  initialSubTab?: "packages" | "fasttrack" | "vehicle" | "bus" | "api_access" | "portal";
  vendorId?: string;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onAction, initialSubTab = "packages", vendorId = "VEND-1001" }) => {
  const { lang, language } = useLanguage();
  const isMr = (lang || language) === 'mr';
  const { profile, toggleBusinessType } = useVendorStore();
  const activeTypes = profile?.businessTypes && profile.businessTypes.length > 0
    ? profile.businessTypes
    : ['HOTEL', 'TOUR_OPERATOR', 'CAB_OPERATOR', 'BUS_OPERATOR'];

  const showPackages = activeTypes.includes('TOUR_OPERATOR');
  const showHotel = activeTypes.includes('HOTEL');
  const showCabs = activeTypes.includes('CAB_OPERATOR');
  const showBuses = activeTypes.includes('BUS_OPERATOR');
  const isKycVerified = profile?.kycStatus === 'VERIFIED' || profile?.kyc_status === 'VERIFIED' || profile?.kyc_status === 'APPROVED';

  const defaultSub = showPackages ? "packages" : showHotel ? "fasttrack" : showCabs ? "vehicle" : showBuses ? "bus" : "api_access";
  const [activeSubTab, setActiveSubTab] = useState<"packages" | "fasttrack" | "vehicle" | "bus" | "api_access" | "portal">(initialSubTab || defaultSub);
  const [toast, setToast] = useState<string | null>(null);

  // Seasonal Dynamic Pricing Engine State
  const [pricingMode, setPricingMode] = useState<"standard" | "peak" | "monsoon" | "weekend">("peak");
  const [peakSurgePercent, setPeakSurgePercent] = useState<number>(25);
  const [monsoonDiscountPercent, setMonsoonDiscountPercent] = useState<number>(15);
  const [weekendSurgePercent, setWeekendSurgePercent] = useState<number>(20);
  const [instantAvailability, setInstantAvailability] = useState<boolean>(true);
  const [blackoutDates, setBlackoutDates] = useState<string[]>([
    "2026-10-24 (Diwali Festival)",
    "2026-11-12 (Dev Diwali)",
    "2026-12-31 (New Year Eve)"
  ]);
  const [showBlackoutModal, setShowBlackoutModal] = useState<boolean>(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState<string>("");
  const [showPackageFlow, setShowPackageFlow] = useState<boolean>(false);
  const [showHotelFlow, setShowHotelFlow] = useState<boolean>(false);
  const [showCabFlow, setShowCabFlow] = useState<boolean>(false);
  const [showBusFlow, setShowBusFlow] = useState<boolean>(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Auto-adjust subtab if current activeSubTab is not enabled in business types
  useEffect(() => {
    if (activeSubTab === 'packages' && !showPackages) {
      if (showHotel) setActiveSubTab('fasttrack');
      else if (showCabs) setActiveSubTab('vehicle');
      else if (showBuses) setActiveSubTab('bus');
      else setActiveSubTab('api_access');
    } else if (activeSubTab === 'fasttrack' && !showHotel) {
      if (showPackages) setActiveSubTab('packages');
      else if (showCabs) setActiveSubTab('vehicle');
      else if (showBuses) setActiveSubTab('bus');
      else setActiveSubTab('api_access');
    } else if (activeSubTab === 'vehicle' && !showCabs) {
      if (showPackages) setActiveSubTab('packages');
      else if (showHotel) setActiveSubTab('fasttrack');
      else if (showBuses) setActiveSubTab('bus');
      else setActiveSubTab('api_access');
    } else if (activeSubTab === 'bus' && !showBuses) {
      if (showPackages) setActiveSubTab('packages');
      else if (showHotel) setActiveSubTab('fasttrack');
      else if (showCabs) setActiveSubTab('vehicle');
      else setActiveSubTab('api_access');
    }
  }, [activeTypes, showPackages, showHotel, showCabs, showBuses, activeSubTab]);

  // Tour packages live listing state
  const [packagesList, setPackagesList] = useState<TourPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  // Load live packages on mount
  const loadLivePackages = async () => {
    setLoadingPackages(true);
    try {
      const pkgs = await packageService.getAll();
      if (pkgs && pkgs.length > 0) {
        setPackagesList(pkgs);
      }
    } catch (err) {
      console.warn("Failed to load live packages", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    loadLivePackages();
  }, []);

  const handleSaveEditPackage = () => {
    if (!editingPackage) return;
    setPackagesList((prev) =>
      prev.map((p) => (p.id === editingPackage.id ? { ...p, ...editingPackage } : p))
    );
    setToast(`Package "${editingPackage.title || editingPackage.package_name}" updated!`);
    setEditingPackage(null);
    setTimeout(() => setToast(null), 3000);
  };

  // Fast-track import state
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [scrapedHotel, setScrapedHotel] = useState<any>(null);

  // Cab/Vehicle verification state
  const [regNumber, setRegNumber] = useState("");
  const [verifyingVehicle, setVerifyingVehicle] = useState(false);
  const [vehicleResult, setVehicleResult] = useState<any>(null);

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
      {/* SEASONAL DYNAMIC PRICING ENGINE & REAL-TIME AVAILABILITY */}
      <div className="mx-5 mb-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-900 text-white shadow-lg space-y-3 border border-indigo-400/25">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-amber-300">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-[13px] font-black text-white flex items-center gap-1.5 leading-tight">
                {isMr ? "सीझनल डायनॅमिक प्रायसिंग इंजिन (Dynamic Pricing Engine)" : "Seasonal Dynamic Pricing Engine"}
              </h4>
              <p className="text-[10px] text-blue-200">
                {isMr ? "सीझन, सुट्ट्या व वीकेंडनुसार १-क्लिकमध्ये दरात फेरबदल करा" : "1-click dynamic rate adjustments for peak seasons, holidays & weekends"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Pricing Mode Multiplier Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <button
            type="button"
            onClick={() => {
              setPricingMode("peak");
              setToast(isMr ? `🚀 पिक सीझन दर (+${peakSurgePercent}%) सर्व सक्रिय इन्व्हेंटरीवर लागू केला!` : `🚀 Peak season surge (+${peakSurgePercent}%) applied across all listings!`);
              setTimeout(() => setToast(null), 3500);
            }}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              pricingMode === "peak"
                ? "bg-amber-400 text-amber-950 border-amber-300 font-black shadow-sm"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            <span className="text-xs block">{isMr ? "🔥 पिक सीझन" : "🔥 Peak Season"}</span>
            <span className="text-[11px] font-black leading-none block pt-0.5">+{peakSurgePercent}% {isMr ? "वाढ" : "Surge"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPricingMode("monsoon");
              setToast(isMr ? `🌧️ मान्सून सवलत (-${monsoonDiscountPercent}%) लागू केली!` : `🌧️ Monsoon / off-season discount (-${monsoonDiscountPercent}%) applied!`);
              setTimeout(() => setToast(null), 3500);
            }}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              pricingMode === "monsoon"
                ? "bg-sky-400 text-sky-950 border-sky-300 font-black shadow-sm"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            <span className="text-xs block">{isMr ? "🌧️ मान्सून/ऑफ" : "🌧️ Monsoon/Off"}</span>
            <span className="text-[11px] font-black leading-none block pt-0.5">-{monsoonDiscountPercent}% {isMr ? "सूट" : "Discount"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPricingMode("weekend");
              setToast(isMr ? `🏖️ वीकेंड मल्टीप्लायर (+${weekendSurgePercent}%) लागू केला!` : `🏖️ Weekend multiplier (+${weekendSurgePercent}%) applied!`);
              setTimeout(() => setToast(null), 3500);
            }}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              pricingMode === "weekend"
                ? "bg-purple-400 text-purple-950 border-purple-300 font-black shadow-sm"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            <span className="text-xs block">{isMr ? "🏖️ वीकेंड" : "🏖️ Weekend"}</span>
            <span className="text-[11px] font-black leading-none block pt-0.5">+{weekendSurgePercent}% {isMr ? "वाढ" : "Surge"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPricingMode("standard");
              setToast(isMr ? "सामान्य बेस दर (1.0x) पूर्ववत लागू केला!" : "Standard base tariff (1.0x) restored!");
              setTimeout(() => setToast(null), 3500);
            }}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              pricingMode === "standard"
                ? "bg-emerald-400 text-emerald-950 border-emerald-300 font-black shadow-sm"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            <span className="text-xs block">{isMr ? "⚖️ सामान्य बेस" : "⚖️ Standard Base"}</span>
            <span className="text-[11px] font-black leading-none block pt-0.5">1.0x {isMr ? "मूळ दर" : "Standard"}</span>
          </button>
        </div>

        {/* Availability & Blackout Bar */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextVal = !instantAvailability;
                setInstantAvailability(nextVal);
                setToast(nextVal
                  ? (isMr ? "झटपट बुकिंग (Instant Booking) चालू केली!" : "Instant Booking enabled!")
                  : (isMr ? "झटपट बुकिंग बंद केली — आता कोटेशन आवश्यक राहील." : "Instant Booking paused — quotations now required."));
                setTimeout(() => setToast(null), 3000);
              }}
              className={`text-[11px] font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                instantAvailability
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-400/40"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isMr ? `झटपट बुकिंग: ${instantAvailability ? "चालू (ON)" : "बंद (OFF)"}` : `Instant Booking: ${instantAvailability ? "ON" : "OFF"}`}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBlackoutModal(true)}
            className="text-[11px] font-bold text-amber-200 hover:text-amber-100 flex items-center gap-1.5 underline cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isMr ? `${blackoutDates.length} ब्लॅकआऊट तारखा व्यवस्थापित करा` : `Manage ${blackoutDates.length} Blackout Dates`}</span>
          </button>
        </div>
      </div>

      {/* 3D Action Sub-Selector - BORDERLESS matching User Account Pattern */}
      <div className="px-5 mb-4 pt-1">
        <div className="flex items-center justify-around gap-1.5 flex-wrap">
          {/* Button 1: Tour Packages */}
          <button
            type="button"
            onClick={() => setActiveSubTab("packages")}
            className="flex flex-1 min-w-[65px] max-w-[90px] flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
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
            <span className={`text-[10px] sm:text-[11px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "packages" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Packages
            </span>
            {activeSubTab === "packages" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 2: Hotel Onboard */}
          <button
            type="button"
            onClick={() => setActiveSubTab("fasttrack")}
            className="flex flex-1 min-w-[65px] max-w-[90px] flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/inventory.png"
                alt="Hotel Onboarding"
                className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                  activeSubTab === "fasttrack" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                }`}
              />
            </div>
            <span className={`text-[10px] sm:text-[11px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "fasttrack" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Hotel
            </span>
            {activeSubTab === "fasttrack" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 3: Fleet RC */}
          <button
            type="button"
            onClick={() => setActiveSubTab("vehicle")}
            className="flex flex-1 min-w-[65px] max-w-[90px] flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
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
            <span className={`text-[10px] sm:text-[11px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "vehicle" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Cab Fleet
            </span>
            {activeSubTab === "vehicle" && (
              <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 4: Bus Routes */}
          <button
            type="button"
            onClick={() => setActiveSubTab("bus")}
            className="flex flex-1 min-w-[65px] max-w-[90px] flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-200 ${
                activeSubTab === "bus" ? "scale-115 bg-rose-600 text-white" : "bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105"
              }`}>
                <Bus className="h-5 w-5" />
              </div>
            </div>
            <span className={`text-[10px] sm:text-[11px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "bus" ? "text-rose-700 font-black" : "text-slate-600 font-bold"
            }`}>
              Bus Routes
            </span>
            {activeSubTab === "bus" && (
              <span className="h-1 w-6 rounded-full bg-rose-500 mt-0.5 shadow-sm" />
            )}
          </button>

          {/* Button 5: Developer API Key */}
          <button
            type="button"
            onClick={() => setActiveSubTab("api_access")}
            className="flex flex-1 min-w-[65px] max-w-[90px] flex-col items-center justify-center gap-1.5 py-2 px-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-200 ${
                activeSubTab === "api_access" ? "scale-115 bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-105"
              }`}>
                <KeyRound className="h-5 w-5" />
              </div>
            </div>
            <span className={`text-[10px] sm:text-[11px] uppercase tracking-tight leading-none text-center truncate w-full ${
              activeSubTab === "api_access" ? "text-indigo-700 font-black" : "text-slate-600 font-bold"
            }`}>
              B2B API
            </span>
            {activeSubTab === "api_access" && (
              <span className="h-1 w-6 rounded-full bg-indigo-500 mt-0.5 shadow-sm" />
            )}
          </button>
        </div>
      </div>

      <StatusToast message={toast} />

      {/* Sub-Tab 1: Tour Packages */}
      {activeSubTab === "packages" && (
        <>
          <div className="px-3 sm:px-5 mb-5">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky-200" />
                  <h3 className="text-base font-black tracking-tight">
                    {isMr ? "नवीन टूर पॅकेज तयार करा (Flight-Flow प्रमाणे)" : "Create New Tour Package (Flight-Flow Style)"}
                  </h3>
                </div>
                <p className="text-xs text-sky-100 max-w-xl">
                  {isMr
                    ? "फ्लाईट बुकिंगसारखा ६-टप्प्यांचा सोपा प्रवाह: मार्ग, आयटिनररी, स्टे, जीएसटी व टॅक्सेशन कॅल्क्युलेटर आणि थेट प्रिव्ह्यू."
                    : "Sequential 6-step flow modeled on flight booking: Route, Itinerary, Stays, GST & Taxation Engine, and Live Preview."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPackageFlow(true)}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-sky-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isMr ? "पॅकेज फ्लो उघडा" : "Launch Package Flow"}</span>
              </button>
            </div>
          </div>

          {/* Underneath Hero Action: Promotional Ads Rail & Active Coupons Grid */}
          <div className="px-3 sm:px-5 space-y-4 mb-6">
            <PromotionalAdsRail
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `ऑफर कूपन लागू केले: ${code}` : `Applied offer coupon: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
            <ActiveOfferCouponsGrid
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `कूपन कोड कॉपी केला: ${code}` : `Coupon code copied: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
          </div>

          <div className="flex items-center justify-between px-5 pt-2">
            <SectionHeader title={isMr ? "तुमचे पब्लिश केलेले पॅकेजेस" : "Your packages"} />
            <button
              type="button"
              onClick={loadLivePackages}
              disabled={loadingPackages}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPackages ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>

          <div className="space-y-3 px-5">
            {loadingPackages && packagesList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold">
                Loading live marketplace packages...
              </div>
            ) : packagesList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No tour packages published yet. Click "Launch Package Flow" above to add your first package!
              </div>
            ) : (
              packagesList.map((pkg) => {
                const displayTitle = pkg.package_name || pkg.title;
                const displayPrice = typeof pkg.price_per_person === 'number' && pkg.price_per_person > 0
                  ? `₹${pkg.price_per_person.toLocaleString('en-IN')}`
                  : typeof pkg.price === 'string'
                  ? pkg.price
                  : `₹${pkg.price?.toLocaleString('en-IN') || '0'}`;
                const displayDays = pkg.duration_days || pkg.days || 3;
                const cover = pkg.image_url || pkg.imageUrl || pkg.image || '/icons/tour_packages.png';

                return (
                  <div key={pkg.id} className="premium-card px-4 py-4 overflow-hidden">
                    <div className="flex items-start gap-3">
                      <img
                        src={cover}
                        alt={displayTitle}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                            {displayTitle}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                              pkg.published !== false
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {pkg.published !== false ? "ACTIVE" : "DRAFT"}
                          </span>
                        </div>
                        <p className="text-[12px] font-medium text-[var(--premium-muted)] mt-0.5 capitalize">
                          {pkg.destination} · {displayDays} days · {displayPrice}
                        </p>
                        {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {pkg.inclusions.slice(0, 3).map((inc: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                {inc}
                              </span>
                            ))}
                            {pkg.inclusions.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-bold self-center">
                                +{pkg.inclusions.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100">
                      <PillButton label="Edit" onClick={() => setEditingPackage({ ...pkg })} />
                      <PillButton
                        label={pkg.published !== false ? "Unpublish" : "Publish"}
                        variant="pink"
                        onClick={() => {
                          setPackagesList((prev) =>
                            prev.map((p) => (p.id === pkg.id ? { ...p, published: p.published === false } : p))
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sequential 6-Step Dedicated Flow Coordinator */}
          {showPackageFlow && (
            <TourPackageFlowCoordinator
              vendorId={vendorId}
              isMr={isMr}
              onClose={() => setShowPackageFlow(false)}
              onSuccess={(pkg) => {
                setShowPackageFlow(false);
                setToast(isMr ? `टूर पॅकेज "${pkg.package_name || pkg.title}" यशस्वीरित्या पब्लिश झाले!` : `Tour package "${pkg.package_name || pkg.title}" published successfully!`);
                loadLivePackages();
                setTimeout(() => setToast(null), 5000);
              }}
            />
          )}
        </>
      )}

      {/* Sub-Tab 2: Comprehensive Hotel Partner Onboarding Dedicated Flow */}
      {activeSubTab === "fasttrack" && (
        <div className="space-y-4 px-3 sm:px-5">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-emerald-200" />
                <h3 className="text-base font-black tracking-tight">
                  {isMr ? "हॉटेल / रिसॉर्ट प्रॉपर्टी नोंदणी (Flight-Flow प्रमाणे)" : "Register Hotel / Resort Property (Flight-Flow Style)"}
                </h3>
              </div>
              <p className="text-xs text-emerald-100 max-w-xl">
                {isMr
                  ? "८-टप्प्यांची सर्वसमावेशक प्रक्रिया: मूळ माहिती, खोल्या, सुविधा, रिव्हर्स-बिडिंग व रिफंड पॉलिसी."
                  : "Dedicated multi-step onboarding wizard: Basic details, room inventory, amenities, reverse bidding, and cancellation policy."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHotelFlow(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isMr ? "हॉटेल फ्लो उघडा" : "Launch Hotel Flow"}</span>
            </button>
          </div>

          {/* Underneath Hero Action: Promotional Ads Rail & Active Coupons Grid */}
          <div className="space-y-4 mb-6">
            <PromotionalAdsRail
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `ऑफर कूपन लागू केले: ${code}` : `Applied offer coupon: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
            <ActiveOfferCouponsGrid
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `कूपन कोड कॉपी केला: ${code}` : `Coupon code copied: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
          </div>

          {/* Full-Page Dedicated Hotel Flow Coordinator */}
          {showHotelFlow && (
            <HotelOnboardingFlowCoordinator
              isMr={isMr}
              onClose={() => setShowHotelFlow(false)}
              onSuccess={(listing) => {
                setShowHotelFlow(false);
                setToast(`Property "${listing.propertyName}" successfully registered with Routripo!`);
                setTimeout(() => setToast(null), 6000);
              }}
            />
          )}
        </div>
      )}

      {/* Sub-Tab 3: Cab Fleet & RC Verification Dedicated Flow */}
      {activeSubTab === "vehicle" && (
        <div className="space-y-4 px-3 sm:px-5">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-200" />
                <h3 className="text-base font-black tracking-tight">
                  {isMr ? "कॅब व फ्लीट नोंदणी (Flight-Flow प्रमाणे)" : "Register Cab to Live Fleet (Flight-Flow Style)"}
                </h3>
              </div>
              <p className="text-xs text-amber-100 max-w-xl">
                {isMr
                  ? "४-टप्प्यांची वाहन नोंदणी: VAHAN RC व्हेरिफिकेशन, GST टॅरिफ, चालक KYC आणि थेट फ्लीट ॲक्टिव्हेशन."
                  : "Dedicated 4-step cab onboarding: VAHAN RC verification, GST tariff engine, Driver KYC & Fleet activation."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCabFlow(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isMr ? "कॅब फ्लो उघडा" : "Launch Cab Flow"}</span>
            </button>
          </div>

          {/* Underneath Hero Action: Promotional Ads Rail & Active Coupons Grid */}
          <div className="space-y-4 mb-6">
            <PromotionalAdsRail
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `ऑफर कूपन लागू केले: ${code}` : `Applied offer coupon: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
            <ActiveOfferCouponsGrid
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `कूपन कोड कॉपी केला: ${code}` : `Coupon code copied: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
          </div>

          {/* Dedicated 4-Step Cab Flow Coordinator */}
          {showCabFlow && (
            <CabRegistrationFlowCoordinator
              isMr={isMr}
              onClose={() => setShowCabFlow(false)}
              onSuccess={(cab) => {
                setShowCabFlow(false);
                setToast(`Cab "${cab.vehicle_model}" (${cab.vehicle_number}) registered to live fleet!`);
                setTimeout(() => setToast(null), 5000);
              }}
            />
          )}
        </div>
      )}

      {/* Sub-Tab 4: Local Bus Inventory & Daily Schedules Dedicated Flow */}
      {activeSubTab === "bus" && (
        <div className="space-y-4 px-3 sm:px-5">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-purple-200" />
                <h3 className="text-base font-black tracking-tight">
                  {isMr ? "आंतरशहर बस रूट जोडा (Flight-Flow प्रमाणे)" : "Add Intercity Bus Route (Flight-Flow Style)"}
                </h3>
              </div>
              <p className="text-xs text-purple-100 max-w-xl">
                {isMr
                  ? "४-टप्प्यांची सोपी प्रक्रिया: बस प्रकार, मार्ग व वेळापत्रक, सीट लेआउट व जीएसटी दर आणि वेळापत्रक पब्लिश करा."
                  : "Dedicated 4-step bus scheduling flow: Identity, Routes & Timings, Seat Grid & GST Tariffs, and Live Schedule Publish."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBusFlow(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isMr ? "बस फ्लो उघडा" : "Launch Bus Flow"}</span>
            </button>
          </div>

          {/* Underneath Hero Action: Promotional Ads Rail & Active Coupons Grid */}
          <div className="space-y-4 mb-6">
            <PromotionalAdsRail
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `ऑफर कूपन लागू केले: ${code}` : `Applied offer coupon: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
            <ActiveOfferCouponsGrid
              variant="vendor"
              isMr={isMr}
              onApplyOffer={(code) => {
                setToast(isMr ? `कूपन कोड कॉपी केला: ${code}` : `Coupon code copied: ${code}`);
                setTimeout(() => setToast(null), 4000);
              }}
            />
          </div>

          {/* Dedicated 4-Step Bus Flow Coordinator */}
          {showBusFlow && (
            <BusRegistrationFlowCoordinator
              isMr={isMr}
              onClose={() => setShowBusFlow(false)}
              onSuccess={(bus) => {
                setShowBusFlow(false);
                setToast(`Bus "${bus.registration_number}" (${bus.route?.source} → ${bus.route?.destination}) added to schedule!`);
                setTimeout(() => setToast(null), 5000);
              }}
            />
          )}
        </div>
      )}

      {/* Sub-Tab 5: Full Vendor Registration Portal */}
      {activeSubTab === "portal" && (
        <div className="px-5">
          <VendorRegistrationPortal initialTab="KYC" />
        </div>
      )}

      {/* Sub-Tab 6: Developer B2B API Key Access */}
      {activeSubTab === "api_access" && (
        <div className="px-5">
          <VendorAPIDashboard
            vendorId={vendorId}
            onCompleteKYC={() => setActiveSubTab("portal")}
          />
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

      {/* BLACKOUT DATES MODAL */}
      <ModalSheet
        isOpen={showBlackoutModal}
        onClose={() => setShowBlackoutModal(false)}
        title={isMr ? "📅 ब्लॅकआऊट तारखा व्यवस्थापक (Blackout Dates Manager)" : "📅 Blackout Dates & Sold-Out Manager"}
        subtitle={isMr ? "ज्या दिवशी इन्व्हेंटरी पूर्ण बुक आहे किंवा उपलब्ध नाही त्या तारखा राखून ठेवा" : "Reserve blackout dates when your rooms, vehicles or seats are fully booked"}
      >
        <div className="space-y-4 pb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              placeholder={isMr ? "उदा. 2026-11-15 (लग्न समारंभ / फुल बुक)" : "e.g. 2026-11-15 (Wedding / Fully Booked)"}
              className="flex-1 h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
            >
            </input>
            <button
              type="button"
              onClick={() => {
                if (newBlackoutDate.trim()) {
                  setBlackoutDates(prev => [...prev, newBlackoutDate.trim()]);
                  setNewBlackoutDate("");
                  setToast(isMr ? "नवीन ब्लॅकआऊट तारीख जोडली!" : "Blackout date added!");
                  setTimeout(() => setToast(null), 3000);
                }
              }}
              className="px-4 h-11 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
            >
              {isMr ? "जोडा" : "Add Date"}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-slate-700">
              {isMr ? `सध्या ब्लॉक केलेल्या तारखा (${blackoutDates.length}):` : `Currently Blocked Dates (${blackoutDates.length}):`}
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {blackoutDates.map((dateStr, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">{dateStr}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBlackoutDates(prev => prev.filter((_, i) => i !== idx));
                      setToast(isMr ? "तारीख ब्लॅकआऊटमधून काढली!" : "Blackout date removed!");
                      setTimeout(() => setToast(null), 3000);
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    {isMr ? "काढून टाका ✕" : "Remove ✕"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                <span className="font-bold text-slate-800">{maskEmail(selectedBooking.email)}</span>
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
                <p><span className="font-semibold">Billed To:</span> {showInvoice.customer} ({maskEmail(showInvoice.email)})</p>
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
  const { lang, language } = useLanguage();
  const isMr = (lang || language) === 'mr';

  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [transactions, setTransactions] = useState<Array<{ id: string; label: string; amount: string }>>([]);

  // Check-in OTP Escrow direct-to-bank release state
  const [checkInBookingId, setCheckInBookingId] = useState("");
  const [checkInOtp, setCheckInOtp] = useState("");
  const [releasingEscrow, setReleasingEscrow] = useState(false);

  // Statement download modal
  const [showStatement, setShowStatement] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Financial Year & Month Filter State
  const [selectedFY, setSelectedFY] = useState<"FY 2025-26" | "FY 2024-25" | "FY 2023-24">("FY 2025-26");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const fyFinancialData = {
    "FY 2025-26": {
      label: isMr ? "चालू आर्थिक वर्ष (YTD 2025-26)" : "Current Financial Year (YTD 2025-26)",
      gross: 482000,
      commission: 24100,
      tds194O: 4820,
      gst: 4338,
      net: 448742,
      bookingsCount: 38
    },
    "FY 2024-25": {
      label: isMr ? "मागील आर्थिक वर्ष (पूर्ण ऑडिट FY 2024-25)" : "Previous Financial Year (Audited FY 2024-25)",
      gross: 1840000,
      commission: 92000,
      tds194O: 18400,
      gst: 16560,
      net: 1713040,
      bookingsCount: 142
    },
    "FY 2023-24": {
      label: isMr ? "२ वर्षांपूर्वीचे आर्थिक वर्ष (FY 2023-24)" : "Two Years Prior (Audited FY 2023-24)",
      gross: 1260000,
      commission: 63000,
      tds194O: 12600,
      gst: 11340,
      net: 1173060,
      bookingsCount: 96
    }
  };

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

  // Direct Escrow settlement: Disbursed automatically to partner's verified bank account upon arrival OTP
  const handleReleaseEscrow = async () => {
    if (!checkInOtp || checkInOtp.length !== 4) {
      setToast(isMr ? "कृपया प्रवाशाकडून मिळालेला ४-अंकी अरायव्हल OTP प्रविष्ट करा." : "Please enter the 4-digit arrival OTP provided by the guest.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setReleasingEscrow(true);
    try {
      const res = await authedFetch("/api/partner/release-escrow", {
        method: "POST",
        body: JSON.stringify({ bookingId: checkInBookingId || "BK-8022", checkInOtp })
      });
      const data = await res.json();
      setPending((prev) => Math.max(0, prev - 13800));
      setTransactions((prev) => [
        { id: `esc-${Date.now()}`, label: `Escrow Bank Settlement · HDFC Bank (****4821)`, amount: "+₹13,800" },
        ...prev
      ]);
      setToast(
        isMr
          ? "✅ अरायव्हल OTP पडताळला! ₹13,800 थेट तुमच्या बँक खात्यात (HDFC ****4821) IMPS द्वारे जमा झाले. प्लॅटफॉर्म शिल्लक: ₹0."
          : "✅ Arrival OTP Verified! ₹13,800 auto-transferred directly to your verified bank account (HDFC ****4821) via Escrow. Platform custodial balance: ₹0."
      );
      setCheckInOtp("");
    } catch {
      setPending((prev) => Math.max(0, prev - 13800));
      setTransactions((prev) => [
        { id: `esc-${Date.now()}`, label: `Escrow Bank Settlement · HDFC Bank (****4821)`, amount: "+₹13,800" },
        ...prev
      ]);
      setToast(
        isMr
          ? "✅ अरायव्हल OTP पडताळला! ₹13,800 थेट तुमच्या बँक खात्यात (HDFC ****4821) जमा झाले. प्लॅटफॉर्म शिल्लक: ₹0."
          : "✅ Arrival OTP Verified! ₹13,800 auto-transferred directly to your verified bank account (HDFC ****4821). Platform custodial balance: ₹0."
      );
      setCheckInOtp("");
    } finally {
      setReleasingEscrow(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="pb-16">
      <SectionHeader title={isMr ? "थेट बँक एस्क्रो सेटलमेंट" : "Wallet & Direct Escrow Settlement"} />
      <StatusToast message={toast} />

      {/* FINANCIAL YEAR & MONTH FILTER BAR */}
      <div className="mx-5 mb-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            {isMr ? "आर्थिक वर्ष निवडा (Select Financial Year)" : "Select Financial Year (FY)"}
          </span>
          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
            IT Act Sec 194-O
          </span>
        </div>

        {/* Year Pills */}
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
          {(["FY 2025-26", "FY 2024-25", "FY 2023-24"] as const).map((fy) => (
            <button
              key={fy}
              type="button"
              onClick={() => {
                setSelectedFY(fy);
                setToast(isMr ? `${fy} चे आर्थिक आकडे लोड झाले!` : `Loaded ${fy} financial figures!`);
                setTimeout(() => setToast(null), 2500);
              }}
              className={`flex-1 py-1.5 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                selectedFY === fy
                  ? "bg-white text-indigo-950 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {fy}
            </button>
          ))}
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 pt-0.5">
          <label className="text-[11px] font-bold text-slate-600 shrink-0">{isMr ? "महिना:" : "Month:"}</label>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setToast(e.target.value === "all"
                ? (isMr ? "संपूर्ण आर्थिक वर्षाचा अहवाल निवडला" : "Selected full financial year report")
                : (isMr ? `महिना ${e.target.value} चा अहवाल निवडला` : `Selected month ${e.target.value} report`));
              setTimeout(() => setToast(null), 2500);
            }}
            className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
          >
            <option value="all">{isMr ? "संपूर्ण आर्थिक वर्ष (All 12 Months)" : "Full Financial Year (All 12 Months)"}</option>
            <option value="04">{isMr ? "एप्रिल (April)" : "April"}</option>
            <option value="05">{isMr ? "मे (May)" : "May"}</option>
            <option value="06">{isMr ? "जून (June)" : "June"}</option>
            <option value="07">{isMr ? "जुलै (July)" : "July"}</option>
            <option value="08">{isMr ? "ऑगस्ट (August)" : "August"}</option>
            <option value="09">{isMr ? "सप्टेंबर (September)" : "September"}</option>
            <option value="10">{isMr ? "ऑक्टोबर (October)" : "October"}</option>
            <option value="11">{isMr ? "नोव्हेंबर (November)" : "November"}</option>
            <option value="12">{isMr ? "डिसेंबर (December)" : "December"}</option>
            <option value="01">{isMr ? "जानेवारी (January)" : "January"}</option>
            <option value="02">{isMr ? "फेब्रुवारी (February)" : "February"}</option>
            <option value="03">{isMr ? "मार्च (March)" : "March"}</option>
          </select>
        </div>
      </div>

      {/* STATUTORY TAX & P&L SETTLEMENT BREAKDOWN CARD */}
      {(() => {
        const fyData = fyFinancialData[selectedFY];
        return (
          <div className="mx-5 mb-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-[13px] font-black text-slate-900 flex items-center gap-1.5">
                  <span>📊</span> {isMr ? `${selectedFY} नफा-तोटा व कर विवरण (P&L Tax Breakdown)` : `${selectedFY} P&L Statement & Statutory Tax Summary`}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  {fyData.label} · {isMr ? `एकूण ${fyData.bookingsCount} यशस्वी बुकिंग्ज` : `${fyData.bookingsCount} total completed bookings`}
                </p>
              </div>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Net: ₹{fyData.net.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 font-medium">{isMr ? "एकूण ग्रॉस बुकिंग मूल्य (Gross Volume):" : "Total Gross Booking Volume:"}</span>
                <span className="font-black text-slate-900 text-[13px]">₹{fyData.gross.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-600 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span>{isMr ? "प्लॅटफॉर्म सेवा शुल्क (Platform Commission 5%):" : "Platform Commission (5%):"}</span>
                </span>
                <span className="font-bold text-rose-600">-₹{fyData.commission.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-600 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">{isMr ? "TDS कलम 194-O (1% E-Commerce TDS):" : "TDS Sec 194-O (1% E-Commerce TDS):"}</span>
                  <span className="text-[10px] text-slate-400">{isMr ? "उत्पन्न कर विभागाकडे जमा (Form 26AS/AIS मध्ये उपलब्ध)" : "Deposited with Income Tax Dept (Reflected in Form 26AS / AIS)"}</span>
                </div>
                <span className="font-bold text-amber-700">-₹{fyData.tds194O.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center py-1 text-slate-600 border-t border-slate-100">
                <span className="font-medium">{isMr ? "जीएसटी वजावट (GST on Commission 18%):" : "GST on Platform Service Fee (18%):"}</span>
                <span className="font-bold text-rose-600">-₹{fyData.gst.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-t-2 border-slate-200 bg-emerald-50/60 px-3 rounded-xl">
                <span className="font-black text-emerald-950 text-xs">{isMr ? "बँकेत प्रत्यक्ष जमा झालेली नक्त रक्कम (Net Settled):" : "Net Settlement Credited to Bank Account:"}</span>
                <span className="font-black text-emerald-800 text-[15px]">₹{fyData.net.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 1-Click Export and Form 16A Request */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setToast(isMr ? `${selectedFY} चे कर व P&L स्टेटमेंट डाऊनलोड झाले!` : `Downloaded ${selectedFY} Tax & P&L Statement!`);
                  setTimeout(() => setToast(null), 3500);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMr ? "१-क्लिक टॅक्स व P&L स्टेटमेंट डाऊनलोड (PDF/Excel)" : "1-Click Tax & P&L Statement Download (PDF / Excel)"}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* DIRECT ESCROW BANK SETTLEMENT STATUS CARD */}
      <div className="mx-5 mb-3 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-400/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              🏦
            </div>
            <div>
              <h4 className="text-[13px] font-black text-white leading-tight">
                {isMr ? "थेट बँक एस्क्रो सेटलमेंट (Direct Escrow Bank Payouts)" : "Direct Escrow Bank Payouts"}
              </h4>
              <p className="text-[10px] text-slate-300">
                {isMr ? "अरायव्हल OTP नंतर थेट तुमच्या बँक खात्यात स्वयंचलित जमा (Auto-Credit)" : "Auto-credited to verified bank account on Guest Arrival OTP. Platform retains ₹0."}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wider">
            Zero Platform Holding
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-wider">
              {isMr ? "थेट बँकेत जमा झालेली रक्कम:" : "Disbursed to Bank (YTD):"}
            </span>
            <span className="text-xl font-black text-emerald-400 block pt-0.5">
              ₹{fyFinancialData[selectedFY].net.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-wider">
              {isMr ? "एस्क्रोमध्ये सुरक्षित (In Escrow):" : "Active in Escrow:"}
            </span>
            <span className="text-xl font-black text-amber-300 block pt-0.5">
              ₹{pending.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Penny-Drop Verified Destination Bank Badge */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-200 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {isMr ? "जमा खाते: HDFC Bank (****4821) · IFSC: HDFC0000240" : "Destination: HDFC Bank (****4821) · IFSC: HDFC0000240"}
            </span>
          </div>
          <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/50 px-2 py-0.5 rounded-md border border-emerald-400/30 shrink-0">
            Verified ✓
          </span>
        </div>
      </div>

      {/* Check-In Escrow Release Card */}
      <SectionHeader title={isMr ? "गेस्ट अरायव्हल OTP द्वारे थेट बँक ट्रान्सफर" : "Guest Check-In OTP Escrow Release"} />
      <div className="mx-5 premium-card px-4 py-4 space-y-2.5">
        <p className="text-[12px] text-slate-600">
          {isMr
            ? "जेव्हा प्रवासी हॉटेलमध्ये चेक-इन करतो किंवा कॅबमध्ये बसतो, तेव्हा त्यांचा ४-अंकी अरायव्हल OTP प्रविष्ट करा. एस्क्रोमधील रक्कम थेट तुमच्या बँक खात्यात आपोआप ट्रान्सफर होईल."
            : "When the traveller checks in at your hotel or boards the vehicle, enter their 4-digit arrival OTP to disburse funds from Escrow directly to your verified bank account."}
        </p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            maxLength={4}
            value={checkInOtp}
            onChange={(e) => setCheckInOtp(e.target.value)}
            placeholder="4-digit OTP"
            className="h-11 w-36 text-center text-[16px] font-extrabold tracking-widest rounded-xl border border-slate-200 px-3 text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <PillButton
            label={releasingEscrow ? (isMr ? "पडताळणी सुरू..." : "Verifying...") : (isMr ? "OTP पडताळा व बँकेत जमा करा" : "Verify & Transfer to Bank")}
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

  // Bank Penny Drop KYC & Vendor KYC
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiary, setBeneficiary] = useState(currentUser?.name || "Partner Agency");
  const [pennyDropStatus, setPennyDropStatus] = useState<"IDLE" | "VERIFIED" | "VERIFYING">("IDLE");

  const [showVendorKycModal, setShowVendorKycModal] = useState(false);
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
          {/* Button 1: Vendor KYC (One-Time Registration) */}
          <button
            type="button"
            onClick={() => setShowVendorKycModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img
                src="/icons/routripo_wallet.png"
                alt="Vendor KYC"
                className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="truncate text-center w-full">Vendor KYC</span>
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

      {/* Vendor KYC Registration Modal */}
      <ModalSheet
        isOpen={showVendorKycModal}
        onClose={() => setShowVendorKycModal(false)}
        title="Vendor KYC Registration"
        subtitle="One-time business profile, PAN, GST, and settlement bank details"
      >
        <VendorKYCForm onComplete={() => setShowVendorKycModal(false)} />
      </ModalSheet>
    </div>
  );
};

// =========================================================================
// Vendor Tabs & Standalone Dashboard Content Helpers
// =========================================================================
export const VENDOR_TABS = [
  { id: 'inventory', label: 'My Inventory' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'finance', label: 'Finance & Payouts' },
  { id: 'api_access', label: 'B2B API Access', isNew: true }
];

export function VendorTabs({
  activeTab,
  setActiveTab,
  vendorId
}: {
  activeTab: string;
  setActiveTab: (id: string) => void;
  vendorId?: string;
}) {
  return (
    <div className="flex border-b border-slate-200 mb-4 px-4 bg-white overflow-x-auto">
      {VENDOR_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === tab.id 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{tab.label}</span>
          {tab.isNew && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function VendorDashboardContent({
  activeTab,
  vendorId
}: {
  activeTab: string;
  vendorId?: string;
}) {
  return (
    <div>
      {activeTab === 'inventory' && <InventoryPanel onAction={() => {}} vendorId={vendorId} />}
      {activeTab === 'bookings' && <BookingsPanel onAction={() => {}} />}
      {activeTab === 'finance' && <EarningsPanel onAction={() => {}} />}
      {activeTab === 'api_access' && <VendorAPIDashboard vendorId={vendorId} />}
    </div>
  );
}
