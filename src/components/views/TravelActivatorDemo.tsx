import React, { useState } from 'react';
import { Plane, Building, Train, Car, Tag, CheckCircle2, X, ChevronRight, MapPin, Calendar, Users } from 'lucide-react';

export const TravelActivatorDemo = () => {
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Example data for the horizontal scroll
  const trendingPackages = [
    { id: 1, title: 'Mystic Manali', duration: '3N / 4D', price: '₹14,999', img: 'https://images.unsplash.com/photo-1605649487212-4d4b1a457494?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Goa Premium Getaway', duration: '4N / 5D', price: '₹18,500', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Kerala Backwaters', duration: '5N / 6D', price: '₹22,000', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* 1. HERO SECTION & GLOBAL UI (Trustworthy Navy Blue) */}
      <div className="bg-[#0A2240] pt-12 pb-24 px-6 rounded-b-[40px] relative">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">Travel Activator</h1>
          <p className="text-slate-300 text-sm">Premium B2B Travel Experiences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 space-y-8">
        
        {/* TRAVEL ICONS (Uniform, Clean, High Contrast) */}
        <div className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 flex justify-between items-center border border-slate-100">
          {[
            { icon: Plane, label: 'Flights', active: true },
            { icon: Building, label: 'Hotels', active: false },
            { icon: Train, label: 'Trains', active: false },
            { icon: Car, label: 'Cabs', active: false }
          ].map((item, idx) => (
            <button key={idx} className="flex flex-col items-center gap-2 w-1/4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${item.active ? 'bg-[#FF5A5F] text-white shadow-md shadow-rose-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold ${item.active ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* 3. TRENDING HOLIDAY PACKAGES (Horizontal Scroll / Carousel) */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-black text-[#0A2240]">Trending Packages</h2>
            <button className="text-xs font-bold text-[#FF5A5F]">View All</button>
          </div>
          
          {/* HORIZONTAL SCROLL LOGIC */}
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar -mx-6 px-6">
            {trendingPackages.map((pkg) => (
              <div key={pkg.id} className="shrink-0 w-64 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 snap-center cursor-pointer hover:shadow-md transition-shadow">
                <img src={pkg.img} alt={pkg.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">{pkg.title}</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{pkg.duration}</span>
                  </div>
                  <p className="text-xs text-slate-400">Starting from</p>
                  <p className="text-lg font-black text-[#0A2240]">{pkg.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. CHECKOUT & COUPON SECTION UI */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-black text-[#0A2240] border-b border-slate-100 pb-3">Checkout Summary</h2>
          
          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>Base Fare (2 Travelers)</span>
            <span>₹29,998</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>Taxes & Fees</span>
            <span>₹2,400</span>
          </div>

          {/* COUPON SUCCESS UI OR APPLY BUTTON */}
          {appliedCoupon ? (
            <div className="bg-[#00A699]/10 border border-[#00A699]/20 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00A699]" />
                <div>
                  <p className="text-xs font-black text-[#00A699] uppercase tracking-wide">'{appliedCoupon}' Applied</p>
                  <p className="text-[10px] font-bold text-[#00A699]/70">You saved ₹1,500 on this booking!</p>
                </div>
              </div>
              <button 
                onClick={() => setAppliedCoupon(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowCoupons(true)}
              className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <Tag className="w-5 h-5 text-[#FF5A5F]" />
                <span className="text-sm font-bold">Apply Promo Code</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-500">Total Payable</span>
            <span className="text-2xl font-black text-[#0A2240]">
              {appliedCoupon ? '₹30,898' : '₹32,398'}
            </span>
          </div>
          <button className="w-full bg-[#FF5A5F] text-white font-black py-3.5 rounded-xl shadow-lg shadow-rose-200 mt-2 hover:bg-rose-600 transition-colors">
            Proceed to Payment
          </button>
        </div>

      </div>

      {/* BOTTOM SHEET / MODAL FOR COUPONS */}
      {showCoupons && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 transition-opacity">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0A2240]">Available Offers</h3>
              <button onClick={() => setShowCoupons(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#FF5A5F]" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-1 rounded">B2BSPECIAL</span>
                    <p className="text-xs font-semibold text-slate-500 mt-2">Flat ₹1,500 off on holiday packages.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setAppliedCoupon('B2BSPECIAL');
                      setShowCoupons(false);
                    }}
                    className="text-xs font-black text-[#FF5A5F]"
                  >
                    APPLY
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#00A699]" />
                <div className="flex justify-between items-start ml-2">
                  <div>
                    <span className="font-mono text-sm font-bold bg-slate-100 px-2 py-1 rounded">FESTIVE10</span>
                    <p className="text-xs font-semibold text-slate-500 mt-2">10% off for 4 or more travelers.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setAppliedCoupon('FESTIVE10');
                      setShowCoupons(false);
                    }}
                    className="text-xs font-black text-[#FF5A5F]"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
