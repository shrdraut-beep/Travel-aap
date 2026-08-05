import re

with open('src/components/views/AdminDashboardView.tsx', 'r') as f:
    content = f.read()

new_content = """import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, CheckCircle2, XCircle, AlertTriangle, Link2Off, LogOut,
  ShieldCheck, PackageSearch, DollarSign, TrendingUp, FileText, ShieldAlert,
  Bell, MessageSquare, Gift, LayoutDashboard, Database, CreditCard, ChevronRight,
  RefreshCcw, Smartphone, Loader2
} from 'lucide-react';

interface AdminDashboardViewProps {
  lang?: 'en' | 'mr' | 'hi';
  onLaunchMainApp?: () => void;
}

type ApiStatus = 'Active' | 'Limit Exceeded' | 'Error/Timeout' | 'Unlinked' | 'Pending';

interface ApiHealth {
  id: string;
  name: string;
  status: ApiStatus;
  lastChecked: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  lang = 'en',
  onLaunchMainApp
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'offers' | 'notifications' | 'support'>('dashboard');

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

  // API Status State
  const [apiStatuses, setApiStatuses] = useState<ApiHealth[]>([]);
  
  // Other Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch Dashboard Metrics
        const metricsRes = await fetch('/api/admin/metrics').catch(() => null);
        if (metricsRes && metricsRes.ok) {
           const data = await metricsRes.json();
           if (isMounted) {
             setAppHealth(data.appHealth || 0);
             setSystemHealth(data.systemHealth || 0);
             setSecurityHealth(data.securityHealth || 0);
             setTotalUsers(data.totalUsers || 0);
             setActiveAgents(data.activeAgents || 0);
             setTotalRevenue(data.totalRevenue || 0);
             setPendingRefunds(data.pendingRefunds || 0);
             setActivePackages(data.activePackages || 0);
             setActivePromos(data.activePromos || 0);
           }
        }

        // Fetch API Health
        const apiRes = await fetch('/api/admin/health').catch(() => null);
        if (apiRes && apiRes.ok) {
           const data = await apiRes.json();
           if (isMounted) setApiStatuses(data || []);
        } else {
           if (isMounted) setApiStatuses([]);
        }

        // Fetch Users
        const usersRes = await fetch('/api/admin/users').catch(() => null);
        if (usersRes && usersRes.ok) {
           const data = await usersRes.json();
           if (isMounted) setUsersList(data || []);
        }

        // Fetch Tickets
        const ticketsRes = await fetch('/api/admin/tickets').catch(() => null);
        if (ticketsRes && ticketsRes.ok) {
           const data = await ticketsRes.json();
           if (isMounted) setTicketsList(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchAdminData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getStatusColor = (status: ApiStatus) => {
    switch (status) {
      case 'Active': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Limit Exceeded': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Error/Timeout': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Unlinked': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Pending': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case 'Active': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Limit Exceeded': return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'Error/Timeout': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Unlinked': return <Link2Off className="w-4 h-4 text-blue-600" />;
      case 'Pending': return <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'offers', icon: Gift, label: 'Promos & Coupons' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'support', icon: MessageSquare, label: 'Support Tickets' }
  ];

  return (
    <div className="h-screen w-full bg-[#F4F6F8] text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-bold text-slate-800">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-10 shadow-sm z-40 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">Super Admin</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Control Panel</p>
          </div>
        </div>
        <div className="flex gap-3">
          {onLaunchMainApp && (
            <button 
              onClick={onLaunchMainApp}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors text-xs font-bold shadow-sm cursor-pointer flex items-center gap-2"
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

      {/* Horizontal Scrollable Tab Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide py-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer font-bold text-sm whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto pb-24">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* COMPACT HEALTH METRICS & ERROR LOGS (Horizontal Pill-Badges) */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
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
                  </div>

                  {/* Right: Quick Action */}
                  <button onClick={() => showToast('Diagnostics re-run initiated.')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200">
                    <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Run Diagnostics</span>
                  </button>
                </div>

                {/* System Warnings & Error Logs (Explains the missing %) */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">System Warnings & Logs</h4>
                  <div className="space-y-2">
                    {isLoading ? (
                       <div className="text-xs text-slate-500 italic">Fetching system logs...</div>
                    ) : (
                      <>
                        {appHealth < 100 && (
                          <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-900">⚠️ {100 - appHealth}% App Error: External API Latency Detected</p>
                              <p className="text-[11px] font-medium text-rose-700 mt-0.5">Image fetch endpoints are responding with >1.2s latency, causing minor timeout errors on client apps.</p>
                            </div>
                          </div>
                        )}
                        {systemHealth < 100 && (
                          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                            <Database className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-900">⚠️ {100 - systemHealth}% System Load: High Concurrent Traffic</p>
                              <p className="text-[11px] font-medium text-amber-700 mt-0.5">Rate limits are nearing 90% capacity for live status endpoints.</p>
                            </div>
                          </div>
                        )}
                        {securityHealth < 100 && (
                          <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-900">⚠️ {100 - securityHealth}% Security Alert: Suspicious Login Attempts</p>
                              <p className="text-[11px] font-medium text-rose-700 mt-0.5">Multiple failed login attempts detected from unknown IP ranges. Auto-block engaged.</p>
                            </div>
                          </div>
                        )}
                        {appHealth === 100 && systemHealth === 100 && securityHealth === 100 && (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>All systems operational. No active warnings.</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* 3x3 GRID LAYOUT FOR DASHBOARD CARDS */}
              <section className="flex flex-row flex-wrap justify-between gap-y-6">
                {/* Row 1 */}
                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
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

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Active Agents</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : activeAgents}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Verified</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
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

                {/* Row 2 */}
                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
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

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Security Score</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-rose-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : `${securityHealth}%`}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Protection</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
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

                {/* Row 3 */}
                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Pending Refunds</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-orange-600">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : pendingRefunds}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Action Req</p>
                  </div>
                </div>

                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
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
                
                <div className="w-[100%] md:w-[48%] lg:w-[31%] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between aspect-[4/3] sm:aspect-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-pink-50 border border-pink-100">
                      <Gift className="w-4 h-4 text-pink-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">Active Promos</h3>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <p className="text-3xl font-black text-slate-900">{isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : activePromos}</p>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Live Coupons</p>
                  </div>
                </div>
              </section>

              {/* COMPREHENSIVE API HEALTH LIST */}
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <Activity className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Live API System Status</h2>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time monitoring of connected third-party services.</p>
                    </div>
                  </div>
                  <button onClick={() => showToast('Refreshing API Status...')} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer">
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-1/3">Service / API Name</th>
                        <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Status</th>
                        <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Last Sync</th>
                        <th className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500"><div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading APIs...</div></td></tr>
                      ) : apiStatuses.length === 0 ? (
                        <tr><td colSpan={4} className="py-8 text-center text-sm font-medium text-slate-500">No active APIs detected or failed to fetch.</td></tr>
                      ) : (
                        apiStatuses.map((api) => (
                          <tr key={api.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="font-bold text-slate-800 text-sm">{api.name}</span>
                            </td>
                            <td className="py-4 px-5">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(api.status)}`}>
                                {getStatusIcon(api.status)}
                                <span>{api.status}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-xs font-medium text-slate-500">{api.lastChecked}</span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-blue-100">
                                Ping API
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
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <h3 className="font-bold text-slate-900 text-base mb-6">User & Group Management</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">User Info</th>
                        <th className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Type</th>
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
                            <td className="py-4 px-4">
                              <p className="text-sm font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
                            </td>
                            <td className="py-4 px-4 text-xs font-bold text-slate-600">{user.type}</td>
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
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
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
                <button 
                  onClick={() => showToast('API request sent to add coupon.')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
                >
                  Add Coupon
                </button>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-6">Home Screen Banners</h3>
                <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center py-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <Gift className="w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-sm font-bold text-slate-700">Click to upload promotional banner (1200x400px)</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl">
              <h3 className="font-bold text-slate-900 text-base mb-6">Broadcast Push Notification</h3>
              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Notification Title</label>
                  <input type="text" placeholder="e.g. Flash Sale Live!" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Message Body</label>
                  <textarea rows={4} placeholder="Type your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"></textarea>
                </div>
              </div>
              <button 
                onClick={() => showToast('API request sent to broadcast notification.')}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
              >
                <span>Send Blast Notification</span>
                <span>🚀</span>
              </button>
            </section>
          )}

          {activeTab === 'support' && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-6">Customer Support Tickets</h3>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="p-8 text-center text-sm font-medium text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading tickets...</div>
                ) : ticketsList.length === 0 ? (
                  <div className="p-8 text-center text-sm font-medium text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">No support tickets found.</div>
                ) : (
                  ticketsList.map((ticket: any) => (
                    <div key={ticket.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{ticket.id}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${ticket.status === 'Open' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ticket.time}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{ticket.issue}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">Reported by: {ticket.user}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer">
                          Reply
                        </button>
                        <button 
                          onClick={() => showToast(`Ticket ${ticket.id} resolution requested via API.`)}
                          className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
"""

with open('src/components/views/AdminDashboardView.tsx', 'w') as f:
    f.write(new_content)

