export interface BusLocation {
  city: string;
  station: string;
  time: string;
}

export interface BusDetails {
  id: string;
  name: string; // From dhan-gaadi: name
  busNumber: string; // From dhan-gaadi: busNumber
  type: string; // AC, Delux, Normal, Sleeper
  fare: number; // Base fare
  departure: BusLocation;
  arrival: BusLocation;
  duration: string;
  amenities: string[];
  totalSeats: number;
  availableSeats: number;
  rating: number;
  boardingPoints: { id: string, name: string, time: string, landmark?: string }[];
  droppingPoints: { id: string, name: string, time: string, landmark?: string }[];
}

export interface BusSeat {
  id: string;
  seatNumber: string;
  isAvailable: boolean;
  price: number;
  isSleeper: boolean;
  isWomenOnly: boolean;
  row: number;
  col: number;
  deck: 'lower' | 'upper';
}

export class BusService {
  public searchBuses(params: { origin: string; destination: string; date: string }): BusDetails[] {
    // Generate realistic mock data inspired by dhan-gaadi
    const { origin, destination } = params;
    const isOvernight = true;
    
    return [
      {
        id: `bus_${Date.now()}_1`,
        name: "IntrCity SmartBus",
        busNumber: "MH-04-AB-1234",
        type: "A/C Sleeper (2+1)",
        fare: 1200,
        departure: { city: origin, station: `${origin} Main Bus Stand`, time: "21:30" },
        arrival: { city: destination, station: `${destination} Central`, time: "07:30" },
        duration: "10h 00m",
        amenities: ["Water Bottle", "Blanket", "Charging Point", "Reading Light", "WIFI"],
        totalSeats: 30,
        availableSeats: 12,
        rating: 4.5,
        boardingPoints: [
          { id: "bp1", name: "Andheri East", time: "21:30", landmark: "Near Metro Station" },
          { id: "bp2", name: "Borivali National Park", time: "22:15", landmark: "Omkareshwar Temple" }
        ],
        droppingPoints: [
          { id: "dp1", name: "Mapusa", time: "06:45", landmark: "Mapusa Bus Stand" },
          { id: "dp2", name: "Panjim", time: "07:30", landmark: "KTC Bus Stand" }
        ]
      },
      {
        id: `bus_${Date.now()}_2`,
        name: "Zingbus",
        busNumber: "MH-12-PQ-9876",
        type: "Volvo Multi-Axle A/C Semi Sleeper (2+2)",
        fare: 950,
        departure: { city: origin, station: `${origin} Bypass`, time: "19:00" },
        arrival: { city: destination, station: `${destination} Highway`, time: "05:00" },
        duration: "10h 00m",
        amenities: ["Water Bottle", "Charging Point", "Emergency Contact"],
        totalSeats: 45,
        availableSeats: 4,
        rating: 4.2,
        boardingPoints: [
          { id: "bp3", name: "Vashi Plaza", time: "19:00", landmark: "Vashi" },
          { id: "bp4", name: "Kalamboli", time: "19:40", landmark: "McDonalds" }
        ],
        droppingPoints: [
          { id: "dp3", name: "Margao", time: "05:00", landmark: "Margao Bus Stand" }
        ]
      },
      {
        id: `bus_${Date.now()}_3`,
        name: "Neeta Tours and Travels",
        busNumber: "GA-03-XY-4455",
        type: "Non A/C Seater (2+2)",
        fare: 600,
        departure: { city: origin, station: `${origin} State Transport`, time: "08:00" },
        arrival: { city: destination, station: `${destination} State Transport`, time: "20:00" },
        duration: "12h 00m",
        amenities: ["Rest Stops"],
        totalSeats: 40,
        availableSeats: 35,
        rating: 3.5,
        boardingPoints: [
          { id: "bp5", name: "Dadar East", time: "08:00" }
        ],
        droppingPoints: [
          { id: "dp5", name: "Panjim KTC", time: "20:00" }
        ]
      }
    ];
  }

  public getSeatLayout(busId: string): { lowerDeck: BusSeat[], upperDeck: BusSeat[] } {
    // Generate a typical 2+1 Sleeper layout (like Dhan-Gaadi / Redbus)
    const lowerDeck: BusSeat[] = [];
    const upperDeck: BusSeat[] = [];

    // Lower deck 2+1 (columns 1,2 on left, aisle, column 3 on right)
    for (let row = 1; row <= 5; row++) {
      lowerDeck.push({ id: `L${row}1`, seatNumber: `L${row}1`, isAvailable: Math.random() > 0.3, price: 1200, isSleeper: true, isWomenOnly: row === 1, row, col: 1, deck: 'lower' });
      lowerDeck.push({ id: `L${row}2`, seatNumber: `L${row}2`, isAvailable: Math.random() > 0.4, price: 1200, isSleeper: true, isWomenOnly: row === 1, row, col: 2, deck: 'lower' });
      lowerDeck.push({ id: `L${row}3`, seatNumber: `L${row}3`, isAvailable: Math.random() > 0.5, price: 1250, isSleeper: true, isWomenOnly: false, row, col: 4, deck: 'lower' }); // Col 4 represents single seat across aisle
    }

    // Upper deck 2+1
    for (let row = 1; row <= 5; row++) {
      upperDeck.push({ id: `U${row}1`, seatNumber: `U${row}1`, isAvailable: Math.random() > 0.3, price: 1100, isSleeper: true, isWomenOnly: false, row, col: 1, deck: 'upper' });
      upperDeck.push({ id: `U${row}2`, seatNumber: `U${row}2`, isAvailable: Math.random() > 0.4, price: 1100, isSleeper: true, isWomenOnly: false, row, col: 2, deck: 'upper' });
      upperDeck.push({ id: `U${row}3`, seatNumber: `U${row}3`, isAvailable: Math.random() > 0.5, price: 1150, isSleeper: true, isWomenOnly: false, row, col: 4, deck: 'upper' });
    }

    return { lowerDeck, upperDeck };
  }
}

export const busService = new BusService();
