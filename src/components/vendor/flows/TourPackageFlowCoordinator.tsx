import React, { useState, useEffect, useRef } from 'react';
import {
  Package, MapPin, Calendar, Clock, DollarSign, Hotel, Car,
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Image as ImageIcon,
  Plus, Trash2, Sparkles, Tag, AlertCircle, Eye
} from 'lucide-react';
import { CommonFlowHeader } from '../../common/CommonFlowHeader';
import { PriceTaxBreakdownBadge } from '../PriceTaxBreakdownBadge';
import { taxationConfigService } from '../../../services/tax/TaxationConfigService';
import { packageService, type TourPackage } from '../../../services/packages/PackageService';

export interface TourPackageFlowCoordinatorProps {
  vendorId?: string;
  onClose: () => void;
  onSuccess?: (pkg: Partial<TourPackage>) => void;
  isMr?: boolean;
}

export type TourFlowStep = 1 | 2 | 3 | 4 | 5 | 6;

export const TourPackageFlowCoordinator: React.FC<TourPackageFlowCoordinatorProps> = ({
  vendorId = 'vnd-agency-01',
  onClose,
  onSuccess,
  isMr = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = useState<TourFlowStep>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 State: Logistics & Route
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [originCity, setOriginCity] = useState('Mumbai');
  const [pickupPoint, setPickupPoint] = useState('');
  const [pickupTime, setPickupTime] = useState('06:00 AM');
  const [dropPoint, setDropPoint] = useState('');
  const [theme, setTheme] = useState('Beach & Coastal');
  const [tourType, setTourType] = useState('Fixed Departure Group');
  const [maxGroupSize, setMaxGroupSize] = useState('25');

  // Step 2 State: Itinerary & Meals
  const [durationDays, setDurationDays] = useState(4);
  const [itinerary, setItinerary] = useState<Array<{
    dayNumber: number;
    title: string;
    overnightCity: string;
    activities: string;
    meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  }>>([
    {
      dayNumber: 1,
      title: 'Arrival & Welcome Dinner',
      overnightCity: 'North Goa',
      activities: 'Hotel check-in, leisure sunset at Calangute Beach, welcome dinner.',
      meals: { breakfast: false, lunch: false, dinner: true }
    },
    {
      dayNumber: 2,
      title: 'North Goa Sightseeing & Water Sports',
      overnightCity: 'North Goa',
      activities: 'Fort Aguada, Anjuna Beach, Baga water sports complex.',
      meals: { breakfast: true, lunch: false, dinner: true }
    },
    {
      dayNumber: 3,
      title: 'South Goa Heritage & River Cruise',
      overnightCity: 'South Goa',
      activities: 'Old Goa Churches, Mangueshi Temple, evening Mandovi river cruise.',
      meals: { breakfast: true, lunch: false, dinner: true }
    },
    {
      dayNumber: 4,
      title: 'Souvenir Shopping & Departure',
      overnightCity: 'Departure',
      activities: 'Panjim Latin Quarter walk, check-out and drop at airport/station.',
      meals: { breakfast: true, lunch: false, dinner: false }
    }
  ]);

  // Step 3 State: Accommodation & Fleet
  const [hotelStarRating, setHotelStarRating] = useState('3-Star Comfort');
  const [roomType, setRoomType] = useState('Deluxe AC Room');
  const [vehicleType, setVehicleType] = useState('AC Tempo Traveller / AC Coach');
  const [tollParkingIncluded, setTollParkingIncluded] = useState(true);

  // Step 4 State: Commercials & Live GST/IGST
  const [vendorNetPrice, setVendorNetPrice] = useState('14500');
  const [pricePerPerson, setPricePerPerson] = useState('16900');
  const [tripleSharingPrice, setTripleSharingPrice] = useState('13500');
  const [childWithBedPrice, setChildWithBedPrice] = useState('9500');
  const [childNoBedPrice, setChildNoBedPrice] = useState('6500');
  const [advanceBookingPercent, setAdvanceBookingPercent] = useState('25');

  // Step 5 State: Inclusions & Policies
  const [inclusions, setInclusions] = useState<string[]>([
    'Accommodation in AC Deluxe Rooms',
    'Daily Breakfast & Dinner as per meal plan',
    'All AC transport, toll taxes, parking & driver allowance',
    'Sightseeing tours with local destination coordinator'
  ]);
  const [newInclusion, setNewInclusion] = useState('');

  const [exclusions, setExclusions] = useState<string[]>([
    'Airfare / Train tickets to origin city',
    'Personal expenses, room service & laundry',
    'Monument entry tickets & water sports activity charges'
  ]);
  const [newExclusion, setNewExclusion] = useState('');

  const [cancellationPolicy, setCancellationPolicy] = useState(
    '15+ days prior: 100% refund minus ₹1,000 processing fee. 7-14 days prior: 50% refund. Less than 7 days: Non-refundable.'
  );
  const [batchDates, setBatchDates] = useState<string[]>([
    '2026-10-15',
    '2026-10-22',
    '2026-11-05'
  ]);
  const [newBatchDate, setNewBatchDate] = useState('');

  // Step 6 State: Photos & Preview
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'
  );

  // Synchronize pricePerPerson when vendorNetPrice changes
  useEffect(() => {
    const net = Number(vendorNetPrice) || 0;
    if (net > 0) {
      const calc = taxationConfigService.calculateUserPrice(net, 'PACKAGE');
      setPricePerPerson(String(calc.finalUserPrice));
    }
  }, [vendorNetPrice]);

  // Reset scroll to top on step transition
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentStep]);

  // 1-Click Fast Pre-fill Templates
  const handleApplyTemplate = (preset: 'goa' | 'rajasthan' | 'kerala') => {
    if (preset === 'goa') {
      setTitle('Goa Coastal Splash & Heritage Tour (4N/5D)');
      setDestination('Goa');
      setOriginCity('Mumbai / Pune');
      setPickupPoint('Dadar Swami Narayan Temple / Swargate');
      setDropPoint('Same as pickup');
      setTheme('Beach & Coastal');
      setVendorNetPrice('14500');
    } else if (preset === 'rajasthan') {
      setTitle('Royal Rajasthan Heritage Circuit: Jaipur, Jodhpur & Udaipur (6N/7D)');
      setDestination('Rajasthan');
      setOriginCity('Jaipur / Delhi');
      setPickupPoint('Jaipur Airport / Railway Station');
      setDropPoint('Udaipur Airport');
      setTheme('Heritage & Culture');
      setVendorNetPrice('24500');
      setDurationDays(7);
    } else if (preset === 'kerala') {
      setTitle('Kerala Backwaters & Munnar Hills Explorer (5N/6D)');
      setDestination('Kerala');
      setOriginCity('Kochi');
      setPickupPoint('Kochi International Airport');
      setDropPoint('Kochi Airport');
      setTheme('Hill Station & Nature');
      setVendorNetPrice('18900');
      setDurationDays(6);
    }
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!title.trim() || !destination.trim()) {
        setErrorMsg(isMr ? 'कृपया पॅकेजचे नाव आणि गंतव्य भरा!' : 'Please enter package title and destination!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!vendorNetPrice || Number(vendorNetPrice) <= 0) {
        setErrorMsg(isMr ? 'कृपया वैध वेंडर नक्त रक्कम प्रविष्ट करा!' : 'Please enter a valid vendor net price!');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as TourFlowStep);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const net = Number(vendorNetPrice) || 0;
      const calc = taxationConfigService.calculateUserPrice(net, 'PACKAGE');

      const newPkg: any = {
        id: `pkg-${Date.now()}`,
        title,
        package_name: title,
        destination,
        origin_city: originCity,
        pickup_point: pickupPoint,
        pickup_time: pickupTime,
        drop_point: dropPoint,
        theme,
        tour_type: (tourType === 'PRIVATE' ? 'PRIVATE' : 'GROUP') as 'GROUP' | 'PRIVATE',
        max_group_size: Number(maxGroupSize) || 25,
        duration_days: durationDays,
        days: durationDays,
        itinerary: itinerary.map(i => `${i.title}: ${i.activities}`),
        day_itinerary: itinerary.map(i => ({
          dayNumber: i.dayNumber,
          title: i.title,
          activities: i.activities,
          meals: Object.entries(i.meals).filter(([_, v]) => v).map(([k]) => k)
        })),
        hotel_rating: hotelStarRating,
        room_type: roomType,
        vehicle_type: vehicleType,
        vendor_net_price: net,
        price_per_person: calc.finalUserPrice,
        price: calc.finalUserPrice,
        inclusions,
        exclusions,
        cancellation_policy: cancellationPolicy,
        batch_dates: batchDates,
        image_url: coverImageUrl,
        imageUrl: coverImageUrl,
        status: 'active',
        vendor_id: vendorId,
        created_at: new Date().toISOString()
      };

      await packageService.createPackage({
        vendorId,
        packageName: title,
        destination,
        originCity,
        pickupPoint,
        dropPoint,
        theme,
        tourType: (tourType === 'PRIVATE' ? 'PRIVATE' : 'GROUP') as 'GROUP' | 'PRIVATE',
        durationDays,
        pricePerPerson: calc.finalUserPrice,
        vendorNetPrice: net,
        hotelStarRating,
        vehicleType,
        inclusions,
        exclusions,
        cancellationPolicy,
        batchDates,
        imageUrl: coverImageUrl,
        itinerary: itinerary.map(i => `${i.title}: ${i.activities}`)
      });
      onSuccess?.(newPkg);
      onClose();
    } catch (err: any) {
      console.warn('Failed to publish package:', err);
      setErrorMsg(isMr ? 'पॅकेज पब्लिश करताना त्रुटी आली.' : 'Failed to publish tour package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return isMr ? 'पायरी १: मार्ग व प्राथमिक माहिती (Logistics & Route)' : 'Step 1: Route, Destination & Logistics';
      case 2: return isMr ? 'पायरी २: दिवसनिहाय इटिनररी व जेवण (Day-by-Day Itinerary)' : 'Step 2: Dynamic Day-by-Day Itinerary & Meals';
      case 3: return isMr ? 'पायरी ३: हॉटेल मुक्काम व वाहतूक (Accommodation & Fleet)' : 'Step 3: Hotel Rating & Transport Fleet';
      case 4: return isMr ? 'पायरी ४: कमर्शियल्स, जीएसटी व IGST आकडेमोड' : 'Step 4: Net Pricing, Live GST & IGST Tax Engine';
      case 5: return isMr ? 'पायरी ५: समाविष्ट बाबी व नियम (Inclusions & Policies)' : 'Step 5: Inclusions, Exclusions & Batch Dates';
      case 6: return isMr ? 'पायरी ६: कव्हर फोटो, प्रिव्ह्यू व पब्लिश करा' : 'Step 6: Cover Photo, Live Preview & Publish';
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      {/* Universal Shared Flow Header */}
      <CommonFlowHeader
        title={isMr ? 'टूर पॅकेज पब्लिशर' : 'Publish Tour Package'}
        subtitle={getStepSubtitle()}
        step={isMr ? `पायरी ${currentStep} पैकी ६` : `Step ${currentStep} of 6`}
        currentStep={currentStep}
        totalSteps={6}
        onBack={handleBack}
        onClose={onClose}
        backAriaLabel="Back to previous step"
        closeAriaLabel="Exit to vendor inventory dashboard"
      />

      {/* Main Form Body */}
      <main className="max-w-4xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28">
        {/* Fast Pre-fill Bar on Step 1 */}
        {currentStep === 1 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-100 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                {isMr ? '१-क्लिक रेडीमेड टेम्पलेट्स:' : '1-Click Industry Templates:'}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyTemplate('goa')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 active:scale-95 transition"
              >
                Goa (4N/5D)
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('rajasthan')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 active:scale-95 transition"
              >
                Rajasthan (6N/7D)
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('kerala')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 active:scale-95 transition"
              >
                Kerala (5N/6D)
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: ROUTE & LOGISTICS */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isMr ? 'पॅकेजचे पूर्ण नाव (Package Title) *' : 'Package Title *'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Rajasthan 6D: Jaipur, Jodhpur & Udaipur Heritage Explorer"
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'मुख्य गंतव्य (Primary Destination) *' : 'Primary Destination *'}
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa / Manali / Kashmir / Kerala"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'मूळ शहर (Origin City) *' : 'Origin City *'}
                  </label>
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="e.g. Mumbai / Pune / Delhi"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'पिकअप ठिकाण (Pickup Point)' : 'Pickup Point'}
                  </label>
                  <input
                    type="text"
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    placeholder="e.g. Dadar Swami Narayan / Airport"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'रिपोर्टिंग वेळ (Pickup Time)' : 'Pickup Time'}
                  </label>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="06:00 AM"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'ड्रॉप ठिकाण (Drop Point)' : 'Drop Point'}
                  </label>
                  <input
                    type="text"
                    value={dropPoint}
                    onChange={(e) => setDropPoint(e.target.value)}
                    placeholder="Same as pickup / Airport"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'टूर थीम (Tour Theme)' : 'Tour Theme'}
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>Beach & Coastal</option>
                    <option>Heritage & Culture</option>
                    <option>Hill Station & Nature</option>
                    <option>Pilgrimage & Spiritual</option>
                    <option>Adventure & Wildlife</option>
                    <option>Honeymoon Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'प्रकार (Tour Type)' : 'Tour Type'}
                  </label>
                  <select
                    value={tourType}
                    onChange={(e) => setTourType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>Fixed Departure Group</option>
                    <option>Private Customized Tour</option>
                    <option>Weekend Roadtrip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'कमाल ग्रुप मर्यादा (Max Pax)' : 'Max Group Size'}
                  </label>
                  <input
                    type="number"
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DAY-BY-DAY ITINERARY */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {isMr ? 'दिवसनिहाय प्रवासी कार्यक्रम' : `Itinerary (${itinerary.length} Days)`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newDayNo = itinerary.length + 1;
                  setItinerary([
                    ...itinerary,
                    {
                      dayNumber: newDayNo,
                      title: `Day ${newDayNo} Sightseeing`,
                      overnightCity: destination || 'Same Hotel',
                      activities: 'Sightseeing, local market visit & leisure time.',
                      meals: { breakfast: true, lunch: false, dinner: true }
                    }
                  ]);
                  setDurationDays(newDayNo);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isMr ? '+ नवीन दिवस जोडा' : '+ Add Day'}</span>
              </button>
            </div>

            {itinerary.map((day, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Day {day.dayNumber}
                  </span>
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = itinerary.filter((_, i) => i !== idx);
                        const remapped = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
                        setItinerary(remapped);
                        setDurationDays(remapped.length);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Day Title
                    </label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[idx].title = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Overnight City / Stay
                    </label>
                    <input
                      type="text"
                      value={day.overnightCity}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[idx].overnightCity = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Activities & Places Visited
                  </label>
                  <textarea
                    rows={2}
                    value={day.activities}
                    onChange={(e) => {
                      const updated = [...itinerary];
                      updated[idx].activities = e.target.value;
                      setItinerary(updated);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                {/* Meals Inclusion for Day */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meals:</span>
                  {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                    <label key={meal} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.meals[meal]}
                        onChange={(e) => {
                          const updated = [...itinerary];
                          updated[idx].meals[meal] = e.target.checked;
                          setItinerary(updated);
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="capitalize">{meal}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: STAYS & FLEET */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'हॉटेल स्टार कॅटेगरी' : 'Hotel Star Rating'}
                  </label>
                  <select
                    value={hotelStarRating}
                    onChange={(e) => setHotelStarRating(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  >
                    <option>3-Star Comfort</option>
                    <option>4-Star Premium</option>
                    <option>5-Star Luxury</option>
                    <option>Heritage / Boutique Resort</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {isMr ? 'खोलीचा प्रकार' : 'Room Category'}
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                  >
                    <option>Deluxe AC Room</option>
                    <option>Super Deluxe AC Room</option>
                    <option>Executive Suite / Cottage</option>
                    <option>Luxury Tent / Villa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isMr ? 'वाहतूक वाहनाचा प्रकार (Transport Vehicle)' : 'Transport Fleet Tier'}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800"
                >
                  <option>AC Tempo Traveller / AC Coach</option>
                  <option>AC Innova Crysta / Ertiga</option>
                  <option>AC Sedan (Dzire / Etios)</option>
                  <option>Volvo Multi-Axle AC Sleeper</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {isMr ? 'सर्व टोल, पार्किंग व ड्रायव्हर भत्ता समाविष्ट' : 'All Tolls, State Border Taxes, Parking & Driver Bata Included'}
                </span>
                <input
                  type="checkbox"
                  checked={tollParkingIncluded}
                  onChange={(e) => setTollParkingIncluded(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: COMMERCIALS & DYNAMIC GST / IGST */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vendor Net Take-Home */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {isMr ? '१. वेंडर नक्त दर (Vendor Net Take-Home) *' : '1. Vendor Net Payout (₹) *'}
                    </label>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {isMr ? 'थेट बँक जमा' : 'Direct Bank'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={vendorNetPrice}
                      onChange={(e) => setVendorNetPrice(e.target.value)}
                      placeholder="14500"
                      className="w-full h-11 rounded-xl border border-emerald-300 bg-emerald-50/20 pl-8 pr-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isMr ? 'ही रक्कम अरायव्हल OTP नंतर थेट तुमच्या बँकेत जमा होईल.' : 'This exact net amount will be credited to your bank account via Escrow.'}
                  </p>
                </div>

                {/* Customer Final Selling Price */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-800">
                      {isMr ? '२. ग्राहकास दिसणारा दर (Customer Price)' : '2. Customer Final Price (₹)'}
                    </label>
                    <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                      {isMr ? 'ऑटो-कॅल्क्युलेटेड' : 'Auto-Calculated'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      readOnly
                      value={pricePerPerson}
                      className="w-full h-11 rounded-xl border border-sky-200 bg-sky-50/40 pl-8 pr-3 text-sm font-black text-slate-900 outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isMr ? 'प्लॅटफॉर्म कमिशन + ५% GST (IGST/CGST) सह ग्राहकास दिसणारा अंतिम दर.' : 'Platform commission + 5% GST (IGST/CGST) included.'}
                  </p>
                </div>
              </div>

              {/* Dynamic Live Tax Breakdown Badge with IGST Toggle */}
              <PriceTaxBreakdownBadge
                vendorNetPrice={Number(vendorNetPrice) || 0}
                vertical="PACKAGE"
                isMr={isMr}
                unitLabel={isMr ? '/ व्यक्ती' : '/ Person'}
              />

              {/* Child & Sharing Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Triple Sharing (₹/Pax)
                  </label>
                  <input
                    type="number"
                    value={tripleSharingPrice}
                    onChange={(e) => setTripleSharingPrice(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Child with Bed (₹)
                  </label>
                  <input
                    type="number"
                    value={childWithBedPrice}
                    onChange={(e) => setChildWithBedPrice(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Child without Bed (₹)
                  </label>
                  <input
                    type="number"
                    value={childNoBedPrice}
                    onChange={(e) => setChildNoBedPrice(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: INCLUSIONS, POLICIES & DATES */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fadeIn">
            {/* Inclusions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {isMr ? 'समाविष्ट बाबी (Inclusions)' : 'Inclusions'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  placeholder="e.g. Scuba diving session included"
                  className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newInclusion.trim()) {
                      setInclusions([...inclusions, newInclusion.trim()]);
                      setNewInclusion('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1 pt-1">
                {inclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {isMr ? 'वगळलेल्या बाबी (Exclusions)' : 'Exclusions'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  placeholder="e.g. Airfare / train tickets"
                  className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExclusion.trim()) {
                      setExclusions([...exclusions, newExclusion.trim()]);
                      setNewExclusion('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1 pt-1">
                {exclusions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => setExclusions(exclusions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Departure Dates */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {isMr ? 'ग्रुप डिपार्चर तारखा (Departure Dates)' : 'Fixed Departure Batch Dates'}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newBatchDate}
                  onChange={(e) => setNewBatchDate(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newBatchDate && !batchDates.includes(newBatchDate)) {
                      setBatchDates([...batchDates, newBatchDate].sort());
                      setNewBatchDate('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs"
                >
                  + Add Date
                </button>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                {batchDates.map((date) => (
                  <span key={date} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {date}
                    <button
                      type="button"
                      onClick={() => setBatchDates(batchDates.filter(d => d !== date))}
                      className="text-indigo-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW & PUBLISH */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Cover Image Input */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {isMr ? 'कव्हर फोटो URL' : 'Cover Image URL'}
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-800"
              />
            </div>

            {/* Live Marketplace Card Preview */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isMr ? 'ग्राहकांना दिसणारे लाईव्ह मार्केटप्लेस कार्ड प्रिव्ह्यू' : 'Live Marketplace Card Preview'}
                </h4>
              </div>

              <div className="max-w-md mx-auto rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md">
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 text-[10px] font-black bg-white/90 backdrop-blur-xs text-indigo-800 px-2.5 py-1 rounded-full shadow-xs">
                    {durationDays} Days / {durationDays - 1} Nights
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] font-black bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                    {theme}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-black text-base text-slate-900 line-clamp-1 leading-snug">
                    {title || 'Untitled Tour Package'}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{originCity} &rarr; {destination}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        Customer Final Price
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{Number(pricePerPerson).toLocaleString('en-IN')}
                        <span className="text-xs text-slate-400 font-semibold"> / Pax</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Net Payout: ₹{Number(vendorNetPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Navigation Bar */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? (isMr ? 'रद्द करा' : 'Cancel') : (isMr ? 'मागे' : 'Previous Step')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              Step {currentStep} of 6
            </span>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
              >
                <span>{isMr ? 'पुढील पायरी' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 sm:px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? (isMr ? 'पब्लिश होत आहे...' : 'Publishing...') : (isMr ? 'टूर पॅकेज पब्लिश करा' : 'Publish Package')}</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TourPackageFlowCoordinator;
