import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../utils/apiClient';
import { useAuthStore } from '../../store/useAuthStore';


import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, onSnapshot, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../../firebase';
import { 
  X, 
  Tag, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Receipt, 
  Sparkles, 
  Clock, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Gift,
  Download,
  Share2
} from 'lucide-react';
import { authedFetch } from '../../utils/apiClient';
import { mockCoupons, validateCouponCode, MockCoupon } from '../../data/mockDataStore';
import { exportElementToPdf } from '../../utils/exportUtils';
import { sanitizeInput } from '../../utils/sanitize';

export interface BookingItemPayload {
  id: string;
  title: string;
  vertical: 'flight' | 'train' | 'hotel' | 'car' | 'cab' | 'bus' | 'package';
  subtitle?: string;
  location?: string;
  date?: string;
  time?: string;
  duration?: string;
  amount: number; // Base amount per unit
  image?: string;
  provider?: string;
  meta?: Record<string, any>;
}

interface UniversalBookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BookingItemPayload | null;
  currencySymbol?: string;
  lang?: string;
  onBookingSuccess?: (bookingReceipt: any) => void;
}

export const UniversalBookingCheckoutModal: React.FC<UniversalBookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  item,
  currencySymbol = '₹',
  lang = 'en',
  onBookingSuccess
}) => {
  const currentUser = useAuthStore(state => state.currentUser);
  if (!isOpen || !item) return null;

  // Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [custName, setCustName] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [travelDate, setTravelDate] = useState<string>(
    item.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'stripe'>('razorpay');
  const [upiVpa, setUpiVpa] = useState<string>('');

  // Promo Code State
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<MockCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingTicket, setProcessingTicket] = useState<boolean>(false);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);
  const [pnrNumber, setPnrNumber] = useState<string | null>(null);
  const [bookingDocId, setBookingDocId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownloadTicket = async () => {
    const el = document.getElementById('ticketContainer');
    if (!el) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(el, `Ticket_${pnrNumber || completedBooking?.bookingId || 'Booking'}.pdf`);
    } catch (err) {
      console.error('Failed to export ticket:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Derived Pricing Math
  const subtotal = item.amount * quantity;
  const taxesAndGst = Math.round(subtotal * 0.05); // 5% GST & Platform charges
  const grossTotal = subtotal + taxesAndGst;
  const finalDiscountedPayable = Math.max(1, grossTotal - discountAmount);

  // Auto-revalidate coupon if quantity/subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (grossTotal < appliedCoupon.minAmount) {
        setCouponError(`Min booking ₹${appliedCoupon.minAmount.toLocaleString('en-IN')} required. Coupon removed.`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponSuccessMsg(null);
      } else {
        let disc = 0;
        if (appliedCoupon.type === 'flat') {
          disc = appliedCoupon.discount;
        } else {
          disc = Math.round((grossTotal * appliedCoupon.discount) / 100);
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) {
            disc = appliedCoupon.maxDiscount;
          }
        }
        setDiscountAmount(Math.min(disc, grossTotal - 1));
      }
    }
  }, [quantity, grossTotal]);

  const handleApplyPromo = async (codeToApply?: string) => {
    const targetCode = (codeToApply || promoInput).trim().toUpperCase();
    if (!targetCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    try {
      const res = await validateCouponCode(targetCode, grossTotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        setPromoInput(targetCode);
        setCouponSuccessMsg(`🎉 Code '${res.coupon.code}' applied! Saved ₹${res.discountAmount.toLocaleString('en-IN')}`);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(res.error || 'Invalid or expired coupon');
      }
    } catch (err: any) {
      setCouponError('Failed to validate promo code. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoInput('');
    setCouponError(null);
    setCouponSuccessMsg(null);
  };
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Clean up if necessary, but scripts are usually kept.
    };
  }, []);

  // Payment Execution with strictly enforced discounted amount
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded.");
      }

      let orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      if (paymentMethod === 'razorpay') {
        try {
          const res = await apiClient.authedFetch('/api/checkout/create-order', {
            method: 'POST',
            body: JSON.stringify({
              itemType: item.vertical,
              itemId: item.id,
              quantity: quantity
            })
          });
          const data = await res.json();
          
          if (!data.success) {
            throw new Error(data.error || "Failed to create order");
          }

          const rzpOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'RoutripO',
            description: item.title,
            order_id: data.order.id,
            handler: async function (response: any) {
              setProcessingTicket(true);
              setIsProcessing(false);
              
              const pnr = Math.random().toString(36).substring(2, 10).toUpperCase();
              setPnrNumber(pnr);
              const newDocRef = await addDoc(collection(db, 'bookings'), {
                userId: currentUser?.id,
                bookingId: orderId,
                orderId,
                itemId: item.id,
                itemTitle: item.title,
                vertical: item.vertical,
                type: item.vertical,
                date: travelDate,
                quantity,
                totalAmount: finalDiscountedPayable,
                status: 'Confirmed',
                paymentId: response.razorpay_payment_id,
                customer: { name: custName, email: custEmail, phone: custPhone },
                PNR_Number: pnr
              });
              setBookingDocId(newDocRef.id);
              
              setTimeout(() => {
                setCompletedBooking({
                  id: newDocRef.id,
                  bookingId: orderId,
                  status: 'Confirmed',
                  totalAmount: finalDiscountedPayable,
                  PNR_Number: pnr,
                  ...item
                } as any);
                setProcessingTicket(false);
                if (onBookingSuccess) onBookingSuccess(data);
              }, 2000);
            },
            prefill: {
              name: custName,
              email: custEmail,
              contact: custPhone
            },
            theme: { color: '#0f172a' }
          };

          const rzp = new (window as any).Razorpay(rzpOptions);
          rzp.on('payment.failed', function (response: any) {
            alert("Payment failed: " + response.error.description);
            setIsProcessing(false);
          });
          rzp.open();

          return; // Exit here, let Razorpay handler continue the flow

        } catch (apiError: any) {
          console.error("Razorpay API Error:", apiError);
          alert("Booking Failed: Server Error. " + (apiError.message || "Failed to create order."));
          setIsProcessing(false);
          return;
        }
      }
      
      // If not razorpay, just alert for now since we only support Razorpay
      alert("Selected payment method is not supported.");
      setIsProcessing(false);

    } catch (error: any) {
      console.error('Payment Error', error);
      setIsProcessing(false);
      alert("Booking Failed: " + (error.message || "System Error"));
    }
  };

  const getVerticalIcon = (vertical: string) => {
    switch (vertical) {
      case 'flight': return <Plane className="w-5 h-5 text-sky-600" />;
      case 'train': return <Train className="w-5 h-5 text-amber-600" />;
      case 'hotel': return <Building className="w-5 h-5 text-purple-600" />;
      case 'car':
      case 'cab': return <Car className="w-5 h-5 text-emerald-600" />;
      case 'bus': return <Bus className="w-5 h-5 text-rose-600" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-slate-50 overflow-y-auto block">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="bg-white max-w-3xl w-full mx-auto min-h-screen shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                {getVerticalIcon(item.vertical)}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black block">
                  {processingTicket ? 'Awaiting Confirmation' : completedBooking ? 'Booking Confirmed' : 'Checkout & Payment Summary'}
                </span>
                <h3 className="font-extrabold text-base text-white line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 [&::-webkit-scrollbar]:hidden">
            {processingTicket ? (
              /* Webhook Waiting View */
              <div className="py-12 space-y-5 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                <h2 className="text-xl font-black text-slate-900 text-center">Processing Secure Payment...</h2>
                <p className="text-sm text-slate-500 text-center max-w-xs">
                  We are waiting for the backend webhook to securely verify the payment signature and generate your PNR.
                </p>
              </div>
            ) : completedBooking ? (
              /* Success Booking Receipt View (Confirmed Ticket) */
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="overflow-auto max-h-[70vh] border-2 border-emerald-500/20 rounded-3xl mb-4 bg-slate-100">
                  <div id="ticketContainer" className="bg-white mx-auto relative text-slate-800 p-4 sm:p-8 w-full max-w-[800px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {completedBooking.type === 'hotel' ? (
                      <>
                        {/* --- HOTEL PAGE 1: BOOKING CONFIRMATION --- */}
                        <div className="flex justify-between items-start mb-6">
                          <div><img src="/routripo_brand_logo.svg" alt="RoutripO" className="h-10" /></div>
                          <div className="text-right">
                            <h1 className="text-4xl font-black text-red-600 mb-1">Booking Confirmation</h1>
                            <p className="text-xs font-bold text-slate-600">Please present either an electronic or paper copy of your booking confirmation upon check-in.</p>
                          </div>
                        </div>

                        {/* Top red/gray dotted border decoration */}
                        <div className="flex h-4 mb-6">
                          <div className="w-1/6 bg-slate-400"></div>
                          <div className="w-1/6 bg-slate-300"></div>
                          <div className="w-1/6 bg-slate-200"></div>
                          <div className="w-1/6 bg-slate-300"></div>
                          <div className="w-1/6 bg-slate-400"></div>
                          <div className="w-1/6 bg-slate-500"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium border border-slate-300 p-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex"><span className="w-40 text-slate-600">Booking ID :</span> <span className="font-bold text-slate-900">{completedBooking.bookingId || completedBooking.orderId}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Client :</span> <span className="font-bold text-slate-900">{completedBooking.customer?.name}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Country of Residence :</span> <span className="font-bold text-slate-900">India</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Property :</span> <span className="font-bold text-slate-900">{completedBooking.itemTitle || completedBooking.title}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Address :</span> <span className="font-bold text-slate-900">Destination location provided at checkout</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Number of Rooms :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">{completedBooking.quantity}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Number of Adults :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">{completedBooking.quantity * 2}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Room Type :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">Deluxe</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Promotion :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">Standard Deal</span></div>
                          </div>
                        </div>

                        <div className="bg-slate-200 text-slate-800 p-2 text-xs font-medium mb-1">
                          Cancellation Policy: Any cancellation received within 1 day prior to arrival date will incur the first night charge. Failure to arrive at your hotel or property will be treated as a No-Show and will incur the first night charge.
                        </div>
                        <div className="bg-slate-200 text-slate-800 p-2 text-xs font-medium mb-4">
                          Benefits Included: Express check-in, Breakfast available, Free WiFi, Parking, Drinking water
                        </div>

                        <div className="border border-slate-300 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Arrival :</span>
                            <span className="bg-slate-200 px-4 py-1 text-sm font-bold text-center flex-1">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Departure :</span>
                            <span className="bg-slate-200 px-4 py-1 text-sm font-bold text-center flex-1">
                              {(() => {
                                const d = new Date(completedBooking.date || completedBooking.travelDate);
                                d.setDate(d.getDate() + (completedBooking.quantity || 1));
                                return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="border border-slate-300 p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-4">
                             <div>
                               <p className="font-bold text-sm mb-2">Payment Details :</p>
                               <div className="flex gap-2 text-sm">
                                  <span className="bg-slate-200 px-2 py-1">Payment Method : -</span>
                                  <span className="bg-slate-200 px-2 py-1">Card No : -</span>
                                  <span className="bg-slate-200 px-2 py-1">EXP : -</span>
                               </div>
                             </div>
                             <div>
                               <p className="font-bold text-sm mb-1">Booked And Payable By :</p>
                               <p className="text-xs text-slate-600">RouTripO Company Pte, Ltd.<br/>30 Cecil Street, Prudential Tower #19-08,<br/>Singapore 049712</p>
                             </div>
                           </div>
                           <div className="flex flex-col justify-end items-end">
                             <div className="font-[cursive] text-4xl text-blue-800 font-black -rotate-6 mb-2">@RoutripO</div>
                             <div className="border-t border-slate-800 pt-1 text-xs font-bold text-center w-48">Authorized Stamp & Signature</div>
                           </div>
                        </div>

                        <div className="mb-4 text-xs font-medium space-y-1">
                          <p className="font-bold text-sm">Remarks :</p>
                          <p>Included : Taxes and fees INR {Math.round((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.18)}</p>
                          <p>NonSmoke, TwinBeds</p>
                          <p className="font-bold mt-2">All special requests are subject to availability upon arrival</p>
                        </div>
                        
                        <div className="border border-slate-800 p-4">
                          <p className="font-bold text-sm text-slate-900 mb-2">Notes</p>
                          <ul className="list-disc pl-4 text-[10px] space-y-1 text-slate-800 font-medium">
                            <li><span className="text-red-600 font-bold">IMPORTANT:</span> At check-in, you must present a valid photo ID with your address confirming the same name as the lead guest on the booking.</li>
                            <li>All rooms are guaranteed on the day of arrival. In the case of a no-show, your room(s) will be released and you will be subject to the terms and conditions of the Cancellation/No-Show Policy.</li>
                            <li>The total price for this booking does not include mini-bar items, telephone usage, laundry service, etc. The property will bill you directly.</li>
                          </ul>
                        </div>

                        {/* PAGE BREAK FOR PDF */}
                        <div style={{ pageBreakBefore: 'always' }} className="my-16 border-t-4 border-dashed border-slate-200"></div>

                        {/* --- HOTEL PAGE 2: TAX INVOICE --- */}
                        <div className="flex justify-between items-start mb-12">
                          <h1 className="text-3xl font-black text-slate-800">Tax Invoice</h1>
                          <div className="w-[300px] border border-slate-200 p-4 text-xs text-slate-500 space-y-1 bg-slate-50">
                            <div className="flex justify-between"><span>Transaction Category:</span> <span className="font-bold text-slate-700">B2C</span></div>
                            <div className="flex justify-between"><span>Transaction Detail:</span> <span className="font-bold text-slate-700">RG</span></div>
                            <div className="flex justify-between"><span>Date:</span> <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')}</span></div>
                            <div className="flex justify-between"><span>Invoice No.</span> <span className="font-bold text-slate-700">M23HL{Math.floor(Math.random() * 100000)}</span></div>
                            <div className="flex justify-between"><span>Place Of Supply:</span> <span className="font-bold text-slate-700">Maharashtra</span></div>
                            <div className="flex justify-between"><span>Booking ID:</span> <span className="font-bold text-slate-700">{completedBooking.bookingId || completedBooking.orderId}</span></div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start mb-8 gap-12">
                           <QrCode className="w-32 h-32 text-slate-800" />
                        </div>

                        <div className="grid grid-cols-2 text-sm border border-slate-300">
                          <div className="p-4 border-r border-slate-300">
                            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Customer Information</h3>
                            <div className="space-y-4">
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Hotel Name</p>
                                <p className="font-bold text-slate-800">{completedBooking.itemTitle || completedBooking.title}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Check-in Date</p>
                                <p className="font-bold text-slate-800">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-GB')}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Check-out Date</p>
                                <p className="font-bold text-slate-800">
                                  {(() => {
                                    const d = new Date(completedBooking.date || completedBooking.travelDate);
                                    d.setDate(d.getDate() + (completedBooking.quantity || 1));
                                    return d.toLocaleDateString('en-GB');
                                  })()}
                                </p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Customer Name</p>
                                <p className="font-bold text-slate-800">{completedBooking.customer?.name}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Customer Gstin</p>
                                <p className="font-bold text-slate-800">UNREGISTERED</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Payment Breakup</h3>
                            <div className="space-y-4 text-slate-800">
                              <div className="flex justify-between font-medium">
                                <span>Accommodation Charges</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.88).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>IGST @ 0.0%</span>
                                <span>INR 0.0</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>CGST @ 6.0%</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.06).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>SGST @ 6.0%</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.06).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg bg-[#f6f2a6] p-3 mt-4 rounded border border-[#e5df88]">
                                <span>Total Invoice Value</span>
                                <span>INR {(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 text-[10px] text-slate-500 leading-relaxed text-justify">
                          *Hotel is the primary service provider of accommodation services. RouTripO Pvt. Ltd. acts only as an intermediary for reservation of accommodation services. GST on accommodation services is collected and remitted by RouTripO Pvt. Ltd. in the capacity of E-commerce operator as per section 9(5) of the Central Goods and Services Act, 2017 and respective State GST Act. This invoice has been issued by RouTripO Pvt. Ltd. only with a limited purpose to comply with legal obligations as an e-commerce operator under GST law.
                          <br/><br/>
                          This is a computer generated Invoice and does not require Signature/Stamp.
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-slate-600 border-t border-slate-200 pt-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <p className="text-slate-400 mb-1">PAN</p>
                               <p className="font-bold text-slate-700">AADCM5146R</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">GST NUMBER</p>
                               <p className="font-bold text-slate-700">23AADCM5146R1Z3</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">HSN/SAC</p>
                               <p className="font-bold text-slate-700">996311</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">Service Description</p>
                               <p className="font-bold text-slate-700">Accommodation Services</p>
                             </div>
                             <div className="col-span-2">
                               <p className="text-slate-400 mb-1">CIN</p>
                               <p className="font-bold text-slate-700">U63040HR2000PTC090846</p>
                             </div>
                          </div>
                        </div>

                        <div className="mt-8 border-t border-slate-300 pt-8 flex gap-12 text-xs">
                          <div className="bg-[#f25c3b] text-white font-black text-3xl px-4 py-2 self-start rounded">
                            RouTripO
                          </div>
                          <div>
                             <p className="font-black text-slate-800 mb-2">RouTripO Private Limited</p>
                             <p className="text-slate-500">Nishank Workspace Pvt Ltd Cabin No P-6<br/>3rd Floor Plot No.74 MP Nagar Zone-2 Tehsil<br/>Huzur Bhopal MP<br/>Madhya Pradesh 452003</p>
                          </div>
                          <div>
                             <p className="font-black text-slate-800 mb-2">REGISTERED OFFICE</p>
                             <p className="text-slate-500">19th Floor, Epitome Building No. 5, DLF<br/>Cyber City,<br/>DLF Phase III<br/>Gurugram-122002, Haryana</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        
                    {/* --- PAGE 1: E-TICKET --- */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Booking Id:</p>
                        <p className="text-xl font-black text-slate-900 uppercase">{completedBooking.bookingId || completedBooking.orderId}</p>
                      </div>
                      <div><img src="/routripo_brand_logo.svg" alt="RoutripO" className="h-10" /></div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-6">
                        <div className="bg-slate-800 text-white text-center px-4 py-2 rounded-lg shadow-inner">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Travel Date</p>
                          <p className="font-black text-xl leading-none">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 uppercase">{completedBooking.itemTitle || completedBooking.title} - CONFIRMED</p>
                          <p className="text-sm font-bold text-slate-500 mt-1">{completedBooking.type?.toUpperCase()} • QTY: {completedBooking.quantity} • SECURE BOOKING</p>
                        </div>
                      </div>
                      
                      <div className="p-8 grid grid-cols-3 gap-6 items-center">
                        <div>
                          <p className="text-3xl font-black text-slate-900">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">Origin / Check-in</p>
                          <p className="text-sm font-medium text-slate-700 mt-1">Starting Point</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full border-t-2 border-dashed border-slate-300 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white px-4 py-1 text-[10px] text-slate-400 font-black tracking-widest border border-slate-200 rounded-full shadow-sm">
                              ROUTRIPO SECURE
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-slate-900">Confirmed</p>
                          <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">Destination / Check-out</p>
                          <p className="text-sm font-medium text-slate-700 mt-1">Completion Point</p>
                        </div>
                      </div>

                      <div className="bg-amber-50/50 p-5 border-t border-slate-200">
                        <p className="font-black text-sm text-slate-800 mb-1">Booking Policy & Allowance</p>
                        <p className="text-xs font-medium text-slate-600">Standard check-in policies apply. Please carry a valid government ID proof. Digital tickets are accepted. Cancellation terms apply as per provider policy.</p>
                      </div>
                    </div>

                    <table className="w-full text-left text-sm mb-12 border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-3 px-4 font-black text-slate-800 w-[140px]">Barcode</th>
                          <th className="py-3 px-4 font-black text-slate-800">Travellers</th>
                          <th className="py-3 px-4 font-black text-slate-800">PNR</th>
                          <th className="py-3 px-4 font-black text-slate-800 text-right">E-Ticket no.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-4 px-4">
                            <QrCode className="w-16 h-16 text-slate-800" />
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">{completedBooking.customer?.name}</td>
                          <td className="py-4 px-4 font-black tracking-wider text-slate-900">{pnrNumber || completedBooking.PNR_Number || 'PENDING'}</td>
                          <td className="py-4 px-4 text-right font-medium text-slate-400">-</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mb-12">
                      <h3 className="font-black text-lg text-slate-900 mb-4 border-b border-slate-200 pb-2">Important Information</h3>
                      <ul className="text-sm font-medium text-slate-700 space-y-4 list-disc pl-5">
                        <li>You have paid <span className="font-black">₹{(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toLocaleString('en-IN')}</span> for this booking.</li>
                        <li>For any queries or communication with RouTripO regarding this booking, please use your Booking ID as a reference.</li>
                        <li>Travellers must present a valid photo ID proof to enter and at the time of check-in. Permissible ID proofs include an Aadhaar Card, Passport or any other government-recognised ID.</li>
                        <li>Kindly carry either a copy of your e-ticket on a tablet/mobile/laptop or a printed copy of the ticket for check-in.</li>
                      </ul>
                    </div>

                    {/* PAGE BREAK FOR PDF */}
                    <div style={{ pageBreakBefore: 'always' }} className="my-16 border-t-4 border-dashed border-slate-200"></div>

                    {/* --- PAGE 2: TAX INVOICE --- */}
                    <div className="border-2 border-slate-800">
                      <div className="border-b-2 border-slate-800 p-4 flex justify-between items-center bg-slate-50">
                        <div className="bg-[#f25c3b] text-white font-black text-2xl px-4 py-1 inline-block">
                          RouTripO
                        </div>
                        <p className="font-black text-lg text-slate-900">Tax Invoice: {(completedBooking.bookingId || completedBooking.orderId).toUpperCase()}</p>
                        <QrCode className="w-12 h-12 text-slate-800" />
                      </div>

                      <div className="text-xs font-medium text-center border-b border-slate-800 py-3 bg-white">
                        <p className="font-black text-sm text-slate-900">LE ROUTRIPO TECHNOLOGY LIMITED</p>
                        <p className="text-slate-600 mt-1">CIN : L63000HR2006PLC071540</p>
                        <p className="text-slate-600">Second Floor, Veritas Building, Sector 53, Golf Course Road, Gurgaon, Haryana, 122002</p>
                      </div>

                      <div className="grid grid-cols-2 text-xs border-b border-slate-800">
                        <div className="border-r border-slate-800 p-4 space-y-2 bg-white">
                          <p><span className="font-black text-slate-900">Booking Id :</span> {completedBooking.bookingId || completedBooking.orderId}</p>
                          <p><span className="font-black text-slate-900">Details Of Service Provider :</span> Le RouTripO Technology Limited</p>
                          <p><span className="font-black text-slate-900">GSTIN :</span> 06AABCL1932G1ZV</p>
                          <p><span className="font-black text-slate-900">SAC Code :</span> 998551</p>
                        </div>
                        <div className="p-4 space-y-2 bg-white">
                          <p><span className="font-black text-slate-900">Invoice date and time :</span> {new Date().toLocaleString('en-IN')}</p>
                          <p><span className="font-black text-slate-900">Place of Supply :</span> Maharashtra</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 text-xs border-b-2 border-slate-800">
                        <div className="border-r border-slate-800 p-4 bg-white">
                          <p className="font-black text-slate-900 mb-2">Details Of Receiver (Billed To)</p>
                          <p className="font-medium">Name : {completedBooking.customer?.name}</p>
                          <p className="font-medium">Email : {completedBooking.customer?.email}</p>
                          <p className="font-medium">Contact : {completedBooking.customer?.phone}</p>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="font-black text-slate-900 mb-2">Billing Address</p>
                          <p className="font-medium">Address : Provided securely during checkout, India</p>
                        </div>
                      </div>

                      {/* FARE TABLE */}
                      <div className="text-sm bg-white">
                        <div className="flex justify-between border-b border-slate-800 p-3 font-black text-slate-900">
                          <span>Fare (Incl of All taxes)</span>
                          <span>{((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.85).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 p-3 font-medium text-slate-800">
                          <span>Convenience / Other Service charges & Fees</span>
                          <span>{((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.15).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-300 p-3 text-slate-600 font-medium bg-slate-50">
                          <span>CGST @9% on charges:</span>
                          <span>0.00</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-300 p-3 text-slate-600 font-medium bg-slate-50">
                          <span>SGST @9% on charges:</span>
                          <span>0.00</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 p-3 text-slate-600 font-medium bg-slate-50">
                          <span>IGST @18% on charges:</span>
                          <span>0.00</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-slate-800 p-3 font-black text-base text-slate-900 bg-slate-100">
                          <span>Total Payable</span>
                          <span>{(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 text-xs border-b border-slate-800 min-h-[70px] bg-white">
                        <div className="border-r border-slate-800 p-3">
                          <p className="font-black text-slate-900 mb-1">Invoice Total (In Words) :</p>
                          <p className="font-medium">Rupees {(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toLocaleString('en-IN')} Only</p>
                        </div>
                        <div className="p-3">
                          <p className="font-black text-slate-900 mb-1">Invoice Total :</p>
                          <p className="font-medium">{(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toFixed(4)}</p>
                        </div>
                      </div>

                      <div className="p-3 text-[10px] border-b-2 border-slate-800 leading-relaxed font-medium bg-white">
                        <p className="font-black text-slate-900 mb-1">Certified that the particulars above are true and correct and the amount indicated :</p>
                        <p>1) Represents the price actually charged and that there is no additional consideration directly or indirectly.</p>
                        <p>2) No tax is payable under reverse charge for this invoice.</p>
                      </div>

                      <div className="grid grid-cols-4 text-[10px] leading-relaxed font-medium bg-white">
                        <div className="col-span-3 border-r border-slate-800 p-4 space-y-2">
                          <p className="font-black text-slate-900 uppercase">TERMS OF SALE :</p>
                          <p>a) Any disputes shall be subject to the exclusive jurisdiction of courts at Gurgaon (Haryana, India).</p>
                          <p>b) All taxes charged on Actual basis.</p>
                          <p>c) Total payable is inclusive of Fare & other services collected on behalf of the service providers for which they are responsible for charging GST & issuing respective GST invoices.</p>
                          <p>d) Convenience Fees, Cancellation/Reschedule Assurance Fees and Price lock Fees are non-refundable.</p>
                        </div>
                        <div className="col-span-1 p-4 flex flex-col justify-between items-center text-center">
                          <p className="font-black text-slate-900 mb-4">For LE ROUTRIPO TECHNOLOGY LIMITED</p>
                          <div className="font-[cursive] text-3xl text-blue-800 mb-2 font-black -rotate-6">@RoutripO</div>
                          <p className="font-black text-slate-900 border-t border-slate-400 pt-1 w-full">Authorised Signatory</p>
                        </div>
                      </div>
                    </div>
                  
                      </>
                    )}
</div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadTicket}
                    disabled={isDownloading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? 'Generating PDF...' : 'Download Ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form View */
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* 1. Item Preview Header */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.subtitle || item.location || `${currencySymbol}${item.amount.toLocaleString('en-IN')} per unit`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Unit Price</span>
                    <span className="font-black text-slate-900 text-base">
                      {currencySymbol}{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* 2. Quantity & Traveler Details */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Traveler & Booking Info
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {item.vertical === 'hotel' ? 'Rooms / Nights' : item.vertical === 'car' ? 'Rental Days' : 'Number of Travelers / Seats'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Travel Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Guest / Traveler</label>
                      <input
                        type="text"
                        placeholder="Sharad Raut"
                        value={custName}
                        onChange={(e) => setCustName(sanitizeInput(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email ID</label>
                      <input
                        type="email"
                        placeholder="shrd.raut@gmail.com"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PROMO CODE / COUPON VALIDATION ENGINE */}
                <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/60 border border-amber-200 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">Have a Promo Code or Coupon?</h5>
                        <p className="text-[10px] text-slate-500">Apply instant discount to reduce total payable amount</p>
                      </div>
                    </div>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Input & Apply Button */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ENTER PROMO CODE (e.g. WELCOME500)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(sanitizeInput(e.target.value).toUpperCase())}
                        disabled={isValidatingCoupon || !!appliedCoupon}
                        className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black tracking-wider text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase disabled:bg-amber-100/50"
                      />
                      {appliedCoupon && (
                        <span className="absolute right-3 top-2.5 text-emerald-600 font-black text-xs flex items-center gap-1">
                          <Check className="w-4 h-4 stroke-[3]" />
                          APPLIED
                        </span>
                      )}
                    </div>
                    {!appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        disabled={isValidatingCoupon || !promoInput.trim()}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    ) : null}
                  </div>

                  {/* Inline Error & Success Messages */}
                  {couponError && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-xl animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponSuccessMsg && (
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold bg-emerald-100 border border-emerald-300 p-2.5 rounded-xl animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{couponSuccessMsg}</span>
                    </div>
                  )}

                  {/* Quick-Select Coupon Badges */}
                  {!appliedCoupon && (
                    <div className="pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                        Popular Coupons for Testing:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mockCoupons.slice(0, 4).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyPromo(c.code)}
                            className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300/80 rounded-lg text-[11px] font-mono font-bold text-amber-900 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Gift className="w-3 h-3 text-amber-600" />
                            <span>{c.code}</span>
                            <span className="text-[9px] text-amber-700 font-sans font-medium">({c.type === 'flat' ? `₹${c.discount} off` : `${c.discount}% off`})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Itemized Price Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Base Amount ({quantity}x {currencySymbol}{item.amount.toLocaleString('en-IN')}):</span>
                    <span>{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium pb-2 border-b border-slate-200">
                    <span>Taxes & Platform GST (5%):</span>
                    <span>+{currencySymbol}{taxesAndGst.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-100/70 -mx-2 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        Discount Applied ({appliedCoupon?.code}):
                      </span>
                      <span className="text-sm font-black">-{currencySymbol}{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Final Price Highlight with Strike-Through */}
                  <div className="flex items-baseline justify-between pt-2">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-500 block">Final Payable Amount:</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Includes all taxes and discounts</span>
                    </div>
                    <div className="text-right flex items-baseline gap-2">
                      {discountAmount > 0 && (
                        <span className="text-sm font-bold text-slate-400 line-through">
                          {currencySymbol}{grossTotal.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-2xl font-black text-emerald-600">
                        {currencySymbol}{finalDiscountedPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Payment Method Selector */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Select Test Payment Gateway
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay' ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="sr-only"
                      />
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <div className="text-left text-xs">
                        <div className="font-extrabold">Razorpay Test Gateway</div>
                        <div className="text-[10px] text-slate-500 font-normal">Card / UPI / NetBanking</div>
                      </div>
                    </label>

                    <label className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 font-bold' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="sr-only"
                      />
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <div className="text-left text-xs">
                        <div className="font-extrabold">Direct UPI App / QR</div>
                        <div className="text-[10px] text-slate-500 font-normal">GPay / PhonePe / Paytm</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 6. Proceed to Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Secure Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Proceed to Pay {currencySymbol}{finalDiscountedPayable.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
 );
};
