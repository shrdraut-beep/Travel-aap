import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, Car, Bus, Package, ArrowRightLeft } from 'lucide-react';
import {
  taxationConfigService,
  type ServiceVertical,
  type TaxCalculationBreakdown,
  type GstSupplyType
} from '../../services/tax/TaxationConfigService';

export interface PriceTaxBreakdownBadgeProps {
  vendorNetPrice: number;
  vertical: ServiceVertical;
  isMr?: boolean;
  unitLabel?: string; // e.g. "/ Person", "/ Night", "/ Day", "/ Seat"
  showDetailsToggle?: boolean;
  className?: string;
}

export const PriceTaxBreakdownBadge: React.FC<PriceTaxBreakdownBadgeProps> = ({
  vendorNetPrice,
  vertical,
  isMr = false,
  unitLabel = '',
  showDetailsToggle = true,
  className = ''
}) => {
  const [supplyType, setSupplyType] = useState<GstSupplyType>('INTRA_STATE');
  const [breakdown, setBreakdown] = useState<TaxCalculationBreakdown>(() =>
    taxationConfigService.calculateUserPrice(vendorNetPrice, vertical, supplyType)
  );
  const [expanded, setExpanded] = useState(false);

  // Recalculate whenever vendorNetPrice, vertical, or supplyType changes
  useEffect(() => {
    setBreakdown(taxationConfigService.calculateUserPrice(vendorNetPrice, vertical, supplyType));
  }, [vendorNetPrice, vertical, supplyType]);

  // Subscribe to live Admin Panel updates
  useEffect(() => {
    const unsubscribe = taxationConfigService.subscribe(() => {
      setBreakdown(taxationConfigService.calculateUserPrice(vendorNetPrice, vertical, supplyType));
    });
    return unsubscribe;
  }, [vendorNetPrice, vertical, supplyType]);

  if (vendorNetPrice <= 0) {
    return (
      <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between ${className}`}>
        <span>{isMr ? 'किंमत प्रविष्ट करा (ग्राहक अंतिम किंमत व IGST/CGST कर तपशील येथे दिसेल)' : 'Enter net amount to see live customer selling price & IGST/CGST breakdown'}</span>
        <span className="text-[10px] font-bold text-slate-400">SAC {breakdown.sacCode}</span>
      </div>
    );
  }

  const verticalIcon = () => {
    switch (vertical) {
      case 'PACKAGE': return <Package className="w-3.5 h-3.5 text-sky-600" />;
      case 'HOTEL': return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'CAB': return <Car className="w-3.5 h-3.5 text-amber-600" />;
      case 'BUS': return <Bus className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  return (
    <div className={`rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/40 p-3 shadow-xs transition-all ${className}`}>
      {/* Top Bar: Live Price Result */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-lg bg-white border border-sky-100 shadow-2xs">
            {verticalIcon()}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block leading-none">
              {isMr ? 'ग्राहकास दिसणारी अंतिम किंमत' : 'Customer Final Selling Price'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-slate-900 tracking-tight">
                ₹{breakdown.finalUserPrice.toLocaleString('en-IN')}
              </span>
              {unitLabel && (
                <span className="text-[11px] font-semibold text-slate-500">{unitLabel}</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            {isMr ? 'सरकारी GST व कमिशन समाविष्ट' : 'Govt GST & Fee Included'}
          </span>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
            {isMr ? `वेंडर नक्त: ₹${breakdown.vendorNetPrice.toLocaleString('en-IN')}` : `Vendor Net: ₹${breakdown.vendorNetPrice.toLocaleString('en-IN')}`}
          </p>
        </div>
      </div>

      {/* GST Mode Toggle: Intra-State (CGST + SGST) vs Inter-State (IGST) */}
      <div className="mt-2 pt-2 border-t border-sky-100/70 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSupplyType('INTRA_STATE')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              supplyType === 'INTRA_STATE'
                ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isMr ? 'राज्यांतर्गत (CGST+SGST)' : 'Intra-State (CGST+SGST)'}
          </button>
          <button
            type="button"
            onClick={() => setSupplyType('INTER_STATE')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              supplyType === 'INTER_STATE'
                ? 'bg-indigo-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-indigo-700'
            }`}
          >
            {isMr ? 'आंतर-राज्य (IGST)' : 'Inter-State (IGST)'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            {supplyType === 'INTER_STATE'
              ? (isMr ? `IGST: ₹${breakdown.totalIgst.toLocaleString('en-IN')}` : `IGST: ₹${breakdown.totalIgst.toLocaleString('en-IN')}`)
              : (isMr ? `CGST: ₹${breakdown.totalCgst} | SGST: ₹${breakdown.totalSgst}` : `CGST: ₹${breakdown.totalCgst} | SGST: ₹${breakdown.totalSgst}`)}
          </span>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
        <div className="p-1 rounded-lg bg-white/80 border border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">
            {isMr ? 'वेंडर नक्त' : 'Vendor Net'}
          </span>
          <span className="text-xs font-bold text-slate-700">
            ₹{breakdown.vendorNetPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-1 rounded-lg bg-white/80 border border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">
            {isMr ? `कमिशन (+${breakdown.platformCommissionPercent}%)` : `Comm (+${breakdown.platformCommissionPercent}%)`}
          </span>
          <span className="text-xs font-bold text-sky-700">
            +₹{breakdown.platformCommissionAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-1 rounded-lg bg-white/80 border border-slate-100">
          <span className="text-[9px] font-bold text-indigo-600 block uppercase">
            {supplyType === 'INTER_STATE'
              ? (isMr ? `एकूण IGST (+${breakdown.igstPercent}%)` : `Total IGST (+${breakdown.igstPercent}%)`)
              : (isMr ? `CGST+SGST (+${breakdown.serviceGstPercent}%)` : `CGST+SGST (+${breakdown.serviceGstPercent}%)`)}
          </span>
          <span className="text-xs font-black text-indigo-700">
            +₹{(supplyType === 'INTER_STATE' ? breakdown.totalIgst : breakdown.totalCgst + breakdown.totalSgst).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Expandable Breakdown Drawer */}
      {showDetailsToggle && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-[10px] font-bold text-sky-700 hover:text-sky-900 flex items-center justify-center gap-1 cursor-pointer py-0.5"
          >
            <span>
              {expanded
                ? (isMr ? 'तपशील लपवा' : 'Hide Tax Breakdown')
                : (isMr ? 'सरकारी GST व IGST कर तपशील पहा' : 'View Statutory GST & IGST Breakdown')}
            </span>
          </button>

          {expanded && (
            <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-2 animate-fadeIn">
              <div className="flex justify-between text-slate-600">
                <span>{isMr ? 'वेंडर मूळ रक्कम (Vendor Net Payout):' : 'Vendor Net Take-Home:'}</span>
                <span className="font-bold text-slate-800">₹{breakdown.vendorNetPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>{isMr ? `प्लॅटफॉर्म सेवा शुल्क (${breakdown.platformCommissionPercent}%):` : `Platform Facilitation Fee (${breakdown.platformCommissionPercent}%):`}</span>
                <span className="font-bold text-sky-700">+₹{breakdown.platformCommissionAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Dynamic IGST vs CGST/SGST Detailed Box */}
              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[11px] text-indigo-950 border-b border-indigo-100/70 pb-1">
                  <span className="flex items-center gap-1">
                    {supplyType === 'INTER_STATE'
                      ? (isMr ? 'आंतर-राज्य पुरवठा (Inter-State IGST)' : 'Inter-State Supply (IGST Breakdown)')
                      : (isMr ? 'राज्यांतर्गत पुरवठा (Intra-State CGST + SGST)' : 'Intra-State Supply (CGST + SGST)')}
                  </span>
                  <span className="text-[10px] text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-bold">
                    SAC {breakdown.sacCode}
                  </span>
                </div>

                {supplyType === 'INTER_STATE' ? (
                  <>
                    <div className="flex justify-between text-slate-700">
                      <span>
                        {isMr ? `१. सेवा IGST (${breakdown.igstPercent}% SAC ${breakdown.sacCode}):` : `1. Service IGST (${breakdown.igstPercent}% SAC ${breakdown.sacCode}):`}
                        {breakdown.isLuxuryHotelTier && (
                          <span className="ml-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                            {isMr ? 'प्रीमियम हॉटेल स्लॅब' : 'Tariff > ₹7.5k'}
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-indigo-800">+₹{breakdown.igstAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span>
                        {isMr ? '२. कमिशनवरील IGST (१८% SAC 9983):' : '2. IGST on Platform Commission (18% SAC 9983):'}
                      </span>
                      <span className="font-bold text-indigo-800">+₹{breakdown.commissionIgstAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-indigo-900 font-extrabold pt-1 border-t border-indigo-100/70 text-xs">
                      <span>{isMr ? 'एकूण देय IGST (Total IGST):' : 'Total Payable IGST:'}</span>
                      <span className="text-indigo-900 font-black">+₹{breakdown.totalIgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-700">
                      <span>
                        {isMr
                          ? `१. केंद्रीय CGST (${breakdown.cgstPercent}% सेवा + ९% कमिशन):`
                          : `1. Central CGST (${breakdown.cgstPercent}% Svc + 9% Comm):`}
                      </span>
                      <span className="font-bold text-indigo-800">+₹{breakdown.totalCgst.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span>
                        {isMr
                          ? `२. राज्य SGST (${breakdown.sgstPercent}% सेवा + ९% कमिशन):`
                          : `2. State SGST (${breakdown.sgstPercent}% Svc + 9% Comm):`}
                      </span>
                      <span className="font-bold text-indigo-800">+₹{breakdown.totalSgst.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-indigo-900 font-extrabold pt-1 border-t border-indigo-100/70 text-xs">
                      <span>{isMr ? 'एकूण CGST + SGST (Total Intra-State GST):' : 'Total Intra-State GST (CGST + SGST):'}</span>
                      <span className="text-indigo-900 font-black">+₹{(breakdown.totalCgst + breakdown.totalSgst).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                {/* Statutory Law Cross-Reference Clarification */}
                <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1 border-t border-indigo-100/40">
                  <ArrowRightLeft className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>
                    {supplyType === 'INTER_STATE'
                      ? (isMr
                          ? `राज्यांतर्गत (Intra-State) ग्राहकासाठी हाच कर CGST (₹${breakdown.totalCgst}) + SGST (₹${breakdown.totalSgst}) असा समान विभागला जाईल.`
                          : `For intra-state customers, this exact amount splits equally into CGST (₹${breakdown.totalCgst}) + SGST (₹${breakdown.totalSgst}).`)
                      : (isMr
                          ? `दुसऱ्या राज्यातील (Inter-State) ग्राहकासाठी हा संपूर्ण कर IGST (₹${breakdown.totalIgst}) म्हणून आकारला जाईल.`
                          : `For inter-state customers from another state, this full tax is levied as IGST (₹${breakdown.totalIgst}).`)}
                  </span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900">
                <span>{isMr ? 'ग्राहकाकडून एकूण देय (Total Payable by Traveller):' : 'Total Customer Price (User Price):'}</span>
                <span className="text-emerald-700 text-sm font-black">₹{breakdown.finalUserPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-1 text-[9px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                <span>TCS Sec 52: 1% (₹{breakdown.tcsAmount}) · TDS Sec 194-O: 1%</span>
                <span className="font-bold text-sky-600">GST Council & CBIC Compliant</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
