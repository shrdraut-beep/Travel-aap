import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Scale, 
  Handshake, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Wallet, 
  Users, 
  PhoneCall, 
  Mail, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ROUTRIPO_LEGAL_POLICIES, LEGAL_COMPANY_INFO } from '../../data/legalPolicies';

export type SupportTopic = 
  | 'guarantee' 
  | 'terms' 
  | 'privacy' 
  | 'cancellation' 
  | 'bargaining' 
  | 'faq';

interface SupportDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: SupportTopic;
  isMr?: boolean;
}

// User Account Comprehensive Q&A derived from codebase
interface AccountFAQ {
  id: string;
  category: 'account' | 'wallet' | 'passengers' | 'security' | 'preferences' | 'safety' | 'bargain';
  categoryLabel: string;
  categoryLabelMr: string;
  question: string;
  questionMr: string;
  answer: string;
  answerMr: string;
}

const ACCOUNT_FAQS: AccountFAQ[] = [
  // 1. Profile & Account
  {
    id: 'faq-1',
    category: 'account',
    categoryLabel: 'Profile & Account',
    categoryLabelMr: 'प्रोफाईल आणि खाते',
    question: 'How do I edit my personal details and avatar in RouTripo?',
    questionMr: 'मी माझी वैयक्तिक माहिती आणि प्रोफाईल फोटो (अवतार) कसा बदलू?',
    answer: 'Tap your Profile hero card or the "Change" action at the top of your Profile Hub. You can update your Full Name, Phone Number, Email Address, and choose from curated traveler avatars. All changes save directly to your secure user record.',
    answerMr: 'तुमच्या प्रोफाईल कार्डवर टॅप करून तुम्ही तुमचे पूर्ण नाव, मोबाईल नंबर, ईमेल आयडी आणि प्रवासी अवतार बदलू शकता. सर्व माहिती सुरक्षितपणे सेव्ह होते.'
  },
  {
    id: 'faq-2',
    category: 'account',
    categoryLabel: 'Profile & Account',
    categoryLabelMr: 'प्रोफाईल आणि खाते',
    question: 'What do the green checkmarks next to my phone and email signify?',
    questionMr: 'माझ्या मोबाईल आणि ईमेल शेजारील हिरवी टिक (Green Checkmark) काय दर्शवते?',
    answer: 'The green checkmarks indicate that your phone number and email address are cryptographically verified and bound to your account credentials for secure two-factor authentication and official IRCTC / airline ticket delivery.',
    answerMr: 'हिरवी टिक दर्शवते की तुमचा फोन नंबर आणि ईमेल पडताळणीकृत (Verified) आहेत. यामुळे तुमचे तिकीट आणि ओटीपी सुरक्षितपणे मिळतात.'
  },
  // 2. Closed-Loop Travel Wallet (RBI PPI Compliant)
  {
    id: 'faq-3',
    category: 'wallet',
    categoryLabel: 'Closed Travel Wallet',
    categoryLabelMr: 'क्लोज्ड ट्रॅव्हल वॉलेट',
    question: 'What is the RouTripo Closed Travel Wallet and why can it not be cashed out?',
    questionMr: 'ROUTRIPO क्लोज्ड ट्रॅव्हल वॉलेट म्हणजे काय आणि यातील पैसे बँकेत का काढता येत नाहीत?',
    answer: 'The RouTripo Wallet is an RBI-compliant Closed System Prepaid Payment Instrument (PPI) governed under Master Direction DPSS.CO.PD.No.1164/02.14.006/2017-18. Per Section 2.1 of RBI regulations, closed wallet balances cannot be transferred to a bank account or withdrawn as physical cash; they are strictly dedicated to travel ticketing, hotel stays, and cab rides on RouTripo.',
    answerMr: 'भारतीय रिझर्व्ह बँक (RBI) च्या Master Direction नियमांनुसार हे क्लोज्ड सिस्टीम वॉलेट आहे. यातील पैसे बँकेत ट्रान्सफर करता येत नाहीत किंवा एटीएममधून काढता येत नाहीत; ते फक्त राऊट्रिपोवर प्रवास बुकिंगसाठी वापरता येतात.'
  },
  {
    id: 'faq-4',
    category: 'wallet',
    categoryLabel: 'Closed Travel Wallet',
    categoryLabelMr: 'क्लोज्ड ट्रॅव्हल वॉलेट',
    question: 'How do I top up funds using Razorpay Payment Gateway?',
    questionMr: 'मी Razorpay गेटवे वापरून वॉलेटमध्ये पैसे कसे ॲड करू?',
    answer: 'Open the Wallet card on your Profile tab, choose a quick amount (+₹500, +₹1,000, +₹2,000, +₹5,000) or enter a custom amount up to ₹50,000, and tap "Proceed to Pay & Top-Up". The official Razorpay Gateway will launch, supporting PhonePe, Google Pay, live UPI QR Code, RuPay/Visa/Mastercard, and NetBanking with instant wallet crediting.',
    answerMr: 'वॉलेट कार्डवर क्लिक करून रक्कम निवडा आणि "Proceed to Pay & Top-Up" वर टॅप करा. अधिकृत Razorpay पेमेंट गेटवे उघडेल, जिथे PhonePe, Google Pay, UPI QR, कार्ड्स किंवा नेटबँकिंगने सुरक्षित पेमेंट करता येते.'
  },
  {
    id: 'faq-5',
    category: 'wallet',
    categoryLabel: 'Closed Travel Wallet',
    categoryLabelMr: 'क्लोज्ड ट्रॅव्हल वॉलेट',
    question: 'How are RouTripo Coins converted and merged into my wallet balance?',
    questionMr: 'RouTripo कॉईन्सचे पैशांमध्ये रूपांतर कसे होते आणि ते वॉलेटमध्ये कसे जुळतात?',
    answer: 'RouTripo Coins are converted at a guaranteed 10 Coins = ₹1 INR ratio. The system automatically merges your coin cash value into your unified Wallet balance so you can use your accumulated savings on any flight, bus, train, or hotel booking.',
    answerMr: '१० RouTripo कॉईन्स = ₹१ अशी खात्रीशीर किंमत असते. तुमची नाणी स्वयंचलितपणे रुपयांमध्ये रूपांतरित होऊन एकूण वॉलेट बॅलन्समध्ये जोडली जातात.'
  },
  // 3. Master Passenger List
  {
    id: 'faq-6',
    category: 'passengers',
    categoryLabel: 'Master Passenger List',
    categoryLabelMr: 'मास्टर पॅसेंजर लिस्ट',
    question: 'What is the Master Passenger List and how does 1-click booking work?',
    questionMr: 'मास्टर पॅसेंजर लिस्ट म्हणजे काय आणि १-क्लिक बुकिंग कसे कार्य करते?',
    answer: 'The Master Passenger List allows you to securely store details of your family and co-travellers (Full Name as per Govt ID, Age, Gender, ID Type & Number, and Meal Preference). During checkout on flights, trains, or hotels, you can select any passenger with a single tap to auto-fill booking forms in under 1 second.',
    answerMr: 'यामध्ये तुम्ही कुटुंब आणि सह-प्रवाशांची माहिती (नाव, वय, आधार/पासपोर्ट, जेवणाचे प्राधान्य) सेव्ह करू शकता. बुकिंग करताना फक्त एका क्लिकवर सर्व फॉर्म आपोआप भरला जातो.'
  },
  {
    id: 'faq-7',
    category: 'passengers',
    categoryLabel: 'Master Passenger List',
    categoryLabelMr: 'मास्टर पॅसेंजर लिस्ट',
    question: 'Can I add or remove co-travellers anytime?',
    questionMr: 'मी कधीही सह-प्रवासी जोडू किंवा डिलीट करू शकतो का?',
    answer: 'Yes! Tap "Master Passenger List" in the Account & Security section, click "+ Add Co-Traveller" to enter new traveler details, or click the Trash icon next to any non-primary passenger to remove them immediately.',
    answerMr: 'होय! Account & Security मधील "Master Passenger List" वर जाऊन तुम्ही कधीही नवीन प्रवासी जोडू शकता किंवा डिलीट करू शकता.'
  },
  // 4. Security & 2-Factor Authentication
  {
    id: 'faq-8',
    category: 'security',
    categoryLabel: 'Security & 2FA',
    categoryLabelMr: 'सुरक्षा व २-फॅक्टर ऑथ',
    question: 'How do Biometric FaceID/TouchID and SMS OTP protect my account?',
    questionMr: 'बायोमेट्रिक FaceID/TouchID आणि SMS OTP खात्याचे संरक्षण कसे करतात?',
    answer: 'Under Security & 2FA, you can enable Biometric FaceID/TouchID prompt for high-value travel bookings, enforce SMS OTP verification on new device logins, and activate instant security alerts. These zero-trust controls ensure no unauthorized transactions occur.',
    answerMr: 'Security & 2FA मध्ये तुम्ही बायोमेट्रिक फेसआयडी/फिंगरप्रिंट आणि SMS OTP चालू करू शकता, ज्यामुळे अनोळखी व्यक्ती तुमचे खाते वापरू शकत नाही.'
  },
  {
    id: 'faq-9',
    category: 'security',
    categoryLabel: 'Security & 2FA',
    categoryLabelMr: 'सुरक्षा व २-फॅक्टर ऑथ',
    question: 'How do I see active login sessions and log out of other devices?',
    questionMr: 'माझे खाते इतर कोणत्या डिव्हाइसवर चालू आहे हे कसे पाहावे आणि लॉग आऊट कसे करावे?',
    answer: 'Open "Security & 2-Factor Auth" from your Profile. Under "Active Devices & Sessions", you will see all logged-in devices with their OS, location, and IP address. Tap "Log Out Other Devices" to immediately invalidate all other active tokens.',
    answerMr: 'Security & 2-Factor Auth उघडून "Active Devices & Sessions" मध्ये तुमची सर्व डिव्हाइसेस दिसतील. तिथे "Log Out Other Devices" वर टॅप करून इतर डिव्हाइसेसवरून लॉग आऊट करता येते.'
  },
  // 5. Travel & Booking Preferences
  {
    id: 'faq-10',
    category: 'preferences',
    categoryLabel: 'Travel Preferences',
    categoryLabelMr: 'प्रवास व बुकिंग प्राधान्ये',
    question: 'What preferences can I set and how are they used during flight/hotel search?',
    questionMr: 'मी कोणती प्राधान्ये सेट करू शकतो आणि बुकिंग करताना ती कशी वापरली जातात?',
    answer: 'Under "Travel Preferences", you can configure your Default Departure Airport (e.g. BOM Mumbai, PNQ Pune), Meal Preference (Veg, Non-Veg, Jain, Vegan, Diabetic), Seat Choice (Window, Aisle, Extra Legroom), Hotel Room Type (King Bed, Balcony), and Outstation Cab (Prime Sedan, SUV, Electric EV). The booking engine automatically applies these as defaults during flight and stay searches.',
    answerMr: 'Travel Preferences मध्ये तुम्ही तुमचे विमानतळ, जेवण (Veg, Non-Veg, Jain, Diabetic), सीट (Window, Aisle), हॉटेल रूम आणि कॅब टाईप सेव्ह करू शकता. बुकिंग करताना हे आपोआप निवडले जाते.'
  },
  // 6. Guardian SOS & Safety
  {
    id: 'faq-11',
    category: 'safety',
    categoryLabel: 'Safety & SOS',
    categoryLabelMr: 'सुरक्षा आणि आपत्कालीन SOS',
    question: 'How does the Guardian SOS Network operate in an emergency?',
    questionMr: 'आपत्कालीन परिस्थितीत Guardian SOS Network कसे काम करते?',
    answer: 'Tapping "Guardian SOS Network" opens the emergency safety console. It acquires your real-time GPS coordinates via device geolocation, triggers an audible high-decibel siren alarm to deter threats, and broadcasts your live map link to pre-configured family emergency contacts.',
    answerMr: 'Guardian SOS Network वर क्लिक करताच ते तुमचे लाईव्ह GPS लोकेशन शोधून कुटुंबियांना पाठवते आणि सायरन अलार्म वाजवून तातडीची मदत मिळवून देते.'
  },
  {
    id: 'faq-12',
    category: 'safety',
    categoryLabel: 'Safety & SOS',
    categoryLabelMr: 'सुरक्षा आणि आपत्कालीन SOS',
    question: 'What is the Live Trip Location Beacon toggle in Settings?',
    questionMr: 'Settings मधील "Live Trip Location Beacon" टॉगल काय करते?',
    answer: 'When enabled, the Location Beacon automatically shares encrypted, real-time trip progress with your designated emergency contacts during active journey hours, turning off automatically once you check in at your destination.',
    answerMr: 'हे चालू केल्यास प्रवासादरम्यान तुमचे थेट लोकेशन तुमच्या कुटुंबासोबत आपोआप शेअर केले जाते आणि प्रवासाअंती थांबवले जाते.'
  },
  // 7. Bargaining & Escrow Guarantee
  {
    id: 'faq-13',
    category: 'bargain',
    categoryLabel: 'Bargaining & Escrow',
    categoryLabelMr: 'बार्गेनिंग आणि एस्क्रो गॅरंटी',
    question: 'How does the 100% ROUTRIPO Escrow Guarantee protect my money?',
    questionMr: '१००% ROUTRIPO Escrow Guarantee माझ्या पैशांचे रक्षण कसे करते?',
    answer: 'When you book a trip or negotiate a fare, your funds are secured in a dedicated escrow account. The vendor/hotel/agent is only paid after your travel check-in is confirmed. If a vendor cancels or fails to deliver, 100% of your funds are instantly refunded to your wallet or source account.',
    answerMr: 'तुम्ही पैसे भरल्यावर ते सुरक्षित एस्क्रो खात्यात जमा राहतात. तुम्ही प्रवासासाठी पोहोचल्यानंतरच संबंधित हॉटेल किंवा एजंटला पैसे दिले जातात. जर त्यांनी सेवा दिली नाही, तर पूर्ण पैसे त्वरित परत मिळतात.'
  },
  {
    id: 'faq-14',
    category: 'account',
    categoryLabel: 'Profile & Account',
    categoryLabelMr: 'खाते व डेटा सुरक्षा',
    question: 'What happens when I click "Delete Account & Data"?',
    questionMr: '"Delete Account & Data" वर क्लिक केल्यावर काय होते?',
    answer: 'In compliance with the Digital Personal Data Protection (DPDP) Act 2023, initiating account deletion permanently purges your personal profile, saved co-travellers, session logs, and authentication tokens from our database after confirming identity verification.',
    answerMr: 'DPDP Act कायद्यानुसार तुमचे खाते, सेव्ह केलेले प्रवासी आणि सर्व वैयक्तिक डेटा आमच्या सर्व्हरवरून कायमचा नष्ट केला जातो.'
  }
];

export const SupportDrawerModal: React.FC<SupportDrawerModalProps> = ({
  isOpen,
  onClose,
  topic,
  isMr = false
}) => {
  // FAQ state
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-3');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accepted policies persisted in localStorage
  const [acceptedPolicies, setAcceptedPolicies] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('routripo_user_accepted_policies');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAcceptPolicy = (policyId: string, policyName: string) => {
    const updated = { ...acceptedPolicies, [policyId]: true };
    setAcceptedPolicies(updated);
    try {
      localStorage.setItem('routripo_user_accepted_policies', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(isMr ? `${policyName} यशस्वीरित्या स्वीकारले गेले!` : `${policyName} accepted & recorded!`);
  };

  const renderAcceptanceSection = (policyId: string, policyName: string) => {
    const isAccepted = Boolean(acceptedPolicies[policyId]);
    const isChecked = Boolean(checkedState[policyId] || isAccepted);

    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/90 shadow-2xs space-y-3 mt-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              setCheckedState((prev) => ({ ...prev, [policyId]: e.target.checked }));
            }}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0 accent-blue-600"
          />
          <div className="text-xs text-slate-700">
            <p className="font-bold text-slate-900 leading-snug">
              {isMr 
                ? `मी ${policyName} च्या सर्व अटी वाचल्या असून मला त्या पूर्णपणे मान्य आहेत.` 
                : `I have read, understood, and accept the ${policyName} terms.`}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMr 
                ? 'हे स्वीकारल्याने तुमच्या खात्यावर या अटी लागू राहतील.' 
                : 'Consent is cryptographically logged for your account under Indian IT & DPDP regulations.'}
            </p>
          </div>
        </label>

        <button
          type="button"
          disabled={!isChecked}
          onClick={() => handleAcceptPolicy(policyId, policyName)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            isAccepted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : isChecked
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isAccepted ? 'text-white' : 'text-blue-200'}`} />
          <span>
            {isAccepted 
              ? (isMr ? 'स्वीकृत झाले (Accepted & Active)' : 'Policy Accepted & Active') 
              : (isMr ? 'अटी स्वीकारा (Accept Policy)' : 'Accept Policy Terms')}
          </span>
        </button>
      </div>
    );
  };

  // Policy search state
  const [policySearch, setPolicySearch] = useState<string>('');

  if (!isOpen) return null;

  // Find policy content if topic corresponds to a legal policy
  const policyMap: Record<string, string> = {
    'terms': 'terms',
    'privacy': 'privacy',
    'cancellation': 'cancellation-refund',
    'bargaining': 'bargaining-bidding'
  };

  const currentPolicy = policyMap[topic] 
    ? ROUTRIPO_LEGAL_POLICIES.find(p => p.id === policyMap[topic]) 
    : null;

  // Filtered FAQs
  const filteredFaqs = ACCOUNT_FAQS.filter((faq) => {
    const matchesCat = faqCategory === 'all' || faq.category === faqCategory;
    const q = faqSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) ||
      faq.questionMr.toLowerCase().includes(q) ||
      faq.answerMr.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Outfit',sans-serif]"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Bottom Sheet Modal (Slides up from the bottom: "khalun warti yenara") */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-2xl border-t border-slate-200 max-h-[88vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast notification */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-0 mx-auto z-50 max-w-xs px-4 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
              <span>{toastMessage}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Mobile Pull Handle Pill */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header (Specific to the opened topic) */}
        <div className="px-5 py-3 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            {topic === 'guarantee' && (
              <div className="w-9 h-9 rounded-xl bg-[#006591] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            {topic === 'terms' && (
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
            )}
            {topic === 'privacy' && (
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
            )}
            {topic === 'cancellation' && (
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
            )}
            {topic === 'bargaining' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Handshake className="w-5 h-5" />
              </div>
            )}
            {topic === 'faq' && (
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 leading-tight truncate">
                {topic === 'guarantee' && (isMr ? 'ROUTRIPO गॅरंटी व एस्क्रो संरक्षण' : 'ROUTRIPO Guarantee & Escrow')}
                {topic === 'terms' && (isMr ? 'नियम आणि अटी (Terms & Conditions)' : 'Terms & Conditions')}
                {topic === 'privacy' && (isMr ? 'गोपनीयता धोरण (Privacy Policy)' : 'Privacy Policy & DPDP Act')}
                {topic === 'cancellation' && (isMr ? 'रद्दीकरण व परतावा धोरण' : 'Cancellation & Refund Policy')}
                {topic === 'bargaining' && (isMr ? 'बार्गेनिंग व बिडिंग नियम' : 'Bargaining & Bidding Fair-Play Rules')}
                {topic === 'faq' && (isMr ? 'ग्राहक साहाय्य आणि वारंवार विचारले जाणारे प्रश्न' : 'Customer Helpdesk & Account FAQs')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {topic === 'guarantee' && '100% Escrow Protection, Zero Host Default Guarantee'}
                {topic === 'terms' && 'Platform agreement, ticketing & carriage rules'}
                {topic === 'privacy' && 'Digital Personal Data Protection (DPDP) Act 2023 compliant'}
                {topic === 'cancellation' && 'Instant wallet refund timelines & cancellation slab policy'}
                {topic === 'bargaining' && 'Anti-sniping, dynamic bidding & escrow lock safeguards'}
                {topic === 'faq' && 'Official answers based strictly on user account features'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* ========================================================= */}
          {/* 1. TOPIC: GUARANTEE */}
          {/* ========================================================= */}
          {topic === 'guarantee' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/90 shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-6 h-6 text-sky-700" />
                  <h4 className="text-sm font-bold text-sky-950 uppercase tracking-wide">
                    100% Escrow Deposit Security
                  </h4>
                </div>
                <p className="text-xs text-sky-900 leading-relaxed">
                  Every rupee paid on RouTripo is placed into a secured escrow account. Funds are released to travel operators, hotels, or airlines strictly after your journey has commenced or you have verified check-in at your stay.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Zero Host Default Protection</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      If a verified vendor or hotel cancels your confirmed reservation, RouTripo automatically re-accommodates you or issues an instant 100% credit back to your Closed Travel Wallet.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Instant Wallet Crediting</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      No 7-14 day bank wait times. Eligible refunds arrive within 60 seconds into your RouTripo Wallet balance for immediate re-booking.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">24x7 Escrow Dispute Concierge</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Our dispute arbitration team operates round-the-clock. Call toll-free 1800-ROUTRIPO or email <span className="font-mono text-slate-700">support@routripo.com</span> for instant dispute intervention.
                    </p>
                  </div>
                </div>
              </div>

              {/* Policy Acceptance Section for Guarantee */}
              {renderAcceptanceSection('guarantee', isMr ? 'ROUTRIPO गॅरंटी व एस्क्रो संरक्षण' : 'ROUTRIPO Guarantee & Escrow')}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. TOPIC: LEGAL POLICIES (Terms, Privacy, Cancellation, Bargaining) */}
          {/* ========================================================= */}
          {currentPolicy && (
            <div className="space-y-4">
              {/* Summary Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Executive Summary: </span>
                {currentPolicy.summary}
              </div>

              {/* Policy Sections */}
              <div className="space-y-3">
                {currentPolicy.sections.map((sec, idx) => (
                  <div key={sec.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>{sec.title}</span>
                    </h4>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Statutory details */}
              <div className="p-3 rounded-xl bg-slate-100 text-[10px] text-slate-500 space-y-0.5 font-mono">
                <p>Governing Entity: {LEGAL_COMPANY_INFO.entityName}</p>
                <p>CIN: {LEGAL_COMPANY_INFO.cin}</p>
                <p>Jurisdiction: {LEGAL_COMPANY_INFO.jurisdiction}</p>
                <p>Grievance Officer: {LEGAL_COMPANY_INFO.grievanceOfficer}</p>
              </div>

              {/* Policy Acceptance Section */}
              {renderAcceptanceSection(currentPolicy.id, currentPolicy.title)}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TOPIC: CUSTOMER HELPDESK & FAQS (Codebase Grounded) */}
          {/* ========================================================= */}
          {topic === 'faq' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder={isMr ? "प्रश्नांमध्ये शोधा (उदा. Wallet, 2FA, Refund)..." : "Search account questions (e.g. Wallet, 2FA, Refund)..."}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All FAQs', labelMr: 'सर्व प्रश्न' },
                  { id: 'wallet', label: 'Wallet & Razorpay', labelMr: 'वॉलेट व पेमेंट' },
                  { id: 'security', label: 'Security & 2FA', labelMr: 'सुरक्षा' },
                  { id: 'passengers', label: 'Passengers', labelMr: 'प्रवासी यादी' },
                  { id: 'safety', label: 'Guardian SOS', labelMr: 'आपत्कालीन सुरक्षा' },
                  { id: 'preferences', label: 'Preferences', labelMr: 'प्राधान्ये' },
                  { id: 'bargain', label: 'Escrow Guarantee', labelMr: 'एस्क्रो गॅरंटी' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFaqCategory(cat.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      faqCategory === cat.id
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isMr ? cat.labelMr : cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion Items */}
              <div className="space-y-2">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-1">
                              <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                {isMr ? faq.categoryLabelMr : faq.categoryLabel}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {isMr ? faq.questionMr : faq.question}
                            </h4>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40 animate-in fade-in duration-150">
                            {isMr ? faq.answerMr : faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No FAQs match your search query. Try another keyword.
                  </div>
                )}
              </div>

              {/* Contact Support Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Still need travel assistance?</p>
                    <p className="text-[11px] text-amber-800">24x7 Helpline: 1800-ROUTRIPO</p>
                  </div>
                </div>
                <a
                  href="mailto:support@routripo.com"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official RouTripo Legal &amp; Support Console</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {isMr ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportDrawerModal;
