import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, ShieldAlert, AlertTriangle, Lock, ShieldCheck, CheckCheck, PhoneCall, AlertCircle, Clock } from 'lucide-react';
import { BiddingChatMessage, SanitizationResult } from '../../types';
import { checkChatAntiLeakage } from '../../utils/sanitize';
import { initiateContactUnlockPayment } from '../../utils/razorpay';

interface BiddingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripRequestId: string;
  senderId: string;
  senderRole: 'user' | 'vendor';
  senderMaskedName: string;
  recipientMaskedName: string;
}

export const BiddingChatModal: React.FC<BiddingChatModalProps> = ({
  isOpen,
  onClose,
  tripRequestId,
  senderId,
  senderRole,
  senderMaskedName,
  recipientMaskedName
}) => {
  const [messages, setMessages] = useState<BiddingChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [warningModalText, setWarningModalText] = useState<string | null>(null);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  
  // Contact Unlock State
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<'locked' | 'payment_pending' | 'vendor_pending' | 'unlocked'>('locked');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tripRequestId) {
      fetchChatHistory();
      checkUnlockStatus();
    }
  }, [isOpen, tripRequestId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/bids/chat/${tripRequestId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.history || []);
      }
    } catch (e) {
      console.error("Failed to fetch chat history:", e);
    }
  };

  const checkUnlockStatus = async () => {
    try {
      const res = await fetch(`/api/bids/unlock-status/${tripRequestId}`);
      const data = await res.json();
      if (data.success) {
        setUnlockStatus(data.status);
      }
    } catch (e) {
      console.error("Failed to fetch unlock status", e);
    }
  };

  const handleContactUnlock = () => {
    setShowUnlockModal(true);
  };

  const handleVendorUnlockResolve = async (action: 'accept' | 'decline') => {
    setLoading(true);
    try {
      const res = await fetch('/api/bids/unlock-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripRequestId, action })
      });
      const data = await res.json();
      if (data.success) {
        setUnlockStatus(data.status);
        if (action === 'accept') {
          // Once unlocked, optionally post a system message to chat
          setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            tripRequestId,
            senderId: 'system',
            senderRole: 'vendor',
            senderMaskedName: 'System',
            text: '📞 Contact Details Shared: +91 9876543210, user@example.com',
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const processUnlockPayment = async () => {
    setLoading(true);
    initiateContactUnlockPayment(
      49,
      tripRequestId,
      async (response) => {
        // Payment success, notify backend
        try {
          await fetch('/api/bids/unlock-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tripRequestId, userId: senderId, paymentId: response.razorpay_payment_id })
          });
          setUnlockStatus('vendor_pending');
          setShowUnlockModal(false);
          alert("Payment Successful! Awaiting vendor consent to share contact details.");
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Payment failed", error);
        alert("Payment Failed");
        setLoading(false);
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    // 1. Client-side Anti-Leakage Check
    const localSanitization: SanitizationResult = checkChatAntiLeakage(inputText);

    if (!localSanitization.isSanitized) {
      const newStrikes = strikeCount + 1;
      setStrikeCount(newStrikes);
      setWarningModalText(
        `🚨 ANTI-LEAKAGE INTERCEPTED!\n\n${localSanitization.warningMessage}\n\nViolations detected: ${localSanitization.violationsDetected.join(', ')}\n\nStrike Warning: ${newStrikes}/3. Accounts reaching 3 strikes will be permanently suspended.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bids/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripRequestId,
          senderId,
          senderRole,
          senderMaskedName,
          text: inputText,
          imageUrl: selectedImage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => [...prev, data.message]);
        setInputText('');
        setSelectedImage(null);
      } else if (data.warning) {
        setStrikeCount(data.strikes || strikeCount + 1);
        setWarningModalText(`🚨 ${data.error || 'Blocked'}\n\n${data.warning}`);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-50/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`bg-gradient-to-r from-slate-50 ${senderRole === "user" ? "via-sky-950" : "via-pink-50"} to-slate-50 text-slate-900 p-4 flex items-center justify-between border-b border-white/10 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${senderRole === "user" ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-100 border-slate-200 text-slate-700"} flex items-center justify-center`}>
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm">{recipientMaskedName}</h3>
                <span className="bg-emerald-500/20 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" /> Masked & Protected
                </span>
              </div>
              <p className="text-[11px] text-slate-700">RouTripO Sealed In-App Communications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {senderRole === 'user' && unlockStatus !== 'unlocked' && (
              <button
                onClick={handleContactUnlock}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3 h-3" /> Unlock Contact (₹49 + Taxes)
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-900 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notices & Banners */}
        {unlockStatus === 'vendor_pending' && senderRole === 'vendor' ? (
          <div className="bg-slate-50 border-slate-200 border-b px-4 py-3 flex flex-col gap-2 text-sm shrink-0">
            <div className="flex items-start gap-2">
              <PhoneCall className="w-5 h-5 shrink-0 mt-0.5 text-pink-600" />
              <div className="flex-1">
                <h4 className="font-bold text-pink-900">User Requested Direct Contact</h4>
                <p className="text-xs mt-1 text-slate-700">The user has paid ₹49 + Taxes to request your direct phone number. If you accept, your contact details will be shared in this chat. If you decline, their fee will be refunded.</p>
                <div className="flex items-center gap-2 mt-3">
                  <button 
                    onClick={() => handleVendorUnlockResolve('decline')}
                    disabled={loading}
                    className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleVendorUnlockResolve('accept')}
                    disabled={loading}
                    className="bg-[#1A365D] hover:bg-[#1A365D]/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow transition-all"
                  >
                    Accept & Share Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : unlockStatus === 'vendor_pending' && senderRole === 'user' ? (
          <div className="bg-sky-500/10 border-sky-500/20 text-sky-800 border-b px-4 py-2 flex items-center gap-2 text-[11px] font-medium shrink-0">
            <Clock className="w-4 h-4 shrink-0 text-sky-600" />
            <span>Payment successful. Waiting for vendor to accept your direct contact request...</span>
          </div>
        ) : unlockStatus !== 'unlocked' ? (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-800 font-medium shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Strict Anti-Leakage Active: Sharing phone, email, numbers or social handles is strictly blocked to protect your booking.</span>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-emerald-800 font-medium shrink-0">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct Contact Unlocked. Vendor has consented to share details.</span>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs">
              <Lock className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <p>No messages yet. Send a message to discuss trip details or inclusions safely.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === senderId || m.senderRole === senderRole;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-600 font-medium mb-1 px-1">{m.senderMaskedName}</span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? senderRole === "user" ? "bg-gradient-to-r from-sky-500 to-sky-700 text-slate-900 rounded-br-none" : "bg-gradient-to-r from-pink-500 to-pink-700 text-slate-900 rounded-br-none"
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="Attached" className="w-full max-h-48 object-cover rounded-xl mb-2 border border-white/20" />
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? senderRole === "user" ? "text-sky-800" : "text-pink-800" : 'text-slate-600'}`}>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-700" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-100 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
              <span className="text-xs text-slate-600 font-medium">Image attached</span>
            </div>
            <button onClick={() => setSelectedImage(null)} className="text-slate-600 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <label className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-all shrink-0">
            <ImageIcon className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text message (Phone numbers/emails blocked)..."
            className={`flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 ${senderRole === "user" ? "focus:ring-sky-500/40" : "focus:ring-pink-500/40"}`}
          />
          <button
            type="submit"
            disabled={loading || (!inputText.trim() && !selectedImage)}
            className={`${senderRole === "user" ? "bg-[#FF6B6B] hover:bg-[#FF6B6B]/90" : "bg-[#1A365D] hover:bg-[#1A365D]/90"} disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Contact Leakage Warning Modal */}
      {warningModalText && (
        <div className="fixed inset-0 z-[100000] bg-slate-100/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border-2 border-red-500/40 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
            </div>
            <h3 className="font-black text-lg text-slate-900">Contact Details Blocked!</h3>
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
              {warningModalText}
            </p>
            <button
              onClick={() => setWarningModalText(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-slate-900 font-bold py-3 rounded-xl text-xs shadow-lg transition-all"
            >
              I Understand & Agree to Rules
            </button>
          </div>
        </div>
      )}
      {/* Contact Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-[100000] bg-slate-100/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h3 className="font-black text-lg text-slate-900 text-center">Unlock Direct Contact</h3>
            
            <div className="text-xs text-slate-700 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 leading-relaxed">
              <p>
                Paying <strong>₹49 + Taxes</strong> unlocks direct phone and email contact with this vendor. 
              </p>
              <div className="bg-red-500/10 text-red-700 p-2 rounded-xl border border-red-500/20 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> RouTripO is an intermediary. We bear zero liability for offline financial deals.
                </span>
              </div>
              <p className="text-[10px] text-slate-600">
                * If the vendor declines to share their contact, your ₹49 + Taxes will be fully refunded to your wallet.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowUnlockModal(false)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={processUnlockPayment}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition-all"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay ₹49 + Taxes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
