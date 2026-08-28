import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Globe, Building2, 
  ShieldCheck, CheckCircle2, Upload, FileText, 
  TrendingUp, Users, Calendar, Package, Plus, 
  Edit2, Check, X, DollarSign, Clock, AlertCircle,
  Phone, Mail, MapPin, Lock, KeyRound, LogIn, 
  UserPlus, ArrowLeft, ArrowRight, ShieldAlert, LogOut, Zap, 
  Compass as Sparkles, Shield, Settings, Plane, MessageCircle, 
  Tag, Inbox, Banknote, Search, Link2, Copy, RefreshCcw, Compass,
  Gift, Wallet, LifeBuoy, Gavel
} from 'lucide-react';
import { AgentBiddingScreen } from '../routripo/AgentBiddingScreen';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { authedFetch } from '../../utils/apiClient';
import { TopBar, LogoName } from '../routripo/SharedUI';
import { AgentAdManager } from './AgentAdManager';
import { AgentWalletView } from './AgentWalletView';
import { SupportTicketView } from './SupportTicketView';
import { PartnerInventoryManager } from './PartnerInventoryManager';

import { MarkupEngineView } from './MarkupEngineView';
import { AgencyStatementView } from './AgencyStatementView';
import { PartnerProfileKYCView } from './PartnerProfileKYCView';
import { FastTrackHotelOnboardingModal } from '../routripo/FastTrackHotelOnboardingModal';
import { Hotel } from 'lucide-react';


interface AgentPortalViewProps {
  lang?: string;
  onShowToast?: (msg: string) => void;
  onLogout?: () => void;
}

interface ActivePackageItem {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  price: number;
  status: 'Active' | 'Inactive';
  leadsCount: number;
  bookingsCount: number;
}

export interface AgentBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  packageType?: 'Hotel Room' | 'Cab' | 'Package';
  amount: number;
  travelDate: string;
  bookingStatus: 'Confirmed' | 'Completed' | 'Pending' | 'in_progress';
  paymentStatus: 'Held in Escrow' | 'Released' | 'held_in_escrow';
  userOtp?: string;
}

export const AgentPortalView: React.FC<AgentPortalViewProps> = ({
  lang = 'en',
  onShowToast,
  onLogout
}) => {
  // Auth state
  const [authState, setAuthState] = useState<'login' | 'forgot' | 'kyc' | 'authenticated'>('authenticated');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bidding' | 'inventory' | 'bookings' | 'earnings' | 'markups' | 'marketing' | 'support' | 'settings'>('dashboard');

  // Agency & Profile State
  const [agencyName, setAgencyName] = useState<string>('B2B Travel Partner Agency');
  const [ownerName, setOwnerName] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [escrowTermsAccepted, setEscrowTermsAccepted] = useState(true);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  // Data state
    const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  const handleOtpChange = (bookingId: string, value: string) => {
    setOtpInputs(prev => ({ ...prev, [bookingId]: value }));
  };

  const handleStartTrip = (b: AgentBooking) => {
    const entered = otpInputs[b.id];
    if (entered === b.userOtp) {
      setBookings(prev => prev.map(booking => 
        booking.id === b.id 
          ? { ...booking, bookingStatus: 'in_progress', paymentStatus: 'Held in Escrow' } 
          : booking
      ));
      notify(`Trip Started! Payment status updated.`);
    } else {
      notify('Invalid PIN. Please enter the correct 4-digit PIN provided by the customer.');
    }
  };
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [packages, setPackages] = useState<ActivePackageItem[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Package Inline Edit
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<'Active' | 'Inactive'>('Active');

  // New Package Modal
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showHotelFastTrackModal, setShowHotelFastTrackModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDest, setNewDest] = useState('Goa');
  const [newPrice, setNewPrice] = useState('9999');
  const [newDays, setNewDays] = useState('3');

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else alert(msg);
  };

  useEffect(() => {
    const fetchAgentData = async () => {
      setIsLoading(true);
      try {
        const res = await authedFetch('/api/agent/metrics').catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          setChartData(data.chartData || []);
          
          setBookings(data.bookings || []);

          setPackages(data.packages || []);
        } else {
          setChartData([]);
          setBookings([]);
          setPackages([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (activeTab === 'dashboard') {
      fetchAgentData();
    }
  }, [activeTab]);

  useEffect(() => {
    const savedName = localStorage.getItem('partner_agency_name');
    const savedGst = localStorage.getItem('partner_gst');
    const savedPhone = localStorage.getItem('partner_phone');
    const savedEmail = localStorage.getItem('partner_email');
    const savedCity = localStorage.getItem('partner_city');
    
    if (savedName) setAgencyName(savedName);
    if (savedGst) setGstNumber(savedGst);
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
    if (savedCity) setCity(savedCity);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('partner_agency_name', agencyName);
    localStorage.setItem('partner_gst', gstNumber);
    localStorage.setItem('partner_phone', phone);
    localStorage.setItem('partner_email', email);
    localStorage.setItem('partner_city', city);
    notify('Partner Profile settings updated successfully!');
  };

  const handleToggleEscrowRelease = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const nextStatus = b.paymentStatus === 'Held in Escrow' ? 'Released' : 'Held in Escrow';
        notify(
          nextStatus === 'Released'
            ? `₹${b.amount.toLocaleString('en-IN')} Escrow Payment Released to Partner Account!`
            : `Booking ${b.id} set back to Held in Escrow.`
        );
        return { ...b, paymentStatus: nextStatus };
      }
      return b;
    }));
  };

  const handleStartEdit = (pkg: ActivePackageItem) => {
    setEditingRowId(pkg.id);
    setEditingPrice(pkg.price);
    setEditingStatus(pkg.status);
  };

  const handleSaveInlineEdit = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, price: editingPrice, status: editingStatus } : p));
    setEditingRowId(null);
    notify('Package updated successfully!');
  };

  const handleToggleStatusQuick = (id: string, currentStatus: 'Active' | 'Inactive') => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    notify(`Package status changed to ${nextStatus}`);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newPkg: ActivePackageItem = {
      id: `pkg-${Date.now()}`,
      title: newTitle,
      destination: newDest,
      durationDays: Number(newDays) || 3,
      price: Number(newPrice) || 9999,
      status: 'Active',
      leadsCount: 0,
      bookingsCount: 0
    };
    setPackages([newPkg, ...packages]);
    setShowAddPackageModal(false);
    setNewTitle('');
    notify('New tour package created and published!');
  };

  const handleLogout = () => {
    import('../../store/useAuthStore').then(module => {
      module.useAuthStore.getState().logout();
    });
    notify('Logged out of Partner Portal');
    if (onLogout) {
      onLogout();
    }
  };

  const tabs = [
    { id: 'dashboard', icon: TrendingUp, label: 'Overview & Analytics' },
    { id: 'bidding', icon: Tag, label: 'Offers / Leads' },
    { id: 'inventory', icon: Package, label: `Inventory & Packages (${packages.length})` },
    { id: 'bookings', icon: Users, label: `Bookings & Leads (${bookings.length})` },
    { id: 'earnings', icon: Wallet, label: 'Earnings & Statement' },
    { id: 'markups', icon: Tag, label: 'Markup Engine' },
    { id: 'support', icon: LifeBuoy, label: 'Agency Support' },
    { id: 'settings', icon: Settings, label: 'Profile & KYC' },
  ] as const;

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden">
      
      {/* Standardized Universal TopBar Header without SOS */}
      <TopBar 
        sub={agencyName || "B2B Travel Partner Portal"}
        title={
          <div className="flex items-center gap-2">
            <LogoName className="text-xl" />
          </div>
        }
        scrolled={false}
        avatarGrad="from-slate-700 to-slate-900"
        initial={agencyName ? agencyName.charAt(0).toUpperCase() : "P"}
        onLogout={handleLogout}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Partner Theme Header Sub-bar */}
      <div className="bg-[#1A365D] text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold shadow-xs shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-extrabold">{agencyName || 'Verified Partner Agency'}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">B2B Partner</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ml-1">
            RouTriO Verified 🟢
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHotelFastTrackModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Hotel className="w-3.5 h-3.5" /> ⚡ FAST-TRACK HOTEL
          </button>
          <button 
            onClick={() => setShowAddPackageModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white text-[#1A365D] hover:bg-slate-100 transition-colors text-xs font-extrabold cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> ADD PACKAGE
          </button>
        </div>
      </div>

      {/* Categorized Navigation Tabs Bar moved to bottom */}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 px-2 sm:px-4 lg:px-6 py-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* ROUTRIPO HERO ACTION BANNER */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-sm">
                    💼
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">सक्रिय पार्टनर वर्कस्पेस</h2>
                    <p className="text-xs font-medium text-slate-600">B2B इन्व्हेंटरी, बुकिंग्स आणि कस्टमर पेमेंट्स</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button 
                    onClick={() => setShowHotelFastTrackModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Hotel className="w-3.5 h-3.5 text-slate-950" />
                    <span>हॉटेल फास्ट-ट्रॅक आयात</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="px-4 py-2 rounded-xl bg-[#1A365D] hover:bg-[#1A365D]/90 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span>पॅकेज इन्व्हेंटरी वर जा</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ROUTRIPO HERO TRIPLE ACTION CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => setShowHotelFastTrackModal(true)}
                  className="bg-gradient-to-br from-[#1A365D] to-indigo-900 rounded-3xl p-5 text-white shadow-md shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between border border-white/10"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                      ⚡ 1-Click Import
                    </span>
                    <h3 className="text-base font-black mt-1">हॉटेल ऑनबोर्डिंग</h3>
                    <p className="text-xs text-sky-100 font-medium mt-0.5">Airbnb / Booking URL किंवा मॅन्युअल विझार्ड</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
                    <Hotel className="w-5 h-5" />
                  </div>
                </div>

                <div 
                  onClick={() => setShowAddPackageModal(true)}
                  className="bg-[#1A365D] rounded-3xl p-5 text-white shadow-md shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">त्वरित नोंदणी</span>
                    <h3 className="text-base font-black mt-1">नवीन पॅकेज बनवा</h3>
                    <p className="text-xs text-sky-100 font-medium mt-0.5">सहलीचे दर आणि संपूर्ण नियोजन जोडा</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('markups')}
                  className="bg-[#1A365D] rounded-3xl p-5 text-white shadow-md shadow-indigo-500/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">नफा आणि दर</span>
                    <h3 className="text-base font-black mt-1">मार्कअप व बुकिंग्स</h3>
                    <p className="text-xs text-indigo-100 font-medium mt-0.5">स्वयंचलित एजन्सी नफा मार्जिन सेट करा</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 2x3 MODULE SERVICES GRID (ROUTRIPO STYLE) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">पार्टनर व्यवसाय सेवा (Partner Services)</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="p-3 bg-slate-50/80 hover:bg-sky-100 border border-sky-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">📦</div>
                    <span className="text-xs font-bold text-slate-800">पॅकेजेस</span>
                    <span className="text-[10px] text-sky-600 font-medium">{packages.length} Active</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="p-3 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">👥</div>
                    <span className="text-xs font-bold text-slate-800">बुकिंग्स</span>
                    <span className="text-[10px] text-indigo-600 font-medium">{bookings.length} Leads</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('earnings')}
                    className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">💰</div>
                    <span className="text-xs font-bold text-slate-800">वॉलेट</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Payment Protected</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('markups')}
                    className="p-3 bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">🏷️</div>
                    <span className="text-xs font-bold text-slate-800">मार्कअप</span>
                    <span className="text-[10px] text-cyan-600 font-medium">Global Rule</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('support')}
                    className="p-3 bg-purple-50/80 hover:bg-purple-100 border border-purple-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">📣</div>
                    <span className="text-xs font-bold text-slate-800">सपोर्ट</span>
                    <span className="text-[10px] text-purple-600 font-medium">24x7 Help</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-amber-50/80 hover:bg-amber-100 border border-amber-100 rounded-2xl text-center flex flex-col items-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-110 transition-transform">🛡️</div>
                    <span className="text-xs font-bold text-slate-800">KYC प्रोफाइल</span>
                    <span className="text-[10px] text-amber-600 font-medium">Verified</span>
                  </button>
                </div>
              </div>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-sky-100">
                      <Inbox className="w-5 h-5 text-sky-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Total Inquiries / Leads</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-slate-900">{bookings.length}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">30 Days</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Confirmed Bookings</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-emerald-600">{bookings.filter(b => b.paymentStatus === 'Released').length}</p>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Converted</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-pink-50 border border-pink-100">
                      <Banknote className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Gross Revenue</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-pink-600">₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Active Listings</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-amber-600">{packages.filter(p => p.status === 'Active').length}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{packages.length} Total</span>
                  </div>
                </div>
              </div>

              {/* 30-Day Performance Trends Chart */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      30-Day Performance Trends
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Real-time customer inquiries and confirmed bookings trajectory.
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="leads" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                        <Area type="monotone" dataKey="bookings" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                      <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-600">No 30-day performance data yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Leads and booking trends will be graphed here as activity occurs.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BIDDING DESK TAB */}
          {activeTab === 'bidding' && (
            <AgentBiddingScreen 
              onBack={() => setActiveTab('dashboard')} 
              lang={lang}
              agencyCity="Mumbai"
              vendorId="vendor-402"
              vendorName="Verified Partner #402"
              onLogout={onLogout}
            />
          )}

          {/* TAB 2: INVENTORY & PACKAGES */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-sky-600" />
                    Tour Packages & Inventory ({packages.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your active itineraries, pricing, and live listings.</p>
                </div>

                <button
                  onClick={() => setShowAddPackageModal(true)}
                  className="px-4 py-2.5 bg-[#FF6B6B] text-white rounded-2xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2 shadow-md shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Package</span>
                </button>
              </div>

              {/* Package Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-600">No packages created yet</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-4">Add your first custom travel itinerary to start receiving leads.</p>
                    <button
                      onClick={() => setShowAddPackageModal(true)}
                      className="px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:opacity-95"
                    >
                      + Create Tour Package
                    </button>
                  </div>
                ) : (
                  packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{pkg.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                            pkg.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {pkg.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-semibold">{pkg.destination} • {pkg.durationDays} Days</p>

                        <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Package Price</span>
                          <span className="text-base font-black text-slate-900">₹{pkg.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleStatusQuick(pkg.id, pkg.status)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Toggle {pkg.status === 'Active' ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Partner Inventory Manager */}
              <PartnerInventoryManager />
            </div>
          )}

          {/* TAB 3: BOOKINGS & LEADS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-sky-600" />
                  Customer Inquiries & Confirmed Bookings ({bookings.length})
                </h3>
                <p className="text-xs text-slate-500">Track customer trip requests, payment status, and confirm payments.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Package</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Travel Date</th>
                        <th className="p-4">Payment Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto py-4 bg-slate-50/80 rounded-3xl border border-sky-200 p-6">
                              <div className="w-16 h-16 bg-[#1A365D] rounded-2xl flex items-center justify-center shadow-lg shadow-sm text-white">
                                <Wallet className="w-8 h-8" />
                              </div>
                              <h4 className="text-base font-black text-slate-800">No Customer Bookings Yet 💼</h4>
                              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                Your client bookings, commissions, and package reservations will appear here. Tap below to create your first client booking.
                              </p>
                              <button 
                                onClick={() => setActiveTab('inventory')}
                                className="px-5 py-2.5 bg-[#1A365D] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-600/20 hover:bg-[#1A365D]/90 transition-all cursor-pointer"
                              >
                                + Explore & Book Packages
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <p className="font-extrabold text-slate-900">{b.customerName}</p>
                              <p className="text-[11px] font-mono text-slate-500">{b.customerPhone}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-700">{b.packageName}</p>
                              {b.packageType === 'Cab' && (
                                <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                                  Cab Booking
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-black text-slate-900">₹{b.amount.toLocaleString('en-IN')}</td>
                            <td className="p-4">
                              <p className="text-slate-600 font-medium">{b.travelDate}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                b.bookingStatus === 'in_progress' ? 'bg-sky-100 text-sky-800' :
                                b.bookingStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {b.bookingStatus === 'in_progress' ? 'Trip In Progress' : b.bookingStatus}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                b.paymentStatus === 'Released' ? 'bg-emerald-100 text-emerald-800' : 
                                b.paymentStatus === 'held_in_escrow' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {b.paymentStatus === 'held_in_escrow' ? 'Pending OTP' : b.paymentStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {b.packageType === 'Cab' && b.bookingStatus === 'Confirmed' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <input 
                                    type="text" 
                                    maxLength={4}
                                    placeholder="PIN"
                                    className="w-16 p-1.5 text-center text-xs font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                                    value={otpInputs[b.id] || ''}
                                    onChange={(e) => handleOtpChange(b.id, e.target.value)}
                                  />
                                  <button
                                    onClick={() => handleStartTrip(b)}
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                                  >
                                    Start Trip
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleToggleEscrowRelease(b.id)}
                                  disabled={b.paymentStatus === 'held_in_escrow'}
                                  className={`px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-opacity cursor-pointer shadow-xs ${
                                    b.paymentStatus === 'held_in_escrow' ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#FF6B6B] hover:opacity-95'
                                  }`}
                                >
                                  {b.paymentStatus === 'Held in Escrow' || b.paymentStatus === 'held_in_escrow' ? 'Release Escrow' : 'Hold Escrow'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EARNINGS & WALLET */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <AgentWalletView />
            </div>
          )}

          {/* TAB 5: ADS & MARKETING */}
          {activeTab === 'marketing' && (
            <div className="space-y-6">
              <AgentAdManager />
            </div>
          )}

          {/* TAB 6: AGENCY SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <SupportTicketView />
            </div>
          )}

          {/* TAB 7: SETTINGS & PROFILE */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-sky-600" />
                    Partner Agency Profile & Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage business registration, GST details, and contact information.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Agency Name</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 27AABCU9603R1ZM"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. partner@travels.com"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Base City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Nashik / Mumbai"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-[#FF6B6B] text-white rounded-2xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-md shadow-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Profile Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Categorized Navigation Tabs Bar (Bottom Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,12px)]">
        <div className="flex items-center gap-2 w-max mx-auto px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isBidding = tab.id === 'bidding';
            
            let activeClass = 'bg-[#008080] text-white shadow-md shadow-sm';
            if (isBidding) {
              activeClass = 'bg-[#FF6B6B] text-white shadow-md shadow-sm';
            } else {
              activeClass = 'bg-slate-800 text-white shadow-md shadow-sm';
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? activeClass
                    : 'bg-transparent sm:bg-white text-slate-500 hover:bg-slate-50 sm:border sm:border-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CREATE PACKAGE MODAL */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create New Tour Package</h3>
              <button
                onClick={() => setShowAddPackageModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 3D2N Konkan Coastal Explorer"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price per Traveler (₹)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPackageModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-sm"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fast-Track Hotel & Stay Onboarding Modal */}
      <FastTrackHotelOnboardingModal
        isOpen={showHotelFastTrackModal}
        onClose={() => setShowHotelFastTrackModal(false)}
        lang={lang}
        onListingCreated={(listing) => {
          notify(`Hotel listing "${listing.propertyName}" onboarded successfully!`);
          setActiveTab('inventory');
        }}
      />

    </div>
  );
};
