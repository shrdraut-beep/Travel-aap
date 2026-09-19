import { BaseService } from '../BaseService';

export interface DayItinerary {
  dayNumber: number;
  title: string;
  activities: string;
  hotelCity?: string;
  meals: string[]; // e.g. ['Breakfast', 'Dinner']
}

export interface TourPackage {
  id: string;
  vendor_id?: string;
  package_name?: string;
  title: string;
  destination: string;
  origin_city?: string;
  pickup_point?: string;
  drop_point?: string;
  theme?: string;
  tour_type?: 'GROUP' | 'PRIVATE';
  duration_days: number;
  days?: number;
  nights?: number;
  duration?: string;
  price_per_person: number;
  price: number;
  vendor_net_price?: number;
  triple_sharing_price?: number;
  child_with_bed_price?: number;
  child_no_bed_price?: number;
  hotel_star_rating?: string;
  vehicle_type?: string;
  inclusions: string[];
  exclusions?: string[];
  day_itinerary?: DayItinerary[];
  itinerary?: string[];
  batch_dates?: string[];
  max_group_size?: number;
  cancellation_policy?: string;
  guidelines?: string[];
  image_url: string;
  imageUrl?: string;
  image?: string;
  gallery_urls?: string[];
  galleryUrls?: string[];
  rating?: number;
  reviews?: number;
  status?: string;
  published?: boolean;
  created_at?: string;
}

export interface TourPackageInput {
  vendorId?: string;
  packageName: string;
  destination: string;
  originCity?: string;
  pickupPoint?: string;
  dropPoint?: string;
  theme?: string;
  tourType?: 'GROUP' | 'PRIVATE';
  durationDays: number | string;
  durationNights?: number | string;
  pricePerPerson: number | string;
  vendorNetPrice?: number | string;
  tripleSharingPrice?: number | string;
  childWithBedPrice?: number | string;
  childNoBedPrice?: number | string;
  hotelStarRating?: string;
  vehicleType?: string;
  inclusions?: string[];
  exclusions?: string[];
  dayItinerary?: DayItinerary[];
  batchDates?: string[];
  maxGroupSize?: number | string;
  cancellationPolicy?: string;
  guidelines?: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  itinerary?: string[];
}

const DEFAULT_FALLBACK_PACKAGES: TourPackage[] = [
  {
    id: "PKG-RAT-1001",
    vendor_id: "vendor-admin-1",
    package_name: "Konkan Coast & Ratnagiri Escape",
    title: "Konkan Coast & Ratnagiri Escape",
    destination: "Ratnagiri",
    duration_days: 4,
    days: 4,
    duration: "4 Days, 3 Nights",
    price_per_person: 18500,
    price: 18500,
    vendor_net_price: 15500,
    inclusions: ["Beach Resort Stay", "Private AC Cab", "Authentic Malvani Meals", "Scuba & Watersports"],
    itinerary: ["Ganpatipule Temple & Sunset Beach", "Ratnadurg Fort & Lighthouse", "Are Ware Coastal Drive & Water Sports", "Mango Orchard Tour & Departure"],
    image_url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000",
    imageUrl: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000",
    image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1000",
    gallery_urls: [
      "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: 84,
    status: "ACTIVE",
    published: true
  },
  {
    id: "PKG-GOA-2002",
    vendor_id: "vendor-admin-2",
    package_name: "Goa Tropical Heritage & Coastal Bliss",
    title: "Goa Tropical Heritage & Coastal Bliss",
    destination: "Goa",
    duration_days: 5,
    days: 5,
    duration: "5 Days, 4 Nights",
    price_per_person: 24000,
    price: 24000,
    vendor_net_price: 20000,
    inclusions: ["4-Star Beach Villa", "South & North Goa Sightseeing", "Mandovi River Cruise", "Breakfast & Dinner"],
    itinerary: ["Calangute Beach Leisure", "Old Goa Churches & Spice Plantation", "Dudhsagar Waterfalls Trek", "South Goa Beaches & Sunset Cruise", "Departure"],
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
    gallery_urls: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: 142,
    status: "ACTIVE",
    published: true
  },
  {
    id: "PKG-MAH-3003",
    vendor_id: "vendor-admin-3",
    package_name: "Sahyadri Valley & Strawberry Trails",
    title: "Sahyadri Valley & Strawberry Trails",
    destination: "Mahabaleshwar",
    duration_days: 3,
    days: 3,
    duration: "3 Days, 2 Nights",
    price_per_person: 12500,
    price: 12500,
    vendor_net_price: 10500,
    inclusions: ["Hill View Resort", "Panchgani Sightseeing", "Strawberry Farm Experience", "Mapro Garden Tour"],
    itinerary: ["Arthur's Seat & Valley Views", "Strawberry Plucking & Venna Lake Boating", "Table Land Panchgani & Departure"],
    image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1000",
    gallery_urls: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: 96,
    status: "ACTIVE",
    published: true
  }
];

export class PackageService extends BaseService {
  private collection = 'packages';

  /**
   * Fetch all packages across Firestore and API with fallbacks
   */
  async getAll(): Promise<TourPackage[]> {
    // 1. First attempt: Direct client Firestore query via BaseService
    try {
      const docs = await this.listDocuments(this.collection);
      if (docs && docs.length > 0) {
        return docs.map(doc => this.normalizePackage(doc));
      }
    } catch (firestoreErr) {
      console.warn('[PackageService] Client Firestore query skipped or failed, falling back to API:', firestoreErr);
    }

    // 2. Second attempt: Fetch from API endpoint
    try {
      const res = await fetch('/api/partner/packages');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          return data.packages.map((pkg: any) => this.normalizePackage(pkg));
        }
      }
    } catch (apiErr) {
      console.warn('[PackageService] API fetch skipped or failed, using curated defaults:', apiErr);
    }

    // 3. Third fallback: Curated default packages
    return DEFAULT_FALLBACK_PACKAGES;
  }

  /**
   * Register a new package via the partner API
   */
  async createPackage(input: TourPackageInput): Promise<{ success: boolean; packageId?: string; message?: string; package?: TourPackage }> {
    try {
      const res = await fetch('/api/partner/register-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.package) {
        data.package = this.normalizePackage(data.package);
      }
      return data;
    } catch (err: any) {
      console.error('[PackageService] Error registering package:', err);
      return { success: false, message: err?.message || 'Network error while registering package' };
    }
  }

  /**
   * Normalize package properties ensuring both snake_case and camelCase compatibility
   */
  private normalizePackage(raw: any): TourPackage {
    const rawPrice = Number(raw.price_per_person || raw.price || 0);
    const rawDays = Number(raw.duration_days || raw.days || 3);
    const title = raw.package_name || raw.title || raw.name || 'Tour Package';
    const destination = raw.destination || raw.location || 'Maharashtra';
    const mainImage = raw.image_url || raw.imageUrl || raw.image || DEFAULT_FALLBACK_PACKAGES[0].image_url;

    return {
      id: raw.id || `PKG-${Date.now()}`,
      vendor_id: raw.vendor_id || raw.vendorId || 'vendor-1',
      package_name: title,
      title: title,
      destination: destination,
      origin_city: raw.origin_city || raw.originCity || 'Ex-Origin',
      pickup_point: raw.pickup_point || raw.pickupPoint || '',
      drop_point: raw.drop_point || raw.dropPoint || '',
      theme: raw.theme || 'Family & Leisure',
      tour_type: raw.tour_type || raw.tourType || 'PRIVATE',
      duration_days: rawDays,
      days: rawDays,
      nights: Number(raw.nights || raw.durationNights || Math.max(1, rawDays - 1)),
      duration: raw.duration || `${rawDays} Days, ${Math.max(1, rawDays - 1)} Nights`,
      price_per_person: rawPrice,
      price: rawPrice,
      vendor_net_price: Number(raw.vendor_net_price || raw.vendorNetPrice || Math.round(rawPrice * 0.85)),
      triple_sharing_price: Number(raw.triple_sharing_price || raw.tripleSharingPrice || Math.round(rawPrice * 0.9)),
      child_with_bed_price: Number(raw.child_with_bed_price || raw.childWithBedPrice || Math.round(rawPrice * 0.75)),
      child_no_bed_price: Number(raw.child_no_bed_price || raw.childNoBedPrice || Math.round(rawPrice * 0.5)),
      hotel_star_rating: raw.hotel_star_rating || raw.hotelStarRating || '3-Star Deluxe',
      vehicle_type: raw.vehicle_type || raw.vehicleType || 'Private AC Vehicle',
      inclusions: Array.isArray(raw.inclusions) && raw.inclusions.length > 0 ? raw.inclusions : ['Resort Stay', 'Transfers', 'Sightseeing'],
      exclusions: Array.isArray(raw.exclusions) ? raw.exclusions : [],
      day_itinerary: Array.isArray(raw.day_itinerary) ? raw.day_itinerary : Array.isArray(raw.dayItinerary) ? raw.dayItinerary : [],
      itinerary: Array.isArray(raw.itinerary) ? raw.itinerary : [],
      batch_dates: Array.isArray(raw.batch_dates) ? raw.batch_dates : Array.isArray(raw.batchDates) ? raw.batchDates : [],
      max_group_size: Number(raw.max_group_size || raw.maxGroupSize || 15),
      cancellation_policy: raw.cancellation_policy || raw.cancellationPolicy || 'Standard 15-day refund policy',
      guidelines: Array.isArray(raw.guidelines) ? raw.guidelines : [],
      image_url: mainImage,
      imageUrl: mainImage,
      image: mainImage,
      gallery_urls: Array.isArray(raw.gallery_urls) ? raw.gallery_urls : Array.isArray(raw.galleryUrls) ? raw.galleryUrls : [mainImage],
      galleryUrls: Array.isArray(raw.galleryUrls) ? raw.galleryUrls : Array.isArray(raw.gallery_urls) ? raw.gallery_urls : [mainImage],
      rating: raw.rating || 4.8,
      reviews: raw.reviews || 24,
      status: raw.status || 'ACTIVE',
      published: raw.published !== false,
      created_at: raw.created_at || raw.createdAt || new Date().toISOString()
    };
  }
}

export const packageService = new PackageService();
