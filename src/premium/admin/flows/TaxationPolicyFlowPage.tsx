import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, Sparkles, Building2, Car, Bus, Package, ArrowRightLeft, Info } from 'lucide-react';
import { CommonFlowHeader } from '../../../components/common/CommonFlowHeader';
import {
  taxationConfigService,
  type VerticalTaxRule,
  type ServiceVertical
} from '../../../services/tax/TaxationConfigService';

export interface TaxationPolicyFlowPageProps {
  onClose: () => void;
  onSaved?: () => void;
}

export const TaxationPolicyFlowPage: React.FC<TaxationPolicyFlowPageProps> = ({
  onClose,
  onSaved
}) => {
  const [taxRules, setTaxRules] = useState<Record<ServiceVertical, VerticalTaxRule>>(() => ({
    ...taxationConfigService.getConfig().rules
  }));
  const [toast, setToast] = useState<string | null>(null);

  const handleUpdateVerticalRule = (
    vertical: ServiceVertical,
    field: keyof VerticalTaxRule,
    value: any
  ) => {
    setTaxRules((prev) => ({
      ...prev,
      [vertical]: {
        ...prev[vertical],
        [field]: value
      }
    }));
  };

  const handleSaveTaxRules = () => {
    taxationConfigService.updateConfig(taxRules, 'Admin Panel Dedicated Flow');
    setToast('Government statutory taxation & commission policy saved and broadcast live to all 4 vendor portals!');
    onSaved?.();
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1200);
  };

  const handleResetStatutoryDefaults = () => {
    taxationConfigService.resetToDefaults();
    setTaxRules({ ...taxationConfigService.getConfig().rules });
    setToast('Official statutory GST Council slabs restored successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      <CommonFlowHeader
        title="Government Statutory Taxation & Platform Commission Policy Manager"
        subtitle="Manage GST Council slabs, dynamic IGST vs CGST/SGST, and category take-rates across all 4 verticals"
        onBack={onClose}
        onClose={onClose}
        backAriaLabel="Back to settlement dashboard"
        closeAriaLabel="Close and return to admin portal"
      />

      <main className="max-w-4xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28 space-y-5">
        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* GST Council Statutory Compliance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 text-xs flex items-start gap-3 shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-sm text-blue-950">
              CBIC & GST Council Dynamic Compliance Engine
            </h3>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              Modifications saved here propagate across all live vendor inventory forms in real-time.
              The engine automatically splits between <strong>Inter-State IGST (Integrated GST)</strong> and <strong>Intra-State CGST + SGST (50:50)</strong>.
            </p>
          </div>
        </div>

        {/* Vertical 1: Tour Packages */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" />
              1. Tour & Holiday Packages (SAC {taxRules.PACKAGE.sacCode})
            </span>
            <span className="text-[10px] font-bold text-slate-400">Notification 11/2017-CT(R)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.PACKAGE.platformCommissionPercent}
                onChange={(e) => handleUpdateVerticalRule('PACKAGE', 'platformCommissionPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tour Service GST / IGST Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.PACKAGE.serviceGstPercent}
                onChange={(e) => handleUpdateVerticalRule('PACKAGE', 'serviceGstPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-sky-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Inter-State: {taxRules.PACKAGE.serviceGstPercent}% IGST · Intra-State: {(taxRules.PACKAGE.serviceGstPercent / 2).toFixed(1)}% CGST + {(taxRules.PACKAGE.serviceGstPercent / 2).toFixed(1)}% SGST
              </p>
            </div>
          </div>
        </div>

        {/* Vertical 2: Hotels & Stays */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              2. Hotels & Stays (SAC {taxRules.HOTEL.sacCode})
            </span>
            <span className="text-[10px] font-bold text-slate-400">47th GST Council Slabs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Commission (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.HOTEL.platformCommissionPercent}
                onChange={(e) => handleUpdateVerticalRule('HOTEL', 'platformCommissionPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tariff ≤ ₹7.5k / IGST (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.HOTEL.serviceGstPercent}
                onChange={(e) => handleUpdateVerticalRule('HOTEL', 'serviceGstPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">12% IGST (6% CGST + 6% SGST)</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Tariff &gt; ₹7.5k / IGST (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.HOTEL.luxuryHotelGstPercent || 18}
                onChange={(e) => handleUpdateVerticalRule('HOTEL', 'luxuryHotelGstPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">18% IGST (9% CGST + 9% SGST)</p>
            </div>
          </div>
        </div>

        {/* Vertical 3: Cabs & Taxis */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-600" />
              3. Cabs & Taxis (SAC {taxRules.CAB.sacCode})
            </span>
            <span className="text-[10px] font-bold text-slate-400">ECO Sec 9(5) CGST Act</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.CAB.platformCommissionPercent}
                onChange={(e) => handleUpdateVerticalRule('CAB', 'platformCommissionPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Cab Transport GST / IGST Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.CAB.serviceGstPercent}
                onChange={(e) => handleUpdateVerticalRule('CAB', 'serviceGstPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {taxRules.CAB.serviceGstPercent}% IGST (or 2.5% CGST + 2.5% SGST)
              </p>
            </div>
          </div>
        </div>

        {/* Vertical 4: Bus Ticketing */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Bus className="w-4 h-4 text-rose-600" />
              4. Intercity Bus Ticketing (SAC {taxRules.BUS.sacCode})
            </span>
            <span className="text-[10px] font-bold text-slate-400">Notification 17/2021-CT(R)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Platform Commission (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.BUS.platformCommissionPercent}
                onChange={(e) => handleUpdateVerticalRule('BUS', 'platformCommissionPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Bus Transport GST / IGST Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={taxRules.BUS.serviceGstPercent}
                onChange={(e) => handleUpdateVerticalRule('BUS', 'serviceGstPercent', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {taxRules.BUS.serviceGstPercent}% IGST (or 2.5% CGST + 2.5% SGST)
              </p>
            </div>
          </div>
        </div>

        {/* Universal Levies Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-900">Universal Platform Levies</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              GST on Commission: 18% (IGST 18% / CGST 9% + SGST 9%) · TCS Sec 52: 1% · TDS Sec 194-O: 1%
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Enforced ✓
          </span>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetStatutoryDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Statutory Slabs</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTaxRules}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Save &amp; Broadcast Live</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TaxationPolicyFlowPage;
