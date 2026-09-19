import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Download, FileText, Loader2, Check } from 'lucide-react';
import { downloadTicketPDF, downloadInvoicePDF, TravelVertical } from '../../../services/DocumentService';

export function PaymentStatusScreen({ 
  status, 
  origin, 
  destination, 
  travellerCount, 
  tripType, 
  travelClass, 
  bookingRef, 
  onPrimaryAction,
  bookingDetails 
}: any) {
  const isSuccess = status === 'success';
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [ticketDownloaded, setTicketDownloaded] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  // Resolve Travel Vertical
  const verticalMap: Record<string, TravelVertical> = {
    'Stay': 'HOTEL',
    'Hotel': 'HOTEL',
    'Flight': 'FLIGHT',
    'Bus': 'BUS',
    'Cab': 'CAR',
    'Car': 'CAR'
  };
  const vertical: TravelVertical = verticalMap[tripType] || 'HOTEL';

  const handleDownloadTicket = async () => {
    setIsDownloadingTicket(true);
    setTicketDownloaded(false);
    try {
      await downloadTicketPDF({
        bookingId: bookingRef,
        vertical,
        rawBooking: {
          booking_id: bookingRef,
          pnr: bookingRef,
          hotelName: origin,
          originCity: origin,
          destCity: destination,
          roomType: travelClass,
          vehicleModel: travelClass,
          tripType,
          totalAmount: bookingDetails?.total || bookingDetails?.price || 3500,
          customer: {
            name: bookingDetails?.guestName || bookingDetails?.customerName || 'Valued Guest',
            phone: bookingDetails?.phone || '+91-9876543210',
            email: bookingDetails?.email || 'guest@routripo.com',
            address: 'Nashik, Maharashtra - 422003'
          },
          ...(bookingDetails || {})
        }
      });
      setTicketDownloaded(true);
      setTimeout(() => setTicketDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download ticket/voucher PDF:', err);
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    setInvoiceDownloaded(false);
    try {
      await downloadInvoicePDF({
        bookingId: bookingRef,
        vertical,
        rawBooking: {
          booking_id: bookingRef,
          pnr: bookingRef,
          hotelName: origin,
          totalAmount: bookingDetails?.total || bookingDetails?.price || 3500,
          customer: {
            name: bookingDetails?.guestName || bookingDetails?.customerName || 'Valued Customer',
            phone: bookingDetails?.phone || '+91-9876543210',
            email: bookingDetails?.email || 'guest@routripo.com',
            address: 'Nashik, Maharashtra - 422003'
          },
          ...(bookingDetails || {})
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

  const ticketButtonLabel = vertical === 'HOTEL' 
    ? 'Download Booking Voucher (PDF)' 
    : (vertical === 'CAR' ? 'Download Cab Confirmation (PDF)' : 'Download E-Ticket (PDF)');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 pt-16 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center my-auto">
        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mb-6 ${isSuccess ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-red-500 bg-red-50 text-red-500'}`}>
          {isSuccess ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 bg-slate-100 text-slate-700">
          {tripType} · {travelClass}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          {isSuccess ? 'Booking Confirmed!' : 'Payment Failed'}
        </h1>
        
        <div className="flex items-center justify-center gap-3 text-slate-800 mb-2">
          <span className="font-bold text-base sm:text-lg">{origin}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-base sm:text-lg">{destination}</span>
        </div>
        
        <p className="text-slate-500 text-xs sm:text-sm mb-5">
          {travellerCount} Traveller{travellerCount > 1 ? 's' : ''} • Instant Confirmation
        </p>
        
        {bookingRef && (
          <div className="font-mono font-bold text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200/80 px-4 py-2.5 rounded-xl tracking-wider mb-6 w-full">
            Booking Reference: {bookingRef}
          </div>
        )}

        {isSuccess && (
          <div className="w-full space-y-2.5 mb-4">
            <button 
              type="button"
              onClick={handleDownloadTicket} 
              disabled={isDownloadingTicket}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDownloadingTicket ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Document...</span>
                </>
              ) : ticketDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{ticketButtonLabel}</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={handleDownloadInvoice} 
              disabled={isDownloadingInvoice}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDownloadingInvoice ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Invoice...</span>
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
          </div>
        )}

        <button 
          onClick={onPrimaryAction} 
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          {isSuccess ? 'Return to Home' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}