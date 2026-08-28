import React, { useState } from 'react';
import { 
  Building2, 
  Car, 
  ShieldCheck, 
  Compass as Sparkles, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  MapPin, 
  Image as ImageIcon, 
  Send, 
  ArrowLeft, 
  Tag, 
  Clock, 
  AlertCircle,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { useVendorStore, VendorApplication } from '../../store/useVendorStore';

interface VendorRegistrationScreenProps {
  onBack?: () => void;
  onSubmittedSuccess?: (app: VendorApplication) => void;
}

const SAMPLE_HOTEL_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
];

const SAMPLE_CAB_PHOTOS = [
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'
];

export const VendorRegistrationScreen: React.FC<VendorRegistrationScreenProps> = ({
  onBack,
  onSubmittedSuccess
}) => {
  const { addApplication } = useVendorStore();

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Hotel' | 'Cab'>('Hotel');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pricingDetails, setPricingDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_HOTEL_PHOTOS[0]);
  const [licenseGst, setLicenseGst] = useState('');
  const [description, setDescription] = useState('');

  const [submittedApp, setSubmittedApp] = useState<VendorApplication | null>(null);

  const handleQuickDemoFill = (type: 'Hotel' | 'Cab') => {
    if (type === 'Hotel') {
      setCategory('Hotel');
      setOwnerName('Ramesh Deshmukh');
      setBusinessName('Sula Valley Heritage Villa & Stay');
      setEmail('ramesh@sulavalleyvillas.com');
      setPhone('+91 98221 44556');
      setCity('Nashik');
      setAddress('Gangapur Dam Road, Goverdhan Village, Nashik');
      setPricingDetails('₹6,500/night (Private Villa with Vineyard View)');
      setPhotoUrl('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');
      setLicenseGst('27AABCU1122R1Z8');
      setDescription('Luxury 3-bedroom private pool villa facing Sula Vineyards with organic chef breakfast included.');
    } else {
      setCategory('Cab');
      setOwnerName('Sunil Patil');
      setBusinessName('Patil Travels & Expressway SUV Fleet');
      setEmail('sunil@patiltravels.in');
      setPhone('+91 98901 22334');
      setCity('Nashik');
      setAddress('Parijat Nagar, College Road, Nashik');
      setPricingDetails('₹22/km (Toyota Innova Crysta VIP 7-Seater)');
      setPhotoUrl('https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600');
      setLicenseGst('27AABCP9988K1Z5');
      setDescription('Top-tier air-conditioned Innova Crysta & Ertiga cabs with trained expressway drivers.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !businessName || !phone || !licenseGst) {
      alert("Please fill in all required fields including GST / License number.");
      return;
    }

    const app = addApplication({
      ownerName,
      businessName,
      email: email || 'vendor@routripo.com',
      phone,
      category,
      city: city || 'Nashik',
      address,
      pricingDetails: pricingDetails || (category === 'Hotel' ? '₹4,500/night' : '₹20/km'),
      photoUrls: [photoUrl],
      licenseGst,
      description
    });

    setSubmittedApp(app);
    if (onSubmittedSuccess) onSubmittedSuccess(app);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300 flex-1 overflow-y-auto pb-32">
      
      {/* Top Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct B2B Vendor Network
            </span>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              Bypass API Middlemen
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            List Your Hotel or Cab Fleet on RouTriO
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl font-medium leading-relaxed">
            Partner directly with RouTriO to receive direct traveler bookings with zero third-party aggregator commissions. Your inventory is automatically prioritized on search results with a verified badge.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Direct Payouts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> RouTriO Verified Priority Search
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Customer Phone Leads
            </span>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal / Banner */}
      {submittedApp ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-emerald-950 animate-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                Application Received • Reference ID: {submittedApp.id}
              </span>
              <h2 className="text-xl font-black text-emerald-900">
                Congratulations, {submittedApp.ownerName}! Your Application is Under Review.
              </h2>
              <p className="text-xs text-emerald-800 font-medium">
                Our Admin Operations team will verify your GST/License details ({submittedApp.licenseGst}) within 24 hours. Once approved, <span className="font-bold">{submittedApp.businessName}</span> will be listed as a RouTriO Verified Direct Partner!
              </p>
            </div>
          </div>

          {/* Submitted Summary Box */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 text-xs space-y-2 text-slate-800">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-500">Business Name:</span>
              <span className="font-black text-slate-900">{submittedApp.businessName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-500">Category & Location:</span>
              <span className="font-black text-slate-900">{submittedApp.category} • {submittedApp.city}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-500">Pricing Terms:</span>
              <span className="font-black text-emerald-600">{submittedApp.pricingDetails}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-500">Status:</span>
              <span className="inline-flex items-center gap-1 font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                <Clock className="w-3 h-3" /> PENDING ADMIN APPROVAL
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setSubmittedApp(null)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Submit Another Registration
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2.5 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl hover:bg-emerald-100/50 cursor-pointer"
              >
                Return to Search Tab
              </button>
            )}
          </div>
        </div>
      ) : (

        /* Registration Form */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Direct Supplier Application Form
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Fill out your property or fleet details for admin approval and priority listing.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Demo Fill:</span>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('Hotel')}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
              >
                + Demo Hotel
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('Cab')}
                className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
              >
                + Demo Cab Fleet
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                1. Select Inventory Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('Hotel');
                    if (!photoUrl || photoUrl === SAMPLE_CAB_PHOTOS[0]) setPhotoUrl(SAMPLE_HOTEL_PHOTOS[0]);
                  }}
                  className={`p-4 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    category === 'Hotel'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${category === 'Hotel' ? 'text-purple-600' : 'text-slate-400'}`} />
                  Hotel / Resort / Villa Owner
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('Cab');
                    if (!photoUrl || photoUrl === SAMPLE_HOTEL_PHOTOS[0]) setPhotoUrl(SAMPLE_CAB_PHOTOS[0]);
                  }}
                  className={`p-4 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    category === 'Cab'
                      ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Car className={`w-5 h-5 ${category === 'Cab' ? 'text-orange-600' : 'text-slate-400'}`} />
                  Car / Cab / SUV Fleet Owner
                </button>
              </div>
            </div>

            {/* Business & Owner Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Property / Fleet Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={category === 'Hotel' ? 'e.g. Express Inn & Suites' : 'e.g. Royal Express Cabs'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Authorized Manager Name *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98220 12345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@business.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Primary City / Destination *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nashik, Goa, Shirdi, Mumbai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Pricing Details / Rates *
                </label>
                <input
                  type="text"
                  value={pricingDetails}
                  onChange={(e) => setPricingDetails(e.target.value)}
                  placeholder={category === 'Hotel' ? 'e.g. ₹4,800/night' : 'e.g. ₹21/km'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {/* License / GST */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Business Registration / License / GST Number *
                </label>
                <input
                  type="text"
                  value={licenseGst}
                  onChange={(e) => setLicenseGst(e.target.value)}
                  placeholder="e.g. 27AABCU9603R1ZM (GST) or Municipal License No."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Used by RouTriO Admin team to verify legitimacy before granting the "RouTriO Verified" badge.
                </p>
              </div>

              {/* Photo URL */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Primary Property / Vehicle Photo URL *
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />

                {/* Preset Selection */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Sample Photos:</span>
                  {(category === 'Hotel' ? SAMPLE_HOTEL_PHOTOS : SAMPLE_CAB_PHOTOS).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold text-slate-600 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      Sample {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Address / Pickup Point
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Pathardi Phata, Mumbai-Agra Highway, Nashik"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Description / Amenities / Fleet Specifications
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your property rooms, amenities (WiFi, Pool, Breakfast) or cab features (AC, Captain seats, Expressway driver)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

            </div>

            {/* Live Search Card Preview */}
            {businessName && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-white">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Search Card Preview (When Approved)
                </div>

                <div className="bg-white rounded-2xl overflow-hidden border border-emerald-300 ring-2 ring-emerald-400/20 shadow-md text-slate-900 flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-44 h-32 shrink-0">
                    <img src={photoUrl} alt={businessName} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-300 fill-emerald-800" />
                      <span>RouTriO Verified</span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                        Direct Partner Margin
                      </span>
                      <span className="text-xs font-black text-emerald-600">{pricingDetails}</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 truncate">{businessName}</h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{address || city || 'Location Verified'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GST: {licenseGst || 'PENDING'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setOwnerName('');
                  setBusinessName('');
                  setEmail('');
                  setPhone('');
                  setCity('');
                  setAddress('');
                  setPricingDetails('');
                  setLicenseGst('');
                  setDescription('');
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Submit Direct Vendor Application
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
