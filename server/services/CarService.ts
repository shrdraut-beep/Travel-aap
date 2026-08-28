export interface CarDetails {
  id: string;
  registrationNumber: string; // rentaride: registeration_number
  title: string; // rentaride: car_title
  company: string; // rentaride: company
  model: string; // rentaride: model
  year: number; // rentaride: year_made
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'; // rentaride: fuel_type
  seats: number; // rentaride: seats
  transmission: 'Automatic' | 'Manual';
  pricePerDay: number;
  unlimitedKms: boolean;
  freeKms: number; // if not unlimited
  extraKmCharge: number;
  deposit: number;
  rating: number; // rentaride: rating array -> average
  trips: number;
  images: string[];
  features: string[];
  vendorName: string;
}

export class CarService {
  public searchCars(params: { location: string; pickupDate: string; dropDate: string }): CarDetails[] {
    // Generate realistic mock data inspired by rentaride
    return [
      {
        id: `car_1`,
        registrationNumber: "MH-02-AB-1234",
        title: "Maruti Suzuki Swift",
        company: "Maruti Suzuki",
        model: "Swift VXI",
        year: 2022,
        fuelType: "petrol",
        seats: 5,
        transmission: "Manual",
        pricePerDay: 1500,
        unlimitedKms: false,
        freeKms: 120,
        extraKmCharge: 12,
        deposit: 3000,
        rating: 4.8,
        trips: 45,
        images: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80"],
        features: ["AC", "Bluetooth", "Airbags", "Power Steering"],
        vendorName: "RentARide Premium"
      },
      {
        id: `car_2`,
        registrationNumber: "GA-03-CD-5678",
        title: "Hyundai Creta",
        company: "Hyundai",
        model: "Creta SX",
        year: 2023,
        fuelType: "diesel",
        seats: 5,
        transmission: "Automatic",
        pricePerDay: 2800,
        unlimitedKms: true,
        freeKms: 0,
        extraKmCharge: 0,
        deposit: 5000,
        rating: 4.9,
        trips: 112,
        images: ["https://images.unsplash.com/photo-1620864273574-cecb237e8bb2?w=800&q=80"],
        features: ["AC", "Sunroof", "Touchscreen", "Cruise Control", "Airbags"],
        vendorName: "Goa Drives"
      },
      {
        id: `car_3`,
        registrationNumber: "MH-01-EF-9012",
        title: "Mahindra Thar",
        company: "Mahindra",
        model: "Thar 4x4",
        year: 2021,
        fuelType: "diesel",
        seats: 4,
        transmission: "Manual",
        pricePerDay: 3500,
        unlimitedKms: false,
        freeKms: 100,
        extraKmCharge: 15,
        deposit: 8000,
        rating: 4.7,
        trips: 67,
        images: ["https://images.unsplash.com/photo-1616422285623-2424b91040ed?w=800&q=80"],
        features: ["AC", "4x4", "Bluetooth", "Removable Roof"],
        vendorName: "Adventure Rides"
      }
    ];
  }
}

export const carService = new CarService();
