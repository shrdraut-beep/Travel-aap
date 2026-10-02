// src/components/common/RazorpayCheckoutModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  X,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import QRCodeLib from 'qrcode';

const SafeQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 140 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  useEffect(() => {
    let active = true;
    QRCodeLib.toDataURL(value || 'upi://pay', { width: size * 2, margin: 1 })
      .then(url => { if (active) setDataUrl(url); })
      .catch(() => {});
    return () => { active = false; };
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="bg-slate-100 animate-pulse rounded-lg" />;
  }
  return <img src={dataUrl} alt="UPI QR Code" width={size} height={size} className="block rounded-lg" />;
};

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  orderId?: string;
  serviceName?: string;
  orderDescription?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (details: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    method?: string;
  }) => void;
  onFailure?: (error: string) => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallet';

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'INR',
  orderId = `order_${Date.now()}`,
  serviceName = 'RoutTripo Travel',
  orderDescription = 'Travel & Stay Booking',
  customerName = 'Guest Traveler',
  customerEmail = 'traveler@routripo.com',
  customerPhone = '9876543210',
  onSuccess,
  onFailure,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [upiMode, setUpiMode] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName);
  const [saveCard, setSaveCard] = useState(true);

  // States
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState('Contacting Payment Gateway...');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(600); // 10 minutes

  // Countdown timer for QR code validity
  useEffect(() => {
    if (!isOpen) {
      setCountdownSeconds(600);
      setIsAuthorizing(false);
      return;
    }
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Card detection
  const cleanCardNum = cardNumber.replace(/\s+/g, '');
  let cardType = 'GENERIC';
  if (cleanCardNum.startsWith('4')) cardType = 'VISA';
  else if (/^5[1-5]/.test(cleanCardNum)) cardType = 'MASTERCARD';
  else if (/^(60|65|508)/.test(cleanCardNum)) cardType = 'RUPAY';
  else if (/^3[47]/.test(cleanCardNum)) cardType = 'AMEX';

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  };

  const handleProcessPayment = async (method: string) => {
    setIsAuthorizing(true);
    setAuthStepMessage('Contacting Razorpay Payment Gateway...');

    try {
      // Step 1: Create order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierBaseFare: amount,
          supplierTaxes: 0,
          serviceType: 'direct_booking',
          buyerState: 'MH',
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderRes.json();
      const rzpOrderId = orderData.id || orderData.orderId;
      const rzpKeyId = orderData.keyId || orderData.key || '';
      const isSandbox = orderData.isSandbox || !rzpKeyId || rzpKeyId.includes('dummy') || rzpKeyId.includes('Mock') || rzpKeyId.length < 8;

      setAuthStepMessage('Connecting to Payment Gateway...');

      // Step 2: Try to open real Razorpay popup if we have real keys
      if (!isSandbox && rzpKeyId) {
        // Load Razorpay script if needed
        if (typeof (window as any).Razorpay === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Razorpay script failed to load'));
            document.head.appendChild(s);
          });
        }

        if (typeof (window as any).Razorpay !== 'undefined') {
          setIsAuthorizing(false);
          const options = {
            key: rzpKeyId,
            amount: orderData.amount || Math.round(amount * 100),
            currency: 'INR',
            name: 'RoutTripo Travel',
            description: `${method} Payment`,
            order_id: rzpOrderId,
            prefill: { name: customerName, email: customerEmail, contact: customerPhone },
            theme: { color: '#072654' },
            handler: async (response: any) => {
              setIsAuthorizing(true);
              setAuthStepMessage('Verifying payment signature...');
              try {
                const verifyRes = await fetch('/api/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                const verifyData = await verifyRes.json();
                setIsAuthorizing(false);
                if (verifyData.success || verifyData.verified) {
                  onSuccess({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    method,
                  });
                } else {
                  if (onFailure) onFailure(verifyData.error || 'Payment signature verification failed');
                }
              } catch (err: any) {
                setIsAuthorizing(false);
                if (onFailure) onFailure(err?.message || 'Verification network error');
              }
            },
            modal: {
              ondismiss: () => {
                setIsAuthorizing(false);
                if (onFailure) onFailure('Payment window closed by user');
              },
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', (resp: any) => {
            setIsAuthorizing(false);
            if (onFailure) onFailure(resp.error?.description || 'Payment failed');
          });
          rzp.open();
          return;
        }
      }

      // Step 3: Sandbox / dev mode — use sandbox order ID, call verify which passes it through
      setAuthStepMessage('Processing sandbox payment...');
      const sandboxPaymentId = `pay_sandbox_${Date.now().toString(36).toUpperCase()}`;
      const sandboxSig = 'sig_sandbox_test';

      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: sandboxPaymentId,
          razorpay_signature: sandboxSig,
        }),
      });

      const verifyData = await verifyRes.json();
      setIsAuthorizing(false);

      if (verifyData.success || verifyData.verified) {
        onSuccess({
          razorpay_payment_id: sandboxPaymentId,
          razorpay_order_id: rzpOrderId,
          razorpay_signature: sandboxSig,
          method,
        });
      } else {
        if (onFailure) onFailure(verifyData.error || 'Sandbox payment verification failed');
      }
    } catch (err: any) {
      setIsAuthorizing(false);
      if (onFailure) onFailure(err?.message || 'Payment processing error');
    }
  };

  const handleSimulateDecline = () => {
    setIsAuthorizing(true);
    setAuthStepMessage('Contacting Bank Gateway...');
    setTimeout(() => {
      setIsAuthorizing(false);
      if (onFailure) {
        onFailure('Payment declined by card issuer/bank (Insufficient funds or user cancelled)');
      }
    }, 1000);
  };

  const handleCancelClick = () => {
    setShowExitConfirm(true);
  };

  const confirmCancel = () => {
    setShowExitConfirm(false);
    onClose();
    if (onFailure) {
      onFailure('Payment cancelled by user');
    }
  };

  const popularBanks = [
    { code: 'HDFC', name: 'HDFC Bank', color: '#004c8f' },
    { code: 'SBI', name: 'State Bank of India', color: '#280071' },
    { code: 'ICICI', name: 'ICICI Bank', color: '#b02a30' },
    { code: 'AXIS', name: 'Axis Bank', color: '#800040' },
    { code: 'KOTAK', name: 'Kotak Bank', color: '#e31837' },
    { code: 'PNB', name: 'Punjab National Bank', color: '#a20a2a' },
  ];

  const popularWallets = ['PhonePe', 'Paytm', 'Mobikwik', 'Amazon Pay', 'Airtel Money'];

  const qrPayload = `upi://pay?pa=routripo.bookings@rzp&pn=RoutTripo&am=${amount}&cu=INR&tn=${encodeURIComponent(orderId)}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-[#072654] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white font-black text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white">Razorpay</span>
                <span className="bg-[#2B83EA] text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                  Trusted
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-400/30">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                {serviceName} • {orderDescription}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Amount to Pay</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Order Reference Bar */}
        <div className="bg-slate-50 px-5 sm:px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono text-[11px]">
            Ref: <strong className="text-slate-800">{orderId}</strong>
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {customerName} ({customerPhone.slice(-4) ? `•••${customerPhone.slice(-4)}` : ''})
          </span>
        </div>

        {/* Payment Methods Layout */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-[360px] bg-white">
          {/* Navigation Sidebar */}
          <div className="sm:w-48 bg-slate-50/70 border-b sm:border-b-0 sm:border-r border-slate-200 p-2 sm:p-3 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upi'
                  ? 'bg-[#072654] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'card'
                  ? 'bg-[#072654] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'netbanking'
                  ? 'bg-[#072654] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Netbanking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`flex-1 sm:flex-none flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'bg-[#072654] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Wallets</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto relative">
            {/* Authorizing Overlay */}
            {isAuthorizing && (
              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-[#072654] rounded-full animate-spin mb-3" />
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">{authStepMessage}</h4>
                <p className="text-xs text-slate-500">Please do not close or refresh this window...</p>
              </div>
            )}

            {/* TAB 1: UPI / QR */}
            {activeTab === 'upi' && (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setUpiMode('qr')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      upiMode === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('id')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      upiMode === 'id' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    UPI Apps & ID
                  </button>
                </div>

                {upiMode === 'qr' ? (
                  <div className="flex flex-col items-center text-center space-y-3 py-1">
                    <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-sm">
                      <SafeQRCode value={qrPayload} size={140} />
                    </div>

                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">
                        Scan with Google Pay, PhonePe, Paytm or BHIM
                      </span>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Code expires in: <strong className="text-slate-800">{timerDisplay}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProcessPayment('UPI_QR')}
                      className="w-full py-3 rounded-xl bg-[#072654] hover:bg-[#0c2f6d] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Simulate QR Scan & Approve (₹{amount.toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Instant Pay with UPI App
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => handleProcessPayment(`UPI_${app.toUpperCase()}`)}
                            className="p-2.5 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 text-xs font-bold text-slate-800 text-center transition-all cursor-pointer"
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase">Or enter UPI ID</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. mobileNumber@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <button
                          type="button"
                          disabled={!upiId.includes('@')}
                          onClick={() => handleProcessPayment(`UPI_ID_${upiId}`)}
                          className="px-4 py-2.5 bg-[#072654] hover:bg-[#0c2f6d] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Verify & Pay
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        A payment collect request will be sent to your UPI application.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Card Number</label>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {cardType}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">CVV / CVC</label>
                      <span className="text-[9px] text-slate-400">3 or 4 digits</span>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveCardBox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <label htmlFor="saveCardBox" className="text-[11px] text-slate-500 font-medium">
                    Save card securely as per RBI guidelines
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment('CREDIT_DEBIT_CARD')}
                  className="w-full py-3 mt-2 rounded-xl bg-[#072654] hover:bg-[#0c2f6d] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{amount.toLocaleString('en-IN')}</span>
                </button>
              </div>
            )}

            {/* TAB 3: NETBANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Popular Banks</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.code)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          selectedBank === bank.code
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{bank.name}</span>
                          {selectedBank === bank.code && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">All Other Banks</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="UNION">Union Bank of India</option>
                    <option value="INDUS">IndusInd Bank</option>
                    <option value="YES">YES Bank</option>
                    <option value="FEDERAL">Federal Bank</option>
                    <option value="IDFC">IDFC FIRST Bank</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment(`NETBANKING_${selectedBank}`)}
                  className="w-full py-3 rounded-xl bg-[#072654] hover:bg-[#0c2f6d] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Proceed to Pay ₹{amount.toLocaleString('en-IN')}</span>
                </button>
              </div>
            )}

            {/* TAB 4: WALLETS */}
            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Select Wallet</label>
                  <div className="space-y-2">
                    {popularWallets.map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                          selectedWallet === wallet
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-slate-500" />
                          <span>{wallet}</span>
                        </div>
                        {selectedWallet === wallet && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment(`WALLET_${selectedWallet.toUpperCase()}`)}
                  className="w-full py-3 rounded-xl bg-[#072654] hover:bg-[#0c2f6d] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay with {selectedWallet} (₹{amount.toLocaleString('en-IN')})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Sandbox Helpers & Cancel Action */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Test Sandbox
            </span>
            <button
              type="button"
              onClick={() => handleProcessPayment('TEST_INSTANT_SUCCESS')}
              className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Instantly simulates successful payment confirmation"
            >
              ⚡ Instant Success
            </button>
            <button
              type="button"
              onClick={handleSimulateDecline}
              className="text-[11px] font-extrabold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Simulates payment decline by bank"
            >
              Simulate Decline
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Prompt */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000000] bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-sm">Cancel Payment?</h4>
            <p className="text-xs text-slate-500">
              Your flight/hotel booking has not been confirmed yet. If you cancel, no amount will be deducted and your reservation will not be issued.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Continue Payment
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
