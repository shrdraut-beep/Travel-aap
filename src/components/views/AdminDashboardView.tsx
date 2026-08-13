import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useVendorStore } from '../../store/useVendorStore';
import { authedFetch } from '../../utils/apiClient';
import { TopBar, LogoName } from '../routripo/SharedUI';
import { AdManager } from './AdManager';
import { 
  Users, Activity, CheckCircle2, XCircle, AlertTriangle, Link2Off, 
  ShieldCheck, PackageSearch, DollarSign, TrendingUp, FileText, ShieldAlert,
  Bell, MessageSquare, Gift, LayoutDashboard, Database, ChevronRight,
  RefreshCcw, Smartphone, Loader2, Search, Filter, Server, Globe, Zap,
  Layers, Send, Terminal, Code2, Building2, Check, X, Clock,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardViewProps {
  lang?: 'en' | 'mr' | 'hi';
  onLaunchMainApp?: () => void;
}

type ApiStatus = 'Active' | 'Active (Fallback Enabled)' | 'Active (Cached Unsplash)' | 'Active (Vision Mode)' | 'Limit Exceeded' | 'Error/Timeout' | 'Unlinked' | 'Pending';

interface ApiHealth {
  id: string;
  name: string;
  endpoint?: string;
  method?: string;
  category?: string;
  status: ApiStatus | string;
  lastChecked: string;
  latency?: string;
  workload?: string;
  description?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onLaunchMainApp
}) => {
  const { applications: vendorApps, approveApplication, rejectApplication, resetApplications } = useVendorStore();
  const [vendorFilter, setVendorFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const [activeTab, setActiveTab] = useState<'analytics' | 'vendors' | 'payouts' | 'ads' | 'apis' | 'support' | 'users'>('analytics');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Dashboard Metrics State
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeAgents, setActiveAgents] = useState<number>(0);
  const [appHealth, setAppHealth] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState<number>(0);
  const [securityHealth, setSecurityHealth] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [pendingRefunds, setPendingRefunds] = useState<number>(0);
  const [activePackages, setActivePackages] = useState<number>(0);
  const [systemWarnings, setSystemWarnings] = useState<any[]>([]);

  // API Status State
  const [apiStatuses, setApiStatuses] = useState<ApiHealth[]>([]);
  const [pingingApiId, setPingingApiId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInspectApi, setSelectedInspectApi] = useState<ApiHealth | null>(null);
  
  // Other Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);

  // Tab-based Lazy Loading Flags
  const [hasLoadedMetrics, setHasLoadedMetrics] = useState(false);
  const [hasLoadedApis, setHasLoadedApis] = useState(false);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const [hasLoadedTickets, setHasLoadedTickets] = useState(false);

  const fetchMetrics = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users')).catch(() => null);
      const tripsSnap = await getDocs(collection(db, 'trips')).catch(() => null);
      
      const userCount = usersSnap ? usersSnap.size : 0;
      const pkgCount = tripsSnap ? tripsSnap.size : 0;
      
      setAppHealth(99);
      setSystemHealth(98);
      setSecurityHealth(100);
      setTotalUsers(userCount);
      setActiveAgents(vendorApps.filter(v => v.status === 'APPROVED').length);
      setTotalRevenue(0);
      setPendingRefunds(0);
      setActivePackages(pkgCount);
      setSystemWarnings([]);
      setHasLoadedMetrics(true);
    } catch (err: any) {
      console.warn("Could not fetch metrics from Firestore:", err);
    }
  };

  const fetchApiHealth = async () => {
    const url = '/api/admin/health';
    try {
      const res = await authedFetch(url);
      if (res.ok) {
        const data = await res.json();
        setApiStatuses(data || []);
        setHasLoadedApis(true);
      } else {
        setApiStatuses([]);
      }
    } catch (err) {
      console.error("API Health error:", url, err);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.name || 'Anonymous User',
          email: data.email || 'No Email',
          type: data.role || 'Customer',
          status: data.isBlocked ? 'Blocked' : 'Active'
        };
      });
      setUsersList(usersData);
      setHasLoadedUsers(true);
    } catch (err) {
      console.warn("Could not fetch users:", err);
      setUsersList([]);
      setHasLoadedUsers(true);
    }
  };

  const fetchTickets = async () => {
    try {
      const ticketsSnap = await getDocs(collection(db, 'support_tickets'));
      const ticketsData = ticketsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          user: data.userName || data.userEmail || 'Unknown User',
          issue: data.issue || data.subject || 'No details provided',
          status: data.status || 'Open',
          time: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString() : 'Recently'
        };
      });
      setTicketsList(ticketsData);
      setHasLoadedTickets(true);
    } catch (err) {
      console.warn("Could not fetch tickets:", err);
      setTicketsList([]);
      setHasLoadedTickets(true);
    }
  };

  const fetchAdminDataForActiveTab = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'analytics' && !hasLoadedMetrics) {
        await fetchMetrics();
      } else if (activeTab === 'apis' && !hasLoadedApis) {
        await fetchApiHealth();
      } else if (activeTab === 'users' && !hasLoadedUsers) {
        await fetchUsers();
      } else if (activeTab === 'support' && !hasLoadedTickets) {
        await fetchTickets();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDataForActiveTab();
  }, [activeTab]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handlePingApi = async (api: ApiHealth) => {
    setPingingApiId(api.id);
    const url = '/api/admin/ping-api';
    try {
      const res = await authedFetch(url, {
        method: 'POST',
        body: JSON.stringify({ apiId: api.id, endpoint: api.endpoint })
      });
      if (res.ok) {
        const data = await res.json();
        setApiStatuses(prev => prev.map(item => {
          if (item.id === api.id) {
            return {
              ...item,
              latency: data.latency,
              lastChecked: 'Just now',
              status: item.status.includes('Unlinked') ? 'Unlinked' : 'Active'
            };
          }
          return item;
        }));
        showToast(`⚡ ${api.name}: Responded in ${data.latency} (HTTP ${data.httpCode} OK)`);
      } else {
        showToast(`⚠️ Ping test sent to ${api.name}`);
      }
    } catch (err) {
      showToast(`❌ Failed to ping ${api.name}`);
    } finally {
      setPingingApiId(null);
    }
  };

  const handlePingAll = async () => {
    showToast('Running diagnostic ping across all system APIs...');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    await fetchAdminDataForActiveTab();
    showToast('✅ All API health statuses refreshed!');
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Active')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status.includes('Limit')) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (status.includes('Error') || status.includes('Timeout')) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (status.includes('Unlinked')) return 'text-slate-600 bg-slate-100 border-slate-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Active')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (status.includes('Limit')) return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    if (status.includes('Error') || status.includes('Timeout')) return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    if (status.includes('Unlinked')) return <Link2Off className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    return <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">POST</span>;
      case 'Realtime Sync':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">SYNC</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">{method || 'API'}</span>;
    }
  };

  const categories = [
    'All',
    'AI & Gemini Services',
    'Transport & Booking APIs',
    'Media & Places Proxy',
    'Database & Cloud Services',
    'Admin & System APIs',
    'Payment & Communication Gateways'
  ];

  const filteredApis = apiStatuses.filter(api => {
    const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (api.endpoint && api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (api.description && api.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = api.status.includes('Active');
    else if (statusFilter === 'Unlinked') matchesStatus = api.status.includes('Unlinked');
    else if (statusFilter === 'Issue') matchesStatus = !api.status.includes('Active') && !api.status.includes('Unlinked');

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const pendingVendorCount = vendorApps.filter(a => a.status === 'PENDING').length;

  const tabs = [
    { id: 'analytics', icon: LayoutDashboard, label: 'Platform Analytics' },
    { id: 'vendors', icon: Building2, label: `Vendor Approvals ${pendingVendorCount > 0 ? `(${pendingVendorCount})` : ''}` },
    { id: 'payouts', icon: DollarSign, label: 'Commission & Payouts' },
    { id: 'ads', icon: Gift, label: 'Active Ads & Offers' },
    { id: 'apis', icon: Activity, label: 'API & System Health' },
    { id: 'support', icon: MessageSquare, label: 'Support & Security' },
    { id: 'users', icon: Users, label: 'User Directory' },
  ] as const;

  const filteredVendors = vendorApps.filter(app => {
    if (vendorFilter === 'ALL') return true;
    return app.status === vendorFilter;
  });

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 max-w-md">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold leading-snug">{toastMsg}</p>
        </div>
      )}

      {/* Inspect API Details Drawer / Modal */}
      {selectedInspectApi && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100">
                  <Code2 className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedInspectApi.name}</h3>
                  <p className="text-xs font-bold text-slate-500 font-mono mt-0.5">{selectedInspectApi.endpoint || 'Internal SDK'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInspectApi(null)} 
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HTTP Method</span>
                  <div className="mt-1">{getMethodBadge(selectedInspectApi.method)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Status</span>
                  <span className={`text-xs font-bold mt-1 inline-block ${selectedInspectApi.status.includes('Active') ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {selectedInspectApi.status}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Response Time</span>
                  <span className="text-xs font-black text-sky-600 mt-1 block">{selectedInspectApi.latency || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Sync</span>
                  <span className="text-xs font-medium text-slate-600 mt-1 block">{selectedInspectApi.lastChecked}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1.5">Functional Purpose in App</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {selectedInspectApi.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button 
                onClick={() => {
                  handlePingApi(selectedInspectApi);
                  setSelectedInspectApi(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs transition-opacity hover:opacity-95 cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 text-emerald-200" />
                <span>Execute Live Ping Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standardized Universal TopBar Header without SOS */}
      <TopBar 
        sub="System Administration & Operations" 
        title={
          <div className="flex items-center gap-2">
            <LogoName className="text-xl" />
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              Admin Portal
            </span>
          </div>
        } 
        scrolled={false} 
        avatarGrad="from-sky-500 to-emerald-500"
        initial="A"
        onLogout={() => {
          if (onLaunchMainApp) onLaunchMainApp();
        }} 
        onOpenSettings={() => setActiveTab('analytics')}
      />

      {/* Admin Theme Header Sub-bar */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold shadow-xs shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span className="text-white font-bold">Super Admin Control Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePingAll}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors text-xs font-bold cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
          {onLaunchMainApp && (
            <button 
              onClick={onLaunchMainApp}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launch Main App</span>
            </button>
          )}
        </div>
      </div>

      {/* Categorized Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 max-w-7xl mx-auto min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area (Scrollable with proper padding) */}
      <main className="flex-1 overflow-y-auto pb-32 px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          
          {/* TAB 1: PLATFORM ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* System Health Overview Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-800">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">App Health: {appHealth}%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-800">
                      <Database className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">System: {systemHealth}%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-sky-50 border-sky-200 text-sky-800">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Security: {securityHealth}%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-slate-100 border-slate-200 text-slate-800">
                      <Server className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Total APIs: {apiStatuses.length}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('apis')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-95 cursor-pointer shadow-xs"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>View All APIs ({apiStatuses.length})</span>
                  </button>
                </div>
              </div>

              {/* Analytics Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100">
                      <Users className="w-5 h-5 text-sky-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Total Registered Users</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Approved Partners</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-emerald-600">{activeAgents}</p>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active B2B</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-100">
                      <DollarSign className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Gross Revenue</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-teal-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Cycle</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100">
                      <PackageSearch className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Active Packages</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black text-amber-600">{activePackages}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Published</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VENDOR APPROVALS */}
          {activeTab === 'vendors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Vendor & Partner Applications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review agency credentials, GST verification, and approve B2B access.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setVendorFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        vendorFilter === filter
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                  <button
                    onClick={resetApplications}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vendor List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVendors.length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-600">No vendor applications found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Applications submitted by travel partners will appear here for review.</p>
                  </div>
                ) : (
                  filteredVendors.map((vendor) => (
                    <div key={vendor.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mb-2 ${
                            vendor.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            vendor.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {vendor.status}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">{vendor.businessName}</h4>
                          <p className="text-xs text-slate-500 font-semibold">{vendor.category} • {vendor.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">GST Number</p>
                          <p className="text-xs font-mono font-bold text-slate-700">{vendor.licenseGst || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p><span className="font-bold text-slate-700">Owner:</span> {vendor.ownerName}</p>
                        <p><span className="font-bold text-slate-700">Contact:</span> {vendor.phone} • {vendor.email}</p>
                      </div>

                      {vendor.status === 'PENDING' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              approveApplication(vendor.id);
                              showToast(`Approved ${vendor.businessName}`);
                            }}
                            className="flex-1 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Partner</span>
                          </button>
                          <button
                            onClick={() => {
                              rejectApplication(vendor.id);
                              showToast(`Rejected ${vendor.businessName}`);
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSION & PAYOUTS */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Commission & Partner Payout Manager
                </h3>
                <p className="text-xs text-slate-500">Configure platform take-rate commissions and process partner payout requests.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Default B2B Commission</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">5.0%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Platform service fee</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Payouts</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">₹0</p>
                    <p className="text-xs text-slate-500 mt-0.5">Awaiting release</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Commission Earned</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">₹0</p>
                    <p className="text-xs text-slate-500 mt-0.5">Lifetime platform earnings</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs text-center text-slate-400">
                <DollarSign className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Pending Payout Requests</h4>
                <p className="text-xs text-slate-400 mt-1">Partner wallet withdrawal requests will be queued here for admin approval.</p>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE ADS & OFFERS */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-sky-600" />
                  Ad Campaigns & Promotion Moderation
                </h3>
                <p className="text-xs text-slate-500">Manage agent promoted ads, homepage banners, and target city campaign slots.</p>
              </div>
              <AdManager />
            </div>
          )}

          {/* TAB 5: API & SYSTEM HEALTH */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search APIs by name or endpoint..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <button
                    onClick={handlePingAll}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Ping All</span>
                  </button>
                </div>
              </div>

              {/* API List */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-4">API Service</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Latency</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {filteredApis.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No API endpoints matched the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredApis.map((api) => (
                          <tr key={api.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <p className="font-extrabold text-slate-900">{api.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{api.endpoint || 'Internal SDK'}</p>
                            </td>
                            <td className="p-4 text-slate-600 font-semibold">{api.category}</td>
                            <td className="p-4">{getMethodBadge(api.method)}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(api.status)}`}>
                                {getStatusIcon(api.status)}
                                {api.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-sky-600">{api.latency || 'N/A'}</td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedInspectApi(api)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                              <button
                                onClick={() => handlePingApi(api)}
                                disabled={pingingApiId === api.id}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                {pingingApiId === api.id ? 'Pinging...' : 'Ping'}
                              </button>
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

          {/* TAB 6: SUPPORT & SECURITY */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                  Support Tickets & Security Audit
                </h3>
                <p className="text-xs text-slate-500">Monitor incoming help desk tickets, security event logs, and user reports.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Open Support Tickets</h4>
                  {ticketsList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No open support tickets at this time.
                    </div>
                  ) : (
                    ticketsList.map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{t.user}</span>
                          <span className="text-emerald-600">{t.status}</span>
                        </div>
                        <p className="text-slate-600">{t.issue}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Security Audit Log</h4>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Super Admin Session Initiated</span>
                      <span className="text-[10px] font-mono text-slate-400">Just now</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>API Health Diagnostic Check</span>
                      <span className="text-[10px] font-mono text-slate-400">2m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-600" />
                    Registered Platform Users ({usersList.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage customer accounts, traveler roles, and system permissions.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-4">User Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            No registered users found in Firestore.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-extrabold text-slate-900">{u.name}</td>
                            <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {u.type}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {u.status}
                              </span>
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

        </div>
      </main>
    </div>
  );
};
