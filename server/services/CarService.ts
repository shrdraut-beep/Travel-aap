export interface CarDetails {
  id: string;
  registrationNumber?: string;
  title: string;
  subtitle?: string;
  company: string;
  model: string;
  year?: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | string;
  seats: number;
  transmission: 'Automatic' | 'Manual' | string;
  price: number;
  originalPrice: number;
  pricePerDay: number;
  deposit?: number;
  tag?: string;
  tagBg?: string;
  verifiedBadge?: string;
  pickupText?: string;
  rating: number;
  reviews: string | number;
  trips?: number;
  images: string[];
  features: string[];
  category: string;
  unlimitedKms?: boolean;
  fastest?: boolean;
  topRated?: boolean;
  vendorName?: string;
}

export class CarService {
  public searchCars(params: {
    location?: string;
    origin?: string;
    destination?: string;
    pickupDate?: string;
    dropDate?: string;
    passengers?: number;
  }): CarDetails[] {
    const loc = (params.location || params.destination || "Goa").toString();
    const isAirport = loc.toLowerCase().includes("airport") || (params.origin || "").toLowerCase().includes("airport");

    return [
      {
        id: "cab_sedan_01",
        title: "Prime Sedan — Swift Dzire / Etios",
        subtitle: "Dedicated airport luggage boot • Chilled AC guarantee",
        category: "AC Sedan",
        company: "Maruti Suzuki / Toyota",
        model: "Swift Dzire",
        tag: "BESTSELLER",
        tagBg: "bg-amber-600 text-white",
        verifiedBadge: "Airport Verified",
        pickupText: isAirport ? "Terminal Gate 3 • Pickup in 6m" : "Pickup at your doorstep in 8m",
        rating: 4.9,
        reviews: "(1.2k+)",
        fuelType: "petrol",
        seats: 4,
        transmission: "Manual",
        price: 1150,
        originalPrice: 1320,
        pricePerDay: 1150,
        deposit: 1500,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCU6DHVZn7-oXDVW59eiDuXZDNADxaQ7NmguGfOfHGiuWVXYEblGuTUlrUV0tYxf0mi7ZDH2YfNgY0l8wnLrNMG_PipoMtrptXlSCgoVGuVb0CjpxqYeMT5MnyJuBpf8omT8_JDkQ91SeBvGO6czWgn9Mav6dm9fcsc2SVAnwt3woyU-SIiaeHDBfb7zVFUVf_jxUwSAYSdQhGt1v7IiQ2V_mplJR6NDi1-cwQctBj81wNXxdJvTLko"
        ],
        features: ["AC Chilled", "3 Large Bags", "4 Seater", "Free Cancellation"],
        unlimitedKms: true,
        fastest: false,
        topRated: true,
        vendorName: "RouTripo Verified Fleet"
      },
      {
        id: "cab_suv_02",
        title: "Prime SUV — Toyota Innova Crysta",
        subtitle: "Spacious luxury MPV with massive boot capacity",
        category: "SUV 6+ Seater",
        company: "Toyota",
        model: "Innova Crysta",
        tag: "GROUP TRAVEL",
        tagBg: "bg-sky-600 text-white",
        verifiedBadge: "6-7 Seater",
        pickupText: isAirport ? "Terminal Gate 4 • Pickup in 10m" : "Pickup at your doorstep in 12m",
        rating: 4.95,
        reviews: "(890+)",
        fuelType: "diesel",
        seats: 7,
        transmission: "Automatic",
        price: 1850,
        originalPrice: 2100,
        pricePerDay: 1850,
        deposit: 2500,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDm7gquDaRg4FaRrL4U_GV69n0Od_wdV7vjRS4wo7Vmyk9C8_lDbYTqpyj-6loX0F0fypAfZUXTwGxWkyS84sQsYIZ0BEVyo3vYrLsLSJV-9IIb2sKTWYI1YKyh_ltxKYbSWpHoVzckctdgiR8_aYBNp4cBjRUwfSAUy_M-7Ozy6SWyNgbyz3fjCMu8ROYdoJeAgdBvIhhjIcFjIgJlB4MxdwqN9X989TrqcylbFjvVUnKfwynk1rYx"
        ],
        features: ["Extra Legroom", "5+ Suitcases", "6-7 Seater", "Top Rated Chauffeur"],
        unlimitedKms: true,
        fastest: false,
        topRated: true,
        vendorName: "RouTripo Prime Chauffeurs"
      },
      {
        id: "cab_mini_03",
        title: "Mini Hatchback — WagonR / Tiago",
        subtitle: "Ideal for solo travellers & couples on a budget",
        category: "AC Sedan",
        company: "Maruti Suzuki / Tata",
        model: "WagonR / Tiago",
        tag: "CHEAPEST FARE",
        tagBg: "bg-emerald-600 text-white",
        verifiedBadge: "Pocket Friendly",
        pickupText: isAirport ? "Terminal Gate 2 • Pickup in 4m" : "Pickup in 5m",
        rating: 4.7,
        reviews: "(3.4k+)",
        fuelType: "petrol",
        seats: 4,
        transmission: "Manual",
        price: 890,
        originalPrice: 999,
        pricePerDay: 890,
        deposit: 1000,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAqJPbx3LqpfMiqk_ZaU8WRLZNuopA7Ic-I6ZgDXyttcKoqWQXeLiXJwRtZfl1QbbHj20vmWaGpyITVO5HfjaOezrcIkeKNa8Dm24jSkDskBqnuVOp4o_Xnh42V9meysdecjez4t01X3ersyyc-WsTNwhLmqP2o12iEWArnvro_VtWdAiArYUYKPoXcMM9-HrQpObFgnWXedk1Jg6qXfainORNjYnjUO4giWQXI1qQzWhCknM9DyIbC"
        ],
        features: ["Compact & Swift", "2 Cabin Bags", "Fixed Fare", "Zero Surge Lock"],
        unlimitedKms: true,
        fastest: true,
        topRated: false,
        vendorName: "RouTripo Pocket Cabs"
      },
      {
        id: "cab_ev_04",
        title: "Luxury Electric Cab — BYD e6 / Nexon EV",
        subtitle: "Ultra quiet premium electric ride with dedicated fast green lane",
        category: "SUV 6+ Seater",
        company: "BYD / Tata Motors",
        model: "e6 / Nexon EV",
        tag: "ECO GREEN",
        tagBg: "bg-teal-600 text-white",
        verifiedBadge: "Zero Emission",
        pickupText: isAirport ? "EV Bay E-1 • Pickup in 8m" : "Fast EV Pickup in 7m",
        rating: 4.98,
        reviews: "(640+)",
        fuelType: "electric",
        seats: 5,
        transmission: "Automatic",
        price: 1350,
        originalPrice: 1550,
        pricePerDay: 1350,
        deposit: 2000,
        images: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCnsnOUuU4w1DnmRJjo6lBsfiqr3sT7TfaCDdqqMLS3ne6F-tqUz8mgfG5HqiuIlwytttEaiIPEXP7RuZf-k1u_lXhIThHVxCCCwU6cdEZowWq4Z-UiGUJT4-DrMlWf2ON89jB2eGBxfS4mvN2VattTOuih6Gb3VQWaZodM0fIXadQ6f8sWFKQsv2uLTSktGmsHv-BKFXwfJyI7obqZIwwmhp2gdG1qt8-QPYOpw9upCym1XEykWjNk"
        ],
        features: ["Silent Ride", "Zero Emission", "Complimentary Water", "Fast EV Priority Lane"],
        unlimitedKms: true,
        fastest: false,
        topRated: true,
        vendorName: "RouTripo Green Mobility"
      }
    ];
  }
}

export const carService = new CarService();
