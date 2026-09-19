import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Tag, Gift, Award, ExternalLink } from 'lucide-react';

export interface PromotionalAdItem {
  id: string;
  badge: string;
  badgeTone?: 'pink' | 'emerald' | 'violet' | 'amber' | 'sky';
  title: string;
  titleMr?: string;
  description: string;
  descriptionMr?: string;
  ctaText: string;
  ctaTextMr?: string;
  imageUrl: string;
  bgGradient: string;
  highlightText?: string;
  highlightTextMr?: string;
  onAction?: () => void;
}

export interface PromotionalAdsRailProps {
  variant?: 'user' | 'vendor' | 'admin';
  isMr?: boolean;
  className?: string;
  onSelectAd?: (ad: PromotionalAdItem) => void;
  onApplyOffer?: (code: string) => void;
}

export const PromotionalAdsRail: React.FC<PromotionalAdsRailProps> = ({
  variant = 'user',
  isMr = false,
  className = '',
  onSelectAd,
  onApplyOffer
}) => {
  const userAds: PromotionalAdItem[] = [
    {
      id: 'ad-goa-monsoon',
      badge: 'LIMITED OFFER',
      badgeTone: 'pink',
      title: 'Monsoon Goa Beach Escape',
      titleMr: 'मान्सून गोवा बीच एक्सप्लोरर',
      description: 'Up to 35% OFF on 4-Star Resort Packages with complimentary breakfast & water sports.',
      descriptionMr: '४-स्टार रिसॉर्ट्सवर ३५% पर्यंत सवलत, मोफत नाश्ता व वॉटरस्पोर्ट्स समाविष्ट.',
      highlightText: 'Save ₹4,500 / Couple',
      highlightTextMr: 'बचत ₹४,५०० / जोडपे',
      ctaText: 'Explore Goa Deals',
      ctaTextMr: 'गोवा पॅकेजेस पहा',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-pink-600/90 via-rose-600/85 to-indigo-900/95'
    },
    {
      id: 'ad-flight-cashback',
      badge: 'AIR TRAVEL SPECIAL',
      badgeTone: 'sky',
      title: 'Flat 12% Cashback on Domestic Flights',
      titleMr: 'देशांतर्गत विमानांवर थेट १२% कॅशबॅक',
      description: 'Pay via RoutTripo Wallet & get instant wallet credit on all IndiGo & Air India flights.',
      descriptionMr: 'RoutTripo वॉलेटद्वारे पेमेंट करा व थेट वॉलेट क्रेडिट मिळवा.',
      highlightText: 'Use Code: FLYROUT12',
      highlightTextMr: 'कोड वापरा: FLYROUT12',
      ctaText: 'Search Flights',
      ctaTextMr: 'विमाने शोधा',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-sky-600/90 via-blue-700/85 to-slate-900/95'
    },
    {
      id: 'ad-kashmir-holiday',
      badge: 'TRENDING HOLIDAY',
      badgeTone: 'emerald',
      title: 'Kashmir Paradise: 5N/6D All-Inclusive',
      titleMr: 'काश्मीर पॅराडाइज: ५-रात्री ६-दिवस टूर',
      description: 'Srinagar, Gulmarg & Pahalgam with Deluxe Houseboat stay & Shikara ride.',
      descriptionMr: 'श्रीनगर, गुलमर्ग व पहलगाम मुक्काम, हाऊसबोट व मोफत शिकारा राइड.',
      highlightText: 'From ₹18,999 / Pax',
      highlightTextMr: 'फक्त ₹१८,९९९ / व्यक्ती',
      ctaText: 'View Itinerary',
      ctaTextMr: 'टूर इटिनररी पहा',
      imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-emerald-600/90 via-teal-700/85 to-indigo-950/95'
    }
  ];

  const vendorAds: PromotionalAdItem[] = [
    {
      id: 'ad-vendor-zero-comm',
      badge: 'B2B ACCELERATOR',
      badgeTone: 'violet',
      title: 'Zero Commission Launch Pass',
      titleMr: 'शून्य कमिशन लाँच पास',
      description: 'First 50 verified package bookings with 0% platform facilitation fee. 100% net earnings to your bank.',
      descriptionMr: 'पहिल्या ५० बुकिंग्सवर ०% प्लॅटफॉर्म कमिशन. संपूर्ण रक्कम थेट बँक खात्यात.',
      highlightText: '100% Net Payouts',
      highlightTextMr: '१००% थेट बँक जमा',
      ctaText: 'Activate Free Pass',
      ctaTextMr: 'मोफत पास सक्रिय करा',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-violet-700/90 via-purple-700/85 to-slate-900/95'
    },
    {
      id: 'ad-vendor-fuel-fleet',
      badge: 'FLEET PARTNER BENEFIT',
      badgeTone: 'amber',
      title: 'HPCL & IOCL Commercial Fleet Fuel Card',
      titleMr: 'HPCL व IOCL कमर्शियल फ्लीट फ्युएल कार्ड',
      description: 'Flat 4.5% cashback on diesel & petrol across 25,000+ pumps nationwide for registered cabs & buses.',
      descriptionMr: 'नोंदणीकृत कॅब व बसेससाठी देशभरात डिझेल व पेट्रोलवर थेट ४.५% कॅशबॅक.',
      highlightText: 'Save ₹8,000/Month',
      highlightTextMr: 'मासिक ₹८,००० बचत',
      ctaText: 'Apply For Card',
      ctaTextMr: 'कार्डसाठी अर्ज करा',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-amber-600/90 via-orange-600/85 to-stone-900/95'
    },
    {
      id: 'ad-vendor-sponsored-listing',
      badge: 'GROWTH ENGINE',
      badgeTone: 'emerald',
      title: 'Boost Package To #1 Featured Rank',
      titleMr: 'आपले टूर पॅकेज पहिल्या क्रमांकावर दाखवा',
      description: 'Get 4.8X more traveler views and direct group inquiries with Verified Featured placement.',
      descriptionMr: '४.८ पट अधिक ग्राहक दृश्यमानता व थेट ग्रुप चौकशी मिळवा.',
      highlightText: '4.8X Higher Bookings',
      highlightTextMr: '४.८ पट अधिक बुकिंग्ज',
      ctaText: 'Promote Package',
      ctaTextMr: 'पॅकेज प्रमोट करा',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
      bgGradient: 'from-teal-600/90 via-emerald-700/85 to-slate-950/95'
    }
  ];

  const ads = variant === 'vendor' ? vendorAds : userAds;

  const getBadgeStyle = (tone: PromotionalAdItem['badgeTone']) => {
    switch (tone) {
      case 'pink': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'amber': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'sky': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-violet-100 text-violet-800 border-violet-200';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
            {variant === 'vendor'
              ? (isMr ? '🌟 वेंडर विशेष ऑफर्स व B2B भागीदार सवलती' : '🌟 Verified Partner Benefits & Sponsored Deals')
              : (isMr ? '🔥 विशेष ट्रॅव्हल ऑफर्स व प्रायोजित सवलती' : '🔥 Featured Travel Offers & Sponsored Deals')}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400">Sponsored</span>
      </div>

      {/* Horizontal Scrollable Cards Rail */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {ads.map((ad) => (
          <div
            key={ad.id}
            onClick={() => onSelectAd?.(ad)}
            className="group relative min-w-[280px] sm:min-w-[340px] max-w-[360px] h-[175px] sm:h-[190px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer snap-start shrink-0 border border-slate-200/80"
          >
            {/* Background Image */}
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ad.bgGradient}`} />

            {/* Card Content */}
            <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shadow-2xs ${getBadgeStyle(ad.badgeTone)}`}>
                    {ad.badge}
                  </span>
                  {ad.highlightText && (
                    <span className="text-[10px] font-black text-white/95 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      {isMr ? (ad.highlightTextMr || ad.highlightText) : ad.highlightText}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-2 line-clamp-1 drop-shadow-xs">
                  {isMr ? (ad.titleMr || ad.title) : ad.title}
                </h3>
                <p className="text-[11px] text-white/85 line-clamp-2 mt-1 leading-snug font-medium">
                  {isMr ? (ad.descriptionMr || ad.description) : ad.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/15">
                <span className="text-[11px] font-bold text-white flex items-center gap-1 group-hover:underline">
                  <span>{isMr ? (ad.ctaTextMr || ad.ctaText) : ad.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[9px] text-white/60 font-medium">T&amp;C Apply</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalAdsRail;
