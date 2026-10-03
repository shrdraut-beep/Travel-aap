import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Car,
  Hotel,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  Loader2,
  Info,
  Layers,
  Tag,
  Users,
  DollarSign,
  AlertCircle,
  X,
  Compass,
  UtensilsCrossed,
  FileText
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';
import { packageService, type TourPackage, type DayItinerary } from '../../services/packages/PackageService';
import { PriceTaxBreakdownBadge } from './PriceTaxBreakdownBadge';
import { taxationConfigService } from '../../services/tax/TaxationConfigService';

export interface TourPackageUploadFormProps {
  vendorId?: string;
  onSuccess?: (pkg: TourPackage) => void;
  onCancel?: () => void;
}

export function TourPackageUploadForm({
  vendorId = 'vendor_agent',
  onSuccess,
  onCancel
}: TourPackageUploadFormProps) {
  const { lang, language } = useLanguage();
  const isMr = (lang || language) === 'mr';

  // --- SECTION 1: IDENTITY & ROUTE ---
  const [packageName, setPackageName] = useState('');
  const [destination, setDestination] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [tourTheme, setTourTheme] = useState('Family & Leisure');
  const [tourType, setTourType] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');

  // --- SECTION 2: DURATION & DAY-WISE ITINERARY ---
  const [days, setDays] = useState('4');
  const [nights, setNights] = useState('3');
  const [dayItineraries, setDayItineraries] = useState<DayItinerary[]>([
    {
      dayNumber: 1,
      title: 'Arrival & Welcome Sunset Cruise',
      activities: 'Pickup from airport/railway station, check-in to beach resort, welcome drink, evening Mandovi river cruise.',
      hotelCity: 'North Goa 4-Star Resort',
      meals: ['Dinner']
    },
    {
      dayNumber: 2,
      title: 'North Goa Forts & Water Sports',
      activities: 'Visit Aguada Fort, Chapora Fort, water sports at Calangute & Baga beach (parasailing & jet ski).',
      hotelCity: 'North Goa 4-Star Resort',
      meals: ['Breakfast', 'Dinner']
    },
    {
      dayNumber: 3,
      title: 'South Goa Heritage & Spice Plantation',
      activities: 'Basilica of Bom Jesus, Se Cathedral, Sahakari Spice Farm tour with traditional Goan buffet lunch.',
      hotelCity: 'North Goa 4-Star Resort',
      meals: ['Breakfast', 'Lunch']
    },
    {
      dayNumber: 4,
      title: 'Local Souvenir Shopping & Departure',
      activities: 'Morning leisure on beach, Panaji market shopping, drop to airport/railway station with happy memories.',
      hotelCity: 'Checkout',
      meals: ['Breakfast']
    }
  ]);

  // --- SECTION 3: STAY & FLEET ---
  const [hotelStarRating, setHotelStarRating] = useState('4-Star Premium');
  const [roomCategory, setRoomCategory] = useState('Deluxe AC Room');
  const [vehicleType, setVehicleType] = useState('Private AC SUV (Innova Crysta)');
  const [transportInclusions, setTransportInclusions] = useState<string[]>([
    'Toll & Parking Included',
    'Fuel Charges Included',
    'State Border Permits Included',
    'Driver Batta / Allowance Included',
    '24x7 Dedicated Vehicle'
  ]);

  // --- SECTION 4: PRICING & B2B COMMERCIALS ---
  const [pricePerPerson, setPricePerPerson] = useState('18500');
  const [vendorNetPrice, setVendorNetPrice] = useState('15500');
  const [tripleSharingPrice, setTripleSharingPrice] = useState('16500');
  const [childWithBedPrice, setChildWithBedPrice] = useState('12500');
  const [childNoBedPrice, setChildNoBedPrice] = useState('8500');
  const [advanceDepositPercent, setAdvanceDepositPercent] = useState('25');
  const [gstOption, setGstOption] = useState('5% GST Extra');

  // --- SECTION 5: INCLUSIONS & EXCLUSIONS ---
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    'Accommodation on Twin Sharing',
    'Daily Buffet Breakfast',
    'Special Welcome Drink on Arrival',
    'All Transfers & Sightseeing by Private AC Vehicle',
    'Driver Allowance, Fuel, Toll & Parking Fees',
    'Sunset Boat Cruise Ticket (1 Hour)',
    '24x7 On-Trip Concierge & Emergency Support'
  ]);
  const [newInclusionInput, setNewInclusionInput] = useState('');

  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([
    'Airfare / Train tickets to origin city',
    'Monument entrance tickets & camera fees',
    'Lunch and unmentioned meals',
    'Water sports and adventure activities',
    'Personal expenses (Laundry, Telephone, Minibar)',
    'Early Check-in or Late Check-out charges'
  ]);
  const [newExclusionInput, setNewExclusionInput] = useState('');

  // --- SECTION 6: FIXED BATCH DEPARTURES ---
  const [departureType, setDepartureType] = useState<'DAILY' | 'BATCHES'>('DAILY');
  const [batchDates, setBatchDates] = useState<string[]>(['2026-10-10', '2026-10-24', '2026-11-07', '2026-11-21']);
  const [newBatchDateInput, setNewBatchDateInput] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('15');

  // --- SECTION 7: GUIDELINES & POLICIES ---
  const [mandatoryDocs, setMandatoryDocs] = useState('Original Govt ID proof (Aadhaar / Voter ID / Passport) mandatory for all guests.');
  const [thingsToCarry, setThingsToCarry] = useState<string[]>([
    'Comfortable Cotton Clothes',
    'Sports / Walking Shoes',
    'Sunscreen & Sunglasses',
    'Personal Medicines & First Aid',
    'Power Bank & Camera'
  ]);
  const [fitnessLevel, setFitnessLevel] = useState('Easy (Suitable for all age groups)');
  const [cancellationPolicy, setCancellationPolicy] = useState('Moderate');

  // --- SECTION 8: MEDIA ---
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800'
  ]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [submittingPackage, setSubmittingPackage] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sync nights when days change
  const handleDaysChange = (val: string) => {
    setDays(val);
    const numDays = parseInt(val) || 1;
    const computedNights = Math.max(1, numDays - 1).toString();
    setNights(computedNights);

    // Re-adjust day itineraries array
    setDayItineraries((prev) => {
      const result: DayItinerary[] = [];
      for (let i = 1; i <= numDays; i++) {
        const existing = prev.find((d) => d.dayNumber === i);
        if (existing) {
          result.push(existing);
        } else {
          result.push({
            dayNumber: i,
            title: `Day ${i}: Sightseeing & Experiences`,
            activities: `Explore premier attractions, local culture and regional cuisine in ${destination || 'the destination'}.`,
            hotelCity: `${destination || 'Local'} Hotel`,
            meals: ['Breakfast']
          });
        }
      }
      return result;
    });
  };

  // 1-Click Demo Pre-Fill Templates
  const handlePreFillTemplate = (templateName: string) => {
    if (templateName === 'goa') {
      setPackageName('Exotic Goa 4N/5D Beach Resort & Watersports Special');
      setDestination('Goa');
      setOriginCity('Ex-Goa / Mumbai / Pune');
      setPickupPoint('Dabolim / MOPA Airport / Madgaon Station');
      setDropPoint('Airport / Railway Station');
      setTourTheme('Beach & Watersports');
      setTourType('PRIVATE');
      setDays('5');
      setNights('4');
      setHotelStarRating('4-Star Premium');
      setRoomCategory('Sea View Deluxe Room');
      setVehicleType('Private AC SUV (Innova Crysta)');
      setPricePerPerson('22500');
      setVendorNetPrice('19000');
      setTripleSharingPrice('19500');
      setChildWithBedPrice('14500');
      setChildNoBedPrice('9500');
      setCoverImageUrl('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000');
      setDayItineraries([
        { dayNumber: 1, title: 'Arrival & Mandovi Sunset Cruise', activities: 'Airport pickup, resort check-in, sunset river cruise with live DJ.', hotelCity: 'Calangute 4-Star Resort', meals: ['Dinner'] },
        { dayNumber: 2, title: 'North Goa Forts & Watersports', activities: 'Aguada Fort, Sinquerim Beach, Jet Ski & Parasailing combo.', hotelCity: 'Calangute 4-Star Resort', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 3, title: 'Dudhsagar Waterfalls & Spice Plantation', activities: '4x4 Jeep Safari to Dudhsagar waterfall, buffet lunch at spice plantation.', hotelCity: 'Calangute 4-Star Resort', meals: ['Breakfast', 'Lunch'] },
        { dayNumber: 4, title: 'South Goa Heritage Churches & Miramar', activities: 'Old Goa Churches, Mangueshi Temple, Miramar beach sunset.', hotelCity: 'Calangute 4-Star Resort', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 5, title: 'Souvenir Shopping & Airport Drop', activities: 'Anjuna flea market shopping, drop to airport with sweet memories.', hotelCity: 'Checkout', meals: ['Breakfast'] }
      ]);
      setToast(isMr ? 'गोवा 4N/5D टेम्पलेट यशस्वीपणे लोड झाले!' : 'Loaded Goa 4N/5D Template with full itinerary!');
    } else if (templateName === 'rajasthan') {
      setPackageName('Royal Rajasthan Heritage Tour: Jaipur, Jodhpur & Udaipur');
      setDestination('Rajasthan (Jaipur-Jodhpur-Udaipur)');
      setOriginCity('Ex-Jaipur / Delhi');
      setPickupPoint('Jaipur International Airport / Railway Station');
      setDropPoint('Udaipur Airport / Railway Station');
      setTourTheme('Heritage & Culture');
      setTourType('PRIVATE');
      setDays('6');
      setNights('5');
      setHotelStarRating('Heritage Palace / 4-Star');
      setRoomCategory('Royal Heritage AC Room');
      setVehicleType('Private AC Sedan (Toyota Etios)');
      setPricePerPerson('29800');
      setVendorNetPrice('25500');
      setTripleSharingPrice('26500');
      setChildWithBedPrice('19500');
      setChildNoBedPrice('12500');
      setCoverImageUrl('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000');
      setDayItineraries([
        { dayNumber: 1, title: 'Jaipur Arrival & Chokhi Dhani', activities: 'Pickup, Amber Fort view, evening traditional Rajasthani dinner at Chokhi Dhani.', hotelCity: 'Jaipur Heritage Hotel', meals: ['Dinner'] },
        { dayNumber: 2, title: 'Jaipur City Palace & Hawa Mahal', activities: 'City Palace, Jantar Mantar, Hawa Mahal photo-stop, Johari Bazaar.', hotelCity: 'Jaipur Heritage Hotel', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 3, title: 'Jaipur to Jodhpur via Ajmer Dargah', activities: 'Drive to Jodhpur via Ajmer Sharif & Pushkar Brahma Temple.', hotelCity: 'Jodhpur Heritage Haveli', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 4, title: 'Mehrangarh Fort & Drive to Udaipur', activities: 'Mehrangarh Fort, Jaswant Thada, scenic drive through Aravalli to Udaipur.', hotelCity: 'Udaipur Lakeview Hotel', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 5, title: 'Udaipur City Palace & Lake Pichola Cruise', activities: 'City Palace, Saheliyon ki Bari, evening boat ride on Lake Pichola.', hotelCity: 'Udaipur Lakeview Hotel', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 6, title: 'Bagore Ki Haveli & Departure', activities: 'Morning lakeside walk, souvenir shopping, drop to Udaipur airport.', hotelCity: 'Checkout', meals: ['Breakfast'] }
      ]);
      setToast(isMr ? 'राजस्थान हेरिटेज 6D टेम्पलेट लोड झाले!' : 'Loaded Royal Rajasthan 6-Day Tour Template!');
    } else if (templateName === 'konkan') {
      setPackageName('Konkan Coastal Escape: Ganpatipule, Ratnagiri & Malvan');
      setDestination('Konkan Coast (Ratnagiri & Sindhudurg)');
      setOriginCity('Pune / Mumbai');
      setPickupPoint('Pune Station / Vashi Plaza');
      setDropPoint('Pune Station / Vashi');
      setTourTheme('Beach & Nature');
      setTourType('GROUP');
      setDays('4');
      setNights('3');
      setHotelStarRating('3-Star Deluxe Beach Resort');
      setRoomCategory('Deluxe AC Cottage');
      setVehicleType('AC Tempo Traveller (17-Seater)');
      setPricePerPerson('14500');
      setVendorNetPrice('12200');
      setTripleSharingPrice('13000');
      setChildWithBedPrice('9500');
      setChildNoBedPrice('6500');
      setCoverImageUrl('https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000');
      setDayItineraries([
        { dayNumber: 1, title: 'Pune/Mumbai to Ganpatipule Beach', activities: 'Early morning pickup, scenic ghat drive, Ganpatipule temple darshan, sunset beach.', hotelCity: 'Ganpatipule Beach Resort', meals: ['Dinner'] },
        { dayNumber: 2, title: 'Are Ware Coastal Road & Ratnadurg Fort', activities: 'Drive along famous Are Ware marine drive, Ratnagiri lighthouse, Thibaw Palace.', hotelCity: 'Ganpatipule Beach Resort', meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 3, title: 'Malvan Scuba Diving & Sindhudurg Sea Fort', activities: 'Boat ride to Shivaji Maharaj sea fort, guided scuba diving with video, authentic Malvani feast.', hotelCity: 'Tarkarli Beach Resort', meals: ['Breakfast', 'Lunch', 'Dinner'] },
        { dayNumber: 4, title: 'Kunkeshwar Temple & Return Journey', activities: 'Kunkeshwar coastal temple, mango pulp shopping, return drive to Pune/Mumbai.', hotelCity: 'Return Drop', meals: ['Breakfast'] }
      ]);
      setToast(isMr ? 'कोकण 4D टेम्पलेट लोड झाले!' : 'Loaded Konkan Coastal 4-Day Template!');
    }
    setTimeout(() => setToast(null), 3500);
  };

  // Day Itinerary field updates
  const updateDayItinerary = (dayIndex: number, field: keyof DayItinerary, value: any) => {
    setDayItineraries((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], [field]: value };
      return copy;
    });
  };

  const toggleDayMeal = (dayIndex: number, meal: string) => {
    setDayItineraries((prev) => {
      const copy = [...prev];
      const currentMeals = copy[dayIndex].meals || [];
      const updated = currentMeals.includes(meal)
        ? currentMeals.filter((m) => m !== meal)
        : [...currentMeals, meal];
      copy[dayIndex] = { ...copy[dayIndex], meals: updated };
      return copy;
    });
  };

  // Photo uploads
  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true });
      try {
        const fileName = `tour_packages/cover_${Date.now()}.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);
        setCoverImageUrl(downloadURL);
        setToast(isMr ? 'कव्हर फोटो यशस्वीपणे अपलोड झाला!' : 'Cover photo uploaded successfully!');
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setCoverImageUrl(reader.result);
            setToast(isMr ? 'कव्हर फोटो कॉम्प्रेश करून जोडला!' : 'Cover photo compressed & attached!');
          }
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch {
      setToast(isMr ? 'फोटो अपलोड करण्यात त्रुटी.' : 'Failed to process cover photo.');
    } finally {
      setUploadingCover(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true });
        try {
          const fileName = `tour_packages/gallery/img_${Date.now()}_${index}.jpg`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, compressed);
          return await getDownloadURL(storageRef);
        } catch {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressed);
          });
        }
      });
      const newUrls = await Promise.all(uploadPromises);
      setGalleryUrls((prev) => [...prev, ...newUrls.filter(Boolean)]);
      setToast(isMr ? `${newUrls.length} गॅलरी फोटो जोडले!` : `${newUrls.length} gallery photos uploaded!`);
    } catch {
      setToast(isMr ? 'गॅलरी फोटो अपलोड करताना त्रुटी.' : 'Error uploading gallery photos.');
    } finally {
      setUploadingGallery(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Submit Package to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || !destination.trim() || !pricePerPerson) {
      setToast(isMr ? 'कृपया पॅकेजचे नाव, गंतव्य स्थान आणि विक्री किंमत प्रविष्ट करा.' : 'Please enter package title, destination and selling price.');
      setTimeout(() => setToast(null), 3500);
      return;
    }

    setSubmittingPackage(true);
    try {
      const payload = {
        vendorId,
        packageName: packageName.trim(),
        destination: destination.trim(),
        originCity: originCity.trim() || 'Ex-Origin',
        pickupPoint: pickupPoint.trim(),
        dropPoint: dropPoint.trim(),
        theme: tourTheme,
        tourType,
        durationDays: parseInt(days) || 3,
        durationNights: parseInt(nights) || 2,
        pricePerPerson: parseFloat(pricePerPerson) || 0,
        vendorNetPrice: parseFloat(vendorNetPrice) || Math.round(parseFloat(pricePerPerson) * 0.85),
        tripleSharingPrice: parseFloat(tripleSharingPrice) || 0,
        childWithBedPrice: parseFloat(childWithBedPrice) || 0,
        childNoBedPrice: parseFloat(childNoBedPrice) || 0,
        hotelStarRating,
        vehicleType,
        inclusions: selectedInclusions,
        exclusions: selectedExclusions,
        dayItinerary: dayItineraries,
        itinerary: dayItineraries.map((d) => `${d.dayNumber}. ${d.title}: ${d.activities}`),
        batchDates: departureType === 'BATCHES' ? batchDates : [],
        maxGroupSize: parseInt(maxGroupSize) || 15,
        cancellationPolicy: `${cancellationPolicy} Tiered Cancellation Policy`,
        guidelines: [mandatoryDocs, ...thingsToCarry],
        imageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000',
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : [coverImageUrl || 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000']
      };

      const res = await packageService.createPackage(payload);
      if (res.success && res.package) {
        setToast(isMr ? `"${packageName}" टूर पॅकेज यशस्वीरित्या बाजारात प्रकाशित झाले!` : `Tour package "${packageName}" published successfully to B2B & traveller marketplace!`);
        if (onSuccess) onSuccess(res.package);
      } else {
        setToast(res.message || (isMr ? 'पॅकेज प्रकाशित करताना त्रुटी आली.' : 'Failed to publish tour package.'));
      }
    } catch (err: any) {
      setToast(err?.message || (isMr ? 'सर्व्हर त्रुटी आली.' : 'Error publishing package.'));
    } finally {
      setSubmittingPackage(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div className="sticky top-2 z-50 mx-4 p-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-lg border border-slate-700 flex items-center justify-between animate-fade-in">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-white">X</button>
        </div>
      )}

      {/* HEADER WITH 1-CLICK DEMO TEMPLATES */}
      <div className="mx-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 text-white shadow-md border border-sky-400/25 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-lg shadow-sm shrink-0">
              
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                {isMr ? "टूर पॅकेज अपलोड व प्रकाशित करा (Tour Package Publisher)" : "Comprehensive Tour Package Publisher"}
              </h3>
              <p className="text-[10px] text-sky-200">
                {isMr
                  ? "मार्ग, दिवसनिहाय सविस्तर प्रवास योजना, हॉटेल, वाहन, दर व बॅचेसची परिपूर्ण माहिती भरा"
                  : "Complete B2B specification: day-wise itinerary, fleet, hotel tiers, batches & commercials"}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wider">
            B2B Standard
          </span>
        </div>

        {/* 1-Click Pre-fill Template Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {isMr ? "तयार डेमो नमुना भरा:" : "Quick 1-Click Pre-Fill:"}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handlePreFillTemplate('goa')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer border border-white/10"
            >
              Goa 4N/5D
            </button>
            <button
              type="button"
              onClick={() => handlePreFillTemplate('rajasthan')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer border border-white/10"
            >
              Rajasthan 6D
            </button>
            <button
              type="button"
              onClick={() => handlePreFillTemplate('konkan')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer border border-white/10"
            >
              Konkan 4D
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        {/* =========================================================================
            SECTION 1: ROUTE & BASIC IDENTITY
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "१. पॅकेज ओळख व मार्ग (Package Identity & Route)" : "1. Package Identity & Route Details"}
            </h4>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isMr ? "पॅकेजचे पूर्ण नाव (Package Title) *" : "Package Title *"}
            </label>
            <input
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. 4N/5D Exotic Goa & Mandovi Sunset Cruise Special"
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "गंतव्य स्थान (Destination) *" : "Destination City & Region *"}
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. North & South Goa"
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "सुरू होणारे शहर (Origin City)" : "Origin / Starting City"}
              </label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="e.g. Pune / Mumbai / Ex-Goa"
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "पिकअप ठिकाण व वेळ (Pickup Point)" : "Pickup Location & Reporting Time"}
              </label>
              <input
                type="text"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                placeholder="e.g. Airport / Railway Station - 09:00 AM"
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-800 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "ड्रॉप ठिकाण व वेळ (Drop Point)" : "Drop-off Location & Return Time"}
              </label>
              <input
                type="text"
                value={dropPoint}
                onChange={(e) => setDropPoint(e.target.value)}
                placeholder="e.g. Airport / Station - 06:00 PM"
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Theme & Mode Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "टूर थीम (Tour Theme)" : "Tour Theme / Category"}
              </label>
              <select
                value={tourTheme}
                onChange={(e) => setTourTheme(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none focus:border-sky-500"
              >
                <option value="Family & Leisure">Family & Leisure</option>
                <option value="Honeymoon Special">Honeymoon Special</option>
                <option value="Beach & Watersports">Beach & Watersports</option>
                <option value="Adventure & Trekking">Adventure & Trekking</option>
                <option value="Heritage & Culture">Heritage & Culture</option>
                <option value="Wildlife Safari">Wildlife Safari</option>
                <option value="Spiritual / Pilgrimage">Spiritual / Pilgrimage</option>
                <option value="Weekend Getaway">Weekend Getaway</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "टूर मोड (Tour Mode)" : "Tour Mode"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTourType('PRIVATE')}
                  className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tourType === 'PRIVATE'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Private Cab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTourType('GROUP')}
                  className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tourType === 'GROUP'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: DURATION & DAY-WISE DYNAMIC ITINERARY
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {isMr ? "२. दिवसनिहाय सविस्तर प्रवास योजना (Day-Wise Itinerary)" : "2. Day-Wise Dynamic Itinerary"}
              </h4>
            </div>
            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {days} Days / {nights} Nights
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "एकूण दिवस (Days)" : "Total Days"}
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "एकूण रात्री (Nights)" : "Total Nights"}
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Dynamic Day Cards */}
          <div className="space-y-3 pt-1">
            {dayItineraries.map((dayItem, idx) => (
              <div key={dayItem.dayNumber} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="h-6 px-2.5 rounded-md bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    Day {dayItem.dayNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 mr-1">Meals:</span>
                    {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                      const active = dayItem.meals?.includes(meal);
                      return (
                        <button
                          key={meal}
                          type="button"
                          onClick={() => toggleDayMeal(idx, meal)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {meal === 'Breakfast' ? 'Breakfast' : meal === 'Lunch' ? 'Lunch' : 'Dinner'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={dayItem.title}
                    onChange={(e) => updateDayItinerary(idx, 'title', e.target.value)}
                    placeholder={`Day ${dayItem.dayNumber} Headline (e.g. Forts & Watersports)`}
                    className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-900 bg-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={dayItem.activities}
                    onChange={(e) => updateDayItinerary(idx, 'activities', e.target.value)}
                    placeholder={`Detailed sightseeing, activities, and timings for Day ${dayItem.dayNumber}...`}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-medium text-slate-700 bg-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Hotel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={dayItem.hotelCity || ''}
                    onChange={(e) => updateDayItinerary(idx, 'hotelCity', e.target.value)}
                    placeholder="Overnight Stay Location / Hotel (e.g. 4-Star Beach Resort)"
                    className="flex-1 h-8 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-800 bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: ACCOMMODATION & FLEET SPECIFICATIONS
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Hotel className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "३. निवास व वाहन तपशील (Stay & Fleet Specs)" : "3. Accommodation & Vehicle Fleet"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "हॉटेल स्टार कॅटेगरी" : "Hotel Category / Star Rating"}
              </label>
              <select
                value={hotelStarRating}
                onChange={(e) => setHotelStarRating(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none focus:border-emerald-500"
              >
                <option value="3-Star Deluxe">3-Star Deluxe Hotel</option>
                <option value="4-Star Premium">4-Star Premium Resort</option>
                <option value="5-Star Luxury">5-Star Luxury Palace</option>
                <option value="Heritage Palace / Haveli">Heritage Palace / Haveli</option>
                <option value="Boutique Villa / Homestay">Boutique Villa / Homestay</option>
                <option value="Glamping Tents / Camp">Luxury Glamping / Swiss Tents</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isMr ? "रूम कॅटेगरी" : "Room Category"}
              </label>
              <input
                type="text"
                value={roomCategory}
                onChange={(e) => setRoomCategory(e.target.value)}
                placeholder="e.g. Deluxe AC Room / Sea Facing Cottage"
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isMr ? "वाहन प्रकार (Vehicle Type)" : "Transport Vehicle Type"}
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none focus:border-emerald-500"
            >
              <option value="Private AC Sedan (Dzire / Etios)">Private AC Sedan (Dzire / Etios) - Up to 4 Pax</option>
              <option value="Private AC SUV (Innova Crysta / Ertiga)">Private AC SUV (Innova Crysta / Ertiga) - Up to 6 Pax</option>
              <option value="AC Tempo Traveller (13/17-Seater)">AC Tempo Traveller (13/17 Seater) - Family/Groups</option>
              <option value="Luxury Volvo AC Sleeper Coach">Luxury Volvo AC Sleeper Coach (Group Tour)</option>
              <option value="Self-Drive Rental Car / Bike">Self-Drive Scooter / SUV Option</option>
            </select>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              {isMr ? "वाहन सुविधा समाविष्ट (Vehicle Inclusions)" : "Vehicle Inclusions & Allowances"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Toll & Parking Included',
                'Fuel Charges Included',
                'State Border Permits Included',
                'Driver Batta / Allowance Included',
                '24x7 Dedicated Vehicle',
                'Airport Pickup & Drop'
              ].map((item) => {
                const active = transportInclusions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTransportInclusions((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {active ? `${item}` : `+ ${item}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: PRICING, SHARING & CHILD SURCHARGES
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "४. दर, लहान मुले व B2B कमर्शिअल्स (Pricing & Surcharges)" : "4. Pricing, Sharing & Child Surcharges"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  {isMr ? "१. वेंडर नक्त दर (Vendor Net Price) *" : "1. Vendor Net Payout (₹) *"}
                </label>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isMr ? "तुम्हाला मिळणारी रक्कम" : "Your Take-Home"}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={vendorNetPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVendorNetPrice(val);
                    const netNum = Number(val) || 0;
                    if (netNum > 0) {
                      const calc = taxationConfigService.calculateUserPrice(netNum, 'PACKAGE');
                      setPricePerPerson(String(calc.finalUserPrice));
                    } else {
                      setPricePerPerson('');
                    }
                  }}
                  placeholder="15500"
                  className="w-full h-11 rounded-xl border border-emerald-300 bg-emerald-50/20 pl-8 pr-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMr ? "ही रक्कम तुमच्या थेट बँक खात्यात जमा होईल" : "This exact net amount will be credited to your bank"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  {isMr ? "२. ग्राहकास दिसणारी किंमत (Customer Selling Price) *" : "2. Customer MRP / Selling Price (₹) *"}
                </label>
                <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  {isMr ? "ऑटो-कॅल्क्युलेटेड" : "Auto-Calculated"}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={pricePerPerson}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPricePerPerson(val);
                    const sellNum = Number(val) || 0;
                    if (sellNum > 0) {
                      const net = taxationConfigService.calculateVendorNet(sellNum, 'PACKAGE');
                      setVendorNetPrice(String(net));
                    }
                  }}
                  placeholder="18200"
                  className="w-full h-11 rounded-xl border border-sky-300 bg-sky-50/20 pl-8 pr-3 text-sm font-black text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isMr ? "प्लॅटफॉर्म कमिशन + ५% GST (IGST किंवा CGST+SGST) जोडून ग्राहकास दिसणारा दर" : "Includes platform commission + 5% GST (IGST or CGST+SGST)"}
              </p>
            </div>
          </div>

          {/* Real-time Dynamic Tax & Commission Breakdown Badge */}
          <PriceTaxBreakdownBadge
            vendorNetPrice={Number(vendorNetPrice) || 0}
            vertical="PACKAGE"
            isMr={isMr}
            unitLabel={isMr ? "/ व्यक्ती" : "/ Person"}
          />

          {/* Child & Sharing Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Triple Sharing (₹/Pax)
              </label>
              <input
                type="number"
                value={tripleSharingPrice}
                onChange={(e) => setTripleSharingPrice(e.target.value)}
                placeholder="16500"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Child With Bed (5-11 yrs)
              </label>
              <input
                type="number"
                value={childWithBedPrice}
                onChange={(e) => setChildWithBedPrice(e.target.value)}
                placeholder="12500"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Child No Bed (5-11 yrs)
              </label>
              <input
                type="number"
                value={childNoBedPrice}
                onChange={(e) => setChildNoBedPrice(e.target.value)}
                placeholder="8500"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Booking Advance Deposit
              </label>
              <select
                value={advanceDepositPercent}
                onChange={(e) => setAdvanceDepositPercent(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none"
              >
                <option value="25">25% Advance to Confirm</option>
                <option value="50">50% Advance to Confirm</option>
                <option value="100">100% Full Payment Required</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                GST Specification
              </label>
              <select
                value={gstOption}
                onChange={(e) => setGstOption(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none"
              >
                <option value="5% GST Extra">5% Tour Operator GST Extra</option>
                <option value="GST Included">5% GST Included in Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: INCLUSIONS & EXCLUSIONS
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "५. समाविष्ट व वगळलेल्या बाबी (Inclusions & Exclusions)" : "5. What's Included & What's Excluded"}
            </h4>
          </div>

          {/* Inclusions */}
          <div className="space-y-2">
            <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Inclusions & Complimentary Services
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedInclusions.map((inc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                >
                  <span>{inc}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedInclusions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                  >
                    X
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newInclusionInput}
                onChange={(e) => setNewInclusionInput(e.target.value)}
                placeholder="Add custom inclusion (e.g. Scuba diving equipment)..."
                className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newInclusionInput.trim()) {
                    setSelectedInclusions((prev) => [...prev, newInclusionInput.trim()]);
                    setNewInclusionInput('');
                  }
                }}
                className="px-3 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-black uppercase tracking-wider text-rose-700">
              Exclusions & Personal Expenses
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedExclusions.map((exc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5"
                >
                  <span>{exc}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedExclusions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-rose-400 hover:text-rose-700 cursor-pointer"
                  >
                    X
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newExclusionInput}
                onChange={(e) => setNewExclusionInput(e.target.value)}
                placeholder="Add custom exclusion (e.g. Monument camera tickets)..."
                className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newExclusionInput.trim()) {
                    setSelectedExclusions((prev) => [...prev, newExclusionInput.trim()]);
                    setNewExclusionInput('');
                  }
                }}
                className="px-3 h-9 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 6: FIXED BATCHES & DEPARTURE DATES
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {isMr ? "६. प्रस्थान वेळापत्रक व बॅच (Batch Departures)" : "6. Departure Schedule & Batch Dates"}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDepartureType('DAILY')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                departureType === 'DAILY'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Daily Flexible Departures
            </button>
            <button
              type="button"
              onClick={() => setDepartureType('BATCHES')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                departureType === 'BATCHES'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Fixed Batch Dates
            </button>
          </div>

          {departureType === 'BATCHES' && (
            <div className="space-y-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex flex-wrap gap-1.5">
                {batchDates.map((dateStr, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-purple-900 border border-purple-200 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{dateStr}</span>
                    <button
                      type="button"
                      onClick={() => setBatchDates((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-purple-400 hover:text-purple-700 cursor-pointer"
                    >
                      X
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={newBatchDateInput}
                  onChange={(e) => setNewBatchDateInput(e.target.value)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newBatchDateInput && !batchDates.includes(newBatchDateInput)) {
                      setBatchDates((prev) => [...prev, newBatchDateInput]);
                      setNewBatchDateInput('');
                    }
                  }}
                  className="px-3 h-9 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer hover:bg-purple-700"
                >
                  + Add Date
                </button>
              </div>

              <div className="pt-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Max Seats per Batch</label>
                <input
                  type="number"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                  className="w-32 h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-bold bg-white mt-0.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 7: GUIDELINES & CANCELLATION POLICY
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "७. नियम व रद्द करण्याचे धोरण (Policies & Guidelines)" : "7. Policies, Guidelines & Things to Carry"}
            </h4>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cancellation & Refund Policy
            </label>
            <select
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none"
            >
              <option value="Flexible">Flexible: 100% refund up to 7 days before departure</option>
              <option value="Moderate">Moderate: 100% up to 15 days, 50% up to 7 days, non-refundable within 7 days</option>
              <option value="Strict">Strict: 50% refund up to 30 days, non-refundable within 30 days</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Physical Fitness Level Required
            </label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/60 outline-none"
            >
              <option value="Easy">Easy (Suitable for all ages & seniors)</option>
              <option value="Moderate">Moderate (Involves light walking & stairs)</option>
              <option value="Challenging">Challenging (High altitude / continuous trek)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Mandatory Travel Documents
            </label>
            <input
              type="text"
              value={mandatoryDocs}
              onChange={(e) => setMandatoryDocs(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 8: MEDIA & PHOTO UPLOADS
            ========================================================================= */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ImageIcon className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {isMr ? "८. फोटो व मीडिया (Photos & Media)" : "8. High-Res Photos & Media Gallery"}
            </h4>
          </div>

          {/* Cover Photo */}
          <div className="p-3 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/40 text-center">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">Package Cover Photo (Required)</span>
              <span className="text-[10px] text-slate-400">Max 1MB, Auto-compressed</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-sky-600 file:text-white cursor-pointer"
            />
            {uploadingCover && (
              <p className="text-xs text-sky-600 font-bold mt-1 animate-pulse">Compressing cover...</p>
            )}
            {coverImageUrl && !uploadingCover && (
              <img
                src={coverImageUrl}
                alt="Cover"
                className="mt-2 h-28 w-full object-cover rounded-xl border border-slate-200"
              />
            )}
          </div>

          {/* Gallery */}
          <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">Gallery Photos (Multiple)</span>
              <span className="text-[10px] text-slate-400">{galleryUrls.length} uploaded</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={uploadingGallery}
              className="block w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-slate-800 file:text-white cursor-pointer"
            />
            {uploadingGallery && (
              <p className="text-xs text-sky-600 font-bold mt-1 animate-pulse">Uploading gallery...</p>
            )}
            {galleryUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Thumb ${idx}`} className="h-16 w-full object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-xs"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 pb-6 flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 h-12 rounded-2xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submittingPackage || uploadingCover || uploadingGallery}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
          >
            {submittingPackage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Marketplace...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isMr ? "टूर पॅकेज थेट मार्केटप्लेसवर प्रकाशित करा" : "Publish Tour Package to Marketplace"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TourPackageUploadForm;
