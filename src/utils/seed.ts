import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { mockFlights, mockHotels, mockTrains, mockCars, mockCabs, mockBuses, mockPackages } from '../data/mockDataStore';

export async function seedDatabase() {
  const collections = {
    flights: mockFlights,
    hotels: mockHotels,
    trains: mockTrains,
    cars: mockCars,
    cabs: mockCabs,
    buses: mockBuses,
    packages: mockPackages
  };

  for (const [colName, data] of Object.entries(collections)) {
    for (const item of data) {
      // @ts-ignore
      await setDoc(doc(db, colName, item.id), item);
    }
  }
  console.log("Database seeded successfully.");
}
