import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Download, 
  Plane, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Luggage, 
  MapPin, 
  Loader2, 
  ArrowRight,
  Share2,
  AlertCircle,
  FileText,
  Printer
} from 'lucide-react';
import { 
  downloadFlightTicketPDF, 
  TicketDetailsData 
} from '../../utils/TicketPDFGenerator';

export interface TicketSuccessProps {
  ticketData: TicketDetailsData;
  onDone?: () => void;
}

export const TicketSuccess: React.FC<TicketSuccessProps> = ({ ticketData, onDone }) => {
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [ticketDownloaded, setTicketDownloaded] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(ticketData.pnrNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTicket = async () => {
    setIsDownloadingTicket(true);
    setTicketDownloaded(false);
    try {
      // Dynamic API document download
      const { downloadTicketPDF } = await import('../../services/DocumentService');
      await downloadTicketPDF({
        bookingId: ticketData.bookingId || ticketData.pnrNumber,
        vertical: 'FLIGHT',
        rawBooking: {
          pnr: ticketData.pnrNumber,
          airline: ticketData.airlineName,
          flight_no: ticketData.flightNumber,
          class: ticketData.cabinClass,
          duration: ticketData.duration,
          fare: ticketData.baseFare,
          ancillary: (ticketData.seatFee || 0),
          net_service: ticketData.convenienceFee || 250,
          total: ticketData.totalPaid,
          customer: {
            name: ticketData.passengers[0]?.name || `${ticketData.passengers[0]?.firstName || ''} ${ticketData.passengers[0]?.lastName || ''}`.trim() || 'Passenger',
            phone: ticketData.contactPhone,
            email: ticketData.contactEmail,
            address: 'Nashik, Maharashtra - 422003'
          },
          departure: {
            code: ticketData.originCode,
            time: ticketData.departTime,
            date: ticketData.departDate,
            city: ticketData.originCity,
            airport: ticketData.originAirport,
            terminal: ticketData.originTerminal
          },
          arrival: {
            code: ticketData.destCode,
            time: ticketData.arriveTime,
            date: ticketData.arriveDate,
            city: ticketData.destCity,
            airport: ticketData.destAirport,
            terminal: ticketData.destTerminal
          },
          passengers: ticketData.passengers
        }
      });
      setTicketDownloaded(true);
      setTimeout(() => setTicketDownloaded(false), 3000);
    } catch (err) {
      console.warn('API ticket download failed, using local PDF generator fallback:', err);
      try {
        await downloadFlightTicketPDF(ticketData);
        setTicketDownloaded(true);
        setTimeout(() => setTicketDownloaded(false), 3000);
      } catch (localErr) {
        console.error('All ticket download attempts failed:', localErr);
      }
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    setInvoiceDownloaded(false);
    try {
      const { downloadInvoicePDF } = await import('../../services/DocumentService');
      await downloadInvoicePDF({
        bookingId: ticketData.bookingId || ticketData.pnrNumber,
        vertical: 'FLIGHT',
        rawBooking: {
          pnr: ticketData.pnrNumber,
          airline: ticketData.airlineName,
          flight_no: ticketData.flightNumber,
          fare: ticketData.baseFare,
          ancillary: (ticketData.seatFee || 0),
          net_service: ticketData.convenienceFee || 250,
          total: ticketData.totalPaid,
          customer: {
            name: ticketData.passengers[0]?.name || `${ticketData.passengers[0]?.firstName || ''} ${ticketData.passengers[0]?.lastName || ''}`.trim() || 'Customer',
            phone: ticketData.contactPhone,
            email: ticketData.contactEmail,
            address: 'Nashik, Maharashtra - 422003'
          }
        }
      });
      setInvoiceDownloaded(true);
      setTimeout(() => setInvoiceDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 ">
      {/* Success Badge & Headline */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-premium-sky-soft text-premium-sky-deep flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft px-3 py-1 rounded-full uppercase tracking-wider">
            Booking Confirmed & Ticket Issued
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            You're Ready for Takeoff!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mt-1">
            An official copy of your e-ticket and invoice has been sent to{' '}
            <span className="font-bold text-slate-800">{ticketData.contactEmail}</span>
          </p>
        </div>

        {/* PNR & Action Banner */}
        <div className="bg-slate-900 text-white rounded-[20px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm text-left">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              RoutTripo Booking ID / PNR
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black tracking-wider text-premium-pink font-mono">
                {ticketData.pnrNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyPNR}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy PNR"
              >
                {isCopied ? <Check className="w-4 h-4 text-premium-sky-deep" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">
              ₹{ticketData.totalPaid.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-premium-sky-deep font-bold mt-0.5">
              Instant Confirmed
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* E-Ticket PDF Button */}
          <button
            type="button"
            onClick={handleDownloadTicket}
            disabled={isDownloadingTicket}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 px-5 rounded-[16px] transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-98"
          >
            {isDownloadingTicket ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Ticket...</span>
              </>
            ) : ticketDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Ticket Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download E-Ticket (PDF)</span>
              </>
            )}
          </button>

          {/* Tax Invoice PDF Button */}
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-5 rounded-[16px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm active:scale-98"
          >
            {isDownloadingInvoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Invoice...</span>
              </>
            ) : invoiceDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Invoice Downloaded!</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Download Tax Invoice (PDF)</span>
              </>
            )}
          </button>

          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-[16px] transition-all text-xs sm:text-sm cursor-pointer"
            >
              Done / Return Home
            </button>
          )}
        </div>
      </motion.div>

      {/* Live e-Ticket Preview Card (A4 Structured Representation) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[16px] bg-rose-600/10 text-rose-600 flex items-center justify-center font-black">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                Electronic Flight Itinerary
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {ticketData.airlineName} • {ticketData.flightNumber}
              </h2>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {ticketData.fareName || 'Standard Saver'}
          </span>
        </div>

        {/* Origin / Dest Routing Details */}
        <div className="bg-[#f8fafc] rounded-[20px] p-5 border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Origin */}
            <div>
              <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">
                {ticketData.originTerminal || 'Terminal 3 (T3)'}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {ticketData.departTime}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {ticketData.originCity} ({ticketData.originCode})
              </div>
              <div className="text-xs text-slate-500">{ticketData.originAirport}</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {ticketData.departDate}
              </div>
            </div>

            {/* Flight Path Graphic */}
            <div className="text-center flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {ticketData.duration || '2h 15m'}
              </span>
              <div className="w-full relative flex items-center justify-center my-3">
                <div className="h-0.5 bg-slate-300 w-full" />
                <div className="absolute bg-rose-600 text-white p-1 rounded-full shadow-sm">
                  <Plane className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[11px] font-black text-premium-sky-deep uppercase">
                {ticketData.stopsText || 'Non-Stop'}
              </span>
            </div>

            {/* Destination */}
            <div className="text-left md:text-right">
              <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">
                {ticketData.destTerminal || 'Terminal 2 (T2)'}
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {ticketData.arriveTime}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {ticketData.destCity} ({ticketData.destCode})
              </div>
              <div className="text-xs text-slate-500">{ticketData.destAirport}</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {ticketData.arriveDate}
              </div>
            </div>
          </div>
        </div>

        {/* Passenger & Baggage Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Passengers & Seat Allocation
          </h3>
          <div className="border border-slate-200 rounded-[16px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 font-extrabold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Seat</th>
                  <th className="p-3">Cabin Bag</th>
                  <th className="p-3">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {ticketData.passengers.map((pax, i) => (
                  <tr key={i} className="hover:bg-transparent">
                    <td className="p-3 font-bold text-slate-900">{pax.name}</td>
                    <td className="p-3 text-slate-500">{pax.type}</td>
                    <td className="p-3 font-black text-rose-600">{pax.seat}</td>
                    <td className="p-3 text-slate-700">{pax.cabinBaggage || ticketData.cabinBaggage}</td>
                    <td className="p-3 text-slate-700">{pax.checkinBaggage || ticketData.checkinBaggage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Airport Kiosk Barcode & Advisory */}
        <div className="p-4 rounded-[16px] bg-transparent border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Airport Self-Check-in Barcode
            </span>
            <span className="text-[11px] text-slate-500">
              Scan barcode at airline airport kiosks for instant boarding pass print
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-mono text-base font-black tracking-widest text-slate-800 shadow-2xs">
            ||||| | |||| ||| ||||| || |||
          </div>
        </div>
      </div>
    </div>
  );
};
