/**
 * Master Passenger Service
 * Manages saved co-travellers for instant 1-click booking checkout
 */

export interface Passenger {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License';
  idNumber: string; // Stored masked or encrypted
  mealPreference: 'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'Diabetic';
  frequentFlyerNo?: string;
  isPrimary?: boolean;
}

const STORAGE_KEY = 'routripo_master_passengers_ledger';

const INITIAL_PASSENGERS: Passenger[] = [
  {
    id: 'pax-1',
    fullName: 'Aditi Sharma',
    age: 28,
    gender: 'Female',
    idType: 'Aadhaar',
    idNumber: '•••• •••• 8921',
    mealPreference: 'Veg',
    frequentFlyerNo: 'AI-902418',
    isPrimary: true
  },
  {
    id: 'pax-2',
    fullName: 'Rajesh Sharma',
    age: 58,
    gender: 'Male',
    idType: 'Aadhaar',
    idNumber: '•••• •••• 4512',
    mealPreference: 'Veg',
    frequentFlyerNo: '6E-44219'
  },
  {
    id: 'pax-3',
    fullName: 'Priya Sharma',
    age: 54,
    gender: 'Female',
    idType: 'Aadhaar',
    idNumber: '•••• •••• 1094',
    mealPreference: 'Jain'
  },
  {
    id: 'pax-4',
    fullName: 'Aarav Sharma',
    age: 19,
    gender: 'Male',
    idType: 'Passport',
    idNumber: 'Z••••421',
    mealPreference: 'Non-Veg'
  },
  {
    id: 'pax-5',
    fullName: 'Meera Sharma',
    age: 24,
    gender: 'Female',
    idType: 'Aadhaar',
    idNumber: '•••• •••• 7721',
    mealPreference: 'Veg'
  }
];

type PassengerListener = (passengers: Passenger[]) => void;
const listeners = new Set<PassengerListener>();

export class MasterPassengerService {
  static getPassengers(): Passenger[] {
    if (typeof window === 'undefined') return INITIAL_PASSENGERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PASSENGERS));
        return INITIAL_PASSENGERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_PASSENGERS;
    }
  }

  static subscribe(listener: PassengerListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private static notifyListeners(list: Passenger[]) {
    listeners.forEach((fn) => {
      try {
        fn(list);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private static save(list: Passenger[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      this.notifyListeners(list);
    } catch (e) {
      console.error('Failed to save passengers', e);
    }
  }

  static addPassenger(data: Omit<Passenger, 'id'>): Passenger {
    const list = this.getPassengers();
    const newPax: Passenger = {
      ...data,
      id: `pax-${Date.now()}`
    };
    list.push(newPax);
    this.save(list);
    return newPax;
  }

  static updatePassenger(id: string, updates: Partial<Passenger>): Passenger | null {
    const list = this.getPassengers();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.save(list);
    return list[index];
  }

  static deletePassenger(id: string): boolean {
    const list = this.getPassengers();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    this.save(filtered);
    return true;
  }
}
