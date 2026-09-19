import React, { useState } from 'react';
import { Ticket, QrCode, Check, Copy, Sparkles, ShieldCheck, Download, Tag, ArrowRight } from 'lucide-react';
import { CommonFlowHeader } from '../../../components/common/CommonFlowHeader';
import { ActiveOfferCouponsGrid } from '../../../components/common/ActiveOfferCouponsGrid';
import { PromotionalAdsRail } from '../../../components/common/PromotionalAdsRail';

export interface VouchersOffersFlowPageProps {
  onClose: () => void;
  isMr?: boolean;
  initialTab?: 'passes' | 'coupons' | 'secret';
}

export const VouchersOffersFlowPage: React.FC<VouchersOffersFlowPageProps> = ({
  onClose,
  isMr = false,
  initialTab = 'passes'
}) => {
  const [activeTab, setActiveTab] = useState<'passes' | 'coupons' | 'secret'>(initialTab);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      <CommonFlowHeader
        title={isMr ? 'ट्रॅव्हल व्हाउचर्स व विशेष ऑफर्स' : 'Travel Vouchers, Passes & Secret Offers'}
        subtitle={isMr ? 'पुष्टी केलेले QR पासेस, ओटीपी आणि विशेष डिस्काउंट्स' : 'Confirmed QR check-in passes, arrival OTPs & exclusive discount codes'}
        onBack={onClose}
        onClose={onClose}
        backAriaLabel="Back to dashboard"
        closeAriaLabel="Close vouchers page"
      />

      <main className="max-w-4xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* Navigation Switcher */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'passes' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? '🎟️ पुष्टी केलेले व्हाउचर्स' : '🎟️ Confirmed Passes'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coupons' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? '🏷️ प्रोमो कूपन्स' : '🏷️ Promo Coupons'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('secret')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'secret' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isMr ? '🔒 गुप्त डील्स' : '🔒 Secret Deals'}
          </button>
        </div>

        {/* TAB 1: CONFIRMED TRAVEL PASSES & QR CODES */}
        {activeTab === 'passes' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Flight + Hotel Escrow Pass
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    Pune ➔ Goa Coastal 4N/5D Holiday
                  </h3>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Confirmed ✓
                </span>
              </div>

              {/* QR Code & OTP Box */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-3">
                <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-sm text-center">
                  <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Scan at Check-in</p>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isMr ? 'अरायव्हल पडताळणी कोड (Arrival OTP)' : 'Arrival Verification OTP'}
                  </span>
                  <div className="text-3xl font-black font-mono tracking-widest text-indigo-700 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-200 inline-block">
                    8429
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {isMr
                      ? 'हॉटेलमध्ये आल्यावर हा OTP वेंडरला द्या. रक्कम थेट एस्क्रोमधून वेंडरला जमा होईल.'
                      : 'Share this 4-digit OTP upon check-in to trigger direct Escrow disbursal to vendor.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Booking ID: #RT-GOA-2026-89</span>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{downloaded ? 'Downloaded PDF ✓' : 'Download Pass (PDF)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROMO COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4 animate-fadeIn">
            <ActiveOfferCouponsGrid variant="user" isMr={isMr} />
          </div>
        )}

        {/* TAB 3: SECRET UNLISTED DEALS */}
        {activeTab === 'secret' && (
          <div className="space-y-4 animate-fadeIn">
            <PromotionalAdsRail variant="user" isMr={isMr} />
          </div>
        )}
      </main>
    </div>
  );
};

export default VouchersOffersFlowPage;
