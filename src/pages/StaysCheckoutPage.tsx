import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Hotel, AlertCircle, User, Phone, Mail, FileText, Compass as  Calendar, Users, MapPin } from 'lucide-react';
import { BillingDetailsSection } from '../components/booking/agoda/BillingDetailsSection';
import { FareBreakupCard } from '../components/booking/agoda/FareBreakupCard';
import { TravelProtectionCard, CfarCard } from '../components/booking/agoda/TravelProtectionCard';
import { PaymentStatusScreen } from '../components/booking/agoda/PaymentStatusScreen';

export const StaysCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { hotel: any; roomRate: any; searchParams: any };
  
  const hotel = state?.hotel;
  const rate = state?.roomRate;
  
  const adults = state?.searchParams?.adults || 2;
  const children = state?.searchParams?.children || 0;
  const checkInDate = state?.searchParams?.checkInDate || 'Tomorrow';
  const checkOutDate = state?.searchParams?.checkOutDate || '3 Days later';
  
  // Single Lead Guest State (Hotels require ONLY 1 primary guest details)
  const [leadGuest, setLeadGuest] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialRequest: ''
  });
  
  const [gst, setGst] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [cfar, setCfar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  const baseFare = Math.ceil(parseFloat(rate?.total_amount || 2500));
  const taxes = Math.round(baseFare * 0.12);
  const totalInsurance = insurance ? 299 : 0;
  const totalCfar = cfar ? 499 : 0;
  const grandTotal = baseFare + taxes + totalInsurance + totalCfar;

  const handlePay = async () => {
    // Validate single lead guest
    if (!leadGuest.firstName.trim() || !leadGuest.lastName.trim()) {
      alert("कृपया मुख्य पाहुण्याचे नाव प्रविष्ट करा / Please enter Lead Guest First & Last Name.");
      return;
    }
    if (!leadGuest.phone.trim() || leadGuest.phone.length < 10) {
      alert("कृपया वैध १० अंकी मोबाईल नंबर टाका / Please enter valid 10-digit Mobile Number.");
      return;
    }
    if (!leadGuest.email.trim() || !leadGuest.email.includes('@')) {
      alert("कृपया ई-मेल पत्ता टाका / Please enter a valid Email address.");
      return;
    }

    setIsProcessing(true);
    let orderData: any = null;
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierBaseFare: baseFare,
          supplierTaxes: taxes,
          serviceType: 'hotel',
          buyerState: 'MH' 
        })
      });
      orderData = await res.json();
      if (!res.ok || !orderData?.success || !orderData?.orderId) {
        setIsProcessing(false);
        alert(`Razorpay Error: ${orderData?.error || "Could not create Razorpay order"}`);
        return;
      }
    } catch (e: any) {
      setIsProcessing(false);
      alert(`Connection Error: ${e?.message || "Failed to reach Razorpay order service"}`);
      return;
    }

    const effectiveKey = orderData.keyId || orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!effectiveKey) {
      setIsProcessing(false);
      alert("Razorpay Key ID is not configured on server.");
      return;
    }

    if (typeof (window as any).Razorpay === 'undefined') {
      setIsProcessing(false);
      alert("Razorpay Checkout SDK is still loading. Please try again.");
      return;
    }

    try {
      const rzpOptions = {
        key: effectiveKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: orderData.orderId || orderData.id,
        name: 'RoutTripo Stays',
        description: `${hotel?.name || 'Hotel Stay'} • Lead Guest: ${leadGuest.firstName} ${leadGuest.lastName}`,
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success || verifyData.verified) {
              setPaymentStatus({
                success: true,
                paymentId: response.razorpay_payment_id
              });
            } else {
              alert(`Payment verification failed: ${verifyData.error || "Untrusted transaction"}`);
            }
          } catch (vErr: any) {
            alert(`Verification error: ${vErr?.message || "Could not verify signature"}`);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${leadGuest.firstName} ${leadGuest.lastName}`.trim(),
          email: leadGuest.email,
          contact: leadGuest.phone
        },
        theme: { color: '#E11D48' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            alert("Payment window closed. No booking was created.");
          }
        }
      };
      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (errResp: any) => {
        setIsProcessing(false);
        alert(`Payment failed: ${errResp?.error?.description || "Declined by bank"}`);
      });
      rzp.open();
    } catch (e: any) {
      setIsProcessing(false);
      alert(`Razorpay SDK Error: ${e?.message || "Could not launch Razorpay window"}`);
    }
  };

  if (paymentStatus) {
     return (
       <PaymentStatusScreen 
         status={paymentStatus}
         origin={hotel?.name || 'Hotel Booking'}
         destination={hotel?.accommodation?.location?.address?.city_name || 'Hotel Property'}
         travellerCount={adults + children}
         tripType="Stay"
         travelClass={rate?.room?.name || 'Standard Room'}
         bookingRef={`RTR-HTL-${Math.floor(Math.random() * 900000) + 100000}`}
         onPrimaryAction={() => navigate('/')}
       />
     );
  }

  return (
    <div className="min-h-screen  pb-28">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-slate-900">Hotel Review & Pay</h1>
            <p className="text-xs text-rose-600 font-medium">Primary Guest Contact & Checkout</p>
          </div>
        </div>
        <span className="bg-pink-50 text-pink-700 font-bold text-xs px-2.5 py-1 rounded-full border border-pink-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Instant Confirmation
        </span>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-5 mt-2">
        {/* Hotel Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
               <Hotel className="w-7 h-7" />
             </div>
             <div>
               <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">{hotel?.name || 'Luxury Hotel Property'}</h2>
               <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                 <MapPin className="w-3.5 h-3.5 text-rose-500" />
                 {hotel?.accommodation?.location?.address?.line_1 || 'Prime Location'}
               </p>
               <div className="flex flex-wrap items-center gap-2 mt-2">
                 <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                   {rate?.room?.name || 'Standard Room'}
                 </span>
                 <span className="bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                   <Users className="w-3 h-3" /> {adults} Adults {children > 0 ? `• ${children} Children` : ''}
                 </span>
               </div>
             </div>
           </div>
        </div>

        {/* Primary Guest Rule Notification */}
        <div className="bg-orange-50/90 border border-orange-200 p-4 rounded-2xl flex items-start gap-3">
          <Hotel className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 leading-relaxed">
            <strong className="block text-orange-950 font-black text-sm mb-0.5">
              🏨 एकाच मुख्य पाहुण्याची (Lead Guest) माहिती आवश्यक:
            </strong>
            हॉटेल बुकिंगसाठी सर्व प्रवाशांची माहिती देण्याची गरज नसते. फक्त एका मुख्य पाहुण्याचे (Primary Guest) नाव आणि संपर्क टाका. इतर पाहुणे चेक-इन करताना थेट ओळखपत्र (ID Proof) दाखवू शकतात.
          </div>
        </div>

        {/* Lead Guest Form Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-600" />
              <span>मुख्य पाहुण्याचे नाव (Primary Lead Guest Details)</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Room 1 • Lead Guest
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Salutation */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
              <select
                value={leadGuest.salutation}
                onChange={(e: any) => setLeadGuest({ ...leadGuest, salutation: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">First & Middle Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul"
                value={leadGuest.firstName}
                onChange={(e: any) => setLeadGuest({ ...leadGuest, firstName: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Last Name *</label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={leadGuest.lastName}
                onChange={(e: any) => setLeadGuest({ ...leadGuest, lastName: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number (for Hotel Confirmation) *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={leadGuest.phone}
                onChange={(e: any) => setLeadGuest({ ...leadGuest, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address (for Hotel Voucher) *
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={leadGuest.email}
                onChange={(e: any) => setLeadGuest({ ...leadGuest, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Optional Special Requests */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Special Requests (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. High floor room, Large bed, Late check-in"
              value={leadGuest.specialRequest}
              onChange={(e: any) => setLeadGuest({ ...leadGuest, specialRequest: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* GST Optional Section */}
        <BillingDetailsSection 
          phone={leadGuest.phone}
          email={leadGuest.email}
          gstNumber={gst}
          onChangePhone={(p: any) => setLeadGuest({ ...leadGuest, phone: p })}
          onChangeEmail={(e: any) => setLeadGuest({ ...leadGuest, email: e })}
          onChangeGst={setGst}
        />

        {/* Protection Add-ons */}
        <h3 className="font-bold text-base text-slate-900 mt-6">Add-ons & Insurance</h3>
        <TravelProtectionCard selected={insurance} onSelect={setInsurance} price={299} gstPercent={18} />
        <CfarCard selected={cfar} onToggle={() => setCfar(!cfar)} price={499} />

        {/* Fare Breakup */}
        <FareBreakupCard 
           baseFare={baseFare} 
           taxesAndFees={taxes} 
           convenienceFee={0}
           convenienceFeeWaived={true}
           total={grandTotal}
        />
        
        <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded-xl flex gap-2 items-start mt-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
          By proceeding, you agree to the hotel check-in policies and terms of service.
        </p>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 p-4 shadow-2xl flex items-center justify-between z-40 max-w-4xl mx-auto">
         <div>
            <span className="text-xs font-medium text-slate-500 block">Total Payable Amount</span>
            <div className="font-black text-2xl text-slate-900 leading-none">₹{grandTotal.toLocaleString('en-IN')}</div>
         </div>
         <button 
           onClick={handlePay}
           disabled={isProcessing}
           className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-rose-200 active:scale-95 transition-all cursor-pointer text-sm uppercase tracking-wider"
         >
           {isProcessing ? 'Processing Payment...' : 'Proceed to Pay'}
         </button>
      </div>
    </div>
  );
};
