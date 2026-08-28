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
  AlertCircle
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(ticketData.pnrNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadFlightTicketPDF(ticketData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download ticket PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 font-[Inter]">
      {/* Success Badge & Headline */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
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
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm text-left">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              RouTripO Booking ID / PNR
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black tracking-wider text-amber-400 font-mono">
                {ticketData.pnrNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyPNR}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy PNR"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
            <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
              Instant Confirmed
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 bg-[#e11d48] hover:bg-[#be123c] text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm active:scale-98"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing High-Res PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Ticket Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Official e-Ticket (PDF)</span>
              </>
            )}
          </button>

          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-xl transition-all text-sm cursor-pointer"
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
            <div className="w-9 h-9 rounded-xl bg-[#e11d48]/10 text-[#e11d48] flex items-center justify-center font-black">
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
        <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Origin */}
            <div>
              <span className="text-[11px] font-extrabold text-[#e11d48] bg-rose-50 px-2 py-0.5 rounded uppercase">
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
                <div className="absolute bg-[#e11d48] text-white p-1 rounded-full shadow-sm">
                  <Plane className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[11px] font-black text-emerald-600 uppercase">
                {ticketData.stopsText || 'Non-Stop'}
              </span>
            </div>

            {/* Destination */}
            <div className="text-left md:text-right">
              <span className="text-[11px] font-extrabold text-[#e11d48] bg-rose-50 px-2 py-0.5 rounded uppercase">
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
          <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{pax.name}</td>
                    <td className="p-3 text-slate-500">{pax.type}</td>
                    <td className="p-3 font-black text-[#e11d48]">{pax.seat}</td>
                    <td className="p-3 text-slate-700">{pax.cabinBaggage || ticketData.cabinBaggage}</td>
                    <td className="p-3 text-slate-700">{pax.checkinBaggage || ticketData.checkinBaggage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Airport Kiosk Barcode & Advisory */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
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
