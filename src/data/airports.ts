export interface AirportItem {
  city: string;
  airport: string;
  code: string;
  country: string;
  cityMr?: string;
}

export const ALL_AIRPORTS: AirportItem[] = [
  // Post-2020 Inaugurated & Expanded Regional Airports
  { city: "Goa (Mopa)", airport: "Manohar International Airport", code: "GOX", country: "India", cityMr: "गोवा (मोपा)" },
  { city: "Ayodhya", airport: "Maharishi Valmiki International Airport", code: "AY", country: "India", cityMr: "अयोध्या" },
  { city: "Ayodhya", airport: "Maharishi Valmiki International Airport", code: "AYJ", country: "India", cityMr: "अयोध्या" },
  { city: "Itanagar", airport: "Donyi Polo Airport", code: "HGI", country: "India", cityMr: "ईटानगर" },
  { city: "Deoghar", airport: "Deoghar Airport", code: "DGH", country: "India", cityMr: "देवघर" },
  { city: "Shivamogga", airport: "Shivamogga Kuvempu Airport", code: "RQY", country: "India", cityMr: "शिवमोगा" },
  { city: "Shivamogga", airport: "Shivamogga Kuvempu Airport", code: "SHM", country: "India", cityMr: "शिवमोगा" },
  { city: "Rajkot", airport: "Hirasar Rajkot International Airport", code: "HSR", country: "India", cityMr: "राजकोट" },
  { city: "Kushinagar", airport: "Kushinagar International Airport", code: "KBK", country: "India", cityMr: "कुशीनगर" },
  { city: "Bengaluru", airport: "Sir M. Visvesvaraya Terminal Railway Station", code: "SMVB", country: "India", cityMr: "बेंगळुरू" },
  { city: "Bhopal", airport: "Rani Kamlapati Railway Station", code: "RKMP", country: "India", cityMr: "भोपाळ" },
  { city: "Gandhinagar", airport: "Gandhinagar Capital Railway Station", code: "GNC", country: "India", cityMr: "गांधीनगर" },
  { city: "Navi Mumbai", airport: "Navi Mumbai International Airport", code: "NMI", country: "India", cityMr: "नवी मुंबई" },
  { city: "Noida / Jewar", airport: "Noida International Airport", code: "DXN", country: "India", cityMr: "नोएडा / जेवर" },
  { city: "Kalahandi", airport: "Utkela Airport", code: "UTK", country: "India", cityMr: "उत्केला" },
  { city: "Malkangiri", airport: "Malkangiri Airport", code: "MKL", country: "India", cityMr: "मलकानगिरी" },
  { city: "Dhubri", airport: "Rupsi Airport", code: "RHO", country: "India", cityMr: "रुपसी" },
  { city: "Darbhanga", airport: "Darbhanga Airport", code: "DBN", country: "India", cityMr: "दरभंगा" },
  { city: "Sindhudurg", airport: "Sindhudurg Chipi Airport", code: "SDW", country: "India", cityMr: "सिंधुदुर्ग" },
  { city: "Gwalior", airport: "Rajmata Vijaya Raje Scindia Airport", code: "GWL", country: "India", cityMr: "ग्वाल्हेर" },
  { city: "Jagdalpur", airport: "Maa Danteshwari Airport", code: "JGB", country: "India", cityMr: "जगदलपूर" },
  { city: "Cooch Behar", airport: "Cooch Behar Airport", code: "COH", country: "India", cityMr: "कूचबिहार" },
  { city: "Salem", airport: "Salem Airport", code: "SXV", country: "India", cityMr: "सेलम" },
  { city: "Solapur", airport: "Solapur Airport", code: "SOP", country: "India", cityMr: "सोलापूर" },
  { city: "Shirdi", airport: "Shirdi International Airport", code: "SAG", country: "India", cityMr: "शिर्डी" },

  // India - Maharashtra & Regional
  { city: "Mumbai", airport: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", country: "India", cityMr: "मुंबई" },
  { city: "Pune", airport: "Pune International Airport", code: "PNQ", country: "India", cityMr: "पुणे" },
  { city: "Nashik", airport: "Nashik Ozar Airport", code: "ISK", country: "India", cityMr: "नाशिक / ओझर" },
  { city: "Goa (Dabolim)", airport: "Dabolim Airport", code: "GOI", country: "India", cityMr: "गोवा (दाबोळी)" },
  { city: "Nagpur", airport: "Dr. Babasaheb Ambedkar International Airport", code: "NAG", country: "India", cityMr: "नागपूर" },
  { city: "Chhatrapati Sambhajinagar", airport: "Aurangabad Airport", code: "IXU", country: "India", cityMr: "छत्रपती संभाजीनगर" },
  { city: "Kolhapur", airport: "Chhatrapati Rajaram Maharaj Airport", code: "KLH", country: "India", cityMr: "कोल्हापूर" },
  { city: "Nanded", airport: "Shri Guru Gobind Singh Ji Airport", code: "NDC", country: "India", cityMr: "नांदेड" },

  // India - Major Metros & Hubs
  { city: "Delhi", airport: "Indira Gandhi International Airport", code: "DEL", country: "India", cityMr: "दिल्ली" },
  { city: "Bengaluru", airport: "Kempegowda International Airport", code: "BLR", country: "India", cityMr: "बेंगळुरू" },
  { city: "Hyderabad", airport: "Rajiv Gandhi International Airport", code: "HYD", country: "India", cityMr: "हैदराबाद" },
  { city: "Chennai", airport: "Chennai International Airport", code: "MAA", country: "India", cityMr: "चेन्नई" },
  { city: "Kolkata", airport: "Netaji Subhash Chandra Bose Intl Airport", code: "CCU", country: "India", cityMr: "कोलकाता" },
  { city: "Jaipur", airport: "Jaipur International Airport", code: "JAI", country: "India", cityMr: "जयपूर" },
  { city: "Ahmedabad", airport: "Sardar Vallabhbhai Patel Intl Airport", code: "AMD", country: "India", cityMr: "अहमदाबाद" },
  { city: "Kochi", airport: "Cochin International Airport", code: "COK", country: "India", cityMr: "कोची" },
  { city: "Udaipur", airport: "Maharana Pratap Airport", code: "UDR", country: "India", cityMr: "उदयपूर" },
  { city: "Varanasi", airport: "Lal Bahadur Shastri Intl Airport", code: "VNS", country: "India", cityMr: "वाराणसी" },
  { city: "Lucknow", airport: "Chaudhary Charan Singh Intl Airport", code: "LKO", country: "India", cityMr: "लखनऊ" },
  { city: "Chandigarh", airport: "Shaheed Bhagat Singh Intl Airport", code: "IXC", country: "India", cityMr: "चंडीगड" },
  { city: "Srinagar", airport: "Sheikh ul-Alam International Airport", code: "SXR", country: "India", cityMr: "श्रीनगर" },
  { city: "Guwahati", airport: "Lokpriya Gopinath Bordoloi Intl Airport", code: "GAU", country: "India", cityMr: "गुवाहाटी" },
  { city: "Patna", airport: "Jay Prakash Narayan Airport", code: "PAT", country: "India", cityMr: "पटना" },
  { city: "Bagdogra", airport: "Bagdogra Airport", code: "IXB", country: "India", cityMr: "बागडोगरा" },
  { city: "Thiruvananthapuram", airport: "Trivandrum International Airport", code: "TRV", country: "India", cityMr: "तिरुवनंतपुरम" },
  { city: "Amritsar", airport: "Sri Guru Ram Dass Jee Intl Airport", code: "ATQ", country: "India", cityMr: "अमृतसर" },
  { city: "Bhopal", airport: "Raja Bhoj Airport", code: "BHO", country: "India", cityMr: "भोपाळ" },
  { city: "Indore", airport: "Devi Ahilya Bai Holkar Airport", code: "IDR", country: "India", cityMr: "इंदूर" },
  { city: "Jammu", airport: "Jammu Civil Enclave", code: "IXJ", country: "India", cityMr: "जम्मू" },
  { city: "Leh", airport: "Kushok Bakula Rimpochee Airport", code: "IXL", country: "India", cityMr: "लेह लडाख" },
  { city: "Raipur", airport: "Swami Vivekananda Airport", code: "RPR", country: "India", cityMr: "रायपूर" },
  { city: "Bhubaneswar", airport: "Biju Patnaik International Airport", code: "BBI", country: "India", cityMr: "भुवनेश्वर" },
  { city: "Ranchi", airport: "Birsa Munda Airport", code: "IXR", country: "India", cityMr: "रांची" },
  { city: "Coimbatore", airport: "Coimbatore International Airport", code: "CJB", country: "India", cityMr: "कोइम्बतूर" },
  { city: "Madurai", airport: "Madurai Airport", code: "IXM", country: "India", cityMr: "मधुराई" },
  { city: "Tiruchirappalli", airport: "Tiruchirappalli Intl Airport", code: "TRZ", country: "India", cityMr: "तिरुचिरापल्ली" },
  { city: "Mangaluru", airport: "Mangaluru International Airport", code: "IXE", country: "India", cityMr: "मंगळुरू" },
  { city: "Dehradun", airport: "Jolly Grant Airport", code: "DED", country: "India", cityMr: "डेहराडून" },
  { city: "Rajkot", airport: "Hirasar Rajkot International Airport", code: "HSR", country: "India", cityMr: "राजकोट" },
  { city: "Jodhpur", airport: "Jodhpur Airport", code: "JDH", country: "India", cityMr: "जोधपूर" },
  { city: "Port Blair", airport: "Veer Savarkar International Airport", code: "IXZ", country: "India", cityMr: "पोर्ट ब्लेअर" },
  { city: "Surat", airport: "Surat International Airport", code: "STV", country: "India", cityMr: "सुरत" },

  // Papua New Guinea
  { city: "Goroka", airport: "Goroka Airport", code: "GKA", country: "Papua New Guinea", cityMr: "गोरोका" },
  { city: "Madang", airport: "Madang Airport", code: "MAG", country: "Papua New Guinea", cityMr: "मदांग" },
  { city: "Mount Hagen", airport: "Mount Hagen Kagamuga Airport", code: "HGU", country: "Papua New Guinea", cityMr: "माऊंट हेगन" },
  { city: "Port Moresby", airport: "Port Moresby Jacksons Intl", code: "POM", country: "Papua New Guinea", cityMr: "पोर्ट मोरेस्बी" },
  { city: "Lae Nadzab", airport: "Nadzab Airport", code: "LAE", country: "Papua New Guinea", cityMr: "लाई नदझाब" },
  { city: "Wewak", airport: "Wewak International Airport", code: "WWK", country: "Papua New Guinea", cityMr: "वेवाक" },
  { city: "Rabaul Tokua", airport: "Tokua Airport", code: "RAB", country: "Papua New Guinea", cityMr: "राबाउल" },

  // Middle East & Gulf
  { city: "Dubai", airport: "Dubai International Airport", code: "DXB", country: "UAE", cityMr: "दुबई" },
  { city: "Abu Dhabi", airport: "Zayed International Airport", code: "AUH", country: "UAE", cityMr: "अबू धाबी" },
  { city: "Sharjah", airport: "Sharjah International Airport", code: "SHJ", country: "UAE", cityMr: "शारजा" },
  { city: "Doha", airport: "Hamad International Airport", code: "DOH", country: "Qatar", cityMr: "दोहा" },
  { city: "Muscat", airport: "Muscat International Airport", code: "MCT", country: "Oman", cityMr: "मस्कत" },
  { city: "Bahrain", airport: "Bahrain International Airport", code: "BAH", country: "Bahrain", cityMr: "बहरीन" },
  { city: "Kuwait City", airport: "Kuwait International Airport", code: "KWI", country: "Kuwait", cityMr: "कुवेत" },
  { city: "Riyadh", airport: "King Khalid International Airport", code: "RUH", country: "Saudi Arabia", cityMr: "रियाध" },
  { city: "Jeddah", airport: "King Abdulaziz International Airport", code: "JED", country: "Saudi Arabia", cityMr: "जिद्दा" },

  // Southeast Asia & Far East
  { city: "Singapore", airport: "Changi Airport", code: "SIN", country: "Singapore", cityMr: "सिंगापूर" },
  { city: "Bangkok (Suvarnabhumi)", airport: "Suvarnabhumi Airport", code: "BKK", country: "Thailand", cityMr: "बँकॉक (सुवर्णभूमी)" },
  { city: "Bangkok (Don Mueang)", airport: "Don Mueang International Airport", code: "DMK", country: "Thailand", cityMr: "बँकॉक (डॉन मुअंग)" },
  { city: "Phuket", airport: "Phuket International Airport", code: "HKT", country: "Thailand", cityMr: "फुकेत" },
  { city: "Kuala Lumpur", airport: "Kuala Lumpur International Airport", code: "KUL", country: "Malaysia", cityMr: "क्वालालंपूर" },
  { city: "Bali / Denpasar", airport: "Ngurah Rai International Airport", code: "DPS", country: "Indonesia", cityMr: "बाली" },
  { city: "Jakarta", airport: "Soekarno-Hatta International Airport", code: "CGK", country: "Indonesia", cityMr: "जकार्ता" },
  { city: "Colombo", airport: "Bandaranaike International Airport", code: "CMB", country: "Sri Lanka", cityMr: "कोलंबो" },
  { city: "Male", airport: "Velana International Airport", code: "MLE", country: "Maldives", cityMr: "माले (मालदीव)" },
  { city: "Kathmandu", airport: "Tribhuvan International Airport", code: "KTM", country: "Nepal", cityMr: "काठमांडू" },
  { city: "Tokyo (Narita)", airport: "Narita International Airport", code: "NRT", country: "Japan", cityMr: "टोकियो (नारिता)" },
  { city: "Tokyo (Haneda)", airport: "Tokyo Haneda Airport", code: "HND", country: "Japan", cityMr: "टोकियो (हानेडा)" },
  { city: "Osaka (Kansai)", airport: "Kansai International Airport", code: "KIX", country: "Japan", cityMr: "ओसाका" },
  { city: "Seoul (Incheon)", airport: "Incheon International Airport", code: "ICN", country: "South Korea", cityMr: "सोल (इंचॉन)" },
  { city: "Hong Kong", airport: "Hong Kong International Airport", code: "HKG", country: "Hong Kong", cityMr: "हाँगकाँग" },
  { city: "Beijing (Capital)", airport: "Beijing Capital International Airport", code: "PEK", country: "China", cityMr: "बीजिंग" },
  { city: "Shanghai (Pudong)", airport: "Shanghai Pudong International Airport", code: "PVG", country: "China", cityMr: "शांघाय" },

  // Europe & UK
  { city: "London (Heathrow)", airport: "Heathrow Airport", code: "LHR", country: "UK", cityMr: "लंडन हिथ्रो" },
  { city: "London (Gatwick)", airport: "Gatwick Airport", code: "LGW", country: "UK", cityMr: "लंडन गॅटविक" },
  { city: "Paris (CDG)", airport: "Charles de Gaulle Airport", code: "CDG", country: "France", cityMr: "पॅरिस (सीडीजी)" },
  { city: "Amsterdam", airport: "Schiphol Airport", code: "AMS", country: "Netherlands", cityMr: "अ‍ॅमस्टरडॅम" },
  { city: "Frankfurt", airport: "Frankfurt Airport", code: "FRA", country: "Germany", cityMr: "फ्रँकफर्ट" },
  { city: "Munich", airport: "Munich Airport", code: "MUC", country: "Germany", cityMr: "म्युनिच" },
  { city: "Zurich", airport: "Zurich Airport", code: "ZRH", country: "Switzerland", cityMr: "झुरिच" },
  { city: "Istanbul", airport: "Istanbul Airport", code: "IST", country: "Turkey", cityMr: "इस्तंबूल" },
  { city: "Rome (FCO)", airport: "Leonardo da Vinci–Fiumicino Airport", code: "FCO", country: "Italy", cityMr: "रोम" },
  { city: "Milan (Malpensa)", airport: "Malpensa Airport", code: "MXP", country: "Italy", cityMr: "मिलान" },
  { city: "Barcelona", airport: "Josep Tarradellas Barcelona-El Prat", code: "BCN", country: "Spain", cityMr: "बार्सिलोना" },
  { city: "Madrid", airport: "Adolfo Suárez Madrid–Barajas Airport", code: "MAD", country: "Spain", cityMr: "माद्रिद" },

  // Americas
  { city: "New York (JFK)", airport: "John F. Kennedy Intl Airport", code: "JFK", country: "USA", cityMr: "न्यूयॉर्क (JFK)" },
  { city: "Newark", airport: "Newark Liberty Intl Airport", code: "EWR", country: "USA", cityMr: "नेवारक" },
  { city: "San Francisco", airport: "San Francisco Intl Airport", code: "SFO", country: "USA", cityMr: "सॅन फ्रान्सिस्को" },
  { city: "Los Angeles", airport: "Los Angeles Intl Airport", code: "LAX", country: "USA", cityMr: "लॉस एंजेलिस" },
  { city: "Chicago (O'Hare)", airport: "O'Hare Intl Airport", code: "ORD", country: "USA", cityMr: "शिकागो" },
  { city: "Toronto", airport: "Pearson International Airport", code: "YYZ", country: "Canada", cityMr: "टोरंटो" },
  { city: "Vancouver", airport: "Vancouver International Airport", code: "YVR", country: "Canada", cityMr: "व्हँकुव्हर" },

  // Australia & Oceania
  { city: "Melbourne", airport: "Melbourne Airport", code: "MEL", country: "Australia", cityMr: "मेलबर्न" },
  { city: "Sydney", airport: "Kingsford Smith Airport", code: "SYD", country: "Australia", cityMr: "सिडनी" },
  { city: "Brisbane", airport: "Brisbane Airport", code: "BNE", country: "Australia", cityMr: "ब्रिस्बेन" },
  { city: "Auckland", airport: "Auckland Airport", code: "AKL", country: "New Zealand", cityMr: "ऑकलंड" }
];

/**
 * City-to-IATA Quick Map for fast resolution
 */
export const CITY_TO_IATA_MAP: Record<string, string> = ALL_AIRPORTS.reduce((acc, item) => {
  acc[item.city.toUpperCase()] = item.code;
  if (item.code) {
    acc[item.code.toUpperCase()] = item.code;
  }
  return acc;
}, {} as Record<string, string>);

/**
 * IATA-to-City Name Map for UI displays
 */
export const IATA_TO_CITY_MAP: Record<string, string> = ALL_AIRPORTS.reduce((acc, item) => {
  acc[item.code] = item.city;
  return acc;
}, {} as Record<string, string>);

/**
 * City Groups for metropolitan areas with multiple airports
 */
export const CITY_GROUPS: Record<string, string[]> = {
  "MUMBAI": ["BOM", "NMI", "MUMBAI", "NAVI MUMBAI"],
  "GOA": ["GOI", "GOX", "GOA", "MOPA", "DABOLIM"],
  "DELHI": ["DEL", "DXN", "DELHI", "NOIDA"],
  "AYODHYA": ["AYJ", "AY", "AYC", "AYODHYA"],
  "BENGALURU": ["BLR", "SBC", "SMVB", "BENGALURU"],
  "BHOPAL": ["BHO", "RKMP", "BHOPAL"],
};

/**
 * Search airports by city name, airport name, or IATA code
 */
export function searchAirports(query: string): AirportItem[] {
  if (!query || !query.trim()) return ALL_AIRPORTS.slice(0, 30);
  const q = query.trim().toLowerCase();
  
  return ALL_AIRPORTS.filter((item) => {
    return (
      item.code.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.airport.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      (item.cityMr && item.cityMr.toLowerCase().includes(q))
    );
  });
}
