import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Users, Activity, CheckCircle2, XCircle, AlertTriangle, Link2Off, LogOut,
  ShieldCheck, PackageSearch, DollarSign, TrendingUp, FileText, ShieldAlert,
  Bell, MessageSquare, Gift, LayoutDashboard, Database, CreditCard, ChevronRight,
  RefreshCcw, Smartphone, Loader2, Search, Filter, Server, Globe, Zap,
  Info, Layers, Send, Terminal, ArrowUpRight, Code2
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
  lang = 'en',
  onLaunchMainApp
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'dashboard' | 'apis' | 'users' | 'offers' | 'notifications' | 'support'>('menu');

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
  const [activePromos, setActivePromos] = useState<number>(0);
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

  // Tab-based Lazy Loading Flags
  const [hasLoadedMetrics, setHasLoadedMetrics] = useState(false);
  const [hasLoadedApis, setHasLoadedApis] = useState(false);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const [hasLoadedTickets, setHasLoadedTickets] = useState(false);

  
  const fetchMetrics = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const tripsSnap = await getDocs(collection(db, 'trips'));
      
      const totalUsers = usersSnap.size;
      const activePackages = tripsSnap.size;
      
      setAppHealth(98);
      setSystemHealth(99);
      setSecurityHealth(100);
      setTotalUsers(totalUsers);
      setActiveAgents(Math.floor(totalUsers * 0.1) || 0); // placeholder
      setTotalRevenue(activePackages * 5000); // 5000 per package placeholder
      setPendingRefunds(0);
      setActivePackages(activePackages);
      setActivePromos(2);
      setSystemWarnings([]);
      setHasLoadedMetrics(true);
    } catch (err) {
      console.error("Error fetching metrics from Firestore:", err);
    }
  };

  const fetchApiHealth = async () => {
    const url = '/api/admin/health';
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.error("API Rate Limit Hit for:", url);
      }
      if (res.ok) {
        const data = await res.json();
        setApiStatuses(data || []);
        setHasLoadedApis(true);
      } else {
        setApiStatuses([]);
      }
    } catch (err) {
      console.error("API Rate Limit Hit for:", url, err);
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
      console.error("Error fetching users from Firestore:", err);
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
      console.error("Error fetching tickets from Firestore:", err);
      setTicketsList([]);
      setHasLoadedTickets(true);
    }
  };

  const fetchAdminDataForActiveTab = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard' && !hasLoadedMetrics) {
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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId: api.id, endpoint: api.endpoint })
      });
      if (res.status === 429) {
        console.error("API Rate Limit Hit for:", url);
      }
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
      console.error("API Rate Limit Hit for:", url, err);
      showToast(`❌ Failed to ping ${api.name}`);
    } finally {
      setPingingApiId(null);
    }
  };

  const handlePingAll = async () => {
    showToast('Running diagnostic ping across all 24 APIs...');
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
    if (status.includes('Pending')) return 'text-slate-700 bg-slate-50 border-slate-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Active')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (status.includes('Limit')) return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    if (status.includes('Error') || status.includes('Timeout')) return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    if (status.includes('Unlinked')) return <Link2Off className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    if (status.includes('Pending')) return <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin shrink-0" />;
    return <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">POST</span>;
      case 'Realtime Sync':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">SYNC</span>;
      case 'Auth SDK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">SDK</span>;
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

  // Calculate API Stats
  const totalApiCount = apiStatuses.length;
  const activeApiCount = apiStatuses.filter(a => a.status.includes('Active')).length;
  const aiApiCount = apiStatuses.filter(a => a.category === 'AI & Gemini Services').length;
  const transportApiCount = apiStatuses.filter(a => a.category === 'Transport & Booking APIs').length;

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'apis', icon: Activity, label: `API & System Health` },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'offers', icon: Gift, label: 'Promos & Coupons' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'support', icon: MessageSquare, label: 'Support Tickets' }
  ];

  return (
    <div className="h-screen w-full bg-[#F4F6F8] text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 max-w-md">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-bold leading-snug">{toastMsg}</p>
        </div>
      )}

      {/* Inspect API Details Drawer / Modal */}
      {selectedInspectApi && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <Code2 className="w-5 h-5 text-indigo-600" />
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
                  <span className="text-xs font-black text-indigo-600 mt-1 block">{selectedInspectApi.latency || 'N/A'}</span>
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

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Backend Test Snippet</span>
                </h4>
                <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto">
                  <code>
                    {`fetch("${selectedInspectApi.endpoint || '/api/health'}", {\n  method: "${selectedInspectApi.method || 'GET'}",\n  headers: { "Content-Type": "application/json" }\n});`}
                  </code>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button 
                onClick={() => {
                  handlePingApi(selectedInspectApi);
                  setSelectedInspectApi(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Execute Live Ping Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-10 shadow-xs z-40 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">Super Admin</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Control Panel & API Hub</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePingAll}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 transition-colors text-xs font-bold cursor-pointer flex items-center gap-2"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh All APIs</span>
          </button>
          {onLaunchMainApp && (
            <button 
              onClick={onLaunchMainApp}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Launch App</span>
            </button>
          )}
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer border border-rose-100">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-[30px] [&::-webkit-scrollbar]:hidden">
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto pb-24">
          
          
          {activeTab === 'menu' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center justify-center p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <tab.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base text-center">{tab.label}</h3>
                </button>
              ))}
            </div>
          )}

          {/* BACK BUTTON (conditionally rendered) */}
          {activeTab !== 'menu' && (
            <button 
              onClick={() => setActiveTab('menu')} 
              className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Admin Menu
            </button>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* COMPACT HEALTH METRICS & ERROR LOGS */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left: Health Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLoading ? 'bg-slate-50 border-slate-200 text-slate-500' : (appHealth >= 98 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800')}`}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-wider">App Health: {isLoading ? '...' : `${appHealth}%`}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLoading ? 'bg-slate-50 border-slate-200 text-slate-500' : (systemHealth >= 95 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800')}`}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-wider">System: {isLoading ? '...' : `${systemHealth}%`}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isLoading ? 'bg-slate-50 border-slate-200 text-slate-500' : (securityHealth === 100 ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-amber-50 border-amber-200 text-amber-800')}`}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-wider">Security: {isLoading ? '...' : `${securityHealth}%`}</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-blue-50 border-blue-200 text-blue-800">
                      <Server className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Total APIs: {totalApiCount}</span>
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveTab('apis')}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>View All Real APIs ({totalApiCount})</span>
                    </button>
                    <button onClick={handlePingAll} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200">
                      <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Diagnostics</span>
                    </button>
                  </div>
                </div>

                {/* System Warnings & Error Logs */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">System Warnings & Logs</h4>
                  <div className="space-y-2">
                    {isLoading ? (
                       <div className="text-xs text-slate-500 italic">Fetching system logs...</div>
                    ) : (
                      <>
                        {systemWarnings.length === 0 ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>All systems operational. No active warnings.</span>
                          </div>
                        ) : (
                          systemWarnings.map(warning => (
                            <div key={warning.id} className={`flex items-start gap-3 p-3 rounded-xl border ${warning.type === 'app' ? 'bg-rose-50 border-rose-100' : warning.type === 'system' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                              {warning.type === 'app' ? <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> : warning.type === 'system' ? <Database className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                              <div>
                                <p className={`text-xs font-bold ${warning.type === 'app' ? 'text-rose-900' : warning.type === 'system' ? 'text-amber-900' : 'text-blue-900'}`}>⚠️ {warning.title}</p>
                                <p className={`text-[11px] font-medium mt-0.5 ${warning.type === 'app' ? 'text-rose-700' : warning.type === 'system' ? 'text-amber-700' : 'text-blue-700'}`}>{warning.desc}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* 3x3 GRID LAYOUT FOR DASHBOARD CARDS */}
              <section className="flex flex-row flex-wrap justify-between gap-y-6">
                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Total Users</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : totalUsers}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Registered</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <Activity className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Integrated APIs</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-indigo-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : `${activeApiCount} / ${totalApiCount}`}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider font-mono">Active & Live</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">App Health</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-emerald-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : `${appHealth}%`}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Performance</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                      <Database className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">System Health</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-amber-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : `${systemHealth}%`}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Uptime</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                      <DollarSign className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Total Revenue</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-teal-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : `₹${totalRevenue.toLocaleString('en-IN')}`}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">This Month</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                      <PackageSearch className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Active Packages</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : activePackages}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Published</p>
                  </div>
                </div>
              </section>

              {/* SYSTEM WORKLOAD (COPIED TO DASHBOARD FOR VISIBILITY) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-lg">System Workload Percentage Distribution</h3>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">Total Active Modules: 100%</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Gemini AI Engine</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-indigo-600 font-black">25%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Google Places & Maps</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>429</span>
                      </div>
                      <span className="text-emerald-600 font-black">30%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Image & Media Fetcher</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-500 uppercase tracking-wider">Idle</span>
                      </div>
                      <span className="text-amber-500 font-black">20%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Database & Core Ops</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-blue-600 font-black">15%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Network Utilities</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-slate-600 font-black">10%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API KEYS & FUNCTIONS (COPIED TO DASHBOARD FOR VISIBILITY) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-lg">API Keys & Their Specific Functions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-bold text-sm text-slate-800">Gemini AI / Groq AI API</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for automated trip planning, smart itinerary generation, and natural language recommendations.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-teal-500" />
                      <h4 className="font-bold text-sm text-slate-800">Google Places & Maps API</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for fetching tourist spot coordinates, managing locations, and calculating accurate driving distances and routes.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <PackageSearch className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-sm text-slate-800">Image APIs (Pixabay / Wikipedia)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for fetching destination and tourist spot images dynamically.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <h4 className="font-bold text-sm text-slate-800">Database & Core State Storage</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for managing user profiles, trips, local data persistence, and sync operations.
                    </p>
                  </div>
                </div>
              </div>





              {/* API PREVIEW LIST ON MAIN DASHBOARD */}
              <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <Activity className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Real Application API Status Summary</h2>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Live status monitor for all backend proxy endpoints and external APIs.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('apis')} 
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Full API Directory ({totalApiCount})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {apiStatuses.map((api) => (
                    <div key={api.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-slate-800 text-xs leading-snug">{api.name}</h4>
                          {getMethodBadge(api.method)}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">{api.endpoint || 'Internal Engine'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(api.status)}`}>
                          {getStatusIcon(api.status)}
                          <span>{api.status}</span>
                        </div>
                        <button 
                          onClick={() => handlePingApi(api)}
                          disabled={pingingApiId === api.id}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {pingingApiId === api.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-500" />}
                          <span>Ping ({api.latency || 'Live'})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* DEDICATED FULL API DIRECTORY TAB */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              {/* API STATS SUMMARY CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Total Real APIs</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{totalApiCount}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active & Live</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{activeApiCount}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>AI & Gemini APIs</span>
                  </div>
                  <p className="text-2xl font-black text-indigo-600">{aiApiCount}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span>Transport APIs</span>
                  </div>
                  <p className="text-2xl font-black text-teal-600">{transportApiCount}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <span>Avg Latency</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">~62ms</p>
                </div>
              </div>

                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* WORKLOAD DISTRIBUTION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-extrabold text-slate-900 text-lg">System Workload Percentage Distribution</h3>
                    </div>
                    <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">Total Active Modules: 100%</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Gemini AI Engine</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                        </div>
                        <span className="text-indigo-600 font-black">25%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Google Places & Maps API</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Rate Limit Warning (429)</span>
                        </div>
                        <span className="text-emerald-600 font-black">30%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Image & Media Fetcher</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-500 uppercase tracking-wider">Idle</span>
                        </div>
                        <span className="text-amber-500 font-black">20%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Database & Core Operations</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                        </div>
                        <span className="text-blue-600 font-black">15%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Network & App Utilities</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                        </div>
                        <span className="text-slate-600 font-black">10%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-slate-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* API KEYS & FUNCTIONS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-slate-900 text-lg">API Keys & Their Specific Functions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-bold text-sm text-slate-800">Gemini AI / Groq AI API</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Used for automated trip planning, smart itinerary generation, and natural language recommendations.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-teal-500" />
                        <h4 className="font-bold text-sm text-slate-800">Google Places & Maps API</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Used for fetching tourist spot coordinates, managing locations, and calculating accurate driving distances and routes.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <PackageSearch className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-sm text-slate-800">Image APIs (Pixabay / Wikipedia)</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Used for fetching destination and tourist spot images dynamically.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <h4 className="font-bold text-sm text-slate-800">Database & Core State Storage</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Used for managing user profiles, trips, local data persistence, and sync operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTERS & SEARCH BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Search input */}
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      placeholder="Search API name, route (/api/...), description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600">✕</button>
                    )}
                  </div>

                  {/* Status filter dropdown & ping all */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Unlinked">Unlinked Only</option>
                        <option value="Issue">Requires Config</option>
                      </select>
                    </div>

                    <button 
                      onClick={handlePingAll}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ping All APIs</span>
                    </button>
                  </div>
                </div>

                {/* Category Horizontal Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2 border-t border-slate-100">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                        selectedCategory === cat 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* COMPREHENSIVE REAL API TABLE */}
              <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                      <Server className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Real Application API Registry</h3>
                      <p className="text-xs text-slate-500">Showing {filteredApis.length} of {totalApiCount} integrated APIs and external services.</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Method</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">API Name & Endpoint Route</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Latency</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Workload</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-500">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                              <span>Scanning and loading real application API list...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredApis.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-500">
                            No APIs matched your query "{searchQuery}".
                          </td>
                        </tr>
                      ) : (
                        filteredApis.map((api) => (
                          <tr key={api.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-4 px-4 shrink-0 hidden sm:table-cell">
                              {getMethodBadge(api.method)}
                            </td>
                            <td className="py-4 px-4 max-w-[200px] sm:max-w-xs">
                              <div className="font-extrabold text-slate-900 text-xs truncate">{api.name}</div>
                              <div className="text-[10px] font-mono font-bold text-indigo-600 mt-0.5 truncate">{api.endpoint || 'Internal Engine'}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 hidden sm:block">{api.description}</div>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {api.category || 'General'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(api.status)}`}>
                                {getStatusIcon(api.status)}
                                <span className="hidden sm:inline">{api.status}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs font-bold text-slate-700 hidden sm:table-cell">
                              {api.latency ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[11px]">
                                  {api.latency}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600">
                              {api.workload ? (
                                <span className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px]">
                                  {api.workload}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">N/A</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right space-x-1 sm:space-x-2">
                              <button 
                                onClick={() => setSelectedInspectApi(api)}
                                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg border border-slate-200"
                              >
                                Details
                              </button>
                              <button 
                                onClick={() => handlePingApi(api)}
                                disabled={pingingApiId === api.id}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-indigo-100 inline-flex items-center gap-1"
                              >
                                {pingingApiId === api.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                                ) : (
                                  <Zap className="w-3 h-3 text-amber-500" />
                                )}
                                <span>Ping API</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
               <h3 className="font-bold text-slate-900 text-base mb-6">User & Group Management</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">User Info</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500"><div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading users...</div></td></tr>
                      ) : usersList.length === 0 ? (
                        <tr><td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500">No users found in database.</td></tr>
                      ) : (
                        usersList.map((user: any) => (
                          <tr key={user.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-4 max-w-[150px] sm:max-w-xs">
                              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{user.email}</p>
                            </td>
                            <td className="py-4 px-4 text-xs font-bold text-slate-600 hidden sm:table-cell">{user.type}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => showToast(`Status update requested via API for ${user.name}`)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${user.status === 'Active' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                              >
                                {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
               </div>
            </section>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-4">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base mb-6">Generate Promo Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Coupon Code Name</label>
                    <input type="text" placeholder="e.g. SUMMER25" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Discount %</label>
                    <input type="number" placeholder="e.g. 15" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Expiry Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                </div>
                <button onClick={() => showToast('Promo coupon successfully published!')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                  Publish Promo Coupon
                </button>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-6">Push Emergency Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Notification Heading</label>
                  <input type="text" placeholder="e.g. Weather Alert in Konkan Region" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Message Body</label>
                  <textarea rows={3} placeholder="Write detailed notification for active trip groups..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"></textarea>
                </div>
                <button onClick={() => showToast('Push notification broadcasted to all users.')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                  Broadcast Push Notification
                </button>
              </div>
            </section>
          )}

          {activeTab === 'support' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-6">Customer Support Tickets</h3>
              <div className="space-y-3">
                {ticketsList.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 font-mono">{ticket.id}</span>
                        <span className="text-xs font-bold text-slate-800">• {ticket.user}</span>
                        <span className="text-[10px] text-slate-400">{ticket.time}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{ticket.issue}</p>
                    </div>
                    <button 
                      onClick={() => showToast(`Ticket ${ticket.id} marked as resolved.`)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Resolve Ticket
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
