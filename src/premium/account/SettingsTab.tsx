import React, { useState } from "react";
import type { AccountItemId } from "./types";
import { useTripContext } from "../../context/TripContext";

export interface SettingsTabProps {
  userName?: string;
  userEmail?: string;
  language?: string;
  currency?: string;
  userRole?: string;
  onSelect: (item: AccountItemId) => void;
  onBack?: () => void;
}

/**
 * RouTripo - Profile & Account Settings Hub
 * Conforms 100% to the verified mobile screen specification:
 * Curved brand header, verified user profile with travel pills,
 * 2x2 numerical stats grid, Quick wallet & bids, 4 grouped settings sections,
 * and danger zone actions (Delete Account & Log Out).
 */
export const SettingsTab: React.FC<SettingsTabProps> = ({
  userName = "Cara Sharma",
  userEmail = "c•••••a@routtripo.com",
  language = "English",
  currency = "INR",
  userRole = "customer",
  onSelect,
  onBack
}) => {
  const [locationBeacon, setLocationBeacon] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tripContext = useTripContext?.();
  const tripsCount = tripContext?.trips?.length || 18;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFC] min-h-screen flex flex-col font-['Outfit',sans-serif] text-slate-900 pb-28 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[100] max-w-xs px-4">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span>{toastMessage}</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          </div>
        </div>
      )}

      {/* 1. Signature RouTripo Curved Brand Header */}
      <header className="w-full bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 border-b border-sky-200/80 px-4 pt-4 pb-4 rounded-b-[24px] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBack ? onBack() : onSelect("booking-upcoming")}
              aria-label="Go Back"
              className="w-9 h-9 rounded-full bg-white/80 border border-sky-200/80 flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col justify-center">
              <div className="flex items-center tracking-tight text-[1.3rem] font-extrabold leading-none">
                <span className="text-[#0284C7]">Rou</span>
                <span className="bg-[#FF5722] text-white text-[0.95rem] px-1.5 py-0.5 rounded-md mx-0.5 font-black leading-none shadow-sm">
                  T
                </span>
                <span className="text-[#EC4899]">ripo</span>
              </div>
              <span className="text-[0.68rem] font-semibold text-sky-800 tracking-wide mt-1 flex items-center gap-1">
                Profile &amp; Account Hub
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect("sos")}
              aria-label="Emergency SOS and Notifications"
              className="relative w-9 h-9 rounded-full bg-white/90 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-50 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-rose-600">notifications_active</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Canvas */}
      <div className="px-4 pt-2 space-y-4 flex-1">
        {/* 2. User Profile Hero Section */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-sky-500/5 rounded-full pointer-events-none blur-2xl" />
          
          <div className="flex items-start gap-4">
            {/* Avatar with Edit Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-[#006591] via-[#0ea5e9] to-[#8B5CF6] shadow-sm overflow-hidden flex items-center justify-center bg-slate-100">
                <img
                  alt={`${userName} avatar`}
                  className="w-full h-full object-cover rounded-[14px]"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1UE5X8wPfMbASxWvI1WI_HWi6F8q003jMkmn6Ts8DFb566-VfgdDxQS0VqORfV64luM0AAe2aeku_Q2MSYA7fewW9MPGXKmJqbY-DAZNnNild8iEh2hV9LVTMHhXkO9dMoDAujXROSRw6lS1Ox7QH2If7d7LppHgCbjEKpae9NEUUnAp5IpfHEfxC3rElDVTXrfE6jeapUmIltUxcOCFlP7AcqiXGwE19KELxU5otl3sOnp2iQtX5K3AnU"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => onSelect("profile")}
                aria-label="Edit Profile"
                className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-white border border-sky-600/40 rounded-full flex items-center gap-1 text-sky-700 shadow-sm hover:bg-sky-50 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span className="font-mono text-[11px] font-bold">Edit</span>
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[1.25rem] font-bold text-slate-900 truncate leading-tight">
                    {userName}
                  </h2>
                  <span
                    className="material-symbols-outlined text-[#0ea5e9] text-[19px] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <span
                      className="material-symbols-outlined text-[12px] text-amber-600"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    Gold VIP Voyager
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Tier 2
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[0.875rem] text-slate-600 flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[#006591] text-[15px]">call</span>
                  <span>+91 98765 •••••</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold ml-1 inline-flex items-center gap-0.5">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    Verified
                  </span>
                </p>
                <p className="text-[0.875rem] text-slate-500 flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[#006591] text-[15px]">mail</span>
                  <span>{userEmail}</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold ml-1 inline-flex items-center gap-0.5">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    Verified
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Travel Defaults Pills */}
          <div className="pt-2 mt-3 border-t border-slate-200 flex flex-col space-y-1.5">
            <span className="font-mono text-[11px] text-slate-700 font-bold tracking-wider uppercase">
              Default Travel Preferences
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 font-mono text-[12px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
                BOM (Mumbai)
              </div>
              <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[12px] font-semibold">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">restaurant</span>
                Veg Meal
              </div>
              <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-[12px]">
                <span className="material-symbols-outlined text-[14px] text-[#006591]">airline_seat_recline_extra</span>
                Window Seat
              </div>
              <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[12px] font-semibold">
                <span className="material-symbols-outlined text-[14px] text-purple-600">stars</span>
                6E Rewards Linked
              </div>
            </div>
          </div>
        </section>

        {/* 3. Numerical Stats Grid (2x2) */}
        <section className="grid grid-cols-2 gap-2">
          {/* Stat 1: Completed Trips */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.875rem] text-slate-600 font-medium">Completed Trips</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">luggage</span>
              </div>
            </div>
            <span className="text-[1.5rem] font-bold text-blue-700 tracking-tight">
              {tripsCount}
            </span>
            <span className="font-mono text-[12px] text-blue-600 font-semibold mt-1">
              +3 this season
            </span>
          </div>

          {/* Stat 2: Bargain Savings */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.875rem] text-slate-600 font-medium">Bargain Savings</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">payments</span>
              </div>
            </div>
            <span className="text-[1.5rem] font-bold text-emerald-600 tracking-tight">
              ₹24,850
            </span>
            <span className="font-mono text-[12px] text-emerald-700 font-semibold mt-1">
              Direct wallet credit
            </span>
          </div>

          {/* Stat 3: RouTripo Coins */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.875rem] text-slate-600 font-medium">RouTripo Coins</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px]">toll</span>
              </div>
            </div>
            <span className="text-[1.5rem] font-bold text-amber-600 tracking-tight">
              3,420
            </span>
            <span className="font-mono text-[12px] text-amber-700 font-semibold mt-1">
              ₹342 redeemable
            </span>
          </div>

          {/* Stat 4: Traveler Rating */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.875rem] text-slate-600 font-medium">Traveler Rating</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[17px] text-purple-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[1.5rem] font-bold text-purple-800 tracking-tight">
                4.95
              </span>
              <span
                className="material-symbols-outlined text-amber-500 text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <span className="font-mono text-[12px] text-slate-400 font-medium mt-1">
              From 42 verified hosts
            </span>
          </div>
        </section>

        {/* 4. Quick Feature Action Chips */}
        <section className="space-y-1.5">
          <h3 className="font-mono text-[11px] text-slate-400 font-bold tracking-wider uppercase">
            Quick Wallet &amp; Bids
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Live Bids */}
            <button
              type="button"
              onClick={() => onSelect("bargain-requests")}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-[#0ea5e9]/40 rounded-full hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[12px] text-slate-900 font-bold">Live Bids</span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-mono text-[10px] font-bold">
                  2 active
                </span>
              </div>
            </button>

            {/* Saved Places */}
            <button
              type="button"
              onClick={() => {
                onSelect("wishlist");
                showToast("Opening Saved Places & Wishlist...");
              }}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">bookmark</span>
              </div>
              <span className="font-mono text-[12px] text-slate-900 font-semibold">Saved Places</span>
            </button>

            {/* Travel Budget */}
            <button
              type="button"
              onClick={() => onSelect("wallet")}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[12px] text-slate-900 font-semibold">Travel Budget</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold">
                  ₹45,000
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* 5. Account Settings Groups */}

        {/* Group 1: Account & Security */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
            <h3 className="font-mono text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              Account &amp; Security
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {/* Item 1: Master Passenger List */}
            <button
              type="button"
              onClick={() => onSelect("profile")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Master Passenger List</p>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                      5 Saved
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">5 Co-Travellers • 1-Click Instant Booking</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 2: DigiLocker Vault */}
            <button
              type="button"
              onClick={() => onSelect("legal-vault")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield_with_heart
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[1rem] text-slate-900 font-semibold leading-tight">DigiLocker Vault</p>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">Aadhaar (XXXX-8921) &amp; Passport linked</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 3: Security & 2-Factor Auth */}
            <button
              type="button"
              onClick={() => {
                showToast("Biometric FaceID & 2FA is active and secured");
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">lock_person</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Security &amp; 2-Factor Auth</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Biometric FaceID &amp; SMS OTP Enabled</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Group 2: Travel & Bargaining Preferences */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
            <h3 className="font-mono text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              Travel &amp; Bargaining Preferences
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {/* Item 1: Travel Preferences */}
            <button
              type="button"
              onClick={() => onSelect("currency")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">flight_class</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Travel Preferences</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Seat: Window, Meal: Veg, Currency: {currency} (₹)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 2: App Language & Region */}
            <button
              type="button"
              onClick={() => onSelect("language")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">translate</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">App Language &amp; Region</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">{language} (India) • Auto Currency Active</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Group 3: Safety, SOS & Group Sharing */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
            <h3 className="font-mono text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              Safety, SOS &amp; Group Sharing
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {/* Item 1: Guardian SOS Network */}
            <button
              type="button"
              onClick={() => onSelect("sos")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">emergency_share</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Guardian SOS Network</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">3 Family emergency contacts synced &amp; active</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
                  3 Synced
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
              </div>
            </button>

            {/* Item 2: Live Trip Location Beacon */}
            <div className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">share_location</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Live Trip Location Beacon</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Sharing active automatically during journeys</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocationBeacon(!locationBeacon);
                  showToast(!locationBeacon ? "Trip location beacon enabled" : "Location sharing paused");
                }}
                className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  locationBeacon ? "bg-[#006c49] justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </section>

        {/* Group 4: Support & Essentials (Expanded) */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
            <h3 className="font-mono text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              Support &amp; Essentials
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {/* Item 1: About RouTripo Guarantee */}
            <button
              type="button"
              onClick={() => onSelect("about")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006591] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">About RouTripo Guarantee</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">100% Escrow &amp; instant refund terms</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 2: Terms & Conditions */}
            <button
              type="button"
              onClick={() => onSelect("about")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Terms &amp; Conditions</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Platform usage, ticketing &amp; cancellation policy</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 3: Privacy Policy */}
            <button
              type="button"
              onClick={() => onSelect("privacy")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">policy</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Privacy Policy</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">DPDP Act compliant, consent management &amp; encryption</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 4: Customer Helpdesk & FAQs */}
            <button
              type="button"
              onClick={() => onSelect("support")}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Customer Helpdesk &amp; FAQs</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">24x7 travel assistance &amp; instant dispute chat</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Role Portal Switchers for Vendors / Admins */}
        {(userRole === "agent" || userRole === "admin" || userRole === "vendor") && (
          <section className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-800">Role Portals</p>
              <p className="text-[11px] text-slate-500">Access vendor bidding &amp; admin controls</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect("agent-portal")}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                Vendor
              </button>
              {userRole === "admin" && (
                <button
                  type="button"
                  onClick={() => onSelect("admin-dashboard")}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 cursor-pointer"
                >
                  Admin
                </button>
              )}
            </div>
          </section>
        )}

        {/* Group 5: Account Danger Zone & Logout Actions */}
        <section className="pt-1 space-y-2 text-center">
          <button
            type="button"
            onClick={() => onSelect("delete-account")}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            <span>Delete Account &amp; Data</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("logout")}
            className="w-full py-2.5 rounded-xl border border-rose-600 text-white bg-rose-600 hover:bg-rose-700 font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Log Out</span>
          </button>

          <div className="py-2">
            <p className="font-mono text-[12px] text-slate-400">
              RouTripo v2.4.0 (Build 890)
            </p>
            <p className="font-mono text-[11px] text-slate-300 mt-0.5">
              Crafted for Indian Voyagers • Bharat
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
