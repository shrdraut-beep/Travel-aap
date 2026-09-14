export interface SavedTraveller {
  id: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mstr';
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string;
  type: 'Adult' | 'Child' | 'Infant';
  isSelf?: boolean;
  phone?: string;
  email?: string;
}

const STORAGE_KEY = 'routripo_saved_travellers';

const DEFAULT_TRAVELLERS: SavedTraveller[] = [
  {
    id: 'traveller-self',
    title: 'Mr',
    firstName: 'Rahul',
    lastName: 'Sharma',
    gender: 'Male',
    dob: '1992-05-14',
    type: 'Adult',
    isSelf: true,
    phone: '9876543210',
    email: 'rahul.sharma@example.com'
  },
  {
    id: 'traveller-priya',
    title: 'Mrs',
    firstName: 'Priya',
    lastName: 'Sharma',
    gender: 'Female',
    dob: '1994-08-22',
    type: 'Adult',
    phone: '9876543211'
  },
  {
    id: 'traveller-aarav',
    title: 'Mstr',
    firstName: 'Aarav',
    lastName: 'Sharma',
    gender: 'Male',
    dob: '2017-11-05',
    type: 'Child'
  }
];

export class SavedTravellersService {
  static getTravellers(): SavedTraveller[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with default template
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRAVELLERS));
        return DEFAULT_TRAVELLERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TRAVELLERS;
    }
  }

  static addTraveller(traveller: Omit<SavedTraveller, 'id'>): SavedTraveller {
    const list = this.getTravellers();
    const newTraveller: SavedTraveller = {
      ...traveller,
      id: `traveller-${Date.now()}`
    };
    list.push(newTraveller);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save traveller to storage', e);
    }
    return newTraveller;
  }

  static removeTraveller(id: string): void {
    const list = this.getTravellers().filter(t => t.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to delete traveller from storage', e);
    }
  }
}
