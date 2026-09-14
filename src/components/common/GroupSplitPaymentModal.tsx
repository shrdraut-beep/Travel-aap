import React, { useState } from 'react';
import { 
  Users, 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Sparkles, 
  ShieldCheck,
  CreditCard,
  UserPlus
} from 'lucide-react';
import QRCode from 'qrcode';

export interface GroupSplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  bookingRef: string;
  title: string;
}

export const GroupSplitPaymentModal: React.FC<GroupSplitPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  bookingRef,
  title
}) => {
  const [friendCount, setFriendCount] = useState<number>(3);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const perPersonAmount = Math.ceil(totalAmount / Math.max(1, friendCount));
  const upiPayUrl = `upi://pay?pa=routripo@razorpay&pn=RoutTripo&am=${perPersonAmount}&tn=Split%20Booking%20${bookingRef}`;

  // Generate dynamic QR Code for the split share
  React.useEffect(() => {
    QRCode.toDataURL(upiPayUrl, { width: 220, margin: 1 })
      .then(url => setQrCodeDataUrl(url))
      .catch(e => console.warn("Failed to generate UPI QR code:", e));
  }, [upiPayUrl]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiPayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `✈️ *RoutTripo Group Travel Split Payment*
━━━━━━━━━━━━━━━━━━━━
Hey team! Here is the split share for our *${title}* booking (Ref: *${bookingRef}*).

👥 *Total Group Members:* ${friendCount}
💰 *Your Share:* ₹${perPersonAmount.toLocaleString('en-IN')}

📲 *Pay via UPI:*
${upiPayUrl}

_Please complete payment so our group reservation remains confirmed._
━━━━━━━━━━━━━━━━━━━━
_Powered by RoutTripo — Travel Smart & Split Seamlessly_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Split Booking with Friends</span>
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                RoutTripo Instant Group UPI Split &amp; WhatsApp Links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Total Booking Amount:</span>
            <span className="font-extrabold text-slate-900 text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700">Number of Travelers in Group:</span>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFriendCount(num)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                    friendCount === num
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Per Person Calculated Share */}
        <div className="text-center p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
            Each Person's Share ({friendCount} Friends)
          </span>
          <div className="text-3xl font-black text-indigo-700 font-mono">
            ₹{perPersonAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium block">
            Includes all taxes &amp; convenience charges
          </span>
        </div>

        {/* UPI QR Code Preview */}
        {qrCodeDataUrl && (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <img src={qrCodeDataUrl} alt="UPI Payment QR Code" className="w-40 h-40 object-contain rounded-lg border border-slate-100" />
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scan using GPay, PhonePe, or Paytm to pay ₹{perPersonAmount.toLocaleString('en-IN')}</span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Split Link to Friends on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyUPI}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "UPI Payment Link Copied!" : "Copy Direct UPI Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
