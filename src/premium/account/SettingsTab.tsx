import React, { useState, useEffect } from "react";
import type { AccountItemId } from "./types";
import { useTripContext } from "../../context/TripContext";
import { GlobalBrandHeader, DEFAULT_USER_AVATAR } from "../../components/common/GlobalBrandHeader";
import { EditProfileModal, type ProfileFormData } from "./EditProfileModal";
import { useAuthStore } from "../../store/useAuthStore";
import { ClosedWalletModal } from "./ClosedWalletModal";
import { ClosedWalletService, type ClosedWalletAccount } from "../../services/ClosedWalletService";
import { MasterPassengerModal } from "./MasterPassengerModal";
import { MasterPassengerService } from "../../services/MasterPassengerService";
import { SecurityAuthModal } from "./SecurityAuthModal";
import { TravelPreferencesModal } from "./TravelPreferencesModal";
import { SosModal } from "../../components/modals/SosModal";
import { SupportDrawerModal, type SupportTopic } from "./SupportDrawerModal";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [supportDrawerTopic, setSupportDrawerTopic] = useState<SupportTopic | null>(null);
  const [walletAccount, setWalletAccount] = useState<ClosedWalletAccount>(ClosedWalletService.getAccount());
  const [passengerCount, setPassengerCount] = useState<number>(MasterPassengerService.getPassengers().length);

  useEffect(() => {
    const unsubWallet = ClosedWalletService.subscribe((updated) => {
      setWalletAccount(updated);
    });
    const unsubPassengers = MasterPassengerService.subscribe((list) => {
      setPassengerCount(list.length);
    });
    return () => {
      unsubWallet();
      unsubPassengers();
    };
  }, []);

  // Strip any "(Traveller)", "(Traveler)" or role from user name
  const cleanName = (rawName: string) => {
    if (!rawName) return "Aditi Sharma";
    return rawName
      .replace(/\s*\((.*?)\)/g, "")
      .replace(/\s*-\s*Travell?er/gi, "")
      .replace(/\s+Travell?er/gi, "")
      .trim();
  };

  // Mask Phone: e.g. +91 98765 •••••
  const maskPhone = (phone: string) => {
    if (!phone) return "+91 98765 •••••";
    if (phone.includes("•") || phone.includes("*")) return phone;
    const trimmed = phone.trim();
    if (trimmed.length >= 10) {
      return trimmed.slice(0, 8) + " •••••";
    }
    return trimmed;
  };

  // Mask Email: e.g. u•••••p@routripo.app
  const maskEmail = (email: string) => {
    if (!email) return "u•••••p@routripo.app";
    if (email.includes("•") || email.includes("*")) return email;
    const parts = email.split("@");
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 2) return `${name.charAt(0)}••@${domain}`;
      return `${name.charAt(0)}•••••${name.charAt(name.length - 1)}@${domain}`;
    }
    return email;
  };

  const [profileData, setProfileData] = useState<ProfileFormData>(() => {
    try {
      const saved = localStorage.getItem("routripo_user_preferences");
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        return {
          name: cleanName(parsedSaved.name || userName || "Aditi Sharma"),
          tag: "Traveller",
          phone: parsedSaved.phone || "+91 98765 43210",
          email: parsedSaved.email || userEmail || "user@routripo.app",
          avatar: parsedSaved.avatar || DEFAULT_USER_AVATAR,
          departureCity: parsedSaved.departureCity || "Mumbai (BOM)",
          dietaryPreference: parsedSaved.dietaryPreference || "Veg Meal",
          seatPreference: parsedSaved.seatPreference || "Window Seat",
          loyaltyProgram: parsedSaved.loyaltyProgram || "6E Rewards Linked",
          tier: parsedSaved.tier || "Gold VIP Voyager"
        };
      }
    } catch (e) {
      console.warn("Failed to load profile preferences", e);
    }
    return {
      name: cleanName(userName || "Aditi Sharma"),
      tag: "Traveller",
      phone: "+91 98765 43210",
      email: userEmail || "user@routripo.app",
      avatar: DEFAULT_USER_AVATAR,
      departureCity: "Mumbai (BOM)",
      dietaryPreference: "Veg Meal",
      seatPreference: "Window Seat",
      loyaltyProgram: "6E Rewards Linked",
      tier: "Gold VIP Voyager"
    };
  });

  const tripContext = useTripContext?.();
  const tripsCount = tripContext?.trips?.length || 18;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (updated: ProfileFormData) => {
    // Preserve system-assigned badges (Traveler Tag & Gold VIP Voyager)
    const sanitized: ProfileFormData = {
      ...updated,
      name: cleanName(updated.name),
      tag: profileData.tag || "Traveller",
      tier: profileData.tier || "Gold VIP Voyager"
    };
    setProfileData(sanitized);
    try {
      localStorage.setItem("routripo_user_preferences", JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    // Update global auth store
    useAuthStore.getState().updateUserProfile({
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      avatar: sanitized.avatar,
      departureCity: sanitized.departureCity,
      dietaryPreference: sanitized.dietaryPreference,
      seatPreference: sanitized.seatPreference,
      loyaltyProgram: sanitized.loyaltyProgram,
      tier: sanitized.tier
    });
    showToast("Profile updated successfully! All preferences saved.");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--premium-page)] min-h-screen flex flex-col font-['Outfit',sans-serif] text-slate-900 pb-28 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[100] max-w-xs px-4">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span>{toastMessage}</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          </div>
        </div>
      )}

      {/* 1. Signature RouTripo Curved Brand Header (Soft Ocean Mist) */}
      <GlobalBrandHeader
        subtitle="Profile & Account Hub"
        theme="ocean"
        avatarSrc={profileData.avatar}
        onNotifications={() => onSelect("sos")}
        onOpenProfile={() => {
          setIsEditModalOpen(true);
        }}
      />

      {/* Content Canvas */}
      <div className="px-4 pt-2 space-y-4 flex-1">
        {/* 2. User Profile Hero Section (Compact & Sleek) */}
        <section className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/5 rounded-full pointer-events-none blur-2xl" />
          
          <div className="flex items-center gap-3.5">
            {/* Left Column: Avatar Photo */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit Profile"
              className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-sky-500 via-indigo-500 to-pink-500 shadow-2xs overflow-hidden flex items-center justify-center bg-slate-100 hover:opacity-95 transition-opacity cursor-pointer shrink-0"
            >
              <img
                alt={`${profileData.name} avatar`}
                className="w-full h-full object-cover rounded-[14px]"
                src={profileData.avatar || DEFAULT_USER_AVATAR}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
                }}
              />
            </button>

            {/* Right Column: Name & Details on Left, Badges & Ticks on the Far Right */}
            <div className="flex-1 min-w-0">
              {/* Row 1: Clean Name on Left, Blue Verified Tick + Gold VIP Badge on Far Right */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h2 className="text-[1.05rem] sm:text-[1.15rem] font-black text-slate-900 leading-tight truncate">
                  {cleanName(profileData.name)}
                </h2>

                {/* Badges and Ticks pinned to the right side of the screen */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  {/* Blue Verified Tick */}
                  <span
                    className="material-symbols-outlined text-[#0ea5e9] text-[18px] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Traveler"
                  >
                    verified
                  </span>
                  {/* Gold VIP Badge Icon */}
                  <span
                    className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 shadow-2xs shrink-0"
                    title="Gold VIP Voyager"
                  >
                    <span
                      className="material-symbols-outlined text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                  </span>
                </div>
              </div>

              {/* Contact details with Text on Left and Verified Green Ticks on Far Right */}
              <div className="mt-1 space-y-1">
                {/* Masked Phone with Tick on Far Right */}
                <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="material-symbols-outlined text-sky-600 text-[14px] shrink-0">call</span>
                    <span className="font-mono font-medium truncate">{maskPhone(profileData.phone)}</span>
                  </div>
                  <span
                    className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 ml-auto"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Phone"
                  >
                    check_circle
                  </span>
                </div>

                {/* Masked Email with Tick on Far Right */}
                <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="material-symbols-outlined text-sky-600 text-[14px] shrink-0">mail</span>
                    <span className="font-mono font-medium truncate">{maskEmail(profileData.email)}</span>
                  </div>
                  <span
                    className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 ml-auto"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Email"
                  >
                    check_circle
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Wallet Header right under Profile Card */}
        <div className="flex items-center justify-between px-1 pt-0.5">
          <h3 className="font-mono text-[11px] text-slate-400 font-bold tracking-wider uppercase">
            Quick Wallet
          </h3>
          <span className="font-mono text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Live Sync
          </span>
        </div>

        {/* 3. Numerical Stats Grid (3 Columns: Completed, Savings, Wallet) with Center-Aligned Bigger Numbers */}
        <section className="grid grid-cols-3 gap-2">
          {/* Stat 1: Completed Trips */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[11px] sm:text-[12px] text-slate-600 font-medium truncate">Completed</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px]">luggage</span>
              </div>
            </div>
            <div className="my-1.5 flex flex-col items-center justify-center">
              <span className="text-[1.65rem] sm:text-[1.85rem] font-black text-blue-700 tracking-tight leading-none text-center">
                {tripsCount || 18}
              </span>
            </div>
            <span className="font-mono text-[10px] text-blue-600 font-bold truncate text-center w-full">
              +3 this season
            </span>
          </div>

          {/* Stat 2: Bargain Savings */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[11px] sm:text-[12px] text-slate-600 font-medium truncate">Savings</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[15px]">payments</span>
              </div>
            </div>
            <div className="my-1.5 flex flex-col items-center justify-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-black text-emerald-600 tracking-tight leading-none text-center">
                ₹24,850
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 font-bold truncate text-center w-full">
              Direct credit
            </span>
          </div>

          {/* Stat 3: Wallet (Closed-Loop Travel Wallet with Merged Coins) */}
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center hover:border-indigo-300 hover:shadow-md transition-all active:scale-98 cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[11px] sm:text-[12px] text-slate-600 font-medium group-hover:text-indigo-600 transition-colors truncate">
                Wallet
              </span>
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="my-1.5 flex flex-col items-center justify-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-black text-indigo-700 tracking-tight leading-none text-center">
                ₹{walletAccount.totalBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-center w-full">
              <span className="font-mono text-[9.5px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 truncate text-center">
                ₹{walletAccount.coinValueInRupees} Coins
              </span>
            </div>
          </button>
        </section>

        {/* 4. Account Settings Groups */}

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
              onClick={() => setIsPassengerModalOpen(true)}
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
                      {passengerCount} Saved
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 mt-0.5">Co-Travellers • 1-Click Instant Booking</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 2: Security & 2-Factor Auth */}
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">lock_person</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Security &amp; 2-Factor Auth</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Biometric FaceID, SMS 2FA &amp; Active Sessions</p>
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
              onClick={() => setIsPreferencesModalOpen(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">flight_class</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Travel Preferences</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Seat: {profileData.seatPreference}, Meal: {profileData.dietaryPreference}, City: {profileData.departureCity.split(' ')[0]}</p>
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
              onClick={() => setIsSosModalOpen(true)}
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
                  <p className="text-[13px] text-slate-500 mt-0.5">Emergency SOS, Live GPS Broadcast &amp; Siren</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
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

        {/* Group 4: Support & Essentials (Expanded with Dedicated Specific Drawers) */}
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
              onClick={() => setSupportDrawerTopic('guarantee')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006591] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">About ROUTRIPO Guarantee</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">100% Escrow &amp; instant refund terms</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 2: Terms & Conditions */}
            <button
              type="button"
              onClick={() => setSupportDrawerTopic('terms')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Terms &amp; Conditions</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Platform usage, ticketing &amp; carriage agreements</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 3: Privacy Policy */}
            <button
              type="button"
              onClick={() => setSupportDrawerTopic('privacy')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">policy</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Privacy Policy &amp; DPDP Act</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">DPDP Act compliant, consent management &amp; encryption</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 4: Cancellation & Refund Policy (Added from pop-up types) */}
            <button
              type="button"
              onClick={() => setSupportDrawerTopic('cancellation')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">replay</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Cancellation &amp; Refund Policy</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Instant wallet refunds, airline &amp; hotel cancellation tiers</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 5: Bargain & Bidding Fair-Play Rules (Added from pop-up types) */}
            <button
              type="button"
              onClick={() => setSupportDrawerTopic('bargaining')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">handshake</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Bargaining &amp; Bidding Fair-Play Rules</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Dynamic bidding, escrow hold &amp; anti-sniping protection</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
            </button>

            {/* Item 6: Customer Helpdesk & Account FAQs */}
            <button
              type="button"
              onClick={() => setSupportDrawerTopic('faq')}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <p className="text-[1rem] text-slate-900 font-semibold leading-tight">Customer Helpdesk &amp; FAQs</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">User account Q&amp;A, 24x7 travel assistance &amp; dispute chat</p>
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
              ROUTRIPO v2.4.0 (Build 890)
            </p>
            <p className="font-mono text-[11px] text-slate-300 mt-0.5">
              Crafted for Indian Voyagers • Bharat
            </p>
          </div>
        </section>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
      />

      {/* RouTripo Closed Travel Wallet Modal (RBI PPI Compliant) */}
      <ClosedWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isMr={language === 'मराठी'}
      />

      {/* Master Passenger List Modal (Backed by MasterPassengerService) */}
      <MasterPassengerModal
        isOpen={isPassengerModalOpen}
        onClose={() => setIsPassengerModalOpen(false)}
        isMr={language === 'मराठी'}
      />

      {/* Security & 2-Factor Authentication Modal (Backed by SecurityAuthService) */}
      <SecurityAuthModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        isMr={language === 'मराठी'}
      />

      {/* Travel Preferences Modal */}
      <TravelPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        initialData={profileData}
        onSave={handleSaveProfile}
        isMr={language === 'मराठी'}
      />

      {/* Emergency Guardian SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        lang={language === 'मराठी' ? 'mr' : 'en'}
        userName={profileData.name}
      />

      {/* Support & Essentials Specific Drawer (Bottom-Sheet "khalun warti yenara") */}
      <SupportDrawerModal
        isOpen={Boolean(supportDrawerTopic)}
        onClose={() => setSupportDrawerTopic(null)}
        topic={supportDrawerTopic || 'faq'}
        isMr={language === 'मराठी'}
      />
    </div>
  );
};
