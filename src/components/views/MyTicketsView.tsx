import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Train, 
  Hotel, 
  Car, 
  Bus, 
  Ticket, 
  Download, 
  ChevronRight, 
  Calendar, 
  X, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  FileText, 
  CreditCard, 
  Wallet,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { 
  TicketService, 
  type BookingTicket, 
  type CancellationDetails 
} from '../../services/TicketService';
import QRCode from 'react-qr-code';
import { GlobalBrandHeader, DEFAULT_USER_AVATAR } from '../common/GlobalBrandHeader';

interface MyTicketsViewProps {
  onBack?: () => void;
  hideHeader?: boolean;
  isMr?: boolean;
  onOpenProfile?: () => void;
  onNotifications?: () => void;
  avatarSrc?: string;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  onBack,
  hideHeader = false,
  isMr = false,
  onOpenProfile,
  onNotifications,
  avatarSrc
}) => {
  const [tickets, setTickets] = useState<BookingTicket[]>(TicketService.getTickets());
  const [statusFilter, setStatusFilter] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  
  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<BookingTicket | null>(null);
  const [ticketToCancel, setTicketToCancel] = useState<BookingTicket | null>(null);
  const [ticketToReschedule, setTicketToReschedule] = useState<BookingTicket | null>(null);
  const [receiptTicket, setReceiptTicket] = useState<BookingTicket | null>(null);

  // Cancellation form state
  const [cancelReason, setCancelReason] = useState('Change in personal schedule');
  const [refundDestination, setRefundDestination] = useState<'gateway' | 'wallet'>('gateway');
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  // Reschedule form state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = TicketService.subscribe((updated) => {
      setTickets(updated);
      if (selectedTicket) {
        const found = updated.find(t => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    });
    return () => unsub();
  }, [selectedTicket]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getVerticalIcon = (vertical: string) => {
    switch (vertical) {
      case 'flight': return <Plane className="w-4 h-4 text-sky-600" />;
      case 'train': return <Train className="w-4 h-4 text-emerald-600" />;
      case 'hotel': return <Hotel className="w-4 h-4 text-indigo-600" />;
      case 'bus': return <Bus className="w-4 h-4 text-amber-600" />;
      case 'cab': return <Car className="w-4 h-4 text-teal-600" />;
      default: return <Ticket className="w-4 h-4 text-purple-600" />;
    }
  };

  const filteredTickets = tickets.filter((t) => {
    return t.status === statusFilter;
  });

  const handleConfirmCancel = () => {
    if (!ticketToCancel) return;
    setIsProcessingCancel(true);
    setTimeout(() => {
      try {
        const res = TicketService.cancelTicket(ticketToCancel.id, cancelReason, refundDestination);
        setIsProcessingCancel(false);
        setTicketToCancel(null);
        showToast(
          isMr 
            ? `तिकीट रद्द झाले! ₹${res.refundAmount.toLocaleString('en-IN')} चा परतावा खात्यामध्ये पाठवला आहे.`
            : `Ticket cancelled! Refund of ₹${res.refundAmount.toLocaleString('en-IN')} initiated.`
        );
        // Automatically open the cancellation receipt
        setReceiptTicket(res.ticket);
      } catch (e: any) {
        setIsProcessingCancel(false);
        alert(e.message || 'Cancellation failed');
      }
    }, 600);
  };

  const handleConfirmReschedule = () => {
    if (!ticketToReschedule || !rescheduleDate) return;
    setIsProcessingReschedule(true);
    setTimeout(() => {
      try {
        const dateIso = new Date(rescheduleDate).toISOString();
        TicketService.rescheduleTicket(ticketToReschedule.id, dateIso);
        setIsProcessingReschedule(false);
        setTicketToReschedule(null);
        showToast(isMr ? 'प्रवासाची तारीख यशस्वीरित्या बदलली आहे!' : 'Travel date rescheduled successfully!');
      } catch (e: any) {
        setIsProcessingReschedule(false);
        alert(e.message || 'Rescheduling failed');
      }
    }, 500);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--premium-page)] pb-24 font-['Outfit',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[200] max-w-sm px-4 pointer-events-none">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span>{toastMessage}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </div>
        </div>
      )}

      {/* 1. Signature RouTripo Curved Brand Header (Same as all other tabs) */}
      {!hideHeader && (
        <GlobalBrandHeader
          subtitle={isMr ? "तिकीट व बुकिंग व्यवस्थापन हब" : "Tickets & Bookings Hub"}
          theme="ocean"
          badge={isMr ? `${tickets.length} बुकिंग्ज` : `${tickets.length} BOOKINGS`}
          avatarSrc={avatarSrc || DEFAULT_USER_AVATAR}
          onNotifications={onNotifications}
          onOpenProfile={onOpenProfile}
        />
      )}

      {/* 2. Status Sorting Tabs: ONLY Upcoming, Completed, Cancelled */}
      <div className="px-4 pt-3 pb-1 sticky top-[60px] z-20 bg-[var(--premium-page)]/90 backdrop-blur-md">
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/70 gap-1.5 shadow-2xs">
          {[
            { 
              id: 'Upcoming', 
              label: isMr ? 'आगामी' : 'Upcoming', 
              count: tickets.filter(t => t.status === 'Upcoming').length,
              badgeActive: 'bg-sky-100 text-sky-800 border-sky-300' 
            },
            { 
              id: 'Completed', 
              label: isMr ? 'पूर्ण' : 'Completed', 
              count: tickets.filter(t => t.status === 'Completed').length,
              badgeActive: 'bg-emerald-100 text-emerald-800 border-emerald-300' 
            },
            { 
              id: 'Cancelled', 
              label: isMr ? 'रद्द' : 'Cancelled', 
              count: tickets.filter(t => t.status === 'Cancelled').length,
              badgeActive: 'bg-rose-100 text-rose-800 border-rose-300' 
            }
          ].map((s) => {
            const isActive = statusFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id as any)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <span>{s.label}</span>
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full border ${
                  isActive ? s.badgeActive : 'bg-slate-300/70 text-slate-700 border-transparent'
                }`}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket List View */}
      <div className="p-4 space-y-3.5 max-w-lg mx-auto w-full">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t) => {
            const isCancelled = t.status === 'Cancelled';
            const travelDateObj = new Date(t.date);

            return (
              <div
                key={t.id}
                className="relative bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* DIAGONAL CANCELLED STAMP (adwa cancelled cha shukla) */}
                {isCancelled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden select-none">
                    <div className="transform -rotate-12 border-4 border-dashed border-red-600/85 px-6 py-2 rounded-2xl bg-red-50/85 shadow-lg backdrop-blur-2xs">
                      <span className="text-xl sm:text-2xl font-black text-red-600 tracking-widest uppercase font-mono">
                        CANCELLED
                      </span>
                      <p className="text-[10px] font-bold text-red-700 tracking-wider text-center">
                        {isMr ? 'परतावा पूर्ण झाला' : 'REFUND SETTLED'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Top: Provider & PNR Badge */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      {getVerticalIcon(t.vertical)}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                      {t.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    <span>PNR:</span>
                    <span className="text-purple-700 font-black">{t.pnr}</span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-4 space-y-3" onClick={() => setSelectedTicket(t)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {isMr && t.titleMr ? t.titleMr : t.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {travelDateObj.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.travelTime}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-slate-900 block leading-tight">
                        ₹{t.pricing.total.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                        t.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        t.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Passengers & Stations */}
                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                    <div className="truncate">
                      <span className="font-semibold text-slate-900">
                        {t.passengers.map(p => p.name).join(', ')}
                      </span>
                      <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                        ({t.passengers.map(p => p.seat).join(', ')})
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  {/* Cancelled Details Preview if cancelled */}
                  {isCancelled && t.cancellationDetails && (
                    <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{isMr ? 'परतावा रक्कम (Refund Amount):' : 'Refund Credited:'}</span>
                        <span className="font-mono font-black text-emerald-700">
                          ₹{t.cancellationDetails.netRefundAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 truncate font-mono">
                        ARN: {t.cancellationDetails.refundArn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* View / Download E-Ticket */}
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(t)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isMr ? 'तिकीट पाहा' : 'View E-Ticket'}</span>
                  </button>

                  {/* If Cancelled: Show Cancellation Receipt Button */}
                  {isCancelled && (
                    <button
                      type="button"
                      onClick={() => setReceiptTicket(t)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{isMr ? 'रद्दीकरण पावती' : 'Refund Receipt'}</span>
                    </button>
                  )}

                  {/* If Upcoming: Show Reschedule & Cancel buttons */}
                  {t.status === 'Upcoming' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketToReschedule(t);
                          setRescheduleDate(new Date(t.date).toISOString().split('T')[0]);
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isMr ? 'तारीख बदला' : 'Date Change'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTicketToCancel(t)}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isMr ? 'रद्द करा' : 'Cancel'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {isMr ? `कोणतेही ${statusFilter} तिकीट आढळले नाही` : `No ${statusFilter} bookings found`}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {isMr ? 'नवीन बुकिंग करण्यासाठी Booking टॅबवर जा.' : 'Explore flights, trains and hotels under Booking tab.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 1. FULL E-TICKET MODAL WITH DIAGONAL CANCELLED STAMP */}
      {/* ================================================================= */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 relative"
          >
            {/* DIAGONAL CANCELLED STAMP ACROSS THE WHOLE TICKET */}
            {selectedTicket.status === 'Cancelled' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-hidden select-none">
                <div className="transform -rotate-15 border-4 border-dashed border-red-600 px-8 py-3 rounded-3xl bg-red-50/90 shadow-2xl backdrop-blur-xs">
                  <span className="text-3xl sm:text-4xl font-black text-red-600 tracking-widest uppercase font-mono">
                    CANCELLED
                  </span>
                  <p className="text-xs font-bold text-red-700 tracking-wider text-center mt-1">
                    {isMr ? 'परतावा पूर्ण झाला • REFUND SETTLED' : 'REFUND SETTLED TO PAYMENT GATEWAY'}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Top Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 via-white to-sky-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {isMr ? 'ई-तिकीट व बोर्डिंग पास' : 'Digital E-Ticket'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {selectedTicket.bookingId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* E-Ticket Scrollable Body */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Route & Schedule Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold uppercase tracking-wider">{selectedTicket.provider}</span>
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                    PNR: {selectedTicket.pnr}
                  </span>
                </div>

                <div className="py-2">
                  <h2 className="text-lg font-black text-white leading-tight">
                    {selectedTicket.title}
                  </h2>
                  <p className="text-xs text-sky-300 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedTicket.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px]">TIME</p>
                    <p className="font-mono font-bold text-white text-sm">{selectedTicket.travelTime}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] text-right">DURATION</p>
                    <p className="font-mono font-bold text-white text-sm">{selectedTicket.duration}</p>
                  </div>
                </div>
              </div>

              {/* Station / Airport Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Departure / Boarding</span>
                    <p className="font-semibold text-slate-800">{selectedTicket.departureInfo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Arrival / Destination</span>
                    <p className="font-semibold text-slate-800">{selectedTicket.arrivalInfo}</p>
                  </div>
                </div>
              </div>

              {/* Passengers List */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {isMr ? 'प्रवासी तपशील' : 'Passenger Details'}
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {selectedTicket.passengers.map((p, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.gender ? `${p.gender}, ` : ''}{p.age ? `Age ${p.age}` : ''} {p.meal ? `• Meal: ${p.meal}` : ''}
                        </p>
                      </div>
                      <span className="font-mono font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        {p.seat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Boarding Barcode */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-2">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <QRCode value={`ROUTRIPO-${selectedTicket.bookingId}-${selectedTicket.pnr}`} size={110} />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Scan for fast security checkpoint / e-gate entry</p>
              </div>

              {/* Payment & Gateway Verification */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-semibold text-slate-900">{selectedTicket.paymentDetails.method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-mono text-slate-700">{selectedTicket.paymentDetails.accountMasked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Txn ID:</span>
                  <span className="font-mono text-slate-700">{selectedTicket.paymentDetails.transactionId}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 font-bold">
                  <span>Total Amount Paid:</span>
                  <span className="text-sm font-black text-slate-900">₹{selectedTicket.pricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* If Cancelled: Show Full Cancellation Breakdown */}
              {selectedTicket.status === 'Cancelled' && selectedTicket.cancellationDetails && (
                <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-red-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Cancellation &amp; Refund Audit</span>
                  </div>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Original Paid:</span>
                      <span className="font-mono">₹{selectedTicket.cancellationDetails.originalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Cancellation Fee:</span>
                      <span className="font-mono">-₹{selectedTicket.cancellationDetails.cancellationFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>GST on Cancellation:</span>
                      <span className="font-mono">-₹{selectedTicket.cancellationDetails.gstOnFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-red-200 font-black text-emerald-800 text-sm">
                      <span>Net Refund Credited:</span>
                      <span className="font-mono">₹{selectedTicket.cancellationDetails.netRefundAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                    <p><strong>Destination:</strong> {selectedTicket.cancellationDetails.refundDestinationName}</p>
                    <p className="font-mono"><strong>Refund ARN:</strong> {selectedTicket.cancellationDetails.refundArn}</p>
                    <p><strong>Timeline:</strong> {selectedTicket.cancellationDetails.settlementTimeline}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{isMr ? 'प्रिंट / डाऊनलोड' : 'Print / Download PDF'}</span>
              </button>

              {selectedTicket.status === 'Cancelled' ? (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptTicket(selectedTicket);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isMr ? 'पावती' : 'Receipt'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTicketToCancel(selectedTicket);
                    setSelectedTicket(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isMr ? 'रद्द करा' : 'Cancel'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. CANCELLATION MODAL (WITH REFUND GATEWAY ROUTING) */}
      {/* ================================================================= */}
      {ticketToCancel && (
        <div 
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-950 leading-tight">
                    {isMr ? 'तिकीट रद्द करा' : 'Cancel Booking'}
                  </h3>
                  <p className="text-[11px] text-rose-700 font-medium">
                    PNR: {ticketToCancel.pnr} • {ticketToCancel.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTicketToCancel(null)}
                className="w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cancellation Body */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Refund Calculations Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  {isMr ? 'परतावा हिशोब (Refund Breakdown)' : 'Refund Calculation Breakdown'}
                </h4>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Original Booking Total:</span>
                    <span className="font-mono font-bold text-slate-900">₹{ticketToCancel.pricing.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Cancellation Fee:</span>
                    <span className="font-mono font-bold">-₹{(Math.round(ticketToCancel.pricing.total * (ticketToCancel.vertical === 'flight' ? 0.20 : 0.15))).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>GST (18% on Fee):</span>
                    <span className="font-mono font-bold">-₹{(Math.round(ticketToCancel.pricing.total * 0.15 * 0.18)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-emerald-700">
                    <span>{isMr ? 'अपेक्षित परतावा (Net Refund):' : 'Estimated Net Refund:'}</span>
                    <span className="font-mono">
                      ₹{(ticketToCancel.pricing.total - Math.round(ticketToCancel.pricing.total * 0.15) - Math.round(ticketToCancel.pricing.total * 0.15 * 0.18)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Choose Refund Destination */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  {isMr ? 'परतावा कुठे जमा करायचा?' : 'Where should we route your refund?'}
                </label>

                {/* Option 1: Original Payment Gateway */}
                <label 
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    refundDestination === 'gateway'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setRefundDestination('gateway')}
                >
                  <input
                    type="radio"
                    name="refundDest"
                    checked={refundDestination === 'gateway'}
                    onChange={() => setRefundDestination('gateway')}
                    className="mt-1 w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isMr ? 'मूळ पेमेंट गेटवे / बँक खाते' : 'Original Payment Gateway / Bank'}</span>
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {ticketToCancel.paymentDetails.method} ({ticketToCancel.paymentDetails.accountMasked})
                    </p>
                    <span className="text-[10px] text-blue-700 font-medium">
                      Credited directly back via Razorpay UPI / Bank IMPS in 15-30 mins
                    </span>
                  </div>
                </label>

                {/* Option 2: RouTripo Closed Travel Wallet */}
                <label 
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    refundDestination === 'wallet'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => setRefundDestination('wallet')}
                >
                  <input
                    type="radio"
                    name="refundDest"
                    checked={refundDestination === 'wallet'}
                    onChange={() => setRefundDestination('wallet')}
                    className="mt-1 w-4 h-4 text-emerald-600 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isMr ? 'RouTripo क्लोज्ड ट्रॅव्हल वॉलेट (त्वरित)' : 'RouTripo Closed Travel Wallet'}</span>
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Instant 100% refund credit reflected in your wallet balance immediately for next bookings.
                    </p>
                  </div>
                </label>
              </div>

              {/* Cancellation Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isMr ? 'रद्द करण्याचे कारण' : 'Cancellation Reason'}
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Change in personal schedule">Change in personal travel schedule</option>
                  <option value="Emergency medical reason">Emergency medical reason</option>
                  <option value="Found alternative flight/train">Found alternative travel option</option>
                  <option value="Trip cancelled by group">Trip cancelled by group</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTicketToCancel(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
              >
                {isMr ? 'मागे जा' : 'Keep Booking'}
              </button>
              <button
                type="button"
                disabled={isProcessingCancel}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingCancel ? (isMr ? 'रद्द करत आहे...' : 'Processing...') : (isMr ? 'नक्की रद्द करा' : 'Confirm Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. RESCHEDULE / CHANGE DATE MODAL */}
      {/* ================================================================= */}
      {ticketToReschedule && (
        <div 
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-5 py-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-sky-950 leading-tight">
                    {isMr ? 'प्रवासाची तारीख बदला' : 'Reschedule Journey Date'}
                  </h3>
                  <p className="text-[11px] text-sky-700 font-medium">
                    PNR: {ticketToReschedule.pnr} • {ticketToReschedule.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTicketToReschedule(null)}
                className="w-8 h-8 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Current Travel Date:</p>
                <p className="font-bold text-slate-900 text-sm">
                  {new Date(ticketToReschedule.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  {isMr ? 'नवीन प्रवासाची तारीख निवडा' : 'Select New Journey Date'}
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Date change policy allows 1 free reschedule for VIP Voyagers, with zero cancellation loss.
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTicketToReschedule(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isProcessingReschedule || !rescheduleDate}
                onClick={handleConfirmReschedule}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingReschedule ? (isMr ? 'तारीख बदलत आहे...' : 'Updating...') : (isMr ? 'तारीख निश्चित करा' : 'Confirm New Date')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. OFFICIAL CANCELLATION RECEIPT MODAL (Cancelled chi receipt) */}
      {/* ================================================================= */}
      {receiptTicket && receiptTicket.cancellationDetails && (
        <div 
          className="fixed inset-0 z-[170] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 relative">
            {/* DIAGONAL CANCELLED STAMP ON THE RECEIPT */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-hidden select-none">
              <div className="transform -rotate-12 border-4 border-dashed border-red-600 px-6 py-2 rounded-2xl bg-red-50/80 shadow-md">
                <span className="text-2xl font-black text-red-600 tracking-widest uppercase font-mono">
                  CANCELLED
                </span>
                <p className="text-[10px] font-bold text-red-700 text-center tracking-wider">
                  REFUND PROCESSED
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-red-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {isMr ? 'अधिकृत रद्दीकरण व परतावा पावती' : 'Cancellation & Refund Certificate'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Receipt #{receiptTicket.cancellationDetails.cancellationReceiptId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-1">
                <span className="text-[10px] font-bold uppercase text-red-700 tracking-wider">Status:</span>
                <p className="font-bold text-sm text-red-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cancelled &amp; Refund Settled Successfully</span>
                </p>
              </div>

              {/* Booking Reference */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900">{receiptTicket.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking ID:</span>
                  <span className="font-mono text-slate-900 font-bold">{receiptTicket.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PNR:</span>
                  <span className="font-mono text-purple-700 font-black">{receiptTicket.pnr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cancelled Date:</span>
                  <span className="font-mono text-slate-700">{new Date(receiptTicket.cancellationDetails.cancelledAt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Refund Audit Ledger */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Accounting Credit Note
                </h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Original Fare Paid:</span>
                    <span className="font-mono">₹{receiptTicket.cancellationDetails.originalPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Cancellation Fee Deducted:</span>
                    <span className="font-mono">-₹{receiptTicket.cancellationDetails.cancellationFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>GST (18% on Fee):</span>
                    <span className="font-mono">-₹{receiptTicket.cancellationDetails.gstOnFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black text-sm text-emerald-800">
                    <span>Net Refund Amount Processed:</span>
                    <span className="font-mono">₹{receiptTicket.cancellationDetails.netRefundAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Bank Gateway Settlement Proof */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                <h5 className="font-bold uppercase tracking-wider text-emerald-800 text-[10px]">
                  Payment Gateway Settlement Proof
                </h5>
                <p><strong>Refund Destination:</strong> {receiptTicket.cancellationDetails.refundDestinationName}</p>
                <p className="font-mono text-[11px]"><strong>Bank ARN / UTR:</strong> {receiptTicket.cancellationDetails.refundArn}</p>
                <p className="text-[11px] text-emerald-800"><strong>Settlement Note:</strong> {receiptTicket.cancellationDetails.settlementTimeline}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{isMr ? 'पावती प्रिंट / सेव्ह करा' : 'Print / Save Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsView;
