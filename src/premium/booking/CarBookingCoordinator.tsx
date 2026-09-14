import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Users,
  Fuel,
  Settings2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Car,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export interface CarSearchParams {
  location: string;
  pickupDate: string;
  dropDate: string;
  passengers: number;
}

export interface CarBookingCoordinatorProps {
  initialSearchParams: CarSearchParams;
  onClose: () => void;
}

const FALLBACK_CARS = [
  {
    id: "car_swift_01",
    title: "Maruti Suzuki Swift",
    category: "Hatchback",
    company: "Maruti Suzuki",
    model: "Swift VXI",
    year: 2023,
    fuelType: "Petrol",
    seats: 5,
    transmission: "Manual",
    pricePerDay: 1500,
    deposit: 2500,
    rating: 4.8,
    trips: 64,
    images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80"],
    features: ["AC", "Bluetooth", "Airbags", "Fastag Enabled", "Power Steering"],
    unlimitedKms: true
  },
  {
    id: "car_creta_02",
    title: "Hyundai Creta SX",
    category: "Compact SUV",
    company: "Hyundai",
    model: "Creta SX (O)",
    year: 2024,
    fuelType: "Diesel",
    seats: 5,
    transmission: "Automatic",
    pricePerDay: 2800,
    deposit: 4000,
    rating: 4.9,
    trips: 92,
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"],
    features: ["Panoramic Sunroof", "Ventilated Seats", "Cruise Control", "Apple CarPlay", "Bose Audio"],
    unlimitedKms: true
  },
  {
    id: "car_ertiga_03",
    title: "Maruti Ertiga ZXI",
    category: "7-Seater MPV",
    company: "Maruti Suzuki",
    model: "Ertiga ZXI+",
    year: 2023,
    fuelType: "Petrol / CNG",
    seats: 7,
    transmission: "Manual",
    pricePerDay: 2400,
    deposit: 3500,
    rating: 4.7,
    trips: 55,
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"],
    features: ["Spacious 7-Seater", "Rear AC Vents", "Large Boot", "Push Button Start"],
    unlimitedKms: false
  },
  {
    id: "car_thar_04",
    title: "Mahindra Thar 4x4",
    category: "Adventure SUV",
    company: "Mahindra",
    model: "Thar LX Hard Top",
    year: 2024,
    fuelType: "Diesel",
    seats: 4,
    transmission: "Automatic",
    pricePerDay: 3800,
    deposit: 6000,
    rating: 4.9,
    trips: 110,
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    features: ["4x4 Low Range", "Convertible/Hardtop", "High Ground Clearance", "Offroad Tires"],
    unlimitedKms: true
  }
];

export const CarBookingCoordinator: React.FC<CarBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose
}) => {
  const [step, setStep] = useState<"results" | "details" | "checkout">("results");
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);

  // Add-ons
  const [addZeroDep, setAddZeroDep] = useState(true);
  const [addExtraDriver, setAddExtraDriver] = useState(false);

  // Driver details
  const [driverName, setDriverName] = useState("Aditya Patil");
  const [drivingLicense, setDrivingLicense] = useState("MH03 20180045678");
  const [driverPhone, setDriverPhone] = useState("9876543210");
  const [driverEmail, setDriverEmail] = useState("aditya.patil@example.com");
  const [pickupAddress, setPickupAddress] = useState(
    `${initialSearchParams.location || "Mumbai"} Airport T2 Terminal Pickup Zone`
  );

  // Razorpay states
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Fetch cars
  useEffect(() => {
    let isMounted = true;
    const fetchCarList = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/cars/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: initialSearchParams.location || "Mumbai",
            pickupDate: initialSearchParams.pickupDate,
            dropDate: initialSearchParams.dropDate
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results && Array.isArray(data.results) && data.results.length > 0) {
            setCars(data.results);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Car search fallback:", e);
      }

      if (isMounted) {
        setCars(FALLBACK_CARS);
        setIsLoading(false);
      }
    };
    fetchCarList();
    return () => {
      isMounted = false;
    };
  }, [initialSearchParams]);

  const handleSelectCar = (car: any) => {
    setSelectedCar(car);
    setStep("details");
  };

  // 2 days calculation default
  const rentalDays = 2;
  const baseRate = (selectedCar?.pricePerDay || 1800) * rentalDays;
  const zeroDepFee = addZeroDep ? 499 * rentalDays : 0;
  const extraDriverFee = addExtraDriver ? 250 * rentalDays : 0;
  const taxes = Math.round((baseRate + zeroDepFee + extraDriverFee) * 0.12);
  const grandTotal = baseRate + zeroDepFee + extraDriverFee + taxes;

  // STEP 3 Confirmation
  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page)] text-[var(--premium-ink)] py-12 px-4 flex flex-col items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
              Car Rental Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">Vehicle Reserved!</h2>
            <p className="text-xs text-slate-500">
              Booking Ref: <span className="font-bold text-slate-900">{bookingCode}</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
                <span className="font-bold text-slate-900 text-sm">{selectedCar?.title}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                <span className="font-bold text-slate-800">{rentalDays} Days</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Driver:</span>
                <span className="font-semibold text-slate-900">{driverName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>License No:</span>
                <span className="font-mono font-semibold text-slate-900">{drivingLicense}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pickup Location:</span>
                <span className="font-semibold text-slate-900">{pickupAddress}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Insurance:</span>
                <span className="font-bold text-pink-600">{addZeroDep ? "Zero Depreciation Included" : "Standard Cover"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-pink-600">PAID via Razorpay</span>
              </div>
              {paymentId && (
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Razorpay ID:</span>
                  <span className="font-mono font-bold text-sky-700">{paymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => alert(`Downloading Car Rental Agreement for Ref: ${bookingCode}...`)}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Rental Voucher (PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page)] text-[var(--premium-ink)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (step === "checkout") setStep("details");
                else if (step === "details") setStep("results");
                else onClose();
              }}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate flex-1 min-w-0">
                  {step === "results" && `Rental Cars in ${initialSearchParams.location || "Mumbai"}`}
                  {step === "details" && `${selectedCar?.title}`}
                  {step === "checkout" && "Checkout"}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--premium-violet)] text-white border border-transparent">
                  {step === "results" ? "Step 1" : step === "details" ? "Step 2" : "Step 3"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {initialSearchParams.pickupDate} to {initialSearchParams.dropDate} ({rentalDays} Days)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 pb-24">
        {/* STEP 1: CAR RESULTS */}
        {step === "results" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-56 h-40 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-44 bg-slate-200 rounded-md" />
                      <div className="h-4 w-72 bg-slate-100 rounded-md" />
                      <div className="h-8 w-24 bg-slate-200 rounded-md mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              cars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => handleSelectCar(car)}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row cursor-pointer group"
                >
                  <div className="w-full sm:w-56 h-44 bg-slate-100 relative overflow-hidden shrink-0">
                    <img
                      src={car.images?.[0] || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80"}
                      alt={car.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {car.category || "Rental"}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {car.title}
                          </h3>
                          <p className="text-xs text-slate-500">{car.company} · Model {car.year}</p>
                        </div>
                        <span className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-current" /> {car.rating}★
                        </span>
                      </div>

                      {/* Specs Badges */}
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-100 text-center">
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <Users className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                          <span className="text-[10px] font-bold text-slate-700">{car.seats} Seats</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <Settings2 className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                          <span className="text-[10px] font-bold text-slate-700">{car.transmission}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <Fuel className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                          <span className="text-[10px] font-bold text-slate-700">{car.fuelType}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <Sparkles className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                          <span className="text-[10px] font-bold text-slate-700">Unlimited km</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Per Day Rate</span>
                        <div className="text-xl font-black text-slate-900">₹{car.pricePerDay.toLocaleString("en-IN")}</div>
                      </div>
                      <button
                        type="button"
                        className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full group-hover:bg-sky-600 transition-colors"
                      >
                        Reserve Vehicle
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 2: CAR DETAILS & ADDONS */}
        {step === "details" && selectedCar && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-5">
              <img
                src={selectedCar.images?.[0]}
                alt={selectedCar.title}
                className="w-full sm:w-56 h-40 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {selectedCar.rating}★ Rating
                  </span>
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full">
                    Free Cancellation
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedCar.title}</h2>
                <p className="text-xs text-slate-500">{selectedCar.company} · {selectedCar.transmission} · {selectedCar.fuelType}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedCar.features || []).map((f: string, i: number) => (
                    <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight">Select Trip Add-Ons & Protection</h3>

            <div className="space-y-3">
              {/* Zero Dep Card */}
              <div
                onClick={() => setAddZeroDep(!addZeroDep)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  addZeroDep ? "border-sky-500 bg-sky-50/50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    addZeroDep ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {addZeroDep && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Zero Depreciation Damage Protection</h4>
                    <p className="text-xs text-slate-500">Zero liability for accidental scratches or dents during rental</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">+₹499/day</span>
              </div>

              {/* Extra Driver */}
              <div
                onClick={() => setAddExtraDriver(!addExtraDriver)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  addExtraDriver ? "border-sky-500 bg-sky-50/50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    addExtraDriver ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {addExtraDriver && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Authorized Secondary Co-Driver</h4>
                    <p className="text-xs text-slate-500">Legal permission for multiple people to operate vehicle</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">+₹250/day</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">{rentalDays} Days Rental Total</span>
                <span className="text-xl font-black text-slate-900">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="bg-gradient-to-r from-sky-500 to-pink-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20"
              >
                Proceed to Driver Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === "checkout" && selectedCar && (
          <div className="space-y-6">
            {/* Rental Summary */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCar.title}</h3>
                  <p className="text-xs text-slate-500">{rentalDays} Days Rental · {initialSearchParams.location}</p>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  Unlimited Kms
                </span>
              </div>

              {/* Pickup Address */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Pickup & Return Address
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Driver Details Form */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Primary Driver Information</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Driver Full Name (As on Driving License)
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Fare Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Vehicle Tariff ({rentalDays} Days × ₹{selectedCar.pricePerDay}):</span>
                  <span className="font-semibold text-slate-900">₹{baseRate.toLocaleString("en-IN")}</span>
                </div>
                {addZeroDep && (
                  <div className="flex justify-between text-slate-600">
                    <span>Zero Dep Protection:</span>
                    <span className="font-semibold text-slate-900">₹{zeroDepFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {addExtraDriver && (
                  <div className="flex justify-between text-slate-600">
                    <span>Extra Driver Option:</span>
                    <span className="font-semibold text-slate-900">₹{extraDriverFee.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Processing Fee (12%):</span>
                  <span className="font-semibold text-slate-900">₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Amount Payable:</span>
                  <span className="text-xl text-sky-600">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Razorpay CTA */}
            <button
              type="button"
              onClick={() => {
                if (!driverName.trim()) {
                  alert("Please enter driver's name.");
                  return;
                }
                setIsRazorpayOpen(true);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-pink-600 py-4 px-6 text-white font-bold text-base shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>Pay ₹{grandTotal.toLocaleString("en-IN")} with Razorpay</span>
            </button>
          </div>
        )}
      </div>

      {/* Razorpay Gateway Modal */}
      <RazorpayPaymentModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={grandTotal}
        serviceName="Car Rental Booking"
        orderDescription={`${selectedCar?.title} (${rentalDays} Days)`}
        customerName={driverName}
        customerEmail={driverEmail}
        customerPhone={driverPhone}
        onSuccess={(details) => {
          setIsRazorpayOpen(false);
          setPaymentId(details.razorpay_payment_id);
          const ref = `CAR${Math.floor(100000 + Math.random() * 900000)}`;
          setBookingCode(ref);
          setIsConfirmed(true);
        }}
        onFailure={(err) => {
          setIsRazorpayOpen(false);
          alert(`Car rental payment failed: ${err}`);
        }}
      />
    </div>
  );
};
