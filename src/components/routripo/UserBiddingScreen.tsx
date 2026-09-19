import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  
  Gavel, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  MessageCircle, FileText, Plus, Eye, ChevronRight, RefreshCw, 
  Lock, ArrowRight, Car, Hotel, Package, Shield, User, AlertCircle,
  QrCode, Check, Copy, Phone, PhoneCall, MapPin, Calendar, Users, X, Info, Download, DollarSign,
  Tag, ExternalLink, RotateCcw, ShieldAlert, Printer
} from 'lucide-react';
import { TripBidRequest, BidOffer, BiddingContract } from '../../types';
import { validateTripBudget, BudgetValidationResult } from '../../utils/budgetValidator';
import { BiddingChatModal } from './BiddingChatModal';
import { CancellationRefundModal } from './CancellationRefundModal';
import { BookingVoucherModal } from './BookingVoucherModal';
import { TopBar, SectionTitle, Card, useScrolled, LogoName } from './SharedUI';
import { cabsMatrix, hotelsMatrix, packagesMatrix } from '../../utils/matrixOptions';

interface UserBiddingScreenProps {
  hideHeader?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  onSOS?: () => void;
  onOpenSettings?: () => void;
  onOpenMyTickets?: () => void;
  lang?: string;
}

export const UserBiddingScreen: React.FC<UserBiddingScreenProps> = ({ 
  onBack, 
  onLogout = () => {}, 
  onSOS = () => {}, 
  onOpenSettings = () => {}, 
  onOpenMyTickets = () => {}, 
  lang = 'en' 
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const isMr = lang === 'mr';

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'vault' | 'contracts'>('requests');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Cabs' | 'Hotels' | 'Packages'>('All');
  const [requests, setRequests] = useState<TripBidRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [offers, setOffers] = useState<BidOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeContract, setActiveContract] = useState<BiddingContract | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Request Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]);
  const [paxCount, setPaxCount] = useState<number>(4);
  const [tripCategory, setTripCategory] = useState<'Hotels' | 'Cabs' | 'Packages'>('Cabs');
  const [customBudget, setCustomBudget] = useState<number>(8500);
  const [notes, setNotes] = useState('');
  const [budgetValidation, setBudgetValidation] = useState<BudgetValidationResult | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [requestedInclusions, setRequestedInclusions] = useState<string[]>([
    'Toll & State Taxes Included',
    'Driver Allowance Included',
    '24x7 AC Running'
  ]);
  const [vehicleClass, setVehicleClass] = useState('Maruti Ertiga / 7-Seater');
  const [propertyType, setPropertyType] = useState('3-Star Beach Resort');
  const [mealPlan, setMealPlan] = useState('CP (Breakfast Included)');
  const [tripTheme, setTripTheme] = useState('Family Leisure');
  const [stayQuality, setStayQuality] = useState('Deluxe AC Room');

  // Chat Modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatVendorName, setChatVendorName] = useState('Local Service Partner');

  // Cancellation & Voucher Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleInclusion = (item: string) => {
    setRequestedInclusions(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const defaultRequests: TripBidRequest[] = [
          {
            id: 'REQ-7821',
            userId: 'usr-101',
            userName: 'Sharad Raut',
            userPhone: '+91 98765 43210',
            origin: 'Pune',
            destination: 'Mahabaleshwar & Panchgani',
            startDate: '2026-09-12',
            endDate: '2026-09-15',
            paxCount: 4,
            tripCategory: 'Cabs',
            requestedInclusions: ['Toll & Taxes Included', 'Driver Allowance Included', 'Sightseeing Points'],
            vehicleClass: 'Ertiga / XL6 (AC)',
            customBudget: 8500,
            minEstimatedThreshold: 7800,
            notes: 'Need early morning pickup from Kothrud. Clean boot space for 3 bags.',
            status: 'OPEN',
            escrowStatus: 'PENDING',
            tokenPaid: true,
            tokenAmount: 49,
            expiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
            createdAt: new Date().toISOString(),
            bidsCount: 3
          },
          {
            id: 'REQ-5519',
            userId: 'usr-101',
            userName: 'Sharad Raut',
            userPhone: '+91 98765 43210',
            origin: 'Mumbai',
            destination: 'Goa (North & South)',
            startDate: '2026-10-02',
            endDate: '2026-10-06',
            paxCount: 2,
            tripCategory: 'Hotels',
            requestedInclusions: ['Breakfast Included', 'Swimming Pool Access', 'Sea View Room'],
            propertyType: '4-Star Boutique Resort',
            mealPlan: 'CP (Breakfast Included)',
            customBudget: 14000,
            minEstimatedThreshold: 12500,
            notes: 'Close to Calangute or Candolim beach with scooter rental nearby.',
            status: 'CONFIRMED',
            escrowStatus: 'HELD',
            tokenPaid: true,
            tokenAmount: 49,
            expiresAt: new Date(Date.now() + 3600000 * 48).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            acceptedBidId: 'OFF-102',
            contractId: 'CTR-GOA-901',
            bidsCount: 4
          }
        ];

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bids/requests?userId=usr-101');
      const data = await res.json();
      if (data.success && data.requests && data.requests.length > 0) {
        setRequests(data.requests);
        if (!selectedRequestId) {
          setSelectedRequestId(data.requests[0].id);
          fetchOffersForRequest(data.requests[0].id);
        }
      } else {
        // Fallback realistic seed data if database is initialising
        
        setRequests(defaultRequests);
        setSelectedRequestId(defaultRequests[0].id);
        fetchOffersForRequest(defaultRequests[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch requests:", e);
      setRequests(defaultRequests);
      if (!selectedRequestId) {
          setSelectedRequestId(defaultRequests[0].id);
          fetchOffersForRequest(defaultRequests[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOffers = (reqId: string): BidOffer[] => [
          {
            id: 'OFF-401',
            tripRequestId: reqId,
            vendorId: 'vendor-401',
            vendorName: 'Sahyadri Tours & Cabs (4.9★)',
            vendorRating: 4.9,
            basePrice: 7200,
            taxes: 450,
            totalPrice: 7650,
            inclusions: ['Toll & Parking Included', 'Driver Allowance Included', 'AC On in Ghats', 'Clean Sanitized Ertiga'],
            exclusions: ['Personal Meals & Entry Tickets'],
            vehicleSpecs: 'Maruti Ertiga ZXI (2024 Model, Chilled AC, Carrier)',
            refundType: 'REFUNDABLE',
            refundDeadlineHours: 24,
            cancellationPolicy: '100% Free Cancellation up to 24 hours before journey start. Non-refundable thereafter.',
            revisionCount: 1,
            status: 'PENDING',
            validUntil: new Date(Date.now() + 3600000 * 18).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'OFF-402',
            tripRequestId: reqId,
            vendorId: 'vendor-402',
            vendorName: 'Konkan Royal Fleets (4.8★)',
            vendorRating: 4.8,
            basePrice: 7500,
            taxes: 400,
            totalPrice: 7900,
            inclusions: ['All Tolls & State Tax', 'Night Stay Driver Allowance', 'Complimentary Water Bottles'],
            exclusions: ['Monument Fees'],
            vehicleSpecs: 'Toyota Rumion / Ertiga Hybrid AC',
            refundType: 'NON_REFUNDABLE',
            cancellationPolicy: '100% Non-Refundable (Zero-Refund Operator Policy). Full escrow protected for operator.',
            revisionCount: 0,
            status: 'PENDING',
            validUntil: new Date(Date.now() + 3600000 * 22).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'OFF-403',
            tripRequestId: reqId,
            vendorId: 'vendor-403',
            vendorName: 'Mahabaleshwar Direct Travels (4.7★)',
            vendorRating: 4.7,
            basePrice: 6800,
            taxes: 350,
            totalPrice: 7150,
            inclusions: ['Toll Included', 'Local Sightseeing 4 Points', 'Driver Charges'],
            exclusions: ['Parking in Market Area'],
            vehicleSpecs: 'Swift Dzire Premium AC (Sedan)',
            refundType: 'REFUNDABLE',
            refundDeadlineHours: 48,
            cancellationPolicy: '100% Free Cancellation up to 48 hours before journey start. Non-refundable thereafter.',
            revisionCount: 0,
            status: 'PENDING',
            validUntil: new Date(Date.now() + 3600000 * 12).toISOString(),
            createdAt: new Date().toISOString()
          }
        ];

  const fetchOffersForRequest = async (reqId: string) => {
    try {
      const res = await fetch(`/api/bids/offers/${reqId}`);
      const data = await res.json();
      if (data.success && data.offers && data.offers.length > 0) {
        setOffers(data.offers);
      } else {
        // Realistic verified bids for demo
        
        setOffers(getDefaultOffers(reqId));
      }
    } catch (e) {
      console.error("Failed to fetch offers:", e);
      setOffers(getDefaultOffers(reqId));
    }
  };

  const handleCreateRequest = async (skipWarning = false) => {
    if (!origin || !destination || !startDate || !endDate || !customBudget) {
      showToast(isMr ? "कृपया प्रवासाचे सर्व तपशील भरा." : "Please fill in all mandatory trip details.");
      return;
    }

    // Run Algorithmic Budget Check
    const validation = validateTripBudget({
      startDate,
      endDate,
      paxCount,
      tripCategory,
      proposedBudget: Number(customBudget)
    });

    setBudgetValidation(validation);

    if (validation.status === 'REJECTED') {
      return;
    }

    if (validation.status === 'WARNING' && !skipWarning) {
      setShowWarningDialog(true);
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/bids/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-101',
          userName: 'Sharad Raut',
          userPhone: '+91 98765 43210',
          origin,
          destination,
          startDate,
          endDate,
          paxCount,
          tripCategory,
          customBudget: Number(customBudget),
          requestedInclusions,
          vehicleClass,
          propertyType,
          mealPlan,
          tripTheme,
          stayQuality,
          notes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isMr ? "✅ ऑफर यशस्वीरीत्या प्रसिद्ध झाली! स्थानिक ऑपरेटर्सना थेट पाठवली आहे." : "✅ Offer Live! Verified local operators are notified.");
        setRequests(prev => [data.request, ...prev]);
        setSelectedRequestId(data.request.id);
        setIsCreateModalOpen(false);
        setShowWarningDialog(false);
        fetchOffersForRequest(data.request.id);
      } else {
        // Fallback client insertion
        const newReq: TripBidRequest = {
          id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: 'usr-101',
          userName: 'Sharad Raut',
          userPhone: '+91 98765 43210',
          origin,
          destination,
          startDate,
          endDate,
          paxCount,
          tripCategory,
          requestedInclusions,
          vehicleClass,
          propertyType,
          mealPlan,
          tripTheme,
          stayQuality,
          customBudget: Number(customBudget),
          minEstimatedThreshold: Math.round(Number(customBudget) * 0.85),
          notes,
          status: 'OPEN',
          escrowStatus: 'PENDING',
          tokenPaid: true,
          tokenAmount: 49,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          bidsCount: 0
        };
        setRequests(prev => [newReq, ...prev]);
        setSelectedRequestId(newReq.id);
        setIsCreateModalOpen(false);
        setShowWarningDialog(false);
        showToast(isMr ? "✅ ऑफर यशस्वीरीत्या सादर झाली!" : "✅ Your offer has been submitted!");
      }
    } catch (e) {
      console.error(e);
      showToast(isMr ? "ऑफर सादर करताना समस्या आली." : "Error submitting offer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (offer: BidOffer) => {
    if (!selectedRequestId) return;
    const req = requests.find(r => r.id === selectedRequestId);
    if (!req) return;

    if (!window.confirm(isMr 
      ? `₹${offer.totalPrice.toLocaleString()} चे गुप्त ऑफर स्वीकारायचे का? यामुळे दर कायमचा लॉक होईल आणि झिरो छुपे शुल्क हमी मिळेल.` 
      : `Accept hidden offer of ₹${offer.totalPrice.toLocaleString()} from ${offer.vendorName}? This will lock the price permanently with Zero Surcharge Guarantee.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bids/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripRequestId: selectedRequestId,
          bidOfferId: offer.id,
          userId: 'usr-101'
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.contract) {
        setActiveContract(data.contract);
        setActiveSubTab('contracts');
        showToast(isMr ? "🎉 सौदा कन्फर्म झाला! ट्रिप व्हाउचर्स तयार झाले आहेत." : "🎉 Deal Confirmed! Your Trip Voucher & OTP Pass is ready.");
        fetchRequests();
      } else {
        const req = requests.find(r => r.id === selectedRequestId);
        const isHotel = req?.tripCategory === 'Hotels';
        const totalPrice = offer.totalPrice;
        const advanceAmount = isHotel ? totalPrice : Math.round(totalPrice * 0.4);
        const balanceAmount = isHotel ? 0 : (totalPrice - advanceAmount);

        const pin1 = `${Math.floor(1000 + Math.random() * 9000)}`;
        const pin2 = `${Math.floor(1000 + Math.random() * 9000)}`;
        const pin3 = `${Math.floor(1000 + Math.random() * 9000)}`;
        const pin4 = `${Math.floor(1000 + Math.random() * 9000)}`;

        // Fallback contract object
        const mockContract: BiddingContract = {
          contractId: `CTR-${Date.now().toString().slice(-6)}`,
          tripRequestId: selectedRequestId,
          bidOfferId: offer.id,
          userId: 'usr-101',
          vendorId: offer.vendorId,
          vendorName: offer.vendorName,
          tripCategory: req?.tripCategory || (isHotel ? 'Hotels' : 'Cabs'),
          lockedPrice: totalPrice,
          escrowModel: isHotel ? 'SINGLE_STAGE_HOTEL' : 'TWO_STAGE_CAB_TRIP',
          escrowStatus: 'HELD',
          advanceAmount,
          balanceAmount,
          advanceReleased: false,
          balanceReleased: false,
          userCheckInPin: isHotel ? pin1 : undefined,
          vendorCheckInPin: isHotel ? pin2 : undefined,
          isCheckedIn: false,
          userStartPin: isHotel ? pin1 : pin1,
          vendorStartPin: isHotel ? pin2 : pin2,
          userEndPin: isHotel ? '' : pin3,
          vendorEndPin: isHotel ? '' : pin4,
          inclusions: offer.inclusions,
          exclusions: offer.exclusions || ['Personal Items'],
          refundType: offer.refundType || 'REFUNDABLE',
          refundDeadlineHours: offer.refundDeadlineHours || 24,
          cancellationPolicy: offer.cancellationPolicy || (offer.refundType === 'NON_REFUNDABLE'
            ? '100% Non-Refundable (Zero-Refund Operator Policy)'
            : '100% Refundable up to 24 hours before journey commencement.'),
          legalClause: isHotel 
            ? `Binding reverse-bidding Hotel contract. 100% Escrow released upon Check-In verification. Policy: ${offer.cancellationPolicy || 'Standard refund terms'}.`
            : `Binding reverse-bidding Cab/Trip contract. 40% fuel advance on pickup + 60% balance on final drop-off. Policy: ${offer.cancellationPolicy || 'Standard refund terms'}.`,
          timestamp: new Date().toISOString(),
          userSignatureIp: '127.0.0.1',
          userDeviceFingerprint: 'DEV_CHROME_WEB',
          vendorSignatureIp: '127.0.0.1',
          vendorDeviceFingerprint: 'DEV_PARTNER_APP',
          startOtp: pin1,
          endOtp: isHotel ? '' : pin3,
          isStarted: false,
          isCompleted: false
        };
        setActiveContract(mockContract);
        setActiveSubTab('contracts');
        setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, status: 'CONFIRMED', escrowStatus: 'HELD', acceptedBidId: offer.id } : r));
        showToast(isMr ? "🎉 सौदा कन्फर्म झाला! डिजिटल व्हाउचर्स तयार आहे." : "🎉 Deal Confirmed! Digital Voucher is generated.");
      }
    } catch (e) {
      console.error(e);
      showToast(isMr ? "ऑफर स्वीकारताना अडचण आली." : "Failed to accept offer.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOfflineStatus = async (status: string) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch('/api/bids/deal-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripRequestId: selectedRequest.id, status })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === data.request.id ? data.request : r));
        showToast(isMr ? "ऑफलाइन स्टेटस अपडेट झाले." : "Offline status updated successfully.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMutualPurgeRequest = async (reqId: string) => {
    if (!window.confirm(isMr 
      ? "तुम्ही डेटा नष्ट करण्याची विनंती करू इच्छिता का? दोन्ही बाजूंच्या संमतीने चॅट आणि दस्तऐवज सुरक्षितपणे नष्ट केले जातील." 
      : "Request data purging? This will erase chat history and trip vouchers upon mutual vendor consent.")) return;
    
    try {
      const res = await fetch('/api/bids/purge-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripRequestId: reqId, role: 'user' })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === data.request.id ? data.request : r));
        showToast(data.isPurged 
          ? (isMr ? "डेटा दोन्ही बाजूंनी पूर्णपणे नष्ट केला गेला." : "Data mutually purged.")
          : (isMr ? "विनंती पाठवली. ऑपरेटरच्या संमतीची वाट पाहत आहे." : "Purge request submitted. Awaiting vendor consent."));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (categoryFilter === 'All') return true;
    return r.tripCategory === categoryFilter;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || filteredRequests[0] || requests[0];

  return (
    <div ref={scrollRef} className="premium-root min-h-screen pb-28 bg-[var(--premium-page)] text-slate-900 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-[20px] text-xs font-bold shadow-xl flex items-center gap-2.5 border border-slate-700 max-w-sm"
          >
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Unified TopBar matching other tabs */}
      <TopBar 
        scrolled={scrolled}
        onLogout={onLogout}
        onSOS={onSOS}
        onOpenSettings={onOpenSettings}
        onOpenMyTickets={onOpenMyTickets}
        onBack={onBack}
        title={isMr ? "थेट ऑपरेटर ऑफर्स" : "Get Secret Vendor Offers"}
        sub={isMr ? "स्थानिक ट्रॅव्हल पार्टनरकडून थेट गुप्त सर्वोत्तम दर मिळवा" : "Confidential Direct Offers & Lowest Guaranteed Rates from Verified Partners"}
      />

      <div className="max-w-5xl mx-auto px-3 sm:px-5 space-y-4 pt-2">
        {/* Quick Action & Category Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
            {[
              { id: 'All', label: isMr ? 'सर्व' : 'All Requests' },
              { id: 'Cabs', icon: Car, label: isMr ? 'गाड्या / टॅक्सी' : 'Cabs & Rentals' },
              { id: 'Hotels', icon: Hotel, label: isMr ? 'हॉटेल्स' : 'Hotels' },
              { id: 'Packages', icon: Package, label: isMr ? 'पॅकेजेस' : 'Packages' }
            ].map(cat => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`btn-cat-${cat.id}`}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-3.5 py-2 rounded-[20px] text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    active 
                      ? 'bg-[#1A365D] text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-transparent'
                  }`}
                >
                  {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Primary Action Button & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-post-trip-req"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-[20px] text-xs font-extrabold shadow-sm hover:shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isMr ? "Start Bargain" : "Start Bargain"}</span>
            </button>

            <button
              id="btn-refresh-user-offers"
              onClick={() => fetchRequests()}
              className="p-2.5 bg-white border border-slate-200 rounded-[20px] text-slate-600 hover:text-slate-900 hover:bg-transparent shrink-0 cursor-pointer shadow-xs"
              title={isMr ? "रिफ्रेश करा" : "Refresh"}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar with Badges */}
        <div className="premium-card p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
          <button
            id="tab-user-my-requests"
            onClick={() => setActiveSubTab('requests')}
            className={`flex-1 py-2.5 px-3 rounded-[20px] text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-[#1A365D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isMr ? "माझ्या मागण्या" : "My Requests"}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'requests' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredRequests.length}
            </span>
          </button>

          <button
            id="tab-user-secret-vault"
            onClick={() => setActiveSubTab('vault')}
            className={`flex-1 py-2.5 px-3 rounded-[20px] text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'vault'
                ? 'bg-[#1A365D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-transparent'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isMr ? "Caught Deals" : "Caught Deals"}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'vault' ? 'bg-pink-400 text-slate-900' : 'bg-premium-sky-soft text-premium-sky-deep'
            }`}>
              {offers.length}
            </span>
          </button>

          <button
            id="tab-user-vouchers-otp"
            onClick={() => setActiveSubTab('contracts')}
            className={`flex-1 py-2.5 px-3 rounded-[20px] text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'contracts'
                ? 'bg-[#1A365D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isMr ? "कन्फर्म व्हाउचर्स" : "Vouchers & OTP"}</span>
            {activeContract && (
              <span className="w-2 h-2 rounded-full bg-premium-sky-soft0 animate-ping" />
            )}
          </button>
        </div>

        {/* TAB 1: ACTIVE REQUESTS LIST */}
        {activeSubTab === 'requests' && (
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[24px] p-10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isMr ? "कोणतीही सक्रिय ऑफर नाही" : "No Active Offers"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {isMr 
                      ? "तुमच्या पुढील सहलीचे बजेट नोंदवा आणि स्थानिक ऑपरेटर्सकडून सर्वोत्तम गुप्त दर मिळवा." 
                      : "Submit your offer to receive competitive confidential bids directly from verified local travel operators."}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-3 bg-[#FF6B6B] text-white rounded-[20px] text-xs font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMr ? "ऑफर सादर करा" : "Make an Offer"}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map(req => {
                  const isSelected = selectedRequestId === req.id;
                  return (
                    <div 
                      key={req.id}
                      className={`premium-card p-4 border transition-all shadow-xs space-y-3 flex flex-col ${
                        isSelected ? 'border-[#1A365D] ring-2 ring-[#1A365D]/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Compact Horizontal Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            req.tripCategory === 'Cabs' ? 'bg-sky-100 text-sky-800' :
                            req.tripCategory === 'Hotels' ? 'bg-orange-100 text-premium-pink' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {req.tripCategory === 'Cabs' ? <Car className="w-3 h-3" /> : req.tripCategory === 'Hotels' ? <Hotel className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                            {req.tripCategory === 'Cabs' ? (isMr ? 'टॅक्सी' : 'Cab') :
                             req.tripCategory === 'Hotels' ? (isMr ? 'हॉटेल' : 'Hotel') :
                             (isMr ? 'पॅकेज' : 'Package')}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{req.origin}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{req.destination}</span>
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {req.startDate} {isMr ? "ते" : "to"} {req.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {req.paxCount} {isMr ? "व्यक्ती" : "Pax"}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${
                            req.status === 'CONFIRMED' ? 'bg-premium-sky-soft text-premium-sky-deep' :
                            req.status === 'OPEN' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status === 'CONFIRMED' ? (isMr ? 'सौदा निश्चित' : 'Confirmed') :
                             req.status === 'OPEN' ? (isMr ? 'लाइव्ह' : 'Live') : req.status}
                          </span>
                        </div>
                      </div>

                      {/* Inclusions Chips */}
                      {req.requestedInclusions && req.requestedInclusions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {req.requestedInclusions.slice(0, 3).map((inc, i) => (
                            <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              ✓ {inc}
                            </span>
                          ))}
                          {req.requestedInclusions.length > 3 && (
                            <span className="text-[10px] font-semibold text-slate-400 px-1 py-0.5">
                              +{req.requestedInclusions.length - 3} {isMr ? "अधिक" : "more"}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Budget and Live Bids count */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            {isMr ? "अपेक्षित बजेट" : "Target Budget"}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{req.customBudget.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-premium-sky-deep block uppercase">
                            {req.bidsCount || offers.length} {isMr ? "गुप्त दर आले" : "Offers Received"}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-premium-pink" />
                            {isMr ? "२४ तासात वैध" : "Active 24h"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            fetchOffersForRequest(req.id);
                            setActiveSubTab('vault');
                          }}
                          className="py-2.5 px-3 bg-[#1A365D] text-white rounded-[20px] text-xs font-extrabold hover:bg-[#2A4A7F] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isMr ? "ऑफर्स पहा (" : "Caught Deals ("}{req.bidsCount || offers.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setChatVendorName(`Verified Operators for ${req.destination}`);
                            setIsChatOpen(true);
                          }}
                          className="py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-[20px] text-xs font-extrabold hover:bg-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
                          <span>{isMr ? "चॅट करा" : "Chat (Offers)"}</span>
                        </button>
                      </div>

                      {/* Privacy & Purge options */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button 
                          onClick={() => handleMutualPurgeRequest(req.id)}
                          className="hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{isMr ? "गोपनीयता व डेटा नष्ट" : "Privacy & Purge Data"}</span>
                        </button>

                        <span className="text-[10px] font-semibold text-premium-sky-deep flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {isMr ? "₹४९ टोकन पडताळणी" : "Anti-Spam Verified"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SECRET OFFERS VAULT */}
        {activeSubTab === 'vault' && (
          <div className="space-y-4">
            {/* Active Selected Request Banner */}
            {selectedRequest && (
              <div className="bg-gradient-to-r from-[#1A365D] to-[#2A4A7F] text-white p-4 sm:p-5 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      {isMr ? "निवडलेली मागणी" : "Comparing Offers for"}
                    </span>
                    <span className="text-xs font-bold text-white/80">#{selectedRequest.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-1 text-white">
                    {selectedRequest.origin} ➔ {selectedRequest.destination}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-0.5">
                    {selectedRequest.startDate} {isMr ? "ते" : "to"} {selectedRequest.endDate} • {selectedRequest.paxCount} {isMr ? "व्यक्ती" : "Passengers"} • {isMr ? "बजेट" : "Budget"}: ₹{selectedRequest.customBudget.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('requests')}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-[16px] text-xs font-bold transition-all cursor-pointer"
                  >
                    {isMr ? "मागणी बदला" : "Switch Request"}
                  </button>
                  <button
                    onClick={() => fetchOffersForRequest(selectedRequest.id)}
                    className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-[16px] cursor-pointer"
                    title={isMr ? "रिफ्रेश" : "Refresh"}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[24px] p-10 text-center space-y-3 shadow-xs">
                <Clock className="w-10 h-10 text-premium-pink mx-auto animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isMr ? "ऑपरेटर्सकडून दर संकलित होत आहेत..." : "Gathering Confidential Partner Quotes..."}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isMr 
                    ? "स्थानिक पडताळणीकृत ड्रायव्हर्स आणि हॉटेल्सना तुमची मागणी पाठवली आहे. काही वेळात थेट सर्वोत्तम दर येथे दिसतील." 
                    : "Verified local operators in this sector are preparing their lowest non-negotiable hidden offers. Real-time offers will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer, idx) => {
                  const savings = selectedRequest ? selectedRequest.customBudget - offer.totalPrice : 0;
                  const isBestDeal = idx === 0;

                  return (
                    <div 
                      key={offer.id}
                      className={`premium-card p-5 border transition-all shadow-xs space-y-4 relative ${
                        isBestDeal ? 'border-premium-sky-deep ring-2 ring-pink-500/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isBestDeal && (
                            <span className="text-[10px] font-black uppercase bg-premium-sky-soft0 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              {isMr ? "सर्वोत्तम दर" : "Lowest Guaranteed Quote"}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400">#{offer.id}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-black text-premium-pink bg-premium-pink-soft px-2 py-0.5 rounded-full border border-orange-100">
                          <span>★ {offer.vendorRating || 4.9}</span>
                        </div>
                      </div>

                      {/* Operator Name & Vehicle Details */}
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{offer.vendorName}</span>
                          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                        </h4>
                        <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          {offer.vehicleSpecs || offer.roomSpecs || 'Deluxe AC Sedan / Commercial Taxi'}
                        </p>
                      </div>

                      {/* Price Breakdown Card */}
                      <div className="bg-transparent rounded-[20px] p-3.5 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>{isMr ? "मूळ दर (Base Fare):" : "Base Operator Fare:"}</span>
                          <span>₹{offer.basePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>{isMr ? "टॅक्स व टोल (Taxes & Tolls):" : "GST & State Taxes:"}</span>
                          <span>₹{offer.taxes.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">
                              {isMr ? "अंतिम लॉक दर" : "All-Inclusive Locked Price"}
                            </span>
                            <span className="text-xl font-black text-slate-900">
                              ₹{offer.totalPrice.toLocaleString()}
                            </span>
                          </div>

                          {savings > 0 && (
                            <span className="text-[11px] font-black text-premium-sky-deep bg-premium-sky-soft px-2.5 py-1 rounded-[16px]">
                              {isMr ? `बचत: ₹${savings.toLocaleString()}` : `Save ₹${savings.toLocaleString()}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Inclusions checklist */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {isMr ? "समाविष्ट बाबी व हमी:" : "Included Perks & Guarantees:"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {offer.inclusions.map((inc, i) => (
                            <span key={i} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-premium-sky-deep shrink-0" />
                              <span className="truncate">{inc}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* VENDOR CANCELLATION POLICY BADGE (MANDATORY TRANSPARENCY) */}
                      {offer.refundType === 'NON_REFUNDABLE' ? (
                        <div className="p-3 bg-rose-50/90 rounded-[20px] border-2 border-rose-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-rose-950 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>🔴 100% Non-Refundable</span>
                            </span>
                            <span className="text-[9px] font-black uppercase bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                              Zero Refund
                            </span>
                          </div>
                          <p className="text-[10px] text-rose-800 font-medium leading-tight">
                            {isMr
                              ? "⚠️ ऑपरेटरचे धोरण: रद्दीकरण केल्यास कोणताही परतावा (₹०) मिळणार नाही."
                              : "⚠️ Operator Policy: Strictly no refund on cancellation. Total escrow disbursed to operator."}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-premium-sky-soft/90 rounded-[20px] border-2 border-premium-sky-deep space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-[var(--premium-sky-deep)] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-premium-sky-deep shrink-0" />
                              <span>🟢 Refundable (Free Cancellation)</span>
                            </span>
                            <span className="text-[9px] font-black uppercase bg-[var(--premium-sky-soft)] text-premium-sky-deep px-2 py-0.5 rounded-full">
                              Up to {offer.refundDeadlineHours || 24}h before start
                            </span>
                          </div>
                          <p className="text-[10px] text-premium-sky-deep font-medium leading-tight">
                            {isMr
                              ? `✓ प्रवासाच्या ${offer.refundDeadlineHours || 24} तास आधी रद्द केल्यास १००% परतावा हमी.`
                              : `✓ 100% full refund guaranteed if cancelled ≥${offer.refundDeadlineHours || 24} hours before departure.`}
                          </p>
                        </div>
                      )}

                      {/* Zero surcharge badge */}
                      <div className="p-2 bg-transparent rounded-[16px] border border-slate-200 flex items-center gap-2 text-[11px] font-bold text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-premium-sky-deep shrink-0" />
                        <span>{isMr ? "झिरो छुपे शुल्क हमी (Zero Surcharge Guaranteed)" : "RouTripo Anti-Gouging & Zero Surcharge Guarantee"}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        {/* Scenario A: In-App Secure Booking */}
                        <button
                          onClick={() => handleAcceptBid(offer)}
                          className="py-3 px-4 bg-premium-sky-deep text-white rounded-[20px] text-xs font-extrabold hover:bg-[var(--premium-sky-deep)] transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-sm relative overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4" />
                            <span>{isMr ? "ॲपद्वारे बुक करा (सुरक्षित)" : "Book Securely In-App"}</span>
                          </div>
                          <span className="text-[10px] font-medium text-pink-100">
                            {isMr ? "₹४९ बुकिंग फी १००% माफ! (फ्री बुकिंग)" : "₹49 Contact/Booking Fee is 100% Waived! (Free)"}
                          </span>
                        </button>

                        {/* Scenario B: Offline Direct Dealing */}
                        <button
                          onClick={() => {
                            setChatVendorName(offer.vendorName);
                            setIsChatOpen(true);
                          }}
                          className="py-3 px-4 bg-slate-800 text-white rounded-[20px] text-xs font-extrabold hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-premium-pink" />
                            <span>{isMr ? "थेट नंबर मिळवा व ऑफलाइन डील करा" : "Get Direct Contact & Deal Offline"}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-300">
                            {isMr ? "(₹४९ अनलॉक फी लागू)" : "(Pay ₹49 Unlock Fee instantly)"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIRMED CONTRACTS & DIGITAL VOUCHERS */}
        {activeSubTab === 'contracts' && (
          <div className="space-y-4">
            {activeContract ? (
              <div className="premium-card p-6 border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-[20px] bg-premium-sky-soft text-premium-sky-deep flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{isMr ? "कन्फर्म डिजिटल ट्रिप व्हाउचर" : "Confirmed Trip Digital Pass"}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          (activeContract.tripCategory === 'Hotels' || activeContract.escrowModel === 'SINGLE_STAGE_HOTEL')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {(activeContract.tripCategory === 'Hotels' || activeContract.escrowModel === 'SINGLE_STAGE_HOTEL') ? '🏨 Hotel (1-Stage)' : '🚗 Cab/Trip (2-Stage)'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">Contract ID: #{activeContract.contractId}</p>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-premium-sky-soft text-premium-sky-deep px-3 py-1 rounded-full">
                    {isMr ? "✓ सुरक्षित एस्क्रो लॉक" : "✓ Escrow Protected"}
                  </span>
                </div>

                {/* Operator Details & Escrow Summary */}
                <div className="bg-transparent rounded-[20px] p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {isMr ? "नेमलेला स्थानिक ऑपरेटर" : "Assigned Service Partner"}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{activeContract.vendorName}</h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        {isMr ? "एकूण लॉक रक्कम (Escrow Total)" : "Locked Escrow Total"}
                      </span>
                      <span className="text-lg font-black text-premium-sky-deep">₹{activeContract.lockedPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Escrow Mechanism Breakdown */}
                  {(activeContract.tripCategory === 'Hotels' || activeContract.escrowModel === 'SINGLE_STAGE_HOTEL') ? (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-[16px] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-purple-900">
                        <span>{isMr ? "🏨 १-स्टेज चेक-इन एस्क्रो रिलीज" : "🏨 1-Stage Check-In Escrow Release"}</span>
                        <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full text-[10px]">100% Payout Trigger</span>
                      </div>
                      <p className="text-[11px] text-purple-800 font-medium">
                        {isMr 
                          ? "हॉटेल चेक-इन वेळी ४ अंकी कोड पडताळताच १००% (₹" + activeContract.lockedPrice.toLocaleString() + ") रक्कम हॉटेल पार्टनरला वर्ग केली जाते. चेक-आउट पिनची आवश्यकता नाही."
                          : "Upon Check-In PIN verification, 100% full Escrow payout (₹" + activeContract.lockedPrice.toLocaleString() + ") is released to the Hotel. No check-out PIN required."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-[16px] space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-rose-900">
                        <span>{isMr ? "🚗 २-स्टेज प्रवास एस्क्रो विभागणी" : "🚗 2-Stage Escrow Release Breakdown"}</span>
                        <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full text-[10px]">40% + 60% Split</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white/80 p-2 rounded-lg border border-rose-100">
                          <span className="font-bold text-rose-950 block">स्टेज १ (पिकअप):</span>
                          <span className="text-rose-800 font-extrabold">₹{(activeContract.advanceAmount || Math.round(activeContract.lockedPrice * 0.4)).toLocaleString()} (४०% इंधन ॲडव्हान्स)</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-lg border border-rose-100">
                          <span className="font-bold text-rose-950 block">स्टेज २ (ड्रॉप-ऑफ):</span>
                          <span className="text-rose-800 font-extrabold">₹{(activeContract.balanceAmount || (activeContract.lockedPrice - Math.round(activeContract.lockedPrice * 0.4))).toLocaleString()} (६०% अंतिम शिल्लक)</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-rose-700 font-medium">
                        {isMr 
                          ? "ड्रायव्हरने संपूर्ण सहल पूर्ण केल्याची खात्री करण्यासाठी अंतिम ६०% रक्कम प्रवासाच्या शेवटीच रिलीज केली जाते."
                          : "Final 60% balance is strictly released at trip completion to ensure drivers complete the entire itinerary."}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-1">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                      {isMr ? "झिरो छुपे शुल्क हमी" : "Zero Surcharges"}
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                      {isMr ? "२४ तास मोफत रद्द धोरण" : "24h Cancellation Guard"}
                    </span>
                  </div>
                </div>

                {/* MUTUAL 4+4 PIN EXCHANGE SYSTEM */}
                {(activeContract.tripCategory === 'Hotels' || activeContract.escrowModel === 'SINGLE_STAGE_HOTEL') ? (
                  /* 🏨 HOTELS: Single-Stage Check-In 4+4 Handshake */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                        <span>🏨 {isMr ? "हॉटेल चेक-इन म्युच्युअल पिन एक्सचेंज (4+4 PIN)" : "Hotel Check-In Mutual PIN Exchange (4+4 PIN)"}</span>
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        activeContract.isCheckedIn || activeContract.isCompleted
                          ? 'bg-premium-sky-soft text-premium-sky-deep'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {activeContract.isCheckedIn || activeContract.isCompleted ? (isMr ? "✓ चेक-इन पूर्ण" : "✓ Checked In") : (isMr ? "● चेक-इन बाकी" : "● Check-In Pending")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 1. Customer Check-In PIN */}
                      <div className="bg-purple-50 border border-purple-200 rounded-[20px] p-4 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">
                          {isMr ? "तुमचा चेक-इन कोड (Hotel Desk ला द्या)" : "Your Check-In PIN (Show to Hotel)"}
                        </span>
                        <div className="text-3xl font-black text-purple-950 tracking-widest py-1 font-mono">
                          {activeContract.userCheckInPin || activeContract.startOtp || "4819"}
                        </div>
                        <p className="text-[10px] text-purple-700 font-medium">
                          {isMr ? "हॉटेल रिसेप्शनवर रूम की घेताना हा कोड द्या." : "Provide to reception to verify reservation."}
                        </p>
                      </div>

                      {/* 2. Hotel Security Verification PIN */}
                      <div className="bg-transparent border border-slate-200 rounded-[20px] p-4 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                          {isMr ? "हॉटेल सिक्युरिटी पिन (क्रॉस व्हेरिफाय)" : "Hotel Security PIN (Cross-Verify)"}
                        </span>
                        <div className="text-3xl font-black text-slate-900 tracking-widest py-1 font-mono">
                          {activeContract.vendorCheckInPin || "8192"}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {isMr ? "हॉटेल डेस्ककडून हा कोड क्रॉस-चेक करा (अधिकृतता खात्री)." : "Cross-verify with front desk for zero fraud."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 🚗/🎒 CABS & TRIPS: Two-Stage 4+4 Handshake */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                        <span>🚗 {isMr ? "२-स्टेज म्युच्युअल पिन हँडशेक (4+4 PIN Exchange)" : "2-Stage Mutual PIN Handshake (4+4 PIN)"}</span>
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        activeContract.isCompleted
                          ? 'bg-premium-sky-soft text-premium-sky-deep'
                          : activeContract.isStarted
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-premium-pink'
                      }`}>
                        {activeContract.isCompleted ? (isMr ? "✓ सहल पूर्ण (100% Paid)" : "✓ Completed (100% Paid)") :
                         activeContract.isStarted ? (isMr ? "● प्रवासात (40% Advance Paid)" : "● Trip in Progress (40% Paid)") :
                         (isMr ? "● पिकअप बाकी" : "● Pickup Pending")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Stage 1: Pickup PINs */}
                      <div className={`p-4 rounded-[20px] border space-y-2 ${
                        activeContract.isStarted ? 'bg-premium-sky-soft/70 border-premium-sky-deep' : 'bg-rose-50 border-rose-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-rose-900">
                            {isMr ? "१. पिकअप पिन (४ अंकी)" : "Stage 1: Pickup PIN"}
                          </span>
                          <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                            {isMr ? "४०% इंधन ॲडव्हान्स" : "40% Fuel Advance"}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-[16px] border border-rose-100 text-center space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {isMr ? "ड्रायव्हरला द्यायचा पिन (Customer PIN):" : "Share with Driver at Pickup:"}
                          </span>
                          <div className="text-2xl font-black text-rose-950 font-mono tracking-widest">
                            {activeContract.userStartPin || activeContract.startOtp || "3814"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-rose-800 font-semibold pt-1">
                          <span>{isMr ? "ड्रायव्हर सिक्युरिटी पिन:" : "Driver Verify PIN:"}</span>
                          <span className="font-mono font-bold bg-rose-100 px-2 py-0.5 rounded">{activeContract.vendorStartPin || "6295"}</span>
                        </div>
                      </div>

                      {/* Stage 2: Drop-off Closing PINs */}
                      <div className={`p-4 rounded-[20px] border space-y-2 ${
                        activeContract.isCompleted 
                          ? 'bg-premium-sky-soft/70 border-premium-sky-deep' 
                          : activeContract.isStarted 
                          ? 'bg-premium-pink-soft border-premium-pink' 
                          : 'bg-transparent border-slate-200 opacity-80'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-premium-pink">
                            {isMr ? "२. समाप्ती ड्रॉप-ऑफ पिन" : "Stage 2: Drop-off PIN"}
                          </span>
                          <span className="text-[10px] font-bold bg-orange-200 text-premium-pink px-1.5 py-0.5 rounded">
                            {isMr ? "६०% अंतिम बॅलन्स" : "60% Final Balance"}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-[16px] border border-orange-100 text-center space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {isMr ? "शेवटी द्यायचा क्लोजिंग पिन (Customer PIN):" : "Share ONLY at Final Destination:"}
                          </span>
                          <div className="text-2xl font-black text-[var(--premium-sky-deep)] font-mono tracking-widest">
                            {activeContract.userEndPin || activeContract.endOtp || "8420"}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-premium-pink font-semibold pt-1">
                          <span>{isMr ? "ड्रायव्हर समाप्ती कोड:" : "Driver Final PIN:"}</span>
                          <span className="font-mono font-bold bg-orange-100 px-2 py-0.5 rounded">{activeContract.vendorEndPin || "1953"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code Pass Simulator */}
                <div className="flex flex-col items-center justify-center p-6 bg-transparent rounded-[20px] border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 bg-white p-2 rounded-[16px] shadow-xs border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-slate-900" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {isMr ? "डिजिटल बोर्डिंग क्यूआर कोड" : "Verified Boarding QR Code Pass"}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {isMr ? "ऑपरेटर थेट स्कॅन करून वैधता तपासू शकतात." : "Can be scanned by partner to verify booking integrity."}
                  </p>
                </div>

                {/* MANDATORY VENDOR-SELECTED CANCELLATION POLICY CARD */}
                {activeContract.refundType === 'NON_REFUNDABLE' || activeContract.cancellationPolicy?.includes('Non-Refundable') ? (
                  <div className="p-4 bg-rose-50/90 rounded-[20px] border-2 border-rose-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>🔴 Binding Cancellation Policy: 100% Non-Refundable</span>
                      </span>
                      <span className="text-[10px] font-black uppercase bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                        Zero Refund
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 font-medium leading-relaxed">
                      {isMr
                        ? "⚠️ ऑपरेटरचे लॉक केलेले धोरण: हा करार 100% नॉन-रिफंडेबल आहे. रद्द केल्यास शून्य परतावा मिळेल व पूर्ण एस्क्रो रक्कम ऑपरेटरला दिली जाईल."
                        : "⚠️ Vendor Locked Policy: This booking is strictly 100% Non-Refundable. Cancellation triggers zero refund and full escrow payout to the operator."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-rose-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { policyId: 'bargaining-bidding' } }))}
                        className="text-rose-700 font-bold underline hover:text-rose-900"
                      >
                        {isMr ? "बार्गेनिंग व एस्क्रो धोरण →" : "Bargaining & Escrow Policy →"}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { policyId: 'cancellation-refund' } }))}
                        className="text-rose-700 font-semibold underline hover:text-rose-900"
                      >
                        {isMr ? "परतावा नियम" : "Refund Policy"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-premium-sky-soft/90 rounded-[20px] border-2 border-premium-sky-deep space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[var(--premium-sky-deep)] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-premium-sky-deep shrink-0" />
                        <span>🟢 Binding Cancellation Policy: 100% Refundable</span>
                      </span>
                      <span className="text-[10px] font-black uppercase bg-[var(--premium-sky-soft)] text-premium-sky-deep px-2 py-0.5 rounded-full">
                        Free Notice: {activeContract.refundDeadlineHours || 24}h
                      </span>
                    </div>
                    <p className="text-xs text-premium-sky-deep font-medium leading-relaxed">
                      {isMr
                        ? `✓ प्रवासाच्या ${activeContract.refundDeadlineHours || 24} तास आधीपर्यंत मोफत रद्दीकरण व १००% झटपट एस्क्रो परतावा हमी.`
                        : `✓ 100% Free Cancellation & Instant Auto-Refund permitted up to ${activeContract.refundDeadlineHours || 24} hours before departure.`}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-sky-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { policyId: 'bargaining-bidding' } }))}
                        className="text-sky-700 font-bold underline hover:text-sky-900"
                      >
                        {isMr ? "बार्गेनिंग व एस्क्रो धोरण →" : "Bargaining & Escrow Policy →"}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-legal-modal', { detail: { policyId: 'cancellation-refund' } }))}
                        className="text-sky-700 font-semibold underline hover:text-sky-900"
                      >
                        {isMr ? "परतावा नियम" : "Refund Policy"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Voucher Inclusions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isMr ? "समाविष्ट सेवा व कायदेशीर अटी:" : "Legal Inclusions & Conditions:"}
                  </span>
                  <div className="space-y-1">
                    {activeContract.inclusions.map((inc, i) => (
                      <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-premium-sky-deep shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="py-3 px-4 bg-[#1A365D] text-white rounded-[20px] text-xs font-extrabold hover:bg-[#2A4A7F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isMr ? "अधिकृत व्हाउचर पहा / प्रिंट" : "Official Voucher"}</span>
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="py-3 px-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-[20px] text-xs font-extrabold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>{isMr ? "रद्द करा व परतावा तपासा" : "Cancel & Refund"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setChatVendorName(activeContract.vendorName);
                      setIsChatOpen(true);
                    }}
                    className="py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-[20px] text-xs font-extrabold hover:bg-transparent transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-sky-600" />
                    <span>{isMr ? "ऑपरेटरशी चॅट" : "Chat with Operator"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-[24px] p-10 text-center space-y-3 shadow-xs max-w-md mx-auto">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {isMr ? "कोणताही सक्रिय व्हाउचर नाही" : "No Confirmed Vouchers Yet"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr 
                    ? "Caught Dealsमधून एखादी ऑफर स्वीकारल्यावर येथे डिजिटल पास आणि म्युच्युअल PINs उपलब्ध होतील." 
                    : "Once you accept a confidential operator offer from the Vault, your secure trip voucher and mutual 4+4 PINs will appear here."}
                </p>
                <button
                  onClick={() => setActiveSubTab('vault')}
                  className="px-4 py-2.5 bg-[#1A365D] text-white rounded-[16px] text-xs font-bold hover:bg-[#2A4A7F] cursor-pointer"
                >
                  {isMr ? "Caught Deals" : "Caught Deals"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE NEW TRIP REQUEST MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[20px] bg-[#1A365D] text-white flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {isMr ? "नवीन ऑफर सादर करा" : "Make an Offer"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isMr ? "स्थानिक पडताळणीकृत ऑपरेटर्सकडून थेट सर्वोत्तम दर मिळवा" : "Submit your preferred budget & get private operator quotes"}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Service Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isMr ? "सेवा प्रकार निवडा:" : "Select Service Vertical:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cabs', icon: Car, label: isMr ? 'टॅक्सी / कार' : 'Cab & Taxi' },
                    { id: 'Hotels', icon: Hotel, label: isMr ? 'हॉटेल्स / मुक्काम' : 'Hotel Stay' },
                    { id: 'Packages', icon: Package, label: isMr ? 'टूर पॅकेज' : 'Full Package' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTripCategory(cat.id as any)}
                      className={`py-2 px-1.5 rounded-[20px] text-xs font-extrabold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        tripCategory === cat.id 
                          ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-xs' 
                          : 'bg-transparent text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <cat.icon className="w-4 h-4 mb-0.5" />
                      <span className="text-center leading-tight whitespace-pre-wrap">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Route & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isMr ? "प्रारंभिक शहर (Origin):" : "Origin City:"}
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="e.g. Pune, Mumbai, Nashik"
                    className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1A365D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isMr ? "गंतव्य ठिकाण (Destination):" : "Destination:"}
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Mahabaleshwar, Goa, Alibaug"
                    className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1A365D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isMr ? "प्रारंभ तारीख (Start Date):" : "Start Date:"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1A365D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isMr ? "परतीची तारीख (End Date):" : "End Date:"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1A365D]"
                  />
                </div>
              </div>

              {/* Passenger Count & Vehicle / Property Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isMr ? "प्रवासी संख्या (Passengers):" : "Passenger Count:"}
                  </label>
                  <div className="flex items-center bg-transparent border border-slate-200 rounded-[16px] p-1">
                    <button
                      type="button"
                      onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-black text-xs text-slate-900">{paxCount} {isMr ? "व्यक्ती" : "Pax"}</span>
                    <button
                      type="button"
                      onClick={() => setPaxCount(paxCount + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {tripCategory === 'Cabs' ? (isMr ? "गाडीचा प्रकार:" : "Preferred Vehicle:") :
                     tripCategory === 'Hotels' ? (isMr ? "हॉटेल श्रेणी:" : "Property Quality:") :
                     (isMr ? "पॅकेज थीम:" : "Tour Theme:")}
                  </label>
                  {tripCategory === 'Cabs' && (
                    <select
                      value={vehicleClass}
                      onChange={e => setVehicleClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden"
                    >
                      <option value="Sedan (Dzire / Etios AC)">Sedan (Dzire / Etios AC)</option>
                      <option value="Maruti Ertiga / 7-Seater">Maruti Ertiga / 7-Seater AC</option>
                      <option value="Toyota Innova Crysta">Toyota Innova Crysta Premium</option>
                      <option value="Tempo Traveller (13/17 Seater)">Tempo Traveller (13/17 Seater)</option>
                    </select>
                  )}
                  {tripCategory === 'Hotels' && (
                    <select
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden"
                    >
                      <option value="3-Star Beach Resort">3-Star Beach Resort</option>
                      <option value="4-Star Luxury Property">4-Star Luxury Property</option>
                      <option value="Heritage Homestay / Villa">Heritage Homestay / Villa</option>
                      <option value="Budget Clean Hotel AC">Budget Clean Hotel AC</option>
                    </select>
                  )}
                  {tripCategory === 'Packages' && (
                    <select
                      value={tripTheme}
                      onChange={e => setTripTheme(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-hidden"
                    >
                      <option value="Family Leisure Tour">Family Leisure Tour</option>
                      <option value="Romantic Couple Getaway">Romantic Couple Getaway</option>
                      <option value="Adventure & Trekking">Adventure & Trekking</option>
                      <option value="Temple & Heritage Pilgrimage">Temple & Heritage Pilgrimage</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Inclusions Matrix Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isMr ? "अपेक्षित समाविष्ट बाबी (Inclusions):" : "Requested Inclusions Checklist:"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Toll & State Taxes Included',
                    'Driver Allowance Included',
                    '24x7 AC Running',
                    'Sightseeing Points Included',
                    'Breakfast Included',
                    'Free WiFi & Parking',
                    'Zero Surcharge Guarantee'
                  ].map(inc => {
                    const selected = requestedInclusions.includes(inc);
                    return (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => toggleInclusion(inc)}
                        className={`px-3 py-1.5 rounded-[16px] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selected 
                            ? 'bg-[#1A365D] text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {selected ? <Check className="w-3 h-3 text-premium-sky-deep" /> : <Plus className="w-3 h-3" />}
                        <span>{inc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Budget Input & Validation Alert */}
              <div className="bg-transparent p-4 rounded-[20px] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900">
                    {isMr ? "तुमचे एकूण अपेक्षित बजेट (₹):" : "Your Proposed Budget (₹):"}
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">All-Inclusive</span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customBudget}
                    onChange={e => setCustomBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-[16px] text-base font-black text-slate-900 focus:outline-hidden focus:border-[#1A365D]"
                  />
                </div>

                {budgetValidation && budgetValidation.status === 'REJECTED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-[16px] flex items-start gap-2 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{budgetValidation.message}</span>
                  </div>
                )}
              </div>

              {/* Special Instructions Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isMr ? "विशेष सूचना / टीप (पर्यायी):" : "Special Instructions / Notes (Optional):"}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isMr ? "उदा. पहाटे ५ वाजता पिकअप, लहान बाळ सोबत आहे, इत्यादी." : "e.g. Need baby seat, morning 6 AM departure, carrier on top."}
                  className="w-full px-3.5 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-medium text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Anti-Spam protection note */}
              <div className="p-3 bg-rose-50 rounded-[20px] border border-rose-200 flex items-center justify-between text-xs text-rose-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">
                    {isMr ? "₹४९ स्पॅम प्रतिबंधक टोकन (१००% रिफंडेबल)" : "₹49 Anti-Spam Token (100% Refundable)"}
                  </span>
                </div>
                <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md">
                  FREE DEPOSIT
                </span>
              </div>

              {/* Modal Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 rounded-[20px] text-xs font-extrabold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {isMr ? "रद्द करा" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateRequest(false)}
                  disabled={loading}
                  className="py-3 px-4 bg-[#FF6B6B] text-white rounded-[20px] text-xs font-extrabold hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? (isMr ? "सादर होत आहे..." : "Submitting...") : (isMr ? "ऑफर सादर करा" : "Submit Your Offer")}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WARNING DIALOG IF BUDGET IS AT LOWER MARGIN */}
      <AnimatePresence>
        {showWarningDialog && budgetValidation && (
          <div className="fixed inset-0 z-[160] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-premium-pink-soft text-premium-pink mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {isMr ? "बजेट सल्ला" : "Budget Advisory"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {budgetValidation.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowWarningDialog(false)}
                  className="py-2.5 px-3 bg-slate-100 text-slate-700 rounded-[16px] text-xs font-bold"
                >
                  {isMr ? "बजेट सुधारा" : "Adjust Budget"}
                </button>
                <button
                  onClick={() => handleCreateRequest(true)}
                  className="py-2.5 px-3 bg-[#1A365D] text-white rounded-[16px] text-xs font-bold"
                >
                  {isMr ? "तरीही पुढे जा" : "Proceed Anyway"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT IN-APP CHAT MODAL */}
      <BiddingChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tripRequestId={selectedRequestId || 'REQ-7821'}
        senderId="usr-101"
        senderRole="user"
        senderMaskedName="Sharad R. (User)"
        recipientMaskedName={chatVendorName}
      />

      {/* CANCELLATION & ESCROW AUTO-REFUND MODAL */}
      <CancellationRefundModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        contract={activeContract}
        lang={lang}
        onCancellationSuccess={(updatedContract, result) => {
          setActiveContract(updatedContract);
          showToast(result.decision === 'AUTO_REFUND_EXECUTED'
            ? (isMr ? "१००% परतावा यशस्वीरीत्या सुरू झाला!" : "100% Escrow Auto-Refund Processed!")
            : (isMr ? "बुकिंग रद्द झाले (शून्य परतावा धोरण)" : "Booking Cancelled (Non-Refundable Policy)"));
        }}
      />

      {/* OFFICIAL LEGAL BOOKING VOUCHER MODAL */}
      <BookingVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        contract={activeContract}
        lang={lang}
      />
    </div>
  );
};
