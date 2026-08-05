import React, { useState } from 'react';
import { 
  Users, 
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2Off,
  LogOut,
  ShieldCheck,
  PackageSearch,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldAlert,
  Bell,
  MessageSquare,
  Gift,
  LayoutDashboard
} from 'lucide-react';

interface AdminDashboardViewProps {
  lang?: 'en' | 'mr' | 'hi';
  onLaunchMainApp?: () => void;
}

type ApiStatus = 'Active' | 'Limit Exceeded' | 'Error/Timeout' | 'Unlinked';

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

  const [apiStatuses] = useState<ApiHealth[]>([
    { id: 'api_1', name: 'Foursquare Places API', status: 'Active', lastChecked: 'Just now' },
    { id: 'api_2', name: 'Pixabay/Pexels API', status: 'Limit Exceeded', lastChecked: '2 mins ago' },
    { id: 'api_3', name: 'Payment Gateway API', status: 'Error/Timeout', lastChecked: '5 mins ago' },
    { id: 'api_4', name: 'Google Places API (Legacy)', status: 'Unlinked', lastChecked: 'N/A' },
    { id: 'api_5', name: 'Flight Search API', status: 'Active', lastChecked: '1 min ago' },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getStatusColor = (status: ApiStatus) => {
    switch (status) {
      case 'Active': return 'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20';
      case 'Limit Exceeded': return 'text-[#F44336] bg-[#F44336]/10 border-[#F44336]/20';
      case 'Error/Timeout': return 'text-[#FF9800] bg-[#FF9800]/10 border-[#FF9800]/20';
      case 'Unlinked': return 'text-[#2196F3] bg-[#2196F3]/10 border-[#2196F3]/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case 'Active': return <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />;
      case 'Limit Exceeded': return <XCircle className="w-4 h-4 text-[#F44336]" />;
      case 'Error/Timeout': return <AlertTriangle className="w-4 h-4 text-[#FF9800]" />;
      case 'Unlinked': return <Link2Off className="w-4 h-4 text-[#2196F3]" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-semibold text-white">{toastMsg}</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="font-bold text-white tracking-wide">Super Admin</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'User & Group Mgmt' },
            { id: 'offers', icon: Gift, label: 'Promos & Coupons' },
            { id: 'notifications', icon: Bell, label: 'Push Notifications' },
            { id: 'support', icon: MessageSquare, label: 'Support Tickets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold text-sm ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 h-16 flex items-center justify-between px-8">
          <h2 className="text-xl font-black text-white capitalize">{activeTab.replace('-', ' ')}</h2>
          {onLaunchMainApp && (
            <button 
              onClick={onLaunchMainApp}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors text-sm font-semibold shadow-lg shadow-slate-900/20 cursor-pointer"
            >
              Launch Customer App
            </button>
          )}
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Financial & Summary Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Agent Accounts</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-black text-white">142</p>
                      <p className="text-xs font-semibold text-slate-400 mb-1">Total</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-semibold">
                      <span className="text-[#4CAF50]">128 Active</span>
                      <span className="text-[#FF9800]">14 Pending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <PackageSearch className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Trip Packages</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-black text-white">856</p>
                      <p className="text-xs font-semibold text-slate-400 mb-1">Total</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-semibold">
                      <span className="text-purple-400">324 Active Tours</span>
                      <span className="text-emerald-400">12.5k Bookings</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Total Revenue</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-black text-emerald-400">₹4.2Cr</p>
                      <p className="text-xs font-semibold text-slate-400 mb-1">This Month</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-semibold">
                      <span className="text-slate-400">Platform Comm. (5%)</span>
                      <span className="text-white">₹21L</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Pending Refunds</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-black text-amber-400">12</p>
                      <p className="text-xs font-semibold text-slate-400 mb-1">Action Required</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-semibold">
                      <span className="text-slate-400">Total Value</span>
                      <span className="text-white">₹1.8L</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Features & Reports */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-lg">Live Travel Trends (AI)</h3>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-sm font-semibold text-emerald-400 mb-1">🔥 High Demand</p>
                      <p className="text-sm text-slate-300 font-medium">Nashik to Ratnagiri</p>
                      <p className="text-xs text-slate-500 mt-1">85% surge in searches over last 48 hrs.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-sm font-semibold text-indigo-400 mb-1">📈 Trending Origin</p>
                      <p className="text-sm text-slate-300 font-medium">Pune (Corporate Groups)</p>
                      <p className="text-xs text-slate-500 mt-1">Spike in weekend Mahabaleshwar bookings.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-white text-lg">Tax & Compliance</h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Automated GST reports (GSTR-1, GSTR-3B) and platform commissions ledger for the current month.
                    </p>
                    <button 
                      onClick={() => showToast('GST Report generated and emailed to CA successfully.')}
                      className="w-full py-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-sm transition-all cursor-pointer"
                    >
                      Generate & Auto-Email to CA
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <h3 className="font-bold text-white text-lg">AI Fraud Detection</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Auto-Block</span>
                      <div className="w-10 h-6 bg-emerald-500 rounded-full p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-rose-400">Suspicious Bulk Booking</p>
                        <span className="px-2 py-1 bg-rose-500/20 text-rose-300 text-[10px] rounded uppercase font-bold tracking-wider">Blocked</span>
                      </div>
                      <p className="text-xs text-slate-300">12 concurrent bookings attempted from same IP (User: temp881@xyz.com).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-sm font-bold text-slate-300 mb-2">Fake Reviews Scrubbed</p>
                      <p className="text-xs text-slate-500">AI identified and removed 5 spam reviews from Agent 'GlobalTripz'.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* API HEALTH MONITORING PANEL */}
              <section className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">API System Health & Status</h2>
                      <p className="text-xs text-slate-400 mt-1">Live monitoring of connected third-party services and APIs.</p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-800">
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/3">Service / API Name</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Checked</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {apiStatuses.map((api) => (
                        <tr key={api.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-200">{api.name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(api.status)}`}>
                              {getStatusIcon(api.status)}
                              <span>{api.status}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-medium text-slate-400">{api.lastChecked}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                              Ping API
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeTab === 'users' && (
            <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <h3 className="font-bold text-white text-lg mb-6">User & Group Management</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">User Info</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                        <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {[
                        { id: 1, name: 'Rahul Deshmukh', email: 'rahul@gmail.com', type: 'Traveler', status: 'Active' },
                        { id: 2, name: 'Sanjay Tours', email: 'contact@sanjaytours.com', type: 'Agent', status: 'Blocked' },
                        { id: 3, name: 'Priya K', email: 'priya.k@yahoo.com', type: 'Traveler', status: 'Active' }
                      ].map(user => (
                        <tr key={user.id} className="hover:bg-slate-900/50">
                          <td className="py-3 px-4">
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-300">{user.type}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => showToast(`Status updated for ${user.name}`)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${user.status === 'Active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            >
                              {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </section>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-6">
              <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-6">Generate Promo Code</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Coupon Code Name</label>
                    <input type="text" placeholder="e.g. SUMMER25" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Discount %</label>
                    <input type="number" placeholder="e.g. 15" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Expiry Date</label>
                    <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <button 
                  onClick={() => showToast('New promo code SUMMER25 added successfully.')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Add Coupon
                </button>
              </section>

              <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-6">Home Screen Banners</h3>
                <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center py-10 cursor-pointer hover:border-indigo-500 transition-colors">
                  <Gift className="w-8 h-8 text-slate-500 mb-3" />
                  <p className="text-sm font-semibold text-white">Click to upload promotional banner (1200x400px)</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl">
              <h3 className="font-bold text-white text-lg mb-6">Broadcast Push Notification</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Notification Title</label>
                  <input type="text" placeholder="e.g. Flash Sale Live!" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Message Body</label>
                  <textarea rows={4} placeholder="Type your message here..." className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"></textarea>
                </div>
              </div>
              <button 
                onClick={() => showToast('Notification blast sent to 12,450 active users.')}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer flex justify-center items-center gap-2"
              >
                <span>Send Blast Notification</span>
                <span>🚀</span>
              </button>
            </section>
          )}

          {activeTab === 'support' && (
            <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-white text-lg mb-6">Customer Support Tickets</h3>
              <div className="space-y-4">
                {[
                  { id: 'TKT-8902', issue: 'Payment Deducted but Booking not Confirmed', user: 'Anjali Sharma', status: 'Open', time: '10 mins ago' },
                  { id: 'TKT-8901', issue: 'Unable to apply SUMMER25 code', user: 'Vikram Joshi', status: 'In Progress', time: '1 hour ago' }
                ].map(ticket => (
                  <div key={ticket.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-indigo-400">{ticket.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.status === 'Open' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs text-slate-500">{ticket.time}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{ticket.issue}</p>
                      <p className="text-xs text-slate-400 mt-1">Reported by: {ticket.user}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700 cursor-pointer">
                        Reply
                      </button>
                      <button 
                        onClick={() => showToast(`Ticket ${ticket.id} resolved.`)}
                        className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
