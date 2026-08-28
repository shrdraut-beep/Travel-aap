// src/utils/airlineFareBrands.ts
export interface AirlineFareBrandTier {
  id: string;
  label: string;          // e.g. "Super 6E" or "Economy Flex"
  fare_name: string;
  pricePerAdult: number;
  cabinBaggageKg: number;
  checkinBaggageKg: number;
  refundable: boolean;
  cancellationSummary?: string;
  dateChangeSummary?: string;
  cancellationSlabs: { window: string; fee: number; platformFee: number }[];
  dateChangeSlabs: { window: string; fee: number; platformFee: number }[];
  seatsIncluded: 'chargeable' | 'free';
  mealsIncluded: 'chargeable' | 'complimentary';
  badge?: string;
  description?: string;
}

export function getAirlineFareTiers(airline: string = '', basePrice: number = 4850): AirlineFareBrandTier[] {
  const norm = airline.toLowerCase().trim();

  // 1. IndiGo (6E)
  if (norm.includes('indigo') || norm.includes('6e')) {
    return [
      {
        id: '6e_saver',
        label: 'Saver (Regular)',
        fare_name: 'Saver',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,500',
        cancellationSlabs: [{ window: '4 hrs to 4 days', fee: 3500, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 3,250',
        dateChangeSlabs: [{ window: '4 hrs to 4 days', fee: 3250, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'chargeable',
        description: 'Standard Economy fare with 15kg check-in baggage'
      },
      {
        id: '6e_flexi',
        label: 'Flexi Plus',
        fare_name: 'Flexi Plus',
        pricePerAdult: basePrice + 750,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Most Popular',
        cancellationSummary: 'Cancellation: INR 500',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 500, platformFee: 300 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Free standard seat, choice of snack/drink & low cancellation charges'
      },
      {
        id: '6e_super',
        label: 'Super 6E',
        fare_name: 'Super 6E',
        pricePerAdult: basePrice + 1450,
        cabinBaggageKg: 10,
        checkinBaggageKg: 20,
        refundable: true,
        badge: 'Best Value',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Extra legroom seat, free gourmet hot meal, 20kg baggage & priority check-in'
      },
      {
        id: '6e_corporate',
        label: '6E Corporate',
        fare_name: 'Corporate',
        pricePerAdult: basePrice + 1850,
        cabinBaggageKg: 7,
        checkinBaggageKg: 25,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Designed for business travelers with zero change fee & 25kg baggage'
      }
    ];
  }

  // 2. Air India (AI)
  if (norm.includes('air india') || norm === 'ai' || norm.includes('airindia')) {
    return [
      {
        id: 'ai_comfort',
        label: 'Economy Comfort',
        fare_name: 'Economy Comfort',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,000',
        cancellationSlabs: [{ window: 'Up to 24 hrs before', fee: 3000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 2,500',
        dateChangeSlabs: [{ window: 'Up to 24 hrs before', fee: 2500, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'complimentary',
        description: 'Standard Air India Economy with complimentary hot meals on-board'
      },
      {
        id: 'ai_flex',
        label: 'Economy Flex',
        fare_name: 'Economy Flex',
        pricePerAdult: basePrice + 850,
        cabinBaggageKg: 7,
        checkinBaggageKg: 25,
        refundable: true,
        badge: 'Recommended',
        cancellationSummary: 'Cancellation: INR 1,000',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 1000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: '25kg check-in baggage, free date change & preferred seat selection'
      },
      {
        id: 'ai_premium',
        label: 'Premium Economy',
        fare_name: 'Premium Economy',
        pricePerAdult: basePrice + 1950,
        cabinBaggageKg: 10,
        checkinBaggageKg: 30,
        refundable: true,
        badge: 'Luxury Cabin',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Spacious dedicated cabin, priority check-in, 30kg baggage & multi-course dining'
      },
      {
        id: 'ai_executive',
        label: 'Business Executive',
        fare_name: 'Executive Business',
        pricePerAdult: basePrice + 3500,
        cabinBaggageKg: 12,
        checkinBaggageKg: 35,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Flatbed comfort, airport lounge access, 35kg baggage & luxury priority service'
      }
    ];
  }

  // 3. Vistara (UK)
  if (norm.includes('vistara') || norm.includes('uk')) {
    return [
      {
        id: 'uk_value',
        label: 'Economy Value',
        fare_name: 'Economy Value',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,250',
        cancellationSlabs: [{ window: 'Up to 24 hrs before', fee: 3250, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 2,750',
        dateChangeSlabs: [{ window: 'Up to 24 hrs before', fee: 2750, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'complimentary',
        description: 'Standard Vistara Economy with gourmet meals included'
      },
      {
        id: 'uk_standard',
        label: 'Economy Standard',
        fare_name: 'Economy Standard',
        pricePerAdult: basePrice + 650,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Popular Choice',
        cancellationSummary: 'Cancellation: INR 2,000',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 2000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Free standard seat selection, 15kg baggage & 1 free date change'
      },
      {
        id: 'uk_flexi',
        label: 'Economy Flexi',
        fare_name: 'Economy Flexi',
        pricePerAdult: basePrice + 1250,
        cabinBaggageKg: 7,
        checkinBaggageKg: 20,
        refundable: true,
        badge: 'Best Flexibility',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: '20kg check-in baggage, priority boarding & zero cancellation fee'
      },
      {
        id: 'uk_prem_econ',
        label: 'Premium Economy Standard',
        fare_name: 'Premium Economy',
        pricePerAdult: basePrice + 2400,
        cabinBaggageKg: 10,
        checkinBaggageKg: 25,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Exclusive Premium Economy cabin, extended legroom & Starbucks coffee onboard'
      }
    ];
  }

  // 4. SpiceJet (SG)
  if (norm.includes('spicejet') || norm.includes('sg') || norm.includes('spice')) {
    return [
      {
        id: 'sg_saver',
        label: 'SpiceSaver',
        fare_name: 'SpiceSaver',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,500',
        cancellationSlabs: [{ window: 'Up to 4 hrs before', fee: 3500, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 3,000',
        dateChangeSlabs: [{ window: 'Up to 4 hrs before', fee: 3000, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'chargeable',
        description: 'Essential Economy fare with 15kg baggage allowance'
      },
      {
        id: 'sg_flex',
        label: 'SpiceFlex',
        fare_name: 'SpiceFlex',
        pricePerAdult: basePrice + 650,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Recommended',
        cancellationSummary: 'Cancellation: INR 500',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 500, platformFee: 300 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Free flight date changes, free sandwich voucher & standard seat selection'
      },
      {
        id: 'sg_max',
        label: 'SpiceMax',
        fare_name: 'SpiceMax',
        pricePerAdult: basePrice + 1350,
        cabinBaggageKg: 10,
        checkinBaggageKg: 20,
        refundable: true,
        badge: 'Extra Comfort',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Extra legroom seats, complimentary hot meal, priority check-in & baggage'
      },
      {
        id: 'sg_biz',
        label: 'SpiceBiz',
        fare_name: 'SpiceBiz',
        pricePerAdult: basePrice + 2800,
        cabinBaggageKg: 10,
        checkinBaggageKg: 30,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Dedicated business class recliner seat, lounge access & 30kg baggage'
      }
    ];
  }

  // 5. Akasa Air (QP)
  if (norm.includes('akasa') || norm.includes('qp')) {
    return [
      {
        id: 'qp_saver',
        label: 'Akasa Saver',
        fare_name: 'Akasa Saver',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,000',
        cancellationSlabs: [{ window: 'Up to 24 hrs before', fee: 3000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 2,750',
        dateChangeSlabs: [{ window: 'Up to 24 hrs before', fee: 2750, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'chargeable',
        description: 'Eco-friendly modern Boeing 737 MAX fare with USB charging'
      },
      {
        id: 'qp_flexi',
        label: 'Akasa Flexi',
        fare_name: 'Akasa Flexi',
        pricePerAdult: basePrice + 700,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Most Popular',
        cancellationSummary: 'Cancellation: INR 499',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 499, platformFee: 300 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Free seat selection & Cafe Akasa gourmet meal voucher included'
      },
      {
        id: 'qp_cafe',
        label: 'Cafe Akasa Comfort',
        fare_name: 'Cafe Akasa Comfort',
        pricePerAdult: basePrice + 1200,
        cabinBaggageKg: 7,
        checkinBaggageKg: 20,
        refundable: true,
        badge: 'Gourmet Special',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Date Change: FREE',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: '20kg check-in baggage + chef-curated Cafe Akasa hot meal'
      },
      {
        id: 'qp_vip',
        label: 'Akasa VIP',
        fare_name: 'Akasa VIP',
        pricePerAdult: basePrice + 1800,
        cabinBaggageKg: 10,
        checkinBaggageKg: 25,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Priority check-in, priority baggage delivery & zero cancellation fee'
      }
    ];
  }

  // 6. Air India Express (IX)
  if (norm.includes('express') || norm.includes('ix')) {
    return [
      {
        id: 'ix_lite',
        label: 'Xpress Lite',
        fare_name: 'Xpress Lite',
        pricePerAdult: Math.max(2500, basePrice - 300),
        cabinBaggageKg: 7,
        checkinBaggageKg: 0,
        refundable: true,
        cancellationSummary: 'Cancellation: INR 3,000',
        cancellationSlabs: [{ window: 'Up to 24 hrs before', fee: 3000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 2,500',
        dateChangeSlabs: [{ window: 'Up to 24 hrs before', fee: 2500, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'chargeable',
        description: 'Ultra-saver cabin-baggage only fare for light travelers'
      },
      {
        id: 'ix_value',
        label: 'Xpress Value',
        fare_name: 'Xpress Value',
        pricePerAdult: basePrice,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Best Value',
        cancellationSummary: 'Cancellation: INR 3,000',
        cancellationSlabs: [{ window: 'Up to 24 hrs before', fee: 3000, platformFee: 300 }],
        dateChangeSummary: 'Date Change: INR 2,250',
        dateChangeSlabs: [{ window: 'Up to 24 hrs before', fee: 2250, platformFee: 300 }],
        seatsIncluded: 'chargeable',
        mealsIncluded: 'chargeable',
        description: 'Standard Economy fare with 15kg checked baggage included'
      },
      {
        id: 'ix_flex',
        label: 'Xpress Flex',
        fare_name: 'Xpress Flex',
        pricePerAdult: basePrice + 1150,
        cabinBaggageKg: 7,
        checkinBaggageKg: 15,
        refundable: true,
        badge: 'Recommended',
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Free date changes, Gourmair hot meal & XpressAhead priority boarding'
      },
      {
        id: 'ix_biz',
        label: 'Xpress Biz',
        fare_name: 'Xpress Biz',
        pricePerAdult: basePrice + 2500,
        cabinBaggageKg: 10,
        checkinBaggageKg: 25,
        refundable: true,
        cancellationSummary: 'Cancellation: FREE',
        cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        dateChangeSummary: 'Unlimited Free Changes',
        dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
        seatsIncluded: 'free',
        mealsIncluded: 'complimentary',
        description: 'Leather recliner seat, 25kg baggage allowance & premium hot meals'
      }
    ];
  }

  // 7. Generic Fallback
  return [
    {
      id: 'gen_saver',
      label: 'Saver (Regular)',
      fare_name: 'Saver',
      pricePerAdult: basePrice,
      cabinBaggageKg: 7,
      checkinBaggageKg: 15,
      refundable: true,
      cancellationSummary: 'Cancellation: INR 3,500',
      cancellationSlabs: [{ window: '4 hrs to 4 days', fee: 3500, platformFee: 300 }],
      dateChangeSummary: 'Date Change: INR 3,250',
      dateChangeSlabs: [{ window: '4 hrs to 4 days', fee: 3250, platformFee: 300 }],
      seatsIncluded: 'chargeable',
      mealsIncluded: 'chargeable',
      description: 'Standard economy fare'
    },
    {
      id: 'gen_flexi',
      label: 'Flexi Plus',
      fare_name: 'Flexi Plus',
      pricePerAdult: basePrice + 750,
      cabinBaggageKg: 7,
      checkinBaggageKg: 15,
      refundable: true,
      badge: 'Most Popular',
      cancellationSummary: 'Cancellation: INR 500',
      cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 500, platformFee: 300 }],
      dateChangeSummary: 'Date Change: FREE',
      dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 300 }],
      seatsIncluded: 'free',
      mealsIncluded: 'complimentary',
      description: 'Free seat selection & low cancellation fee'
    },
    {
      id: 'gen_corporate',
      label: 'Corporate Fare',
      fare_name: 'Corporate',
      pricePerAdult: basePrice + 1200,
      cabinBaggageKg: 7,
      checkinBaggageKg: 20,
      refundable: true,
      cancellationSummary: 'Cancellation: FREE',
      cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
      dateChangeSummary: 'Unlimited Free Changes',
      dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
      seatsIncluded: 'free',
      mealsIncluded: 'complimentary',
      description: 'Zero change fee & 20kg check-in baggage'
    },
    {
      id: 'gen_upfront',
      label: 'UpFront (Premium)',
      fare_name: 'UpFront',
      pricePerAdult: basePrice + 1850,
      cabinBaggageKg: 10,
      checkinBaggageKg: 25,
      refundable: true,
      cancellationSummary: 'Cancellation: FREE',
      cancellationSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
      dateChangeSummary: 'Unlimited Free Changes',
      dateChangeSlabs: [{ window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }],
      seatsIncluded: 'free',
      mealsIncluded: 'complimentary',
      description: 'Priority check-in, free hot meal & extra legroom seat'
    }
  ];
}
