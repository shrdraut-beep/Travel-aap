import React, { useState, useEffect } from 'react';
import { TopBar, Card } from '../components/routripo/SharedUI';
import { ArrowLeft, Plane, Train, Hotel, Car, Bus, Loader2, Search, Filter, Download, ArrowRight, X, ChevronRight, CheckCircle2, Ticket } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { exportElementToPdf } from '../utils/exportUtils';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';


function getSafeDate(d: any) {
  if (!d) return new Date();
  if (d.toDate) return d.toDate();
  if (d.seconds) return new Date(d.seconds * 1000);
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function MyTicketsView({ onBack }: { onBack: () => void }) {
  const currentUser = useAuthStore(state => state.currentUser);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'Upcoming' | 'Past' | 'Cancelled' | 'Failed'>('Upcoming');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'flight' | 'train' | 'hotel' | 'cab' | 'bus'>('All');
  
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const userId = currentUser?.id || (currentUser as any)?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch all user bookings and filter client-side for flexibility
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const data: any[] = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Filter for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recent = data.filter((t: any) => {
        const d = getSafeDate(t.createdAt || t.date);
        return d > sixMonthsAgo;
      });
      
      // Sort by date desc
      recent.sort((a: any, b: any) => {
        const da = getSafeDate(a.createdAt || a.date);
        const db_date = getSafeDate(b.createdAt || b.date);
        return db_date.getTime() - da.getTime();
      });

      // Let's add some mock data if empty for demo purposes of the detailed view
      if (recent.length === 0) {
        setTickets([{
          id: 'mock_1',
          bookingId: 'IXIFT00021087158',
          pnr: 'KEEGKX',
          title: 'NASHIK TO NEW DELHI',
          vertical: 'flight',
          status: 'Upcoming',
          date: new Date(Date.now() + 86400000 * 5).toISOString(),
          travelTime: '21:00 - 22:55',
          duration: '1h 55m',
          provider: 'IndiGo 6E-6636 - Economy',
          departureInfo: 'Nashik Ozar Airport',
          arrivalInfo: 'Indira Gandhi International Airport, Terminal 1',
          baggage: { checkin: '15 kg per piece', cabin: '7 kg per piece' },
          passengers: [
            { name: 'Amol Pramodrao Pawar', seat: '14D', meal: '-' },
            { name: 'Praful Shrawan', seat: '14E', meal: '-' },
            { name: 'Dinesh Kalu Gavali', seat: '14F', meal: '-' }
          ],
          pricing: {
            baseFare: 44652,
            taxes: 102.06,
            ancillary: 3212,
            fees: 566.94,
            total: 48533
          }
        }]);
      } else {
        setTickets(recent);
      }
    } catch (e) {
      console.error('Failed to fetch tickets', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    // Status Logic
    const tDate = getSafeDate(t.date || t.createdAt);
    const isPast = tDate < new Date();
    let computedStatus = t.status || 'Upcoming';
    if (computedStatus === 'Confirmed' || computedStatus === 'Upcoming' || computedStatus === 'Pending') {
      computedStatus = isPast ? 'Past' : 'Upcoming';
    }
    
    if (statusFilter !== computedStatus) return false;
    if (categoryFilter !== 'All' && t.vertical !== categoryFilter) return false;
    return true;
  });

  const getVerticalIcon = (vertical: string) => {
    switch (vertical) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'cab': 
      case 'car': return <Car className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar title="My Tickets & Trips" onBack={onBack} sub="Last 6 Months" scrolled={false} onLogout={() => {}} />
      
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Filters */}
        <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Upcoming', 'Past', 'Cancelled', 'Failed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors ${
                  statusFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto mt-2 pb-1 scrollbar-hide">
            {[
              { id: 'All', label: 'All Bookings' },
              { id: 'flight', label: 'Flights' },
              { id: 'train', label: 'Trains' },
              { id: 'hotel', label: 'Hotels' },
              { id: 'bus', label: 'Bus' },
              { id: 'cab', label: 'Cabs' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                  categoryFilter === cat.id ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
              <p className="font-medium">Loading your bookings...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-600">No {statusFilter.toLowerCase()} bookings found</p>
              <p className="text-xs mt-1">Try changing your filters.</p>
            </div>
          ) : (
            filteredTickets.map((ticket, i) => (
              <motion.div
                key={ticket.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {getVerticalIcon(ticket.vertical)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {getSafeDate(ticket.date || ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{ticket.title || ticket.itemTitle}</h4>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 border-dashed">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Booking ID</p>
                    <p className="text-xs font-black text-slate-700">{ticket.bookingId || ticket.orderId || 'PENDING'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      statusFilter === 'Upcoming' ? 'bg-emerald-100 text-emerald-700' :
                      statusFilter === 'Past' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                    }`}>
                      {statusFilter}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketDetailView ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketDetailView({ ticket, onClose }: { ticket: any, onClose: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundDetails, setRefundDetails] = useState<any>(null);

  const handleCalculateRefund = () => {
    import('../utils/refundCalculator').then(m => {
        const details = m.calculateRefund(ticket.totalAmount, ticket.vertical);
        setRefundDetails(details);
        setShowCancelModal(true);
    });
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
        const response = await fetch('/api/bookings/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: ticket.id })
        });
        const data = await response.json();
        if (data.success) {
            alert('Cancellation successful');
            onClose();
        } else {
            throw new Error(data.error);
        }
    } catch (e: any) {
        alert(e.message || 'Cancellation failed');
    } finally {
        setIsCancelling(false);
        setShowCancelModal(false);
    }
  };
  const handleDownload = async () => {
    const el = document.getElementById('ixigo-pdf-template');
    if (!el) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(el, `${ticket.bookingId || 'Ticket'}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Upcoming' || status === 'Confirmed') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'Cancelled') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const statusInfo = getStatusColor(ticket.status || 'Upcoming');
  
  // Normalizing passengers
  let passengers = ticket.passengers || [];
  if (passengers.length === 0 && ticket.customer) {
    passengers = [{ name: ticket.customer.name, seat: '-', meal: '-' }];
  }

  const getSafeDate = (d: any) => {
    if (!d) return new Date();
    if (d.toDate) return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const travelDate = getSafeDate(ticket.date || ticket.createdAt);

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm flex justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-3xl min-h-screen bg-slate-100 sm:rounded-t-[2.5rem] mt-0 sm:mt-10 shadow-2xl flex flex-col relative"
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200 z-50">
          <div>
            <h3 className="font-black text-lg text-slate-900">E-Ticket</h3>
            <p className="text-xs text-slate-500 font-medium">{ticket.bookingId || ticket.orderId}</p>
          </div>
          <div className="flex items-center gap-3">
            {ticket.status === 'Confirmed' && (
              <button 
                onClick={handleCalculateRefund}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CANCELLATION BREAKDOWN MODAL */}
        {showCancelModal && refundDetails && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="font-black text-lg">Confirm Cancellation</h3>
              <div className="space-y-2 text-sm">
                 <div className="flex justify-between"><span>Paid</span><span>₹{refundDetails.totalPaid.toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>Penalty</span><span>-₹{refundDetails.penalty.toFixed(2)}</span></div>
                 <div className="flex justify-between"><span>App Fee</span><span>-₹{refundDetails.appFee.toFixed(2)}</span></div>
                 <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Refundable</span><span>₹{refundDetails.refundAmount.toFixed(2)}</span>
                 </div>
              </div>
              <div className="flex gap-2 pt-4">
                 <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 bg-slate-100 rounded-xl font-bold">Back</button>
                 <button onClick={handleCancel} disabled={isCancelling} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold">
                    {isCancelling ? 'Processing...' : 'Confirm Cancel'}
                 </button>
              </div>
            </div>
          </div>
        )}


      {/* HIDDEN PRINT TEMPLATE FOR PDF (ixigo style layout) */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div id="ixigo-pdf-template" className="w-[820px] bg-white text-slate-900 font-sans pb-8 p-8">
          
          {/* Top Header: Logo on Left, Generated On & Booking ID on Right */}
          <div className="flex justify-between items-center border-b-2 border-rose-600 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/routripo_brand_logo.svg" 
                alt="RouTripO" 
                className="h-10 w-auto object-contain block" 
              />
              <div className="border-l border-slate-300 pl-3">
                <div className="text-[11px] font-black text-slate-900 tracking-wider uppercase">
                  OFFICIAL ELECTRONIC FLIGHT TICKET
                </div>
                <div className="text-[9.5px] font-bold text-rose-600">
                  Confirmed & Verified E-Reservation Slip
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-semibold">
                Generated on: <strong className="text-slate-800">{new Date().toLocaleString('en-IN')}</strong>
              </div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                Booking ID: <span className="text-rose-600 font-mono">{ticket.bookingId || ticket.orderId || 'IF26041438871696'}</span>
              </div>
            </div>
          </div>

          {/* FLIGHT/ROUTE INFO BLOCK */}
          <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-white shadow-2xs">
             <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
               <div className="flex items-center gap-3">
                 <div className="border border-slate-300 rounded-md text-center w-11 overflow-hidden bg-white">
                   <p className="text-[9px] font-black bg-slate-200 uppercase py-0.5">{travelDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</p>
                   <p className="text-base font-black py-0.5">{travelDate.getDate()}</p>
                   <p className="text-[8px] uppercase pb-0.5 font-bold text-slate-500">{travelDate.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                 </div>
                 <div>
                   <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">{ticket.title || ticket.itemTitle || 'FLIGHT BOOKING'} - {ticket.status || 'CONFIRMED'}</h2>
                   <p className="text-xs text-slate-500 font-semibold">{ticket.stopsText || 'Nonstop'} • {ticket.duration || '1h 55m'} • Class: {ticket.cabinClass || 'Economy'}</p>
                   <p className="text-xs font-bold text-blue-700 mt-0.5">{ticket.provider || 'IndiGo 6E-6636 - Economy'}</p>
                 </div>
               </div>

               <div className="flex items-center gap-3">
                 <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-400 uppercase">AIRLINE PNR</p>
                   <p className="text-base font-black text-rose-600 font-mono">{ticket.pnr || 'KEEGKX'}</p>
                 </div>
                 <div className="p-1 bg-white border border-slate-200 rounded-md">
                   <QRCode value={ticket.pnr || ticket.bookingId || 'KEEGKX'} size={56} />
                 </div>
               </div>
             </div>

             {/* Timings Strip */}
             <div className="flex justify-between items-center py-2">
               <div className="w-[38%]">
                 <h3 className="text-xl font-black text-slate-900">{ticket.departureCode || 'ISK'} {ticket.travelTime ? ticket.travelTime.split('-')[0].trim() : '21:00'}</h3>
                 <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{travelDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                 <p className="text-[10.5px] font-bold text-slate-900">{ticket.departureCity || 'Nashik'}</p>
                 <p className="text-[9.5px] text-slate-500">{ticket.departureInfo || 'Nashik Ozar Airport'}</p>
               </div>
               <div className="w-[24%] flex flex-col items-center">
                 <p className="text-[10px] font-bold text-slate-500">{ticket.duration || '1h 55m'}</p>
                 <div className="w-full h-px bg-slate-300 relative my-1">
                   <span className="absolute right-0 top-[-4px] text-[8px] text-slate-500">➔</span>
                 </div>
                 <p className="text-[9.5px] font-bold text-emerald-600 uppercase">Nonstop</p>
               </div>
               <div className="w-[38%] text-right">
                 <h3 className="text-xl font-black text-slate-900">{ticket.arrivalCode || 'DEL'} {ticket.travelTime ? ticket.travelTime.split('-')[1]?.trim() : '22:55'}</h3>
                 <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{travelDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                 <p className="text-[10.5px] font-bold text-slate-900">{ticket.arrivalCity || 'New Delhi'}</p>
                 <p className="text-[9.5px] text-slate-500">{ticket.arrivalInfo || 'Indira Gandhi International Airport, Terminal 1'}</p>
               </div>
             </div>

             {/* Baggage Allowance Strip */}
             <div className="bg-slate-50 border border-slate-200 rounded-md p-2 mt-2 flex justify-between items-center text-[10px] text-slate-700">
               <div>
                 <strong className="text-slate-900">Baggage Allowance:</strong> Check-in: {ticket.baggage?.checkin || '15 kg per piece, 1 piece per adult'} , Cabin: {ticket.baggage?.cabin || '7 kg per piece, 1 piece per adult'}
               </div>
               <div className="font-black text-rose-600">
                 Paid: ₹{(ticket.pricing?.total || ticket.totalAmount || 0).toLocaleString('en-IN')}
               </div>
             </div>
          </div>

          {/* Task 2: Table 1 (Core Passengers: Barcode | Travellers | PNR | E-Ticket no.) */}
          <div className="mb-4">
            <table className="w-full text-left border border-slate-300 rounded-md overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10.5px] font-black text-slate-700">
                  <th className="py-2 px-3 w-[24%]">Barcode</th>
                  <th className="py-2 px-3 w-[36%]">Travellers</th>
                  <th className="py-2 px-3 w-[18%]">PNR</th>
                  <th className="py-2 px-3 w-[22%]">E-Ticket no.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {passengers.map((p: any, idx: number) => {
                  const pName = p.name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : `Traveller ${idx + 1}`);
                  return (
                    <tr key={idx}>
                      <td className="py-2 px-3">
                        <Barcode value={`${ticket.pnr || 'KEEGKX'}-${idx}`} width={1.1} height={28} displayValue={false} margin={0} />
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{pName}</td>
                      <td className="py-2 px-3 font-black text-slate-900 font-mono">{ticket.pnr || 'KEEGKX'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{p.ticketNumber || `779-${Math.floor(1000000000 + (idx * 3333) + 12345)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Task 2: Table 2 (Other Add-ons: Travellers | Sector | Seat | Cabin Bag | Check-in Bag) */}
          <div className="mb-4">
            <h4 className="text-xs font-black uppercase text-slate-900 mb-1.5 tracking-wider">Other Add-ons</h4>
            <table className="w-full text-left border border-slate-300 rounded-md overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-700">
                  <th className="py-2 px-3 w-[30%]">Travellers</th>
                  <th className="py-2 px-3 w-[16%]">Sector</th>
                  <th className="py-2 px-3 w-[14%]">Seat</th>
                  <th className="py-2 px-3 w-[20%]">Cabin Bag</th>
                  <th className="py-2 px-3 w-[20%]">Check-in Bag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {passengers.map((p: any, idx: number) => {
                  const pName = p.name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : `Traveller ${idx + 1}`);
                  return (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-slate-900">{pName}</td>
                      <td className="py-2 px-3 font-semibold text-slate-600">{ticket.departureCode || 'ISK'}-{ticket.arrivalCode || 'DEL'}</td>
                      <td className="py-2 px-3 font-black text-rose-600">{p.seat || `${14 + idx}${['D','E','F','A','B','C'][idx % 6]}`}</td>
                      <td className="py-2 px-3 text-[10.5px] text-slate-700">{p.cabinBaggage || '7 kg per piece'}</td>
                      <td className="py-2 px-3 text-[10.5px] text-slate-700">{p.checkinBaggage || '15 kg per piece'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Task 4: Important Information & Cancellation Information */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h5 className="text-[11px] font-black uppercase text-slate-900 mb-1">Important Information</h5>
              <ul className="list-disc pl-3 text-[9.5px] text-slate-600 space-y-1">
                <li>You have paid ₹{(ticket.pricing?.total || ticket.totalAmount || 0).toLocaleString('en-IN')}.</li>
                <li>Check-in counters close strictly 60 minutes prior to flight departure.</li>
                <li>Travellers must present a valid Govt photo ID (Aadhaar, Passport, DL, Voter ID).</li>
                <li>For infant travellers (0-2 yrs), valid birth certificate is mandatory.</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <h5 className="text-[11px] font-black uppercase text-slate-900 mb-1">Cancellation Information</h5>
              <ul className="list-disc pl-3 text-[9.5px] text-slate-600 space-y-1">
                <li>To initiate booking cancellation, please visit the 'My Trips' section.</li>
                <li>Airline and RouTripO cancellation charges apply per traveller, per sector.</li>
                <li>In case of a no-show, submit refund request within 90 days from travel date.</li>
                <li>If the flight is cancelled by airline, refund is processed directly via RouTripO.</li>
              </ul>
            </div>
          </div>

          {/* Support Strip */}
          <div className="bg-slate-100 rounded-md p-2 flex justify-between text-[9.5px] text-slate-600 mb-3">
             <div><strong className="text-slate-900">RouTripO Support:</strong> Chat: www.routripo.com/help | Helpline: 011-61224444</div>
             <div><strong className="text-slate-900">Airline Support:</strong> 0124-6173838</div>
          </div>

          {/* Task 4: Corporate Footer & Legal Disclaimer */}
          <div className="border-t border-slate-200 pt-2 text-center">
            <p className="text-[8.5px] font-bold text-slate-500">
              RouTripO Travel Solutions Pvt. Ltd. | Reg. Office: Nashik, Maharashtra, India 422009 | GSTIN: 27AAAAA0000A1Z5
            </p>
            <p className="text-[8px] italic text-slate-400 mt-0.5">
              This is an electronically generated e-Ticket and does not require a physical signature.
            </p>
          </div>

        </div>
      </div>

        {/* PRINTABLE AREA */}
        <div className="p-4 sm:p-8 flex-1">
          <div id="printable-ticket" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
            {/* Ticket Header */}
            <div className="p-6 border-b border-slate-200 flex flex-wrap justify-between gap-6 items-center">
              <div className="flex items-center gap-3">
                <img src="/routripo_brand_logo.svg" alt="RouTripO" className="h-10 w-auto object-contain" />
                <div className="border-l border-slate-200 pl-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</p>
                  <p className="text-base font-black text-slate-900">{ticket.bookingId || ticket.orderId}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest border ${statusInfo}`}>
                  {ticket.status || 'CONFIRMED'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Travel Route Info */}
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-2xs">
                    <p className="text-xs font-black text-slate-800 text-center">
                      {travelDate.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }).toUpperCase()}<br/>
                      <span className="text-[10px] text-slate-500 font-medium">{travelDate.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    </p>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{ticket.title || ticket.itemTitle}</h2>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">{ticket.provider || 'RouTripO standard booking'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">AIRLINE PNR</p>
                    <p className="text-base font-black text-rose-600 font-mono">{ticket.pnr || 'KEEGKX'}</p>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                    <QRCode value={ticket.pnr || ticket.bookingId || 'KEEGKX'} size={50} />
                  </div>
                </div>
              </div>

              {ticket.vertical === 'flight' || ticket.vertical === 'train' || ticket.vertical === 'bus' ? (
                <div className="flex items-center justify-between max-w-md mt-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{ticket.departureCode || 'ISK'} {ticket.travelTime ? ticket.travelTime.split('-')[0].trim() : '21:00'}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">{travelDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">{ticket.departureCity || 'Nashik'}</p>
                    <p className="text-[10px] text-slate-400">{ticket.departureInfo || 'Source'}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">{ticket.duration || '1h 55m'}</p>
                    <div className="w-full flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <div className="flex-1 border-t-2 border-slate-200 border-dashed"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                    <p className="text-[9.5px] font-bold text-emerald-600 uppercase mt-1">Nonstop</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-slate-900">{ticket.arrivalCode || 'DEL'} {ticket.travelTime ? ticket.travelTime.split('-')[1]?.trim() : '22:55'}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">{travelDate.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">{ticket.arrivalCity || 'New Delhi'}</p>
                    <p className="text-[10px] text-slate-400">{ticket.arrivalInfo || 'Destination'}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                   <p className="text-sm font-medium text-slate-600">Travel Date: {travelDate.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
            </div>

            {/* Baggage Allowance */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <p className="text-slate-600">
                <strong className="text-slate-900">Baggage Allowance:</strong> Check-in: {ticket.baggage?.checkin || '15 kg per piece'} • Cabin: {ticket.baggage?.cabin || '7 kg per piece'}
              </p>
              <p className="font-bold text-rose-600">
                Total Paid: ₹{(ticket.pricing?.total || ticket.totalAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Task 2: Two Clean Tables */}
            <div className="p-6 space-y-6">
              
              {/* Table 1: Core Passengers */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Travellers & E-Ticket Details</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase">
                        <th className="py-2.5 px-4">Barcode</th>
                        <th className="py-2.5 px-4">Travellers</th>
                        <th className="py-2.5 px-4">PNR</th>
                        <th className="py-2.5 px-4">E-Ticket no.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {passengers.map((p: any, idx: number) => {
                        const pName = p.name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : `Traveller ${idx + 1}`);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4">
                              <Barcode value={`${ticket.pnr || 'KEEGKX'}-${idx}`} width={1.1} height={24} displayValue={false} margin={0} />
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{pName}</td>
                            <td className="py-2.5 px-4 font-black text-slate-900 font-mono">{ticket.pnr || 'KEEGKX'}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-500">{p.ticketNumber || `779-${Math.floor(1000000000 + (idx * 3333) + 12345)}`}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Other Add-ons */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Other Add-ons</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase">
                        <th className="py-2.5 px-4">Travellers</th>
                        <th className="py-2.5 px-4">Sector</th>
                        <th className="py-2.5 px-4">Seat</th>
                        <th className="py-2.5 px-4">Cabin Bag</th>
                        <th className="py-2.5 px-4">Check-in Bag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {passengers.map((p: any, idx: number) => {
                        const pName = p.name || (p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : `Traveller ${idx + 1}`);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-bold text-slate-900">{pName}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-600">{ticket.departureCode || 'ISK'}-{ticket.arrivalCode || 'DEL'}</td>
                            <td className="py-2.5 px-4 font-black text-rose-600">{p.seat || `${14 + idx}${['D','E','F','A','B','C'][idx % 6]}`}</td>
                            <td className="py-2.5 px-4 text-slate-600">{p.cabinBaggage || '7 kg per piece'}</td>
                            <td className="py-2.5 px-4 text-slate-600">{p.checkinBaggage || '15 kg per piece'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Fare Breakdown */}
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-sm font-black text-slate-900 mb-4">Payment Details</h4>
              <div className="max-w-sm space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare</span>
                  <span className="font-medium">₹{(ticket.pricing?.baseFare || ticket.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                {ticket.pricing?.taxes > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & GST</span>
                    <span className="font-medium">₹{ticket.pricing.taxes.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {ticket.pricing?.ancillary > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Ancillary Charges</span>
                    <span className="font-medium">₹{ticket.pricing.ancillary.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {ticket.pricing?.fees > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Convenience Fee</span>
                    <span className="font-medium">₹{ticket.pricing.fees.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 mt-2 border-t border-slate-200">
                  <span className="font-black text-slate-900">Total Paid</span>
                  <span className="font-black text-slate-900">₹{(ticket.pricing?.total || ticket.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer / Rules */}
            <div className="p-6 bg-slate-50 text-xs text-slate-500 space-y-4">
              <div>
                <h5 className="font-bold text-slate-700 mb-1">Important Information</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li>For any queries regarding this booking, please use your Booking ID as a reference.</li>
                  <li>Travellers must present a valid photo ID proof to enter the airport/station and at the time of check-in.</li>
                  <li>Kindly carry a digital or printed copy of this ticket.</li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-slate-700 mb-1">Cancellation Information</h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li>To initiate cancellation, please visit the 'My Tickets' section.</li>
                  <li>Cancellation fees apply as per provider policies plus standard platform convenience fees.</li>
                </ul>
              </div>
              <div className="border-t border-slate-200 pt-3 text-center text-slate-400 text-[10px]">
                <p className="font-semibold text-slate-600">RouTripO Travel Solutions Pvt. Ltd. | Reg. Office: Nashik, Maharashtra, India 422009 | GSTIN: 27AAAAA0000A1Z5</p>
                <p className="italic mt-0.5">This is an electronically generated e-Ticket and does not require a physical signature.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
