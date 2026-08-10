import React, { useState } from 'react';
import { 
  Activity, Server, Database, Globe, Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Upload, 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar, 
  Package, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  DollarSign, 
  BarChart3, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Lock,
  KeyRound,
  LogIn,
  UserPlus,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Zap,
  Sparkles,
  Shield,
  Camera,
  Settings,
  Plane,
  UserCheck
,  Star,  MessageCircle} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { authedFetch } from '../../utils/apiClient';

interface AgentPortalViewProps {
  lang?: string;
  onShowToast?: (msg: string) => void;
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
  amount: number;
  platform_commission: number;
  vendor_amount: number;
  tripStartDate: string;
  paymentStatus: 'Held in Escrow' | 'Released';
}

export const AgentPortalView: React.FC<AgentPortalViewProps> = ({
  lang = 'en',
  onShowToast
}) => {
  const [authState, setAuthState] = useState<'login' | 'register' | 'forgot_password' | 'authenticated'>('authenticated');
  const [agentApprovalStatus, setAgentApprovalStatus] = useState<'pending' | 'approved'>('pending');
  const [loginIdentifier, setLoginIdentifier] = useState('agent@mahakonkan.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bidding' | 'ai_builder' | 'kyc_registration' | 'wallet' | 'api_health' | 'settings'>('dashboard');
  const [agentRating, setAgentRating] = useState<number>(4.2); 
  const [biddingOffer, setBiddingOffer] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [agencyName, setAgencyName] = useState('MahaKonkan B2B Travels');
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('agent@mahakonkan.com');
  const [gstNumber, setGstNumber] = useState('27AAAAA0000A1Z5');
  const [city, setCity] = useState('Nashik');
  const [escrowTermsAccepted, setEscrowTermsAccepted] = useState(true);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [gstLicenseFile, setGstLicenseFile] = useState<File | null>(null);
  const [cancelledChequeFile, setCancelledChequeFile] = useState<File | null>(null);
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [appHealth, setAppHealth] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState<number>(0);
  const [securityHealth, setSecurityHealth] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const fetchAgentData = async () => {
      setIsLoading(true);
      try {
        const res = await authedFetch('/api/agent/metrics').catch(() => null);
        if (res && res.ok) {
           const data = await res.json();
           setAppHealth(data.appHealth || 0);
           setSystemHealth(data.systemHealth || 0);
           setSecurityHealth(data.securityHealth || 0);
           setTotalUsers(data.totalUsers || 0);
           setChartData(data.chartData || []);
           setBookings(data.bookings || []);
           setPackages(data.packages || []);
        } else {
           setAppHealth(99);
           setSystemHealth(98);
           setSecurityHealth(100);
           setTotalUsers(520);
           setChartData([]);
           setBookings([]);
           setPackages([]);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (activeTab === 'dashboard') {
      fetchAgentData();
    }
  }, [activeTab]);




  // Active Packages Data
  const [packages, setPackages] = useState<ActivePackageItem[]>([]);

  // Inline Quick Edit state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<'Active' | 'Inactive'>('Active');

  // New Package Modal state
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newDest, setNewDest] = useState('Nashik');
  const [newPrice, setNewPrice] = useState('9999');
  const [newDays, setNewDays] = useState('3');
  const [itinerary, setItinerary] = useState([{ day: 1, title: '', description: '' }]);
  const [inclusions, setInclusions] = useState({ hotel: true, meals: true, transport: true, guide: false, flights: false });
  const [photos, setPhotos] = useState<{url: string, isCover: boolean}[]>([]);

  // Required Fields Calculation
  const requiredFields = [
    { label: 'Agency Name', value: agencyName },
    { label: 'Owner Name', value: ownerName },
    { label: 'Phone Number', value: phone },
    { label: 'Email Address', value: email },
    { label: 'GST Number', value: gstNumber },
    { label: 'City', value: city },
    { label: 'Aadhaar Document', value: aadhaarFile },
    { label: 'Escrow Terms Agreement', value: escrowTermsAccepted }
  ];

  const completedCount = requiredFields.filter(f => Boolean(f.value)).length;
  const totalRequired = requiredFields.length;
  const kycCompletionPercentage = Math.round((completedCount / totalRequired) * 100);

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    else alert(msg);
  };

  const handleToggleEscrowRelease = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const nextStatus = b.paymentStatus === 'Held in Escrow' ? 'Released' : 'Held in Escrow';
        notify(
          nextStatus === 'Released'
            ? `₹${b.amount.toLocaleString('en-IN')} Escrow Payment Released to Agent Account post-trip confirmation!`
            : `Booking ${b.id} payment status set back to Held in Escrow.`
        );
        return { ...b, paymentStatus: nextStatus };
      }
      return b;
    }));
  };

  // Auth Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;
    setAuthState('authenticated');
    notify(`Welcome back, ${agencyName}!`);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) return;
    setResetSent(true);
    notify('Password reset instructions sent to your registered contact!');
  };

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState('authenticated');
    setAgentApprovalStatus('pending');
    notify('KYC submitted! Account is now under admin verification.');
  };

  const handleApproveAgentByAdmin = () => {
    setAgentApprovalStatus('approved');
    notify('🎉 Account Approved by Admin! Full Dashboard access unlocked.');
  };

  const handleSetPendingByAdmin = () => {
    setAgentApprovalStatus('pending');
    notify('Account status set back to Pending Approval.');
  };

  const handleLogout = () => {
    // We now use app-level authentication.
    // If the agent logs out, clear the app session.
    import('../../store/useAuthStore').then(module => {
      module.useAuthStore.getState().logout();
    });
    notify('Logged out of B2B Agent Portal');
  };

  // Inline Edit Handlers
  const handleStartEdit = (pkg: ActivePackageItem) => {
    setEditingRowId(pkg.id);
    setEditingPrice(pkg.price);
    setEditingStatus(pkg.status);
  };

  const handleSaveInlineEdit = (id: string) => {
    setPackages(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          price: editingPrice,
          status: editingStatus
        };
      }
      return p;
    }));
    setEditingRowId(null);
    notify('Package updated successfully!');
  };

  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
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

  // =========================================================================
  // AUTH SCREEN 1: LOGIN SCREEN
  // =========================================================================
  if (authState === 'login') {
    return (
      <div className="w-full max-w-md mx-auto my-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">B2B Agent Portal Login</h2>
            <p className="text-xs text-slate-500 font-medium">
              Access your Maharashtra travel agency dashboard, track leads, and manage packages.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. agent@mahakonkan.com or 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthState('forgot_password')}
                  className="text-xs font-extrabold text-indigo-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Dashboard</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-500">
              Not registered as a travel agent partner yet?
            </p>
            <button
              onClick={() => setAuthState('register')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Register New B2B Agency & Submit KYC</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTH SCREEN 2: FORGOT PASSWORD SCREEN
  // =========================================================================
  if (authState === 'forgot_password') {
    return (
      <div className="w-full max-w-md mx-auto my-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <button
            onClick={() => {
              setAuthState('login');
              setResetSent(false);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your registered mobile number or business email to receive reset instructions.
            </p>
          </div>

          {resetSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-sm">Reset Link Sent!</h3>
                <p className="text-xs text-slate-600">
                  We sent password reset instructions to <span className="font-extrabold text-slate-900">{forgotIdentifier || 'your contact'}</span>.
                </p>
              </div>
              <button
                onClick={() => {
                  setAuthState('login');
                  setResetSent(false);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer hover:bg-emerald-700 transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Registered Email / Mobile Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. agent@mahakonkan.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Send Password Reset Code
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTH SCREEN 3: REGISTER NEW AGENCY (KYC FORM)
  // =========================================================================
  if (authState === 'register') {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <button
            onClick={() => setAuthState('login')}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Agent Login</span>
          </button>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Step 1 of 2: KYC Registration
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Register New Travel Agency Account
              </h3>
              <p className="text-xs text-slate-300">
                Submit business information & documents to create your B2B partner account.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              Verification Required
            </span>
          </div>

          <form onSubmit={handleKYCSubmit} className="space-y-6">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              1. Business Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Agency Name *</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. MahaKonkan Travels"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Owner Name *</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Phone / WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit mobile"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Business Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">GST Registration Number *</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Headquarter City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nashik"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 pt-4">
              2. Document Uploads
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Aadhaar Card / Govt ID *</span>
                  {aadhaarFile && (
                    <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Uploaded
                    </span>
                  )}
                </label>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-4 text-center">
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-xs font-extrabold text-indigo-600 block">
                      {aadhaarFile ? aadhaarFile.name : 'Upload Aadhaar PDF/Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setAadhaarFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>GST Certificate / Trade License</span>
                  {gstLicenseFile && (
                    <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Uploaded
                    </span>
                  )}
                </label>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-4 text-center">
                  <label className="cursor-pointer space-y-2 block">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-xs font-extrabold text-indigo-600 block">
                      {gstLicenseFile ? gstLicenseFile.name : 'Upload GST License PDF'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setGstLicenseFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 pt-4">
              3. Platform Security & Escrow Terms
            </h4>

            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider">
                    Security Deposit & Escrow Protection Notice
                  </h5>
                  <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                    Notice: All customer payments will be held in platform escrow and released post-trip confirmation to ensure customer safety, prevent vendor fraud, and maintain quality standards across MahaKonkan network.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escrowTermsAccepted}
                    onChange={(e) => setEscrowTermsAccepted(e.target.checked)}
                    required
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-black text-slate-900">
                    I agree to the Platform Security Policy and Escrow Payment Terms. *
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setAuthState('login')}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit KYC for Approval</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTHENTICATED AGENT VIEW
  // =========================================================================
  return (
    <div className="w-full space-y-6">
      {/* Top B2B Agent Header */}
      <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400 font-black">
                <Building2 className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">{agencyName || 'B2B Travel Partner Portal'}</h2>
                
                {/* Approval Status Badge */}
                {agentApprovalStatus === 'approved' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified Partner
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                GST: {gstNumber} • Agent ID: <span className="font-mono text-indigo-300">AGT-2026-994</span> • {city}, India
              </p>
            </div>
          </div>

          {/* Quick Actions Header Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {agentApprovalStatus === 'approved' && (
              <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 flex-1 md:flex-initial">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('bidding')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'bidding'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Live Leads</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai_builder')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'ai_builder'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Builder</span>
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'wallet'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Wallet & Earnings</span>
                </button>
                <button
                  onClick={() => setActiveTab('kyc_registration')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'kyc_registration'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>KYC Info</span>
                </button>
                <button
                  onClick={() => setActiveTab('api_health')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'api_health'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>API & System Health</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'settings'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-2xl border border-slate-700 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Log out of Agent Portal"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PENDING APPROVAL STATE SCREEN (Restricts Dashboard until Admin Approves)   */}
      {/* ========================================================================= */}
      {agentApprovalStatus === 'pending' && (
        <div className="space-y-6">
          {/* Main Pending Approval Review Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300/80 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-100 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-8 h-8 animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">Account Under Verification Review</h3>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-full border border-amber-200">
                    Pending Approval
                  </span>
                </div>
                <p className="text-sm font-extrabold text-amber-900 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/60 inline-block">
                  "Your account is under review. Our team is verifying your documents."
                </p>
                <p className="text-xs text-slate-500 font-medium pt-1">
                  Our verification team reviews GST certificates, business licenses, and ID proof within 2-4 business hours.
                </p>
              </div>
            </div>

            {/* Application Overview Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Registered Agency</span>
                <span className="font-extrabold text-slate-900 text-sm block">{agencyName}</span>
                <span className="text-xs text-slate-500 font-medium">Owner: {ownerName}</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Tax & Contact Details</span>
                <span className="font-extrabold text-slate-900 text-xs block">GST: {gstNumber}</span>
                <span className="text-xs text-slate-500 font-medium">Phone: {phone} • {city}</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Uploaded Documents Status</span>
                <div className="space-y-1 text-xs font-extrabold">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Aadhaar Govt ID:</span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">Submitted ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>GST Certificate:</span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">Submitted ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Actions Notice */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Actions Restricted Pending Approval</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Publishing new tour packages, receiving direct customer leads, and generating B2B voucher invoices will be fully unlocked as soon as our verification team approves your application.
              </p>
            </div>

            {/* ========================================================================= */}
            {/* MOCK ADMIN APPROVAL TOGGLE (REQUIRED FOR TESTING & DEMONSTRATION)          */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white border-2 border-indigo-500/50 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-black text-sm text-white">Mock Admin Approval Controls (Testing Mode)</span>
                </div>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-400/40">
                  Instant Simulation
                </span>
              </div>

              <p className="text-xs text-indigo-200">
                Click the toggle below to instantly simulate an Admin approving this agent account and unlock the complete live Agent Dashboard:
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleApproveAgentByAdmin}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Approve Agent Account (Unlock Dashboard)</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPROVED AGENT FULL DASHBOARD                                             */}
      {/* ========================================================================= */}
      {agentApprovalStatus === 'approved' && activeTab === 'dashboard' && (
            <>

              {/* Health Metrics & Quick Stats */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button className={`p-4 rounded-2xl flex flex-col items-start gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 border cursor-pointer ${appHealth > 90 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                  <span className={`text-xs font-black uppercase tracking-wider ${appHealth > 90 ? 'text-emerald-500' : 'text-rose-500'}`}>App Health</span>
                  <span className="text-2xl font-black text-white">{isLoading ? '...' : `${appHealth}%`}</span>
                </button>
                <button className={`p-4 rounded-2xl flex flex-col items-start gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 border cursor-pointer ${systemHealth > 90 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                  <span className={`text-xs font-black uppercase tracking-wider ${systemHealth > 90 ? 'text-blue-500' : 'text-amber-500'}`}>System Health</span>
                  <span className="text-2xl font-black text-white">{isLoading ? '...' : `${systemHealth}%`}</span>
                </button>
                <button className={`p-4 rounded-2xl flex flex-col items-start gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 border cursor-pointer ${securityHealth > 90 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
                  <span className={`text-xs font-black uppercase tracking-wider ${securityHealth > 90 ? 'text-indigo-500' : 'text-purple-500'}`}>Security Status</span>
                  <span className="text-2xl font-black text-white">{isLoading ? '...' : `${securityHealth}%`}</span>
                </button>
                <button 
                  className="p-4 rounded-2xl flex flex-col items-start gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 border border-slate-700 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Users</span>
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-2xl font-black text-white">{isLoading ? '...' : totalUsers}</span>
                </button>
              </section>

        <div className="space-y-6">
          {/* Mock Admin Status Switcher Banner on Approved Dashboard */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Admin Testing Mode: Currently logged in as <strong className="text-slate-900">Approved Agent</strong>.</span>
            </div>
            <button
              onClick={handleSetPendingByAdmin}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[11px] transition-all cursor-pointer shrink-0"
              title="Revert back to pending approval screen for testing"
            >
              Revert Status to "Pending Approval"
            </button>
          </div>

          {/* Summary KPIs Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Leads (30 Days)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">142</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+18.4%</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Bookings</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">38</span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">26.7% Conv</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Gross Revenue</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">₹4,85,000</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+24.1%</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Listings</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{packages.filter(p => p.status === 'Active').length}</span>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">4 Total</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE ANALYTICS (DATA VISUALIZATION WITH RECHARTS) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  30-Day Performance Trends (Leads vs. Bookings)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time customer inquiries and confirmed bookings trajectory.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-extrabold">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                  Total Leads
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  Total Bookings
                </span>
              </div>
            </div>

            <div className="w-full h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '16px', 
                      border: 'none', 
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Leads" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Bookings" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QUICK EDIT IN ACTIVE PACKAGES DATA TABLE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Active Packages (Inline Quick Edit Enabled)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Click directly on Price or Status column to update instantly in row.
                </p>
              </div>

              <button
                onClick={() => setShowAddPackageModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tour Package</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-3 px-4 rounded-l-xl">Package Details</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Price (₹) <span className="text-indigo-600 lowercase font-bold">(click to edit)</span></th>
                    <th className="py-3 px-4">Status <span className="text-indigo-600 lowercase font-bold">(click to toggle)</span></th>
                    <th className="py-3 px-4">Inquiries</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {packages.map((pkg) => {
                    const isEditingThisRow = editingRowId === pkg.id;

                    return (
                      <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-slate-900 text-xs">{pkg.title}</p>
                            <span className="text-[10px] text-slate-400 font-semibold block">Dest: {pkg.destination}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          {pkg.durationDays} Days
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditingThisRow ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-400">₹</span>
                              <input
                                type="number"
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(Number(e.target.value))}
                                className="w-24 bg-white border-2 border-indigo-600 rounded-lg px-2 py-1 text-xs font-black text-slate-900 focus:outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(pkg)}
                              className="font-black text-slate-900 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer group"
                              title="Click to inline edit price"
                            >
                              <span>₹{pkg.price.toLocaleString('en-IN')}</span>
                              <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isEditingThisRow ? (
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value as any)}
                              className="bg-white border-2 border-indigo-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => handleToggleStatusQuick(pkg.id, pkg.status)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                                pkg.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle status Active/Inactive"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${pkg.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                              <span>{pkg.status}</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900">{pkg.leadsCount} Leads</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{pkg.bookingsCount} booked</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isEditingThisRow ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveInlineEdit(pkg.id)}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                                title="Save Inline Changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelInlineEdit}
                                className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(pkg)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Edit Row</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE CUSTOMER BOOKINGS & ESCROW PAYMENT STATUS TABLE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Active Customer Bookings & Escrow Payment Status
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Payments are held securely in platform escrow and released post-trip confirmation.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Escrow Protected Ledger</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-3 px-4 rounded-l-xl">Booking Ref & Customer</th>
                    <th className="py-3 px-4">Tour Package</th>
                    <th className="py-3 px-4">Trip Date</th>
                    <th className="py-3 px-4">Booking Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Escrow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 inline-block">
                            {booking.id}
                          </span>
                          <p className="font-extrabold text-slate-900 text-xs">{booking.customerName}</p>
                          <span className="text-[10px] text-slate-400 font-semibold block">{booking.customerPhone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[220px]">
                        <p className="truncate" title={booking.packageName}>{booking.packageName}</p>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-600">
                        {booking.tripStartDate}
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        {booking.paymentStatus === 'Held in Escrow' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1.5 w-max">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Held in Escrow</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1.5 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Released</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleEscrowRelease(booking.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            booking.paymentStatus === 'Held in Escrow'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          }`}
                          title="Simulate post-trip confirmation to release escrow funds to agent"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{booking.paymentStatus === 'Held in Escrow' ? 'Release Escrow (Post-Trip)' : 'Mark Held in Escrow'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
      )}

      {/* APPROVED AGENT KYC DETAILS TAB */}


          {/* LEAD BIDDING SYSTEM / WATAGHATI */}
          {agentApprovalStatus === 'approved' && activeTab === 'bidding' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-400" />
                    Live Customer Leads (Wataghati)
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Bid on custom user requests and negotiate live offers.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400">Current Rating:</span>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 cursor-pointer" onClick={() => setAgentRating(agentRating === 4.2 ? 4.8 : 4.2)}>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-black text-amber-400">{agentRating}</span>
                    <span className="text-xs text-slate-400 ml-1">(Click to toggle)</span>
                  </div>
                </div>
              </div>

              {agentRating < 4.5 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                      <Lock className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Premium Feature Locked</h3>
                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-sm mb-6">
                      You need a rating of <span className="text-amber-400 font-bold">4.5 to 5 Stars</span> to participate in live user negotiations (Wataghati). Improve your service to unlock this!
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700 cursor-pointer">
                      View Tips to Improve Rating
                    </button>
                  </div>
                  
                  {/* Blurred mock content in background */}
                  <div className="opacity-20 space-y-4">
                    <div className="h-24 bg-slate-800 rounded-2xl w-full"></div>
                    <div className="h-24 bg-slate-800 rounded-2xl w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                            New Lead
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            5 mins ago
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">Family of 4 looking for a 3-day Goa trip</h3>
                          <p className="text-sm text-slate-400 mt-1">User requested custom package with flights from Mumbai.</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-xs mr-2">Budget:</span>
                            <span className="font-bold text-white">₹40,000</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <input 
                          type="number" 
                          placeholder="Your Bid Amount (₹)" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                        />
                        <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer">
                          Submit Bid
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <MessageCircle className="w-32 h-32 text-indigo-500" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Direct Offer (Wataghati)
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">User offered <span className="text-emerald-400">₹22,000</span> for Goa 3 Days</h3>
                          <p className="text-sm text-slate-400 mt-1">Original Price: <span className="line-through">₹25,000</span></p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 italic">
                          "I'm looking to book immediately if we can agree on this price. Ready to pay advance."
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer">
                          Accept Offer
                        </button>
                        <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors cursor-pointer border border-indigo-500/50">
                          Counter Offer
                        </button>
                        <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI PACKAGE BUILDER */}
          {agentApprovalStatus === 'approved' && activeTab === 'ai_builder' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  Smart Itinerary Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1">Describe a trip and let AI generate a complete, day-by-day itinerary instantly.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-300">What kind of package do you want to create?</label>
                  <div className="relative">
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 5 days in Delhi & Agra for a family covering all heritage sites, with 3-star hotels and private cab..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                    ></textarea>
                    <button 
                      onClick={() => setAiGenerated(true)}
                      className="absolute bottom-4 right-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Itinerary
                    </button>
                  </div>
                </div>
              </div>

              {aiGenerated && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-black text-white">Generated: Delhi & Agra Heritage Tour (5 Days)</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700">
                        Edit Manually
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/20">
                        Publish Package
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { day: 'Day 1', title: 'Arrival in Delhi & Local Markets', desc: 'Check-in to 3-star hotel. Evening visit to Connaught Place and India Gate.' },
                      { day: 'Day 2', title: 'Delhi Heritage Sightseeing', desc: 'Full day tour of Red Fort, Qutub Minar, and Lotus Temple with private guide.' },
                      { day: 'Day 3', title: 'Transfer to Agra & Taj Mahal', desc: 'Morning drive to Agra. Afternoon visit to the majestic Taj Mahal.' },
                      { day: 'Day 4', title: 'Agra Fort & Fatehpur Sikri', desc: 'Explore the historic Agra Fort and the abandoned city of Fatehpur Sikri.' },
                      { day: 'Day 5', title: 'Departure', desc: 'Morning breakfast and transfer back to Delhi Airport/Railway Station.' }
                    ].map(d => (
                      <div key={d.day} className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20 shrink-0">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{d.day.split(' ')[0]}</span>
                          <span className="text-xl font-black text-indigo-300">{d.day.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{d.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

      {agentApprovalStatus === 'approved' && activeTab === 'kyc_registration' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verified Agency Details & KYC Document Records
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
              KYC 100% Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Agency Name</span>
              <p className="font-extrabold text-slate-900 text-sm">{agencyName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Authorized Person</span>
              <p className="font-extrabold text-slate-900 text-sm">{ownerName}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">GST Number</span>
              <p className="font-extrabold text-slate-900 text-sm font-mono">{gstNumber}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Mobile / WhatsApp</span>
              <p className="font-extrabold text-slate-900 text-sm">{phone}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Email Address</span>
              <p className="font-extrabold text-slate-900 text-sm">{email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Headquarters</span>
              <p className="font-extrabold text-slate-900 text-sm">{city}, India</p>
            </div>
          </div>
        </div>
      )}

      {/* WALLET & EARNINGS TAB */}
      {agentApprovalStatus === 'approved' && activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-emerald-200/50 w-32 h-32">
                <CheckCircle2 className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Total Earned (Released)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-950 tracking-tight">
                    ₹{bookings.filter(b => b.paymentStatus === 'Released').reduce((acc, b) => acc + b.vendor_amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs font-bold text-emerald-700 mt-2">
                  Successfully transferred to your registered bank account.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-amber-200/50 w-32 h-32">
                <Lock className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">Pending Payouts (Escrow)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-amber-950 tracking-tight">
                    ₹{bookings.filter(b => b.paymentStatus === 'Held in Escrow').reduce((acc, b) => acc + b.vendor_amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-700 mt-2">
                  Held securely in escrow. Releases automatically after trip completion.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Ledger & Payment Splits
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="py-3 px-4 rounded-l-xl">Ref & Package</th>
                    <th className="py-3 px-4">Customer Price</th>
                    <th className="py-3 px-4 text-rose-600">Platform Comm. (10%)</th>
                    <th className="py-3 px-4 text-emerald-700">Vendor Net (90%)</th>
                    <th className="py-3 px-4 rounded-r-xl">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 inline-block">
                            {booking.id}
                          </span>
                          <p className="truncate font-bold text-slate-900" title={booking.packageName}>{booking.packageName}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-black text-rose-600">
                        -₹{booking.platform_commission.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        ₹{booking.vendor_amount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        {booking.paymentStatus === 'Held in Escrow' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1.5 w-max">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1.5 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Transferred</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      
      {/* API & System Health Tab Content */}
      {agentApprovalStatus === 'approved' && activeTab === 'api_health' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-indigo-600" />
                API Integration & Workload Dashboard
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Real-time monitoring of integrated external services and system workload distribution.
              </p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold text-sm shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              All Systems Operational
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. API Keys & Their Specific Functions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                Integrated APIs & Functional Roles
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    name: 'Gemini AI / Groq AI API',
                    icon: Sparkles,
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                    border: 'border-purple-200',
                    desc: 'Used for automated trip planning, smart itinerary generation, and natural language recommendations.'
                  },
                  {
                    name: 'Google Places & Maps API',
                    icon: MapPin,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    desc: 'Used for fetching tourist spot coordinates, managing locations, and calculating accurate driving distances and routes.'
                  },
                  {
                    name: 'Image APIs (Pixabay / Wikipedia)',
                    icon: Camera,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    desc: 'Used for fetching high-quality destination and tourist spot images.'
                  },
                  {
                    name: 'Database & Core State Storage',
                    icon: Database,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    desc: 'Used for managing user profiles, trips, local data persistence, and sync.'
                  }
                ].map((api, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${api.bg} ${api.border} ${api.color}`}>
                      <api.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{api.name}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                        {api.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. System Workload Percentage Distribution */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Live Workload Distribution (100%)
              </h3>
              
              <div className="flex-1 space-y-6 mt-2">
                {[
                  { name: 'Google Places & Maps API', percent: 30, color: 'bg-blue-500', status: 'Active', reqs: '124 req/min' },
                  { name: 'Gemini AI Engine', percent: 25, color: 'bg-purple-500', status: 'Active', reqs: '42 req/min' },
                  { name: 'Image & Media Fetcher', percent: 20, color: 'bg-amber-500', status: 'Idle', reqs: '12 req/min' },
                  { name: 'Database & Core Operations', percent: 15, color: 'bg-emerald-500', status: 'Active', reqs: '89 req/min' },
                  { name: 'Network & App Utilities', percent: 10, color: 'bg-slate-500', status: 'Idle', reqs: '5 req/min' },
                ].map((module, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{module.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${module.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {module.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-400">{module.reqs}</span>
                        <span className="font-black text-sm text-slate-900">{module.percent}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${module.color} transition-all duration-1000`} 
                        style={{ width: `${module.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">System Load is Optimal</h4>
                  <p className="text-xs font-medium text-indigo-700/80 mt-1">
                    All modules are operating within rate limits. No Error 429 (Too Many Requests) detected in the last 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {agentApprovalStatus === 'approved' && activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Agency Profile */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-slate-900 text-base mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Agency Profile
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center sm:items-start gap-4 sm:flex-row">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-400">Logo</span>
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agency Name</label>
                    <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500" />
                </div>
                
                <button type="button" onClick={() => notify('Profile updated')} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors">
                  Save Profile Settings
                </button>
              </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-slate-900 text-base mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Payout Settings
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bank Account Number</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">IFSC Code</label>
                  <input type="text" placeholder="e.g. HDFC0001234" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 uppercase" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">UPI ID</label>
                  <input type="text" placeholder="e.g. agency@upi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500" />
                </div>

                <button type="button" onClick={() => notify('Payout settings saved')} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors">
                  Save Payout Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW PACKAGE MODAL */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-900 text-base">Smart Trip Builder</h3>
              <button
                onClick={() => {
                  setShowAddPackageModal(false);
                  setBuilderStep(1);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer bg-white shadow-sm border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex px-5 py-3 border-b border-slate-100 bg-white shrink-0">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`h-1.5 flex-1 rounded-l-full ${builderStep >= step ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${builderStep >= step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step}
                  </div>
                  <div className={`h-1.5 flex-1 rounded-r-full ${builderStep > step ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-[30px] [&::-webkit-scrollbar]:hidden">
              <form onSubmit={handleCreatePackage} id="package-form">
                
                {/* Step 1: Basic Details */}
                {builderStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-800 text-sm mb-3">1. Basic Details</h4>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Package Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nashik to Ratnagiri Konkan Tour"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Destination *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ratnagiri"
                          value={newDest}
                          onChange={(e) => setNewDest(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Duration (Days) *</label>
                        <input
                          type="number"
                          value={newDays}
                          onChange={(e) => setNewDays(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Price Per Person (₹) *</label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Itinerary */}
                {builderStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-800 text-sm mb-3">2. Day-wise Itinerary</h4>
                    
                    {itinerary.map((day, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative">
                        <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                          Day {day.day}
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 bg-white rounded-full border border-slate-200 shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="Day Title (e.g., Arrival at Goa)"
                            value={day.title}
                            onChange={(e) => {
                              const newIt = [...itinerary];
                              newIt[idx].title = e.target.value;
                              setItinerary(newIt);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 mb-2"
                          />
                          <textarea
                            placeholder="Describe the day's activities..."
                            value={day.description}
                            onChange={(e) => {
                              const newIt = [...itinerary];
                              newIt[idx].description = e.target.value;
                              setItinerary(newIt);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none h-20"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }])}
                      className="w-full py-3 bg-white border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Next Day
                    </button>
                  </div>
                )}

                {/* Step 3: Inclusions */}
                {builderStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-black text-slate-800 text-sm mb-3">3. Inclusions & Exclusions</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 mb-4">Toggle what's included in your package:</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'hotel', label: 'Hotel Stay', icon: Building2 },
                          { key: 'meals', label: 'All Meals', icon: null },
                          { key: 'transport', label: 'Local Transport', icon: MapPin },
                          { key: 'guide', label: 'Tour Guide', icon: UserCheck },
                          { key: 'flights', label: 'Flights', icon: Plane }
                        ].map(item => (
                          <label key={item.key} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${inclusions[item.key as keyof typeof inclusions] ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                            <input 
                              type="checkbox" 
                              checked={inclusions[item.key as keyof typeof inclusions]} 
                              onChange={(e) => setInclusions({...inclusions, [item.key]: e.target.checked})}
                              className="hidden"
                            />
                            <div className={`w-4 h-4 rounded shadow-inner border flex items-center justify-center shrink-0 ${inclusions[item.key as keyof typeof inclusions] ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-100 border-slate-300'}`}>
                              {inclusions[item.key as keyof typeof inclusions] && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Photos */}
                {builderStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-slate-800 text-sm">4. Trip Gallery</h4>
                      <button type="button" onClick={() => {
                        const newPhotos = [
                          { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600', isCover: photos.length === 0 },
                          { url: 'https://images.unsplash.com/photo-1506461883276-594a12b11dc3?q=80&w=600', isCover: false }
                        ];
                        setPhotos([...photos, ...newPhotos]);
                        notify('Found 2 HD photos from Unsplash!');
                      }} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-indigo-100">
                        <Camera className="w-3.5 h-3.5" /> Search Free Photos
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                      <p className="font-bold text-sm text-slate-700">Drag & Drop images here</p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse from your computer</p>
                      <button type="button" className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm cursor-pointer">
                        Select Files
                      </button>
                    </div>

                    {photos.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Gallery ({photos.length} photos)</label>
                        <div className="grid grid-cols-3 gap-3">
                          {photos.map((photo, idx) => (
                            <div key={idx} className={`relative rounded-xl overflow-hidden aspect-square border-2 ${photo.isCover ? 'border-indigo-600 shadow-md' : 'border-slate-200'} group`}>
                              <img src={photo.url} alt="Trip" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                {!photo.isCover && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newP = photos.map((p, i) => ({ ...p, isCover: i === idx }));
                                      setPhotos(newP);
                                    }}
                                    className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase"
                                  >
                                    Set Cover
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                  className="p-1.5 bg-rose-500 text-white rounded-lg"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {photo.isCover && (
                                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-sm">Cover</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
              </form>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between shrink-0">
              {builderStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setBuilderStep(prev => prev - 1)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 shadow-sm"
                >
                  Back
                </button>
              ) : <div></div>}
              
              {builderStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setBuilderStep(prev => prev + 1)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-indigo-700 cursor-pointer flex items-center gap-2"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  form="package-form"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-emerald-700 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publish Package
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
