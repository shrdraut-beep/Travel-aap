import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Send,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Paperclip,
  PhoneCall
} from 'lucide-react';
import { BookingStepHeader } from '../../booking/BookingStepHeader';
import { BargainingTrip, VendorBidOffer, ChatMessage } from './types';

interface FullScreenChatViewProps {
  trip: BargainingTrip;
  offer: VendorBidOffer;
  onBack: () => void;
  onAcceptAndLock: () => void;
}

export const FullScreenChatView: React.FC<FullScreenChatViewProps> = ({
  trip,
  offer,
  onBack,
  onAcceptAndLock
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: `🔒 Safe Bargaining Room Active. Real contact details are protected under RouTripO Escrow. Complete 'Accept & Lock' to unmask direct contact numbers.`,
      time: '10:00 AM'
    },
    {
      id: 'm2',
      sender: 'vendor',
      text: `Hello Sir/Madam! We have placed our competitive quote of ₹${offer.totalPrice.toLocaleString('en-IN')} for your ${trip.route}. Our ${offer.vehicleOrRoomTitle} is in immaculate condition with verified chauffeur.`,
      time: '10:02 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Check anti-leakage filter
    const phoneRegex = /\b\d{10}\b|\b\d{5}\s\d{5}\b/;
    if (phoneRegex.test(inputText)) {
      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `⚠️ Phone numbers and personal contacts cannot be shared prior to Escrow Lock for your safety. Please use the sticky 'ACCEPT & LOCK' button above to securely unlock direct phone access.`,
          time: 'Just now'
        }
      ]);
      setInputText('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: 'Just now'
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulated vendor response after 1 second
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: 'vendor',
          text: `Understood! We can confirm all those requirements. Please click 'ACCEPT & LOCK' above so we can reserve this vehicle for your dates right away.`,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  const sendQuickChip = (chipText: string) => {
    setInputText(chipText);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-900 animate-in fade-in duration-150">
      {/* Top Header */}
      <BookingStepHeader
        title={
          <span className="flex items-center gap-1.5">
            <span className="truncate">{offer.maskedPartnerName}</span>
            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" title="Online" />
          </span>
        }
        subtitle={<>★ {offer.rating} · {offer.vehicleOrRoomTitle}</>}
        onBack={onBack}
        backAriaLabel="Back"
        maxWidth="max-w-2xl"
        rightElement={
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Escrow Monitored</span>
          </div>
        }
      />

      {/* Requirement 6: STICKY "ACCEPT & LOCK" BUTTON DIRECTLY INSIDE CHAT */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white px-4 py-2.5 shadow-md shrink-0 border-b border-pink-500/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-pink-100">
              Active Vendor Quote
            </p>
            <p className="text-[16px] font-black tracking-tight text-white leading-none">
              ₹{offer.totalPrice.toLocaleString('en-IN')}{' '}
              <span className="text-[11px] font-normal text-pink-200">all-inclusive</span>
            </p>
          </div>

          {/* Sticky Accept & Lock Action */}
          <button
            type="button"
            onClick={onAcceptAndLock}
            className="px-5 py-2 rounded-2xl bg-white text-pink-950 font-black text-[13px] shadow-sm hover:bg-pink-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-pink-600" />
            <span>ACCEPT & LOCK DEAL</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map(msg => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="bg-sky-50/80 border border-sky-200/80 text-sky-950 rounded-2xl p-3 text-[11px] font-medium flex items-start gap-2 max-w-md mx-auto text-center"
              >
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="text-left leading-relaxed">{msg.text}</span>
              </div>
            );
          }

          const isMe = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-3xl text-[13px] leading-relaxed shadow-2xs ${
                  isMe
                    ? 'bg-slate-900 text-white rounded-br-xs'
                    : 'bg-white text-slate-900 border border-slate-200/70 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 px-1">
                {msg.time}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Quick Negotiate Chips */}
      <div className="bg-white border-t border-slate-100 px-4 py-2 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Quick Ask:
          </span>
          {[
            'Can we do ₹35,000 all-inclusive?',
            'Is luggage roof carrier ready?',
            'Can you do 5:30 AM pickup?',
            'Is driver allowance fully covered?'
          ].map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => sendQuickChip(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <footer className="bg-white border-t border-slate-200 p-3 shrink-0">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Message ${offer.maskedPartnerName}...`}
            className="flex-1 bg-slate-100 text-[13px] font-medium px-4 py-2.5 rounded-2xl border border-transparent focus:border-slate-300 focus:bg-white focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-800 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
};
