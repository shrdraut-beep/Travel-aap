import { create } from 'zustand';
import { secureStorage } from '../utils/security';

export interface VendorApplication {
  id: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  category: 'Hotel' | 'Cab' | 'Tour Package' | 'Tour Operator';
  city: string;
  address?: string;
  pricingDetails: string;
  photoUrls: string[];
  licenseGst: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  rejectionReason?: string;
}

export interface VendorProfile {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  business_type?: string;
  address?: {
    full_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  legal?: {
    pan_number?: string;
    gstin?: string;
    has_gst?: boolean;
    trade_license?: string;
  };
  bank_details?: {
    account_name?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    verified_via_penny_drop?: boolean;
  };
  kyc_documents?: {
    pan_url?: string;
    gst_url?: string;
    cheque_url?: string;
  };
  kyc_status?: 'APPROVED' | 'VERIFIED' | 'PENDING' | 'REJECTED';
  kycStatus?: 'APPROVED' | 'VERIFIED' | 'PENDING' | 'REJECTED';
  businessName?: string;
  ownerName?: string;
  panNumber?: string;
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
  };
  businessTypes?: ('HOTEL' | 'TOUR_OPERATOR' | 'CAB_OPERATOR' | 'BUS_OPERATOR' | string)[];
  apiKeyMasked?: string;
  apiKeyHash?: string;
  apiKeyCreatedAt?: string;
  created_at?: string;
}

export interface CabItem {
  id: string;
  vendor_id: string;
  vehicle_model: string;
  vehicle_number: string;
  seating_capacity: number;
  ac_type: 'AC' | 'NON_AC' | string;
  fuel_type?: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC' | string;
  has_roof_carrier?: boolean;
  driver_details: {
    name: string;
    contact: string;
    driver_bata?: number;
  };
  pricing: {
    base_fare_per_day: number;
    price_per_km: number;
    min_km_per_day?: number;
    toll_rule?: 'EXCLUDED' | 'INCLUDED' | string;
  };
  legal: {
    is_verified_vahan: boolean;
    fitness_valid_till?: string;
  };
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | string;
  created_at: string;
}

export interface BusItem {
  id: string;
  vendor_id: string;
  operator_name: string;
  registration_number: string;
  bus_type: string;
  bus_layout?: '2X1_SLEEPER' | '2X2_SEATER' | '1X2_HYBRID' | string;
  women_protection?: boolean;
  conductor_phone?: string;
  dinner_halt?: string;
  pickup_landmark?: string;
  total_capacity: number;
  driver_details?: {
    name: string;
    contact: string;
  };
  legal?: {
    permit_type?: string;
    fitness_valid_till?: string;
    insurance_valid_till?: string;
  };
  schedule?: {
    runs_on_type: 'DAILY' | 'SPECIFIC' | string;
    specific_days?: string[];
  };
  route: {
    source: string;
    destination: string;
  };
  points?: {
    boarding?: Array<{ location: string; time: string; landmark?: string }>;
    dropping?: Array<{ location: string; time: string }>;
  };
  pricing: {
    selling_price: number;
    vendor_net_price: number;
    weekend_price?: number;
  };
  amenities?: {
    ac?: boolean;
    wifi?: boolean;
    waterBottle?: boolean;
    chargingPoint?: boolean;
    blanket?: boolean;
  };
  status: 'ACTIVE' | 'INACTIVE' | string;
  created_at: string;
}

interface VendorStoreState {
  applications: VendorApplication[];
  profile: VendorProfile | null;
  cabs: CabItem[];
  buses: BusItem[];
  addApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => VendorApplication;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, reason?: string) => void;
  deleteApplication: (id: string) => void;
  resetApplications: () => void;
  setProfile: (profile: VendorProfile | null) => void;
  setBusinessTypes: (types: string[]) => void;
  toggleBusinessType: (type: string) => void;
  setApiKeyMasked: (key: string) => void;
  addCab: (cab: CabItem) => void;
  setCabs: (cabs: CabItem[]) => void;
  addBus: (bus: BusItem) => void;
  setBuses: (buses: BusItem[]) => void;
}

const DEFAULT_APPLICATIONS: VendorApplication[] = [];

const getStoredVendorApps = (): VendorApplication[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = secureStorage.getItem<VendorApplication[]>('routripo_vendor_apps');
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {
      console.warn("Failed to load vendor applications from storage", e);
    }
  }
  return DEFAULT_APPLICATIONS;
};

const saveVendorApps = (apps: VendorApplication[]) => {
  if (typeof window !== 'undefined') {
    secureStorage.setItem('routripo_vendor_apps', apps);
  }
};

const getStoredProfile = (): VendorProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      return secureStorage.getItem<VendorProfile>('routripo_vendor_profile');
    } catch (e) {}
  }
  return null;
};

export const useVendorStore = create<VendorStoreState>((set, get) => ({
  applications: getStoredVendorApps(),
  profile: getStoredProfile(),
  cabs: [],
  buses: [],

  addApplication: (appData) => {
    const newApp: VendorApplication = {
      ...appData,
      id: `vendor-app-${Date.now()}`,
      status: 'PENDING',
      submittedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    const updated = [newApp, ...get().applications];
    set({ applications: updated });
    saveVendorApps(updated);
    return newApp;
  },

  approveApplication: (id) => {
    const updated = get().applications.map(app => 
      app.id === id ? { ...app, status: 'APPROVED' as const, rejectionReason: undefined } : app
    );
    set({ applications: updated });
    saveVendorApps(updated);
  },

  rejectApplication: (id, reason) => {
    const updated = get().applications.map(app => 
      app.id === id ? { ...app, status: 'REJECTED' as const, rejectionReason: reason || 'Information incomplete or GST verification failed' } : app
    );
    set({ applications: updated });
    saveVendorApps(updated);
  },

  deleteApplication: (id) => {
    const updated = get().applications.filter(app => app.id !== id);
    set({ applications: updated });
    saveVendorApps(updated);
  },

  resetApplications: () => {
    set({ applications: DEFAULT_APPLICATIONS });
    saveVendorApps(DEFAULT_APPLICATIONS);
  },

  setProfile: (profile) => {
    set({ profile });
    if (typeof window !== 'undefined') {
      if (profile) secureStorage.setItem('routripo_vendor_profile', profile);
      else secureStorage.removeItem('routripo_vendor_profile');
    }
  },

  setBusinessTypes: (types) => {
    const current = get().profile;
    const updated: VendorProfile = current
      ? { ...current, businessTypes: types }
      : {
          id: 'VEND-1001',
          business_name: 'Registered Vendor Partner',
          owner_name: 'Partner',
          email: 'vendor@routripo.com',
          phone: '9876543210',
          businessTypes: types
        };
    set({ profile: updated });
    if (typeof window !== 'undefined') {
      secureStorage.setItem('routripo_vendor_profile', updated);
    }
  },

  toggleBusinessType: (type) => {
    const current = get().profile;
    const existing = current?.businessTypes && current.businessTypes.length > 0
      ? current.businessTypes
      : ['HOTEL', 'TOUR_OPERATOR', 'CAB_OPERATOR', 'BUS_OPERATOR'];
    const updatedTypes = existing.includes(type)
      ? existing.filter((t) => t !== type)
      : [...existing, type];
    // Keep at least one selected so dashboard isn't completely empty
    const finalTypes = updatedTypes.length > 0 ? updatedTypes : [type];
    get().setBusinessTypes(finalTypes);
  },

  setApiKeyMasked: (key) => {
    const current = get().profile;
    if (current) {
      const updated: VendorProfile = {
        ...current,
        apiKeyMasked: key,
        apiKeyCreatedAt: new Date().toISOString()
      };
      set({ profile: updated });
      if (typeof window !== 'undefined') {
        secureStorage.setItem('routripo_vendor_profile', updated);
      }
    }
  },

  addCab: (cab) => {
    set((state) => ({ cabs: [cab, ...state.cabs.filter(c => c.id !== cab.id)] }));
  },

  setCabs: (cabs) => {
    set({ cabs });
  },

  addBus: (bus) => {
    set((state) => ({ buses: [bus, ...state.buses.filter(b => b.id !== bus.id)] }));
  },

  setBuses: (buses) => {
    set({ buses });
  }
}));
