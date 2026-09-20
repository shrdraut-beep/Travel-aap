/**
 * Master Cities Database for RouTripO OTA Platform
 * 
 * Provides standardized Master City IDs (`CITY-XXX`), multi-lingual names (English & Marathi),
 * linked primary airports (IATA), railway stations (IRCTC), and bus terminals.
 */

export interface MasterCity {
  id: string; // Standard Master City ID: CITY-XXX
  name: string;
  nameMr: string;
  state: string;
  country: string;
  airportCode?: string;
  airportName?: string;
  railwayCode?: string;
  railwayStationName?: string;
  secondaryStations?: string[];
  busTerminal?: string;
  keywords: string[];
  popular?: boolean;
  tier?: 1 | 2 | 3;
  coordinates?: [number, number]; // [lat, lon]
}

export const MASTER_CITIES: MasterCity[] = [
  // ================= Maharashtra =================
  {
    id: 'CITY-ISK',
    name: 'Nashik',
    nameMr: 'नाशिक',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'ISK',
    airportName: 'Nashik Ozar International Airport',
    railwayCode: 'NK',
    railwayStationName: 'Nasik Road Railway Station',
    secondaryStations: ['DVL', 'IGP'],
    busTerminal: 'CBS Nashik Central Bus Station',
    keywords: ['nashik', 'nasik', 'nashik road', 'ozar', 'trimbakeshwar', 'panchavati', 'devlali', 'नाशिक', 'नासिक'],
    popular: true,
    tier: 2,
    coordinates: [19.9975, 73.7898]
  },
  {
    id: 'CITY-BOM',
    name: 'Mumbai',
    nameMr: 'मुंबई',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'BOM',
    airportName: 'Chhatrapati Shivaji Maharaj International Airport',
    railwayCode: 'CSMT',
    railwayStationName: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    secondaryStations: ['BCT', 'MMCT', 'LTT', 'BDTS', 'DR'],
    busTerminal: 'Mumbai Central Bus Station',
    keywords: ['mumbai', 'bombay', 'csmt', 'colaba', 'bandra', 'andheri', 'thane', 'navi mumbai', 'मुंबई'],
    popular: true,
    tier: 1,
    coordinates: [19.0760, 72.8777]
  },
  {
    id: 'CITY-PNQ',
    name: 'Pune',
    nameMr: 'पुणे',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'PNQ',
    airportName: 'Pune International Airport (Lohegaon)',
    railwayCode: 'PUNE',
    railwayStationName: 'Pune Junction',
    secondaryStations: ['SVJR', 'CCH'],
    busTerminal: 'Shivajinagar / Swargate Bus Stand',
    keywords: ['pune', 'poona', 'shivajinagar', 'hinjewadi', 'swargate', 'hadapsar', 'पुणे'],
    popular: true,
    tier: 1,
    coordinates: [18.5204, 73.8567]
  },
  {
    id: 'CITY-NAG',
    name: 'Nagpur',
    nameMr: 'नागपूर',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'NAG',
    airportName: 'Dr. Babasaheb Ambedkar International Airport',
    railwayCode: 'NGP',
    railwayStationName: 'Nagpur Junction',
    busTerminal: 'Ganeshpeth Bus Stand Nagpur',
    keywords: ['nagpur', 'orange city', 'vidarbha', 'नागपूर'],
    popular: true,
    tier: 2,
    coordinates: [21.1458, 79.0882]
  },
  {
    id: 'CITY-IXU',
    name: 'Chhatrapati Sambhajinagar',
    nameMr: 'छत्रपती संभाजीनगर',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'IXU',
    airportName: 'Chhatrapati Sambhajinagar Airport (Chikkalthana)',
    railwayCode: 'AWB',
    railwayStationName: 'Aurangabad Railway Station',
    busTerminal: 'Central Bus Stand Aurangabad',
    keywords: ['aurangabad', 'chhatrapati sambhajinagar', 'sambhajinagar', 'ellora', 'ajanta', 'संभाजीनगर', 'औरंगाबाद'],
    popular: true,
    tier: 2,
    coordinates: [19.8762, 75.3433]
  },
  {
    id: 'CITY-SAG',
    name: 'Shirdi',
    nameMr: 'शिर्डी',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'SAG',
    airportName: 'Shirdi International Airport (Kakadi)',
    railwayCode: 'SNSI',
    railwayStationName: 'Sainagar Shirdi Railway Station',
    busTerminal: 'Shirdi MSRTC Bus Stand',
    keywords: ['shirdi', 'sainagar', 'sai baba', 'kopargaon', 'शिर्डी'],
    popular: true,
    tier: 2,
    coordinates: [19.7667, 74.4766]
  },
  {
    id: 'CITY-KLH',
    name: 'Kolhapur',
    nameMr: 'कोल्हापूर',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'KLH',
    airportName: 'Chhatrapati Rajaram Maharaj Airport',
    railwayCode: 'KOP',
    railwayStationName: 'Chhatrapati Shahu Maharaj Terminus',
    busTerminal: 'CBS Kolhapur Central Bus Stand',
    keywords: ['kolhapur', 'mahalaxmi', 'panhala', 'कोल्हापूर'],
    popular: true,
    tier: 2,
    coordinates: [16.7050, 74.2433]
  },
  {
    id: 'CITY-MHB',
    name: 'Mahabaleshwar',
    nameMr: 'महाबळेश्वर',
    state: 'Maharashtra',
    country: 'India',
    railwayCode: 'WTR',
    railwayStationName: 'Wathar Railway Station',
    busTerminal: 'Mahabaleshwar ST Stand',
    keywords: ['mahabaleshwar', 'panchgani', 'pratapgad', 'strawberry', 'महाबळेश्वर'],
    popular: true,
    tier: 2,
    coordinates: [17.9237, 73.6586]
  },
  {
    id: 'CITY-LNL',
    name: 'Lonavala',
    nameMr: 'लोणावळा',
    state: 'Maharashtra',
    country: 'India',
    railwayCode: 'LNL',
    railwayStationName: 'Lonavala Railway Station',
    busTerminal: 'Lonavala Bus Depot',
    keywords: ['lonavala', 'khandala', 'karla', 'लोणावळा', 'खंडाळा'],
    popular: true,
    tier: 2,
    coordinates: [18.7546, 73.4062]
  },
  {
    id: 'CITY-ALB',
    name: 'Alibaug',
    nameMr: 'अलिबाग',
    state: 'Maharashtra',
    country: 'India',
    busTerminal: 'Alibaug MSRTC Bus Depot',
    keywords: ['alibaug', 'kashid', 'murud janjira', 'varsoli', 'अलिबाग'],
    popular: true,
    tier: 2,
    coordinates: [18.6414, 72.8722]
  },
  {
    id: 'CITY-MTH',
    name: 'Matheran',
    nameMr: 'माथेरान',
    state: 'Maharashtra',
    country: 'India',
    railwayCode: 'MAE',
    railwayStationName: 'Matheran Hill Railway',
    keywords: ['matheran', 'neral', 'hill station', 'माथेरान'],
    popular: true,
    tier: 3,
    coordinates: [18.9866, 73.2676]
  },
  {
    id: 'CITY-SOP',
    name: 'Solapur',
    nameMr: 'सोलापूर',
    state: 'Maharashtra',
    country: 'India',
    railwayCode: 'SUR',
    railwayStationName: 'Solapur Junction',
    busTerminal: 'Solapur Central Bus Stand',
    keywords: ['solapur', 'siddheshwar', 'pandharpur', 'सोलापूर', 'पंढरपूर'],
    popular: true,
    tier: 2,
    coordinates: [17.6599, 75.9064]
  },
  {
    id: 'CITY-NDC',
    name: 'Nanded',
    nameMr: 'नांदेड',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'NDC',
    airportName: 'Shri Guru Gobind Singh Ji Airport',
    railwayCode: 'NED',
    railwayStationName: 'Hazur Sahib Nanded Railway Station',
    busTerminal: 'Nanded Bus Station',
    keywords: ['nanded', 'hazur sahib', 'sikh pilgrimage', 'नांदेड'],
    popular: true,
    tier: 2,
    coordinates: [19.1383, 77.3210]
  },
  {
    id: 'CITY-RN',
    name: 'Ratnagiri',
    nameMr: 'रत्नागिरी',
    state: 'Maharashtra',
    country: 'India',
    railwayCode: 'RN',
    railwayStationName: 'Ratnagiri Railway Station',
    busTerminal: 'Ratnagiri Bus Stand',
    keywords: ['ratnagiri', 'ganpatipule', 'alphonso mango', 'konkan', 'रत्नागिरी', 'गणपतीपुळे'],
    popular: true,
    tier: 2,
    coordinates: [16.9902, 73.3120]
  },
  {
    id: 'CITY-SDW',
    name: 'Sindhudurg',
    nameMr: 'सिंधुदुर्ग',
    state: 'Maharashtra',
    country: 'India',
    airportCode: 'SDW',
    airportName: 'Sindhudurg Chipi Airport',
    railwayCode: 'SNDD',
    railwayStationName: 'Sindhudurg Railway Station',
    keywords: ['sindhudurg', 'tarkarli', 'malvan', 'chipi', 'सिंधुदुर्ग', 'तारकर्ली', 'मालवण'],
    popular: true,
    tier: 2,
    coordinates: [16.1264, 73.5658]
  },

  // ================= Goa =================
  {
    id: 'CITY-GOA',
    name: 'Goa',
    nameMr: 'गोवा',
    state: 'Goa',
    country: 'India',
    airportCode: 'GOI',
    airportName: 'Dabolim Airport / Mopa International Airport (GOX)',
    railwayCode: 'MAO',
    railwayStationName: 'Madgaon Junction',
    secondaryStations: ['VSG', 'KRMI', 'THVM'],
    busTerminal: 'Panaji / Margao KTC Bus Stand',
    keywords: ['goa', 'panaji', 'margao', 'calangute', 'baga', 'anjuna', 'candolim', 'dabolim', 'mopa', 'गोवा', 'पणजी'],
    popular: true,
    tier: 1,
    coordinates: [15.2993, 74.1240]
  },

  // ================= Delhi NCR =================
  {
    id: 'CITY-DEL',
    name: 'New Delhi',
    nameMr: 'नवी दिल्ली',
    state: 'Delhi',
    country: 'India',
    airportCode: 'DEL',
    airportName: 'Indira Gandhi International Airport',
    railwayCode: 'NDLS',
    railwayStationName: 'New Delhi Railway Station',
    secondaryStations: ['DLI', 'NZM', 'ANVT'],
    busTerminal: 'Kashmere Gate ISBT Delhi',
    keywords: ['delhi', 'new delhi', 'ncr', 'noida', 'gurgaon', 'gurugram', 'connaught place', 'दिल्ली', 'नवी दिल्ली'],
    popular: true,
    tier: 1,
    coordinates: [28.6139, 77.2090]
  },

  // ================= Karnataka =================
  {
    id: 'CITY-BLR',
    name: 'Bengaluru',
    nameMr: 'बेंगळुरू',
    state: 'Karnataka',
    country: 'India',
    airportCode: 'BLR',
    airportName: 'Kempegowda International Airport',
    railwayCode: 'SBC',
    railwayStationName: 'KSR Bengaluru City Junction',
    secondaryStations: ['YPR', 'BNC'],
    busTerminal: 'Majestic KSRTC Bus Stand Bengaluru',
    keywords: ['bengaluru', 'bangalore', 'it hub', 'whitefield', 'koramangala', 'बेंगळुरू', 'बंगलोर'],
    popular: true,
    tier: 1,
    coordinates: [12.9716, 77.5946]
  },
  {
    id: 'CITY-MYA',
    name: 'Mysuru',
    nameMr: 'म्हैसूर',
    state: 'Karnataka',
    country: 'India',
    airportCode: 'MYQ',
    airportName: 'Mysore Airport (Mandakalli)',
    railwayCode: 'MYS',
    railwayStationName: 'Mysuru Junction',
    busTerminal: 'Mysuru KSRTC Sub-Urban Bus Stand',
    keywords: ['mysuru', 'mysore', 'mysore palace', 'chamundi', 'म्हैसूर'],
    popular: true,
    tier: 2,
    coordinates: [12.2958, 76.6394]
  },
  {
    id: 'CITY-CRG',
    name: 'Coorg (Madikeri)',
    nameMr: 'कूर्ग (मडिकेरी)',
    state: 'Karnataka',
    country: 'India',
    busTerminal: 'Madikeri KSRTC Bus Stand',
    keywords: ['coorg', 'madikeri', 'coffee hills', 'कूर्ग'],
    popular: true,
    tier: 2,
    coordinates: [12.4244, 75.7382]
  },

  // ================= Telangana =================
  {
    id: 'CITY-HYD',
    name: 'Hyderabad',
    nameMr: 'हैदराबाद',
    state: 'Telangana',
    country: 'India',
    airportCode: 'HYD',
    airportName: 'Rajiv Gandhi International Airport (Shamshabad)',
    railwayCode: 'SC',
    railwayStationName: 'Secunderabad Junction',
    secondaryStations: ['HYB', 'KCG'],
    busTerminal: 'MGBS Hyderabad Central Bus Station',
    keywords: ['hyderabad', 'secunderabad', 'charminar', 'hitech city', 'gachibowli', 'हैदराबाद'],
    popular: true,
    tier: 1,
    coordinates: [17.3850, 78.4867]
  },

  // ================= Tamil Nadu =================
  {
    id: 'CITY-MAA',
    name: 'Chennai',
    nameMr: 'चेन्नई',
    state: 'Tamil Nadu',
    country: 'India',
    airportCode: 'MAA',
    airportName: 'Chennai International Airport (Meenambakkam)',
    railwayCode: 'MAS',
    railwayStationName: 'MGR Chennai Central',
    secondaryStations: ['MS'],
    busTerminal: 'CMBT Koyambedu Chennai',
    keywords: ['chennai', 'madras', 'marina beach', 't nagar', 'चेन्नई'],
    popular: true,
    tier: 1,
    coordinates: [13.0827, 80.2707]
  },
  {
    id: 'CITY-UAM',
    name: 'Ooty',
    nameMr: 'उटी',
    state: 'Tamil Nadu',
    country: 'India',
    railwayCode: 'UAM',
    railwayStationName: 'Udagamandalam (Ooty) Railway Station',
    busTerminal: 'Ooty Central Bus Stand',
    keywords: ['ooty', 'udagamandalam', 'nilgiris', 'coonoor', 'उटी'],
    popular: true,
    tier: 2,
    coordinates: [11.4102, 76.6950]
  },

  // ================= West Bengal =================
  {
    id: 'CITY-CCU',
    name: 'Kolkata',
    nameMr: 'कोलकाता',
    state: 'West Bengal',
    country: 'India',
    airportCode: 'CCU',
    airportName: 'Netaji Subhash Chandra Bose International Airport',
    railwayCode: 'HWH',
    railwayStationName: 'Howrah Junction',
    secondaryStations: ['SDAH', 'KOAA'],
    busTerminal: 'Esplanade Bus Terminus Kolkata',
    keywords: ['kolkata', 'calcutta', 'howrah', 'sealdah', 'victoria memorial', 'कोलकाता'],
    popular: true,
    tier: 1,
    coordinates: [22.5726, 88.3639]
  },
  {
    id: 'CITY-DAJ',
    name: 'Darjeeling',
    nameMr: 'दार्जिलिंग',
    state: 'West Bengal',
    country: 'India',
    airportCode: 'IXB',
    airportName: 'Bagdogra International Airport',
    railwayCode: 'DJ',
    railwayStationName: 'Darjeeling Himalayan Railway',
    keywords: ['darjeeling', 'tea garden', 'kanchendzonga', 'bagdogra', 'दार्जिलिंग'],
    popular: true,
    tier: 2,
    coordinates: [27.0410, 88.2663]
  },

  // ================= Rajasthan =================
  {
    id: 'CITY-JAI',
    name: 'Jaipur',
    nameMr: 'जयपूर',
    state: 'Rajasthan',
    country: 'India',
    airportCode: 'JAI',
    airportName: 'Jaipur International Airport (Sanganer)',
    railwayCode: 'JP',
    railwayStationName: 'Jaipur Junction',
    busTerminal: 'Sindhi Camp Bus Stand Jaipur',
    keywords: ['jaipur', 'pink city', 'amer fort', 'hawa mahal', 'जयपूर'],
    popular: true,
    tier: 1,
    coordinates: [26.9124, 75.7873]
  },
  {
    id: 'CITY-UDR',
    name: 'Udaipur',
    nameMr: 'उदयपूर',
    state: 'Rajasthan',
    country: 'India',
    airportCode: 'UDR',
    airportName: 'Maharana Pratap Airport (Dabok)',
    railwayCode: 'UDZ',
    railwayStationName: 'Udaipur City Railway Station',
    busTerminal: 'Udaipur Central Bus Stand',
    keywords: ['udaipur', 'city of lakes', 'lake pichola', 'fatheh sagar', 'उदयपूर'],
    popular: true,
    tier: 2,
    coordinates: [24.5854, 73.7125]
  },
  {
    id: 'CITY-JDH',
    name: 'Jodhpur',
    nameMr: 'जोधपूर',
    state: 'Rajasthan',
    country: 'India',
    airportCode: 'JDH',
    airportName: 'Jodhpur Airport',
    railwayCode: 'JU',
    railwayStationName: 'Jodhpur Junction',
    keywords: ['jodhpur', 'blue city', 'mehrangarh fort', 'जोधपूर'],
    popular: true,
    tier: 2,
    coordinates: [26.2389, 73.0243]
  },
  {
    id: 'CITY-JSA',
    name: 'Jaisalmer',
    nameMr: 'जैसलमेर',
    state: 'Rajasthan',
    country: 'India',
    airportCode: 'JSA',
    airportName: 'Jaisalmer Airport',
    railwayCode: 'JSM',
    railwayStationName: 'Jaisalmer Railway Station',
    keywords: ['jaisalmer', 'golden city', 'thar desert', 'sam sand dunes', 'जैसलमेर'],
    popular: true,
    tier: 2,
    coordinates: [26.9157, 70.9083]
  },

  // ================= Gujarat =================
  {
    id: 'CITY-AMD',
    name: 'Ahmedabad',
    nameMr: 'अहमदाबाद',
    state: 'Gujarat',
    country: 'India',
    airportCode: 'AMD',
    airportName: 'Sardar Vallabhbhai Patel International Airport',
    railwayCode: 'ADI',
    railwayStationName: 'Ahmedabad Junction (Kalupur)',
    busTerminal: 'Geeta Mandir Bus Stand Ahmedabad',
    keywords: ['ahmedabad', 'gandhinagar', 'sabarmati', 'अहमदाबाद'],
    popular: true,
    tier: 1,
    coordinates: [23.0225, 72.5714]
  },
  {
    id: 'CITY-STV',
    name: 'Surat',
    nameMr: 'सुरत',
    state: 'Gujarat',
    country: 'India',
    airportCode: 'STV',
    airportName: 'Surat International Airport',
    railwayCode: 'ST',
    railwayStationName: 'Surat Railway Station',
    busTerminal: 'Surat Central GSRTC Bus Station',
    keywords: ['surat', 'diamond city', 'textile', 'सुरत'],
    popular: true,
    tier: 2,
    coordinates: [21.1702, 72.8311]
  },

  // ================= Uttar Pradesh =================
  {
    id: 'CITY-VNS',
    name: 'Varanasi',
    nameMr: 'वाराणसी',
    state: 'Uttar Pradesh',
    country: 'India',
    airportCode: 'VNS',
    airportName: 'Lal Bahadur Shastri International Airport (Babatpur)',
    railwayCode: 'BSB',
    railwayStationName: 'Varanasi Junction (Cantonment)',
    secondaryStations: ['DDU', 'BCY'],
    busTerminal: 'Varanasi Cantt Bus Station',
    keywords: ['varanasi', 'banaras', 'kashi', 'ganga ghat', 'kashi vishwanath', 'वाराणसी', 'काशी', 'बनारस'],
    popular: true,
    tier: 1,
    coordinates: [25.3176, 82.9739]
  },
  {
    id: 'CITY-AGR',
    name: 'Agra',
    nameMr: 'आग्रा',
    state: 'Uttar Pradesh',
    country: 'India',
    airportCode: 'AGR',
    airportName: 'Agra Kheria Airport',
    railwayCode: 'AGC',
    railwayStationName: 'Agra Cantt Railway Station',
    busTerminal: 'Idgah Bus Stand Agra',
    keywords: ['agra', 'taj mahal', 'agra fort', 'fatehpur sikri', 'आग्रा'],
    popular: true,
    tier: 2,
    coordinates: [27.1767, 78.0081]
  },
  {
    id: 'CITY-AY',
    name: 'Ayodhya',
    nameMr: 'अयोध्या',
    state: 'Uttar Pradesh',
    country: 'India',
    airportCode: 'AY',
    airportName: 'Maharishi Valmiki International Airport',
    railwayCode: 'AYC',
    railwayStationName: 'Ayodhya Cantt / Ayodhya Dham Junction',
    busTerminal: 'Ayodhya Central Bus Station',
    keywords: ['ayodhya', 'ram mandir', 'saryu', 'faizabad', 'अयोध्या', 'राम मंदिर'],
    popular: true,
    tier: 2,
    coordinates: [26.7922, 82.1998]
  },

  // ================= Himachal Pradesh & Uttarakhand =================
  {
    id: 'CITY-MAN',
    name: 'Manali',
    nameMr: 'मनाली',
    state: 'Himachal Pradesh',
    country: 'India',
    airportCode: 'KUU',
    airportName: 'Kullu Manali Airport (Bhuntar)',
    busTerminal: 'Manali Mall Road Bus Stand',
    keywords: ['manali', 'solang valley', 'rohtang pass', 'kullu', 'मनाली'],
    popular: true,
    tier: 2,
    coordinates: [32.2432, 77.1892]
  },
  {
    id: 'CITY-SLV',
    name: 'Shimla',
    nameMr: 'शिमला',
    state: 'Himachal Pradesh',
    country: 'India',
    airportCode: 'SLV',
    airportName: 'Shimla Airport (Jubbarhatti)',
    railwayCode: 'SML',
    railwayStationName: 'Shimla Railway Station',
    busTerminal: 'ISBT Tutikandi Shimla',
    keywords: ['shimla', 'mall road', 'kufri', 'toy train', 'शिमला'],
    popular: true,
    tier: 2,
    coordinates: [31.1048, 77.1734]
  },
  {
    id: 'CITY-RKSH',
    name: 'Rishikesh',
    nameMr: 'ऋषिकेश',
    state: 'Uttarakhand',
    country: 'India',
    airportCode: 'DED',
    airportName: 'Dehradun Jolly Grant Airport',
    railwayCode: 'YNRK',
    railwayStationName: 'Yog Nagari Rishikesh Railway Station',
    busTerminal: 'Rishikesh Central Bus Stand',
    keywords: ['rishikesh', 'yoga capital', 'ram jhula', 'laxman jhula', 'river rafting', 'ऋषिकेश'],
    popular: true,
    tier: 2,
    coordinates: [30.0869, 78.2676]
  },
  {
    id: 'CITY-HW',
    name: 'Haridwar',
    nameMr: 'हरिद्वार',
    state: 'Uttarakhand',
    country: 'India',
    railwayCode: 'HW',
    railwayStationName: 'Haridwar Junction',
    busTerminal: 'Haridwar Inter-State Bus Stand',
    keywords: ['haridwar', 'har ki pauri', 'kumbh mela', 'ganga aarti', 'हरिद्वार'],
    popular: true,
    tier: 2,
    coordinates: [29.9457, 78.1642]
  },

  // ================= Kerala =================
  {
    id: 'CITY-COK',
    name: 'Kochi (Cochin)',
    nameMr: 'कोची',
    state: 'Kerala',
    country: 'India',
    airportCode: 'COK',
    airportName: 'Cochin International Airport (Nedumbassery)',
    railwayCode: 'ERS',
    railwayStationName: 'Ernakulam Junction (South)',
    secondaryStations: ['ERN'],
    busTerminal: 'KSRTC Central Bus Station Ernakulam',
    keywords: ['kochi', 'cochin', 'ernakulam', 'fort kochi', 'backwaters', 'कोची'],
    popular: true,
    tier: 1,
    coordinates: [9.9312, 76.2673]
  },
  {
    id: 'CITY-MNR',
    name: 'Munnar',
    nameMr: 'मुन्नार',
    state: 'Kerala',
    country: 'India',
    busTerminal: 'Munnar KSRTC Bus Depot',
    keywords: ['munnar', 'tea estates', 'anamudi', 'western ghats', 'मुन्नार'],
    popular: true,
    tier: 2,
    coordinates: [10.0889, 77.0595]
  },

  // ================= Jammu & Kashmir / Ladakh =================
  {
    id: 'CITY-SXR',
    name: 'Srinagar',
    nameMr: 'श्रीनगर',
    state: 'Jammu & Kashmir',
    country: 'India',
    airportCode: 'SXR',
    airportName: 'Sheikh ul-Alam International Airport',
    railwayCode: 'SINA',
    railwayStationName: 'Srinagar Railway Station',
    busTerminal: 'TRC Bus Stand Srinagar',
    keywords: ['srinagar', 'dal lake', 'gulmarg', 'pahalgam', 'shikara', 'श्रीनगर'],
    popular: true,
    tier: 2,
    coordinates: [34.0837, 74.7973]
  },
  {
    id: 'CITY-IXL',
    name: 'Leh Ladakh',
    nameMr: 'लेह लडाख',
    state: 'Ladakh',
    country: 'India',
    airportCode: 'IXL',
    airportName: 'Kushok Bakula Rimpochee Airport',
    busTerminal: 'Leh Main Bus Stand',
    keywords: ['leh', 'ladakh', 'pangong lake', 'nubra valley', 'khardung la', 'लेह', 'लडाख'],
    popular: true,
    tier: 2,
    coordinates: [34.1526, 77.5771]
  }
];

/**
 * Filter Master Cities by Query with exact-prefix ranking
 */
export function searchMasterCities(query: string, limit: number = 10): MasterCity[] {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const clean = query.trim().toLowerCase();

  const matched = MASTER_CITIES.filter((c) => {
    return (
      c.name.toLowerCase().includes(clean) ||
      c.nameMr.includes(clean) ||
      c.id.toLowerCase().includes(clean) ||
      c.state.toLowerCase().includes(clean) ||
      (c.airportCode && c.airportCode.toLowerCase().includes(clean)) ||
      (c.railwayCode && c.railwayCode.toLowerCase().includes(clean)) ||
      c.keywords.some((k) => k.toLowerCase().includes(clean))
    );
  });

  // Rank matches: exact match > startsWith > substring
  matched.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aId = a.id.toLowerCase();
    const bId = b.id.toLowerCase();

    const aExact = aName === clean || aId === clean ? 100 : 0;
    const bExact = bName === clean || bId === clean ? 100 : 0;

    const aStarts = aName.startsWith(clean) ? 50 : 0;
    const bStarts = bName.startsWith(clean) ? 50 : 0;

    const aPop = a.popular ? 20 : 0;
    const bPop = b.popular ? 20 : 0;

    return (bExact + bStarts + bPop) - (aExact + aStarts + aPop);
  });

  return matched.slice(0, limit);
}
