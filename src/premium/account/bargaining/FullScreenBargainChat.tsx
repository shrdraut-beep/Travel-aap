import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  Phone,
  AlertTriangle,
  X,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { BargainingRequest, VendorBid } from './BargainingTypes';
import { obfuscateBargainChatText, renderObfuscatedMessageContent } from './BargainingChatObfuscator';
import { initiateBargainMicroPayment } from '../../../utils/razorpay';

interface FullScreenBargainChatProps {
  request: BargainingRequest;
  bid: VendorBid;
  onBack: () => void;
  onAcceptAndLock: (bid: VendorBid) => void;
  lang?: string;
}

export const FullScreenBargainChat: React.FC<FullScreenBargainChatProps> = ({
  request,
  bid,
  onBack,
  onAcceptAndLock,
  lang = 'en'
}) => {
  // Deal unlock state: restored typing keyboard only post-payment or post-offline unlock
  const [isUnlocked, setIsUnlocked] = useState<boolean>(request.status === 'Confirmed');
  const [warningToast, setWarningToast] = useState<string | null>(null);

  // Numeric dialer state
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [dialerAmount, setDialerAmount] = useState<string>(
    Math.max(bid.totalPrice - 1500, 5000).toString()
  );

  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: 'vendor' | 'user';
    text: string;
    time: string;
    offer?: { price: number; perks?: string };
  }>>([
    {
      id: 1,
      sender: 'vendor',
      text: `Hello! We have submitted our best verified quote for "${request.title}" at ₹${bid.totalPrice.toLocaleString()}. Legal entity: ${bid.legalName || bid.realName}, ${bid.city}. All inclusions & escrow protection are active.`,
      time: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unlockingOffline, setUnlockingOffline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Requirement 2: Readymade Statement Chips
  const readymadeChips = [
    'Can you offer a better price?',
    'Are meals included?',
    'Is this your final offer?',
    'Will AC run continuously in ghats?',
    'Are all tolls & state taxes included?',
    'Can you include airport / station pickup?',
    'What is your free cancellation policy?'
  ];

  const triggerWarningToast = (msg: string) => {
    setWarningToast(msg);
    setTimeout(() => setWarningToast(null), 4000);
  };

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend || input).trim();
    if (!raw) return;

    // Requirement 2 Fallback: Regex check & mask
    const result = obfuscateBargainChatText(raw);

    if (result.hasViolations) {
      triggerWarningToast('Sharing contact details is strictly prohibited before payment.');
    }

    const messageText = result.sanitizedText;
    const userMsgId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (!textToSend) setInput('');

    // Automated vendor response simulator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const lower = raw.toLowerCase();
      let reply = `Thank you for your message! Our registered team at ${bid.city} has reviewed your inquiry.`;
      let revisedPrice: number | undefined;

      if (lower.includes('price') || lower.includes('better') || lower.includes('₹') || lower.includes('final offer')) {
        revisedPrice = Math.max(bid.totalPrice - 1200, 10000);
        reply = `We can offer an exclusive direct adjustment of ₹${revisedPrice.toLocaleString()} for this route. Please lock deal in escrow to confirm this rate!`;
      } else if (lower.includes('meal') || lower.includes('breakfast') || lower.includes('food')) {
        reply = `Yes, complimentary daily breakfast is 100% verified and included in our package.`;
      } else if (lower.includes('ac') || lower.includes('ghat')) {
        reply = `Guaranteed! Dual chilled AC runs continuously throughout the trip including all hill stations and ghats.`;
      } else if (lower.includes('toll') || lower.includes('tax')) {
        reply = `All national highway tolls, state border taxes, and driver allowances are fully covered with zero extra surcharge.`;
      } else if (lower.includes('pickup') || lower.includes('airport')) {
        reply = `Confirmed! Dedicated door-to-door airport or railway station pickup and drop are included.`;
      } else if (lower.includes('cancellation')) {
        reply = `Free 100% cancellation is permitted up to 48 hours before trip commencement. Full refund via escrow.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'vendor',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          offer: revisedPrice ? { price: revisedPrice, perks: 'Special Negotiated Escrow Rate' } : undefined
        }
      ]);
    }, 1200);
  };

  // Requirement 2: Numeric Dialer Send
  const handleDialerSubmit = () => {
    const num = parseInt(dialerAmount, 10);
    if (isNaN(num) || num <= 0) return;
    setIsDialerOpen(false);
    handleSend(`Can you do ₹${num.toLocaleString()} for this trip?`);
  };

  // Requirement 3: Offline direct contact unlock via ₹29 Razorpay payment
  const handlePayOfflineUnlock = () => {
    setUnlockingOffline(true);
    initiateBargainMicroPayment(
      29,
      'vendor_contact_unlock',
      (res) => {
        setUnlockingOffline(false);
        setIsUnlocked(true);
        triggerWarningToast('Payment successful! Direct vendor contact & full typing unlocked.');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'vendor',
            text: `🔓 Direct Contact Unlocked! You can call us directly at ${bid.directPhone} or continue messaging here. Standard keyboard enabled.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      },
      (err) => {
        setUnlockingOffline(false);
        alert('Unlock payment cancelled.');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-50 flex flex-col">
      {/* Warning Toast */}
      {warningToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[130] bg-rose-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-black text-slate-900">{bid.maskedName}</h2>
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {bid.city}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
              Legal Entity: {bid.legalName || bid.realName} · {bid.rating}★
            </p>
          </div>
        </div>

        {/* Current Active Quote */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Quote</span>
          <span className="text-[15px] font-black text-slate-900 font-mono">
            ₹{bid.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sticky Accept & Lock Header Bar */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pink-200 shrink-0" />
          <span className="text-[12px] font-bold truncate">
            {isUnlocked ? 'Verified Deal Ready' : `Lock Quote at ₹${bid.totalPrice.toLocaleString()}?`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isUnlocked && (
            <button
              type="button"
              onClick={handlePayOfflineUnlock}
              disabled={unlockingOffline}
              className="px-2.5 py-1 bg-rose-800/80 hover:bg-rose-900 text-white font-bold text-[11px] rounded-xl border border-rose-500/40 shadow-xs cursor-pointer"
            >
              {unlockingOffline ? 'Unlocking...' : 'Unlock Contact (₹29)'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onAcceptAndLock(bid)}
            className="px-3.5 py-1.5 bg-white text-pink-800 hover:bg-pink-50 font-black text-[12px] rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Accept & Lock</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Pre-payment Zero-Trust Notice */}
        {!isUnlocked ? (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl text-[11px] text-orange-900 flex items-start gap-2.5 max-w-lg mx-auto">
            <Lock className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Zero-Trust Guided Negotiation Active</p>
              <p className="text-orange-800 mt-0.5">
                Free-text typing is disabled before payment to protect your booking. Select readymade statement chips or use the numeric dialer below to counter-bid. Standard typing restores automatically after Accept & Lock or upon ₹29 contact unlock.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-pink-50 border border-pink-200 p-2.5 rounded-2xl text-[11px] text-pink-800 flex items-center gap-2 max-w-lg mx-auto">
            <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              Deal Unlocked! Full standard keyboard typing is active. Direct phone: <strong>{bid.directPhone}</strong>.
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 text-[13px] shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-pink-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">
                {renderObfuscatedMessageContent(msg.text)}
              </p>

              {msg.offer && (
                <div className="mt-2.5 p-2.5 bg-pink-50 border border-pink-200 rounded-xl text-pink-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700">
                      Revised Quote
                    </span>
                    <span className="text-[16px] font-black text-pink-800 font-mono">
                      ₹{msg.offer.price.toLocaleString()}
                    </span>
                  </div>
                  {msg.offer.perks && (
                    <p className="text-[11px] text-pink-700 font-medium mt-0.5">
                      ✓ {msg.offer.perks}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onAcceptAndLock({ ...bid, totalPrice: msg.offer!.price })}
                    className="mt-2 w-full py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-[12px] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Lock Revised ₹{msg.offer.price.toLocaleString()}
                  </button>
                </div>
              )}

              <span
                className={`text-[9px] block mt-1 ${
                  msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs pl-2">
            <span className="font-semibold text-[11px]">{bid.maskedName} is typing</span>
            <span className="animate-pulse">...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Requirement 2: Readymade Statement Chips Carousel */}
      <div className="bg-white border-t border-slate-100 px-4 py-2.5 overflow-x-auto scrollbar-hide flex items-center gap-2">
        {/* Numeric Dialer Trigger Button */}
        <button
          type="button"
          onClick={() => setIsDialerOpen(true)}
          className="shrink-0 bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-black text-[11px] px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Dial Amount</span>
        </button>

        {readymadeChips.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(chip)}
            className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors cursor-pointer active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Requirement 2: Pre-payment vs Post-payment Input Row */}
      <div className="bg-white border-t border-slate-200 p-3">
        {!isUnlocked ? (
          /* Pre-Payment: Free-text keyboard hidden & disabled, guided UI active */
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/80 rounded-2xl p-2.5">
            <div className="flex items-center gap-2 flex-1 text-slate-500 text-xs pl-1">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium text-[11px]">
                Free-text locked pre-payment. Tap chips or dial an offer amount.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDialerOpen(true)}
              className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-black rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
            >
              Numeric Dialer
            </button>
          </div>
        ) : (
          /* Post-Payment or Unlocked: Standard typing restored */
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${bid.maskedName}...`}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-[13px] text-slate-900 focus:outline-hidden focus:border-pink-500"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                input.trim()
                  ? 'premium-gradient-pink text-white cursor-pointer hover:opacity-90 active:scale-95 shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Requirement 2: Interactive Numeric Amount Dialer Modal */}
      {isDialerOpen && (
        <div className="fixed inset-0 z-[125] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-slate-900">Numeric Counter Dialer</h4>
                  <p className="text-[11px] text-slate-500">Current Quote: ₹{bid.totalPrice.toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDialerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Field */}
            <div className="py-4 text-center">
              <span className="text-xs font-bold text-slate-400 block uppercase">Your Target Offer</span>
              <div className="text-[32px] font-black text-slate-900 font-mono tracking-tight">
                ₹{Number(dialerAmount || 0).toLocaleString()}
              </div>
            </div>

            {/* Quick Adjustment Steppers */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[-2000, -1000, -500].map((adj) => (
                <button
                  key={adj}
                  type="button"
                  onClick={() => {
                    const next = Math.max(Number(dialerAmount || 0) + adj, 1000);
                    setDialerAmount(next.toString());
                  }}
                  className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {adj.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') {
                      setDialerAmount('');
                    } else if (key === '⌫') {
                      setDialerAmount((prev) => prev.slice(0, -1));
                    } else {
                      setDialerAmount((prev) => (prev.length < 7 ? prev + key : prev));
                    }
                  }}
                  className={`py-3 rounded-2xl font-black text-base transition-all cursor-pointer ${
                    key === 'C'
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : key === '⌫'
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Submit Counter Button */}
            <button
              type="button"
              onClick={handleDialerSubmit}
              disabled={!dialerAmount || Number(dialerAmount) <= 0}
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              Propose ₹{Number(dialerAmount || 0).toLocaleString()} to Partner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
