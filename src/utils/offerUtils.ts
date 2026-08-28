
export const groupOffersByItinerary = (offers: any[]) => {
  const grouped: Record<string, any[]> = {};

  offers.forEach((offer) => {
    // Generate a unique key based on the flight itinerary (slices)
    const itineraryKey = offer.slices
      .map((slice: any) => slice.segments.map((s: any) => s.flight_number).join('-'))
      .join('|');

    if (!grouped[itineraryKey]) {
      grouped[itineraryKey] = [];
    }
    grouped[itineraryKey].push(offer);
  });

  return Object.values(grouped).map((group) => {
    // Sort by price to easily find the cheapest
    const sortedOffers = group.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
    return {
      itineraryKey: group[0].slices.map((slice: any) => slice.segments.map((s: any) => s.flight_number).join('-')).join('|'),
      cheapestOffer: sortedOffers[0],
      upgradedFarePlans: sortedOffers.slice(1), // All offers except the cheapest
    };
  });
};
