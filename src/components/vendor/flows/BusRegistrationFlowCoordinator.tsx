import React, { useState, useEffect, useRef } from 'react';
import {
  Bus, MapPin, Clock, Calendar, ShieldCheck, CheckCircle2,
  AlertTriangle, ArrowRight, ArrowLeft, Plus, Trash2, Users, Sparkles
} from 'lucide-react';
import { CommonFlowHeader } from '../../common/CommonFlowHeader';
import { PriceTaxBreakdownBadge } from '../PriceTaxBreakdownBadge';
import { useVendorStore, type BusItem } from '../../../store/useVendorStore';
import { taxationConfigService } from '../../../services/tax/TaxationConfigService';

export interface BusRegistrationFlowCoordinatorProps {
  onClose: () => void;
  onBusRegistered?: (bus: BusItem) => void;
  onSuccess?: (bus: BusItem) => void;
  vendorId?: string;
  isMr?: boolean;
}

export type BusFlowStep = 1 | 2 | 3 | 4;

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const BusRegistrationFlowCoordinator: React.FC<BusRegistrationFlowCoordinatorProps> = ({
  onClose,
  onBusRegistered,
  onSuccess,
  vendorId = 'VEND-1001',
  isMr = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { addBus } = useVendorStore();
  const [currentStep, setCurrentStep] = useState<BusFlowStep>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [operatorName, setOperatorName] = useState('Sai Royal Express');
  const [registrationNumber, setRegistrationNumber] = useState('MH 14 BT 9988');
  const [busType, setBusType] = useState('2x1 AC Sleeper');
  const [totalSeats, setTotalSeats] = useState('32');
  const [routeFrom, setRouteFrom] = useState('Pune');
  const [routeTo, setRouteTo] = useState('Goa (Panaji)');
  const [departureTime, setDepartureTime] = useState('21:00');
  const [arrivalTime, setArrivalTime] = useState('06:30');
  const [vendorNetPrice, setVendorNetPrice] = useState('850');
  const [weekendNetPrice, setWeekendNetPrice] = useState('1050');
  const [customerPrice, setCustomerPrice] = useState('950');
  const [driverName, setDriverName] = useState('Raju Patil');
  const [driverContact, setDriverContact] = useState('9876543210');
  const [runsOn, setRunsOn] = useState<string[]>(['Mon', 'Wed', 'Fri', 'Sat', 'Sun']);

  // Sync Customer Price from Net Price using taxationConfigService
  useEffect(() => {
    const net = Number(vendorNetPrice) || 0;
    if (net > 0) {
      const calc = taxationConfigService.calculateUserPrice(net, 'BUS');
      setCustomerPrice(String(calc.finalUserPrice));
    }
  }, [vendorNetPrice]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentStep]);

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!operatorName.trim() || !registrationNumber.trim()) {
        setErrorMsg(isMr ? 'कृपया ऑपरेटर नाव व बस क्रमांक भरा!' : 'Please enter operator name and bus registration number!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!routeFrom.trim() || !routeTo.trim()) {
        setErrorMsg(isMr ? 'कृपया मूळ व गंतव्य शहर भरा!' : 'Please enter origin and destination cities!');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!vendorNetPrice || Number(vendorNetPrice) <= 0) {
        setErrorMsg(isMr ? 'कृपया वैध वेंडर नक्त तिकीट दर भरा!' : 'Please enter valid net ticket price!');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BusFlowStep);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const net = Number(vendorNetPrice) || 850;
      const calc = taxationConfigService.calculateUserPrice(net, 'BUS');

      const newBus: any = {
        id: `bus-${Date.now()}`,
        vendor_id: vendorId,
        operator_name: operatorName,
        registration_number: registrationNumber.toUpperCase(),
        bus_type: busType,
        total_capacity: Number(totalSeats) || 32,
        route: {
          source: routeFrom,
          destination: routeTo
        },
        pricing: {
          base_fare: calc.finalUserPrice,
          vendor_net_price: net,
          weekend_fare: Number(weekendNetPrice) || 1050
        },
        driver_details: {
          name: driverName,
          contact: driverContact
        },
        schedule: {
          runs_on_type: runsOn.length === 7 ? 'DAILY' : 'SPECIFIC',
          specific_days: runsOn
        },
        status: 'AVAILABLE',
        created_at: new Date().toISOString()
      };

      addBus(newBus);
      onBusRegistered?.(newBus);
      onSuccess?.(newBus);
      onClose();
    } catch (err) {
      console.warn('Bus registration error:', err);
      setErrorMsg(isMr ? 'बस नोंदणी करताना त्रुटी आली.' : 'Failed to register bus route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return isMr ? 'पायरी १: बस ऑपरेटर व वाहन माहिती' : 'Step 1: Bus Identity & Operator Details';
      case 2: return isMr ? 'पायरी २: मार्ग, वेळापत्रक व स्टॉप्स' : 'Step 2: Route, Timings & Daily Schedule';
      case 3: return isMr ? 'पायरी ३: आसन क्षमता व तिकीट दर (GST/IGST)' : 'Step 3: Seat Capacity & Net Tariff with Live IGST';
      case 4: return isMr ? 'पायरी ४: चालक तपशील व अंतिम पब्लिश' : 'Step 4: Driver KYC & Publish Bus Route';
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      <CommonFlowHeader
        title={isMr ? 'आंतरशहरी बस मार्ग नोंदणी' : 'Register Intercity Bus Route'}
        subtitle={getStepSubtitle()}
        step={isMr ? `पायरी ${currentStep} पैकी ४` : `Step ${currentStep} of 4`}
        currentStep={currentStep}
        totalSteps={4}
        onBack={handleBack}
        onClose={onClose}
        backAriaLabel="Back to previous step"
        closeAriaLabel="Exit to bus routes panel"
      />

      <main className="max-w-3xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: BUS IDENTITY */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'ट्रॅव्हल्स / ऑपरेटर नाव *' : 'Agency / Operator Name *'}
                  </label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Sai Royal Express"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'बस नोंदणी क्रमांक (RTO) *' : 'Bus Registration Number *'}
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    placeholder="MH 14 BT 9988"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-black text-slate-900 tracking-wider uppercase outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Bus Category & Layout
                  </label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="2x1 AC Sleeper">2x1 AC Sleeper (Single + Double Berths)</option>
                    <option value="2x2 AC Pushback Seater">2x2 AC Pushback Seater</option>
                    <option value="Volvo Multi-Axle AC Sleeper">Volvo Multi-Axle Luxury AC Sleeper</option>
                    <option value="BharatBenz AC Sleeper">BharatBenz AC Sleeper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Total Passenger Capacity
                  </label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROUTE & TIMINGS */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'प्रारंभ शहर (Origin City) *' : 'Origin City *'}
                  </label>
                  <input
                    type="text"
                    value={routeFrom}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    placeholder="e.g. Pune / Mumbai"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'गंतव्य शहर (Destination City) *' : 'Destination City *'}
                  </label>
                  <input
                    type="text"
                    value={routeTo}
                    onChange={(e) => setRouteTo(e.target.value)}
                    placeholder="e.g. Goa (Panaji) / Bangalore"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Days of Week Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Operating Days
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => {
                    const active = runsOn.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (active) setRunsOn(runsOn.filter(d => d !== day));
                          else setRunsOn([...runsOn, day]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TARIFF & DYNAMIC GST/IGST */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    {isMr ? 'वेंडर नक्त तिकीट दर (Net Payout / Seat) *' : 'Vendor Net Ticket Price / Seat (₹) *'}
                  </label>
                  <input
                    type="number"
                    value={vendorNetPrice}
                    onChange={(e) => setVendorNetPrice(e.target.value)}
                    placeholder="850"
                    className="w-full h-11 rounded-xl border border-emerald-300 bg-emerald-50/20 px-3 text-sm font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
                    {isMr ? 'शुक्रवार-रविवार विकेंड दर (Weekend Net)' : 'Weekend Special Net Tariff (₹)'}
                  </label>
                  <input
                    type="number"
                    value={weekendNetPrice}
                    onChange={(e) => setWeekendNetPrice(e.target.value)}
                    placeholder="1050"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Dynamic Live GST & IGST Badge */}
              <PriceTaxBreakdownBadge
                vendorNetPrice={Number(vendorNetPrice) || 0}
                vertical="BUS"
                unitLabel="/ Seat"
                isMr={isMr}
              />
            </div>
          </div>
        )}

        {/* STEP 4: DRIVER & PUBLISH */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{operatorName}</h3>
                    <p className="text-xs text-slate-500">{routeFrom} &rarr; {routeTo} ({departureTime} - {arrivalTime})</p>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {busType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Driver Mobile Contact
                  </label>
                  <input
                    type="tel"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-700">Passenger Ticket: ₹{customerPrice}/Seat</span>
                <span className="text-emerald-700 font-bold">Net Payout: ₹{vendorNetPrice}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? (isMr ? 'रद्द करा' : 'Cancel') : (isMr ? 'मागे' : 'Previous Step')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              Step {currentStep} of 4
            </span>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition"
              >
                <span>{isMr ? 'पुढील पायरी' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 sm:px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? (isMr ? 'पब्लिश होत आहे...' : 'Publishing...') : (isMr ? 'बस मार्ग पब्लिश करा' : 'Publish Bus Route')}</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusRegistrationFlowCoordinator;
