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
