import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, MapPin, Calendar, Star, Navigation, Palmtree, Users } from "lucide-react";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";
import { useAuthStore } from "../../store/useAuthStore";

export interface HolidaySearchParams {
  location: string;
  theme?: string;
  startDate?: string;
  travelers?: number;
}

export interface HolidayBookingCoordinatorProps {
  initialSearchParams: HolidaySearchParams;
  onExit: () => void;
}

const mockPackages = [
  {
    id: "pkg1",
    name: "Maldives Honeymoon Special",
    location: "Maldives",
    duration: "5 Nights, 6 Days",
    price: 45000,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=800",
    includes: ["Flights", "4 Star Hotel", "Meals", "Transfers"]
  },
  {
    id: "pkg2",
    name: "Bali Adventure & Relax",
    location: "Bali, Indonesia",
    duration: "6 Nights, 7 Days",
    price: 38000,
    rating: 4.6,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    includes: ["4 Star Hotel", "Sightseeing", "Meals", "Transfers"]
  },
  {
    id: "pkg3",
    name: "Dubai Luxury Getaway",
    location: "Dubai, UAE",
    duration: "4 Nights, 5 Days",
    price: 32000,
    rating: 4.9,
    reviews: 342,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    includes: ["Flights", "5 Star Hotel", "Desert Safari", "Burj Khalifa"]
  }
];

export const HolidayBookingCoordinator: React.FC<HolidayBookingCoordinatorProps> = ({
  initialSearchParams,
  onExit
}) => {
  const [step, setStep] = useState<"results" | "checkout">("results");
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.currentUser);
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBook = (pkg: any) => {
    setSelectedPkg(pkg);
    setStep("checkout");
  };

  const handlePaymentSuccess = (response: any) => {
    setPaymentSuccess(true);
    setShowPayment(false);
  };

  if (paymentSuccess && selectedPkg) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-pink-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8 max-w-sm">
            Your holiday package to {selectedPkg.location} has been successfully booked. Check your email for the itinerary.
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 w-full max-w-md mb-8 text-left">
            <div className="text-sm text-slate-500 mb-1">Booking Reference</div>
            <div className="text-xl font-bold text-slate-900 mb-4">HLD-{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            <div className="text-sm text-slate-500 mb-1">Package</div>
            <div className="text-lg font-bold text-slate-900">{selectedPkg.name}</div>
          </div>
          <button
            onClick={onExit}
            className="w-full max-w-md py-4 rounded-xl font-bold bg-[var(--premium-violet)] text-white shadow-lg hover:shadow-xl transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--premium-page)] text-[var(--premium-ink)] overflow-y-auto font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => step === "checkout" ? setStep("results") : onExit()}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate flex-1 min-w-0">
                  {step === "results" ? "Holiday Packages" : "Review Booking"}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--premium-violet)] text-white border border-transparent">
                  {step === "results" ? "Step 1" : "Step 2"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {initialSearchParams.location} • {initialSearchParams.travelers || 2} Travelers
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center">
              <Palmtree className="w-12 h-12 text-sky-500 animate-bounce mb-4" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Finding Best Deals</h2>
              <p className="text-slate-500">Curating top holiday packages for {initialSearchParams.location}...</p>
            </div>
          </div>
        ) : step === "results" ? (
          <div className="space-y-4">
            {mockPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                <div className="w-full md:w-64 h-48 md:h-auto relative bg-slate-200 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                    {pkg.rating} ({pkg.reviews})
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {pkg.location}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {pkg.duration}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.includes.map(inc => (
                        <span key={inc} className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md">
                          {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-2xl font-black text-[var(--premium-violet)]">₹{pkg.price}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">per person</div>
                    </div>
                    <button 
                      onClick={() => handleBook(pkg)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                    >
                      View & Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedPkg && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4">Lead Traveler Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--premium-violet)]" placeholder="John" defaultValue={currentUser?.name ? currentUser.name.split(" ")[0] : ""} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--premium-violet)]" placeholder="Doe" defaultValue={currentUser?.name && currentUser.name.split(" ").length > 1 ? currentUser.name.split(" ").slice(1).join(" ") : ""} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--premium-violet)]" placeholder="john@example.com" defaultValue={currentUser?.email || ""} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">Price Summary</h3>
                <div className="space-y-3 text-sm mb-4 pb-4 border-b border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Price (x{initialSearchParams.travelers || 2})</span>
                    <span className="font-bold text-slate-900">₹{(selectedPkg.price * (initialSearchParams.travelers || 2))}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Taxes & Fees</span>
                    <span className="font-bold text-slate-900">₹{Math.round(selectedPkg.price * 0.18)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-slate-900">Total Amount</span>
                  <span className="text-xl font-black text-[var(--premium-violet)]">
                    ₹{(selectedPkg.price * (initialSearchParams.travelers || 2)) + Math.round(selectedPkg.price * 0.18)}
                  </span>
                </div>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3.5 bg-[var(--premium-violet)] hover:opacity-95 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Razorpay Modal */}
      <RazorpayPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={(selectedPkg?.price * (initialSearchParams.travelers || 2)) + Math.round(selectedPkg?.price * 0.18) || 0}
        serviceName="RoutTripo Holidays"
        orderDescription={selectedPkg?.name || "Holiday Package"}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
