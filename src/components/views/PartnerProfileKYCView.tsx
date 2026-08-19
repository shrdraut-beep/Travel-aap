import React, { useState, useEffect } from 'react';
import { User, Building2, MapPin, Mail, Phone, FileBadge, Landmark, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

export const PartnerProfileKYCView = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    proprietorName: '',
    address: '',
    email: '',
    mobile: '',
    panVat: '',
    bankAccount: '',
    ifsc: ''
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.authedFetch('/api/user/profile/secure-get');
        const data = await res.json();
        if (data.success && data.profile) {
          setFormData(prev => ({
            ...prev,
            ...data.profile
          }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    try {
      const res = await apiClient.authedFetch('/api/user/profile/secure-update', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save securely: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save securely.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
          <FileBadge className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Partner Profile & KYC</h2>
          <p className="text-xs font-semibold text-slate-500">Manage your agency details, compliance, and payout bank accounts securely.</p>
        </div>
      </div>
      
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-4">
        <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
           Zero-Trust Encryption is ACTIVE. Your sensitive KYC and banking details are encrypted before saving.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" /> Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Agency Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.agencyName} onChange={e => handleUpdate('agencyName', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Proprietor / Director Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.proprietorName} onChange={e => handleUpdate('proprietorName', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Registered Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.address} onChange={e => handleUpdate('address', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="email" value={formData.email} onChange={e => handleUpdate('email', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="tel" value={formData.mobile} onChange={e => handleUpdate('mobile', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* KYC & Banking */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <h3 className="font-black text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-pink-500" /> KYC & Automated Payouts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">PAN / VAT / GSTIN Number</label>
              <div className="relative">
                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.panVat} onChange={e => handleUpdate('panVat', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500 uppercase" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Bank Account Number</label>
              <div className="relative">
                <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.bankAccount} onChange={e => handleUpdate('bankAccount', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Bank IFSC Code</label>
              <div className="relative">
                <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type="text" value={formData.ifsc} onChange={e => handleUpdate('ifsc', e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-pink-500 uppercase" />
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mt-4">
            <p className="text-[10px] font-bold text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              Payouts are automatically routed to this account every Friday via Razorpay Route. Subject to 194-O TDS deduction as per Indian Income Tax guidelines.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 ${saving ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95`}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'Encrypting & Saving...' : saved ? 'Profile Updated' : 'Save KYC & Profile'}</span>
        </button>
      </form>
    </div>
  );
};
