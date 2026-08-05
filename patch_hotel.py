import sys

with open('src/components/travel/HotelSearchTab.tsx', 'r') as f:
    lines = f.readlines()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if 'const handleHotelSearch = async (e: React.FormEvent)' in line:
        start_index = i
    if start_index != -1 and i > start_index and 'const handleBookHotel' in line:
        end_index = i - 1
        break

if start_index != -1 and end_index != -1:
    new_content = """  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    
    console.log(`[HotelSearchTab] Searching hotels for destination: ${destination}`);

    try {
      const results = await fetchHotelData({
        destination,
        checkIn,
        checkOut,
        adults,
        onRawData: (raw) => setRawData(raw),
        onRequestParams: (params) => setRequestParams(params),
      });
      
      console.log(`[HotelSearchTab] API returned ${results?.length || 0} results`);
      
      if (!results || results.length === 0) {
        throw new Error("API returned no results. Falling back to mock data.");
      }
      
      setHotels(results);
    } catch (error: any) {
      console.error("[HotelSearchTab] API Fetch Error:", error);
      let trueErrorMessage = error?.message || "API Error: Unable to fetch hotels. Please check logs.";
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.error || error.response.data?.message || 'API Error: Unable to fetch hotels.';
        trueErrorMessage = `API Error: ${serverMessage} (Status ${status}). Please check logs.`;
      } else if (error.request) {
        trueErrorMessage = "Network/CORS Error: Unable to reach hotel search server. Please check logs.";
      }
      
      setError(trueErrorMessage);
      
      // FALLBACK MOCK DATA (For Testing)
      setHotels([
        {
          id: `mock_hotel_1`,
          name: `Grand ${destination} Resort & Spa`,
          location: `Downtown ${destination}`,
          rating: 4.8,
          reviewsCount: 342,
          image: '', // Will use empty or fallback
          pricePerNight: 8500,
          currency: 'INR',
          amenities: ['Free WiFi', 'Pool', 'Spa', 'Breakfast Included'],
          provider: 'Mock Data',
          deepLink: 'https://bitli.in/1HdfW4l'
        },
        {
          id: `mock_hotel_2`,
          name: `${destination} Boutique Stay`,
          location: `Central District, ${destination}`,
          rating: 4.5,
          reviewsCount: 156,
          image: '',
          pricePerNight: 4200,
          currency: 'INR',
          amenities: ['Free WiFi', 'Air Conditioning', 'Room Service'],
          provider: 'Mock Data',
          deepLink: 'https://bitli.in/1HdfW4l'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
"""
    lines[start_index:end_index] = [new_content]
    
    with open('src/components/travel/HotelSearchTab.tsx', 'w') as f:
        f.writelines(lines)
    print("Replaced hotel search handler successfully")
else:
    print("Could not find hotel search handler bounds")
