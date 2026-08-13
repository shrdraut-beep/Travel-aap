import { create } from 'zustand';
import { secureStorage } from '../utils/security';

export interface VendorApplication {
  id: string;
  ownerName: string;
  businessName: string;
  email: string;
  phone: string;
  category: 'Hotel' | 'Cab';
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

interface VendorStoreState {
  applications: VendorApplication[];
  addApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => VendorApplication;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, reason?: string) => void;
  deleteApplication: (id: string) => void;
  resetApplications: () => void;
}

const DEFAULT_APPLICATIONS: VendorApplication[] = [
  {
    id: 'vendor-app-1',
    ownerName: 'Rajesh Sharma',
    businessName: 'Express Inn Hotel & Suites',
    email: 'rajesh@expressinnhotels.com',
    phone: '+91 98220 12345',
    category: 'Hotel',
    city: 'Nashik',
    address: 'Pathardi Phata, Mumbai-Agra Highway, Nashik',
    pricingDetails: '₹4,800/night (5-Star Luxury Suite)',
    photoUrls: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    licenseGst: '27AABCU9603R1ZM',
    description: 'Premier 5-star luxury hotel on Mumbai-Agra highway with rooftop swimming pool and spa.',
    status: 'APPROVED',
    submittedAt: '2026-08-10 10:30 AM'
  },
  {
    id: 'vendor-app-2',
    ownerName: 'Vikramaditya Deshmukh',
    businessName: 'Grape County Eco Resort',
    email: 'contact@grapecounty.in',
    phone: '+91 94222 88990',
    category: 'Hotel',
    city: 'Nashik',
    address: 'Anjaneri, Trimbakeshwar Road, Nashik 422213',
    pricingDetails: '₹5,200/night (Lake View Eco Villa)',
    photoUrls: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'],
    licenseGst: '27AAECG1029K1Z4',
    description: 'Organic eco resort with private lake, kayaking, and natural flora habitat.',
    status: 'PENDING',
    submittedAt: '2026-08-12 04:15 PM'
  },
  {
    id: 'vendor-app-3',
    ownerName: 'Amitabh Sen',
    businessName: 'Royal Express Cabs & SUV Fleet',
    email: 'info@royalexpresscabs.com',
    phone: '+91 98231 55443',
    category: 'Cab',
    city: 'Nashik',
    address: 'Near CBS Bus Stand, Nashik',
    pricingDetails: '₹21/km (Innova Crysta VIP 7-Seater)',
    photoUrls: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600'],
    licenseGst: '27AABCR8830L1Z9',
    description: 'Fleet of 15 Innova Crysta & Dzire vehicles with verified expressway drivers.',
    status: 'PENDING',
    submittedAt: '2026-08-13 09:00 AM'
  }
];

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

export const useVendorStore = create<VendorStoreState>((set, get) => ({
  applications: getStoredVendorApps(),

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
  }
}));
