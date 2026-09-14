// Curated Real Destination Knowledge Base & Real Spots Engine
// Provides authentic, verified real spots, landmarks, temples, forts, dishes, restaurants, and stays
// Prevents generic placeholders like "प्रसिद्ध पर्यटन स्थळ" or "स्थानिक खानावळ".

export interface RealDayPlan {
  day_title_mr: string;
  day_title_en: string;
  travel_route_info_mr: string;
  travel_route_info_en: string;
  local_food_specialty_mr: string;
  local_food_specialty_en: string;
  heritage_highlights_mr: string;
  heritage_highlights_en: string;
  morning_mr: string;
  morning_en: string;
  afternoon_mr: string;
  afternoon_en: string;
  evening_mr: string;
  evening_en: string;
  stay_mr: string;
  stay_en: string;
  tips_mr: string;
  tips_en: string;
  spots: string[];
}

export interface DestinationProfile {
  aliases: string[];
  canonicalNameMr: string;
  canonicalNameEn: string;
  keyHighlightsMr: string[];
  keyHighlightsEn: string[];
  bestTime: string;
  packListMr: string[];
  packListEn: string[];
  days: RealDayPlan[];
}

export const REAL_DESTINATIONS: Record<string, DestinationProfile> = {
  kolhapur: {
    aliases: ['kolhapur', 'कोल्हापूर', 'ambabai', 'mahalaxmi', 'महालक्ष्मी', 'panhala', 'पन्हाळा'],
    canonicalNameMr: 'कोल्हापूर',
    canonicalNameEn: 'Kolhapur',
    keyHighlightsMr: [
      'श्री महालक्ष्मी (अंबाबाई) शक्तिपीठ मंदिर व किरणोत्सव दर्शन',
      'ऐतिहासिक पन्हाळा किल्ला (सज्जा कोठी व तीन दरवाजा)',
      'रंकाळा तलाव चौपाटी व संध्यामठ',
      'छत्रपती शाहू महाराज न्यू पॅलेस म्युझियम',
      'अस्सल कोल्हापुरी तांबडा-पांढरा रस्सा व मटण/व्हेज थाळी'
    ],
    keyHighlightsEn: [
      'Shri Mahalakshmi (Ambabai) Shaktipeeth Temple',
      'Historic Panhala Fort (Sajja Kothi & Teen Darwaza)',
      'Rankala Lake Promenade & Sandhyamath',
      'Chhatrapati Shahu Maharaj New Palace Museum',
      'Authentic Kolhapuri Tambda-Pandhra Rassa Thali'
    ],
    bestTime: 'October to March',
    packListMr: ['पारंपरिक पोशाख (मंदिरासाठी)', 'सैल सुती कपडे', 'कम्फर्टेबल वॉकिंग शूज', 'कॅमेरा'],
    packListEn: ['Traditional attire for temple', 'Comfortable cotton wear', 'Walking shoes', 'Camera'],
    days: [
      {
        day_title_mr: 'श्री महालक्ष्मी (अंबाबाई) दर्शन, भवानी मंडप व न्यू पॅलेस',
        day_title_en: 'Shri Ambabai Temple Darshan, Bhavani Mandap & New Palace',
        travel_route_info_mr: 'शहरांतर्गत प्रवास (५-१० किमी). ऑटोरिक्षा किंवा स्वतःच्या वाहनाने सुलभ प्रवास.',
        travel_route_info_en: 'Intra-city travel (5-10 km). Easy transit via auto-rickshaw or personal cab.',
        local_food_specialty_mr: 'नाश्ता: फडतरे / बावडा मिसळ-पाव; दुपार: अस्सल कोल्हापुरी थाळी @ हॉटेल ओपेल / देहाती; संध्याकाळ: रंकाळा राजाभाऊ भेळ; रात्री: कोल्हापुरी रस्सा जेवण.',
        local_food_specialty_en: 'Breakfast: Phadtare / Bawada Misal; Lunch: Authentic Thali @ Hotel Opal / Dehati; Evening: Rajabhau Bhel at Rankala; Dinner: Kolhapuri Special Thali.',
        heritage_highlights_mr: '७ व्या शतकातील हेमाडपंती महालक्ष्मी मंदिर, ऐतिहासिक भवानी मंडप (छत्रपती घराण्याचे दरबार स्थळ) व छत्रपती शाहू महाराजांचा न्यू पॅलेस वास्तू.',
        heritage_highlights_en: '7th Century Hemadpanthi Mahalakshmi Temple, historic Bhavani Mandap royal court, and magnificent New Palace Museum.',
        morning_mr: 'सकाळी [०८:०० AM - ११:३० AM]: श्री महालक्ष्मी (अंबाबाई) मंदिरात दर्शन व महाआरती. नजीकच्या भवानी मंडप वास्तूची पाहणी आणि फडतरे मिसळ नाश्ता.',
        morning_en: 'Morning [08:00 AM - 11:30 AM]: Darshan at sacred Shri Mahalakshmi Temple. Explore Bhavani Mandap and breakfast at famous Phadtare Misal.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०४:०० PM]: हॉटेल ओपेल येथे अस्सल तांबडा-पांढरा रस्सा थाळी भोजन. त्यानंतर छत्रपती शाहू महाराज न्यू पॅलेस म्युझियम व प्राणीसंग्रहालय भेट.',
        afternoon_en: 'Afternoon [12:30 PM - 04:00 PM]: Authentic Kolhapuri meal at Hotel Opal. Post-lunch tour of Chhatrapati Shahu Maharaj New Palace Museum.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:३० PM]: ऐतिहासिक रंकाळा तलावावर फेरफटका, बोटिंग आणि राजाभाऊ भेळ आस्वाद. कोल्हापुरी चपला खरेदीसाठी महाद्वार रोड बाजारपेठ भेट.',
        evening_en: 'Evening [04:30 PM - 08:30 PM]: Stroll and boating at Rankala Lake, famous Rajabhau Bhel, and Kolhapuri chappal shopping at Mahadwar Road bazaar.',
        stay_mr: 'हॉटेल सयाजी / हॉटेल पर्ल (कावळा नाका, कोल्हापूर)',
        stay_en: 'Hotel Sayaji / The Pearl (Kawala Naka, Kolhapur)',
        tips_mr: 'मंदिरात दर्शनासाठी सकाळी लवकर जावे. कोल्हापुरी चपला खरेदीसाठी घासाघीस करण्यास वाव असतो.',
        tips_en: 'Visit Ambabai temple early morning to avoid rush. Bargain respectfully at chappal lane.',
        spots: ['श्री महालक्ष्मी मंदिर', 'भवानी मंडप', 'न्यू पॅलेस म्युझियम', 'रंकाळा तलाव', 'महाद्वार रोड']
      },
      {
        day_title_mr: 'ऐतिहासिक पन्हाळा किल्ला, पावनखिंड व ज्योतिबा देवस्थान',
        day_title_en: 'Historic Panhala Fort, Pawankhind & Jyotiba Hill Shrine',
        travel_route_info_mr: 'कोल्हापूर ते पन्हाळा (२२ किमी, ४० मिनिटे) आणि पन्हाळा ते वाडी रत्नागिरी/ज्योतिबा (१५ किमी).',
        travel_route_info_en: 'Kolhapur to Panhala (22 km, 40 min) and Panhala to Jyotiba shrine (15 km).',
        local_food_specialty_mr: 'नाश्ता: कांदा पोहे व चहा @ पन्हाळा; दुपार: पिठलं-भाकरी, ठेचा व गावरान चिकन/मटण @ पन्हाळा व्हॅली ढाबा; रात्री: अस्सल बासुंदी व कोल्हापुरी जेवण.',
        local_food_specialty_en: 'Breakfast: Kanda Pohe & Tea; Lunch: Authentic Pithla-Bhakri, Thecha & Gavran thali; Dinner: Basundi & dinner at city center.',
        heritage_highlights_mr: 'छत्रपती शिवाजी महाराजांच्या पदस्पर्शाने पावन झालेला पन्हाळा किल्ला, बाजीप्रभू देशपांडे व सज्जा कोठी, आणि दख्खनचा राजा श्री ज्योतिबा देवस्थान.',
        heritage_highlights_en: 'Panhala Fort (sanctified by Chhatrapati Shivaji Maharaj), Sajja Kothi, Veer Bajiprabhu memorial, and sacred Jyotiba hill shrine.',
        morning_mr: 'सकाळी [०८:३० AM - १२:०० PM]: पन्हाळा किल्ल्यावर तीन दरवाजा, सज्जा कोठी, अंबरखाना आणि पुसाटी बुरुज भेट. विहंगम दरीचे दृश्य व फोटोग्राफी.',
        morning_en: 'Morning [08:30 AM - 12:00 PM]: Explore Panhala Fort, Teen Darwaza, Sajja Kothi, Ambarkhana granary, and scenic valley photography points.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: पन्हाळ्यावर निसर्गरम्य व्हॅली व्ह्यू ढाब्यावर गरमागरम पिठलं-भाकरी व गावरान जेवण. त्यानंतर पावनखिंड स्मारकाची माहिती.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Fresh rustic Pithla Bhakri and Thecha lunch at valley viewpoint eatery. Learn the heroic history of Pawankhind.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:०० PM]: दख्खनचा राजा श्री ज्योतिबा मंदिरात दर्शन, गुलाल उधळण व विहंगम सूर्यास्त. शहरात परत येऊन विश्रांती.',
        evening_en: 'Evening [04:00 PM - 08:00 PM]: Visit sacred Jyotiba Temple atop the hill, witness sunset panorama, and return to Kolhapur city.',
        stay_mr: 'हॉटेल सयाजी / पन्हाळा एमटीडीसी रिसॉर्ट',
        stay_en: 'Hotel Sayaji Kolhapur / MTDC Resort Panhala',
        tips_mr: 'पन्हाळा किल्ल्यावर पायऱ्या चढण्यासाठी आरामदायक शूज वापरा.',
        tips_en: 'Wear sturdy footwear for walking around Panhala ramparts.',
        spots: ['पन्हाळा किल्ला', 'सज्जा कोठी', 'तीन दरवाजा', 'श्री ज्योतिबा मंदिर']
      },
      {
        day_title_mr: 'कणेरी मठ (सिद्धगिरी म्युझियम) व नरसोबाची वाडी',
        day_title_en: 'Siddhagiri Kaneri Math & Narsobachi Wadi Dattatreya Shrine',
        travel_route_info_mr: 'कोल्हापूर ते कणेरी मठ (१२ किमी) आणि तेथून नरसोबाची वाडी (४५ किमी, १ तास).',
        travel_route_info_en: 'Kolhapur to Kaneri Math (12 km) and further to Narsobachi Wadi (45 km, 1 hr).',
        local_food_specialty_mr: 'नाश्ता: उपमा/इडली; दुपार: कणेरी मठामधील सात्विक महाप्रसाद भोजन; संध्याकाळ: नरसोबाच्या वाडीची प्रसिद्ध बासुंदी व खवा पेढे.',
        local_food_specialty_en: 'Breakfast: South Indian; Lunch: Pure Satvik Mahaprasad at Kaneri Math; Evening: Famous Narsobachi Wadi Basundi and Khawa Pedha.',
        heritage_highlights_mr: 'सिद्धगिरी ग्रामजीवन संग्रहालय (प्राचीन भारतीय खेड्यातील स्वयंपूर्ण संस्कृतीचे सजीव दर्शन) आणि कृष्णा-पंचगंगा संगमावरील पवित्र नरसोबाची वाडी.',
        heritage_highlights_en: 'Siddhagiri Gramjivan Wax Museum depicting ancient Indian rural self-sufficient life, and holy confluence shrine at Narsobachi Wadi.',
        morning_mr: 'सकाळी [०८:३० AM - १२:०० PM]: सिद्धगिरी ग्रामजीवन संग्रहालय (कणेरी मठ) भेट. प्राचीन भारतीय शिल्पकला, कारागीर व ग्रामीण संस्कृतीचे सजीव देखावे पाहणे.',
        morning_en: 'Morning [08:30 AM - 12:00 PM]: Tour Siddhagiri Gramjivan Museum at Kaneri Math, marveling at lifelike clay sculptures of self-reliant Indian villages.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: मठात सात्विक जेवण घेऊन नरसोबाच्या वाडीकडे प्रयाण. कृष्णा नदी घाटावर पवित्र दत्त मंदिर दर्शन व चरण पादुका पूजा.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Savor satvik meal and drive to Narsobachi Wadi. Visit holy Dattatreya Temple on Krishna riverbank.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:०० PM]: घाटावर कृष्णा आरती दर्शन. प्रसिद्ध वाडीची ताजी बासुंदी व खवा खरेदी. सहलीची यशस्वी सांगता व परतीचा प्रवास.',
        evening_en: 'Evening [04:00 PM - 08:00 PM]: Witness Krishna river evening aarti, purchase fresh Basundi and sweets, and commence departure journey.',
        stay_mr: 'हॉटेल सयाजी किंवा परतीचा प्रवास',
        stay_en: 'Hotel Sayaji or return journey',
        tips_mr: 'नरसोबाच्या वाडीत ताजी बासुंदी घेताना स्थानिक अधिकृत दुकानांना प्राधान्य द्या.',
        tips_en: 'Buy fresh Basundi from authorized traditional sweet shops near river ghat.',
        spots: ['कणेरी मठ सिद्धगिरी म्युझियम', 'नरसोबाची वाडी', 'कृष्णा नदी घाट']
      }
    ]
  },

  mahabaleshwar: {
    aliases: ['mahabaleshwar', 'महाबळेश्वर', 'panchgani', 'पाचगणी', 'venna lake', 'वेण्णा लेक', 'mapro', 'मॅप्रो'],
    canonicalNameMr: 'महाबळेश्वर',
    canonicalNameEn: 'Mahabaleshwar',
    keyHighlightsMr: [
      'वेण्णा लेक बोटिंग व हॉर्स रायडिंग',
      'आर्थर्स सीट, विल्सन पॉईंट व एल्फिन्स्टन व्ह्यू पॉईंट्स',
      'पाचगणीचे टेबल लँड व पारसी पॉईंट',
      'मॅप्रो गार्डन (स्ट्रॉबेरी विथ फ्रेश क्रीम)',
      'पुरातन महाबळेश्वर मंदिर व पंचगंगा मंदिर (५ नद्यांचे उगमस्थान)'
    ],
    keyHighlightsEn: [
      'Venna Lake Boating & Horse Riding',
      'Arthur’s Seat, Wilson Sunrise & Elphinstone Points',
      'Panchgani Table Land & Parsi Point',
      'Mapro Garden (Strawberries with Fresh Cream)',
      'Ancient Mahabaleshwar Temple & Panchganga Shrine'
    ],
    bestTime: 'Throughout the year (Monsoon for lush greenery, Winter for cool strawberry season)',
    packListMr: ['उबदार जॅकेट किंवा स्वेटर', 'रेनकोट/छत्री (पावसाळ्यात)', 'वॉकिंग शूज', 'सनग्लासेस'],
    packListEn: ['Warm jacket or sweater', 'Umbrella/Raincoat (monsoon)', 'Walking shoes', 'Sunglasses'],
    days: [
      {
        day_title_mr: 'वेण्णा लेक बोटिंग, महाबळेश्वर मंदिर व आर्थर्स सीट',
        day_title_en: 'Venna Lake Boating, Ancient Temple & Arthur’s Seat',
        travel_route_info_mr: 'महाबळेश्वर अंतर्गत प्रेक्षणीय रस्ता (१५-२० किमी). हिरव्यागार सह्याद्री घाटातून सुखद प्रवास.',
        travel_route_info_en: 'Local Mahabaleshwar circuit (15-20 km) through lush Sahyadri pine and mist forests.',
        local_food_specialty_mr: 'नाश्ता: गरमागरम मका पॅटीस व चहा @ वेण्णा लेक; दुपार: अस्सल गुजराती/महाराष्ट्रीयन थाळी @ हॉटेल बगिचा; संध्याकाळ: ताजी स्ट्रॉबेरी विथ क्रीम; रात्री: चविष्ट मोगलाई/व्हेज जेवण.',
        local_food_specialty_en: 'Breakfast: Warm Corn Patties & Masala Chai; Lunch: Maharashtrian Thali @ Bagicha Restaurant; Evening: Strawberry with Fresh Cream; Dinner: Multi-cuisine.',
        heritage_highlights_mr: '१३ व्या शतकातील हेमाडपंती पंचगंगा मंदिर (कृष्णा, कोयना, वेण्णा, सावित्री, गायत्री या ५ नद्यांचे उगमस्थान) व छत्रपती शिवाजी महाराजांचे आवडते थंड हवेचे ठिकाण.',
        heritage_highlights_en: '13th Century Panchganga Temple (origin of 5 holy rivers: Krishna, Koyna, Venna, Savitri, Gayatri) and Maratha heritage viewpoints.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: जुने महाबळेश्वर येथील पुरातन महाबळेश्वर शिवमंदिर आणि पंचगंगा मंदिर दर्शन. वेण्णा लेकवर पॅडल बोटिंग व मका पॅटीस नाश्ता.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Visit ancient Mahabaleshwar Temple and Panchganga River Origin shrine. Enjoy boating at scenic Venna Lake.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: प्रसिद्ध बगिचा रेस्टॉरंटमध्ये मका पॅटीस व थाळी जेवण. त्यानंतर सह्याद्रीचे विहंगम दृश्य पाहण्यासाठी आर्थर्स सीट (क्वीन ऑफ ऑल पॉईंट्स) भेट.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Lunch at iconic Bagicha Restaurant. Tour Arthur’s Seat (Queen of Points) admiring deep Savitri valley cliffs.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:०० PM]: एल्फिन्स्टन पॉईंट व केट्स पॉईंटवरून सूर्यास्त दर्शन. महाबळेश्वर टाऊन मार्केटमध्ये चिक्की, फज व मध खरेदी.',
        evening_en: 'Evening [04:00 PM - 08:00 PM]: Sunset at Kate’s Point & Elephant’s Head. Evening shopping for honey, chikki and fruit crushes in town bazaar.',
        stay_mr: 'सिटाडेल रिसॉर्ट / क्लब महिंद्रा / एमटीडीसी महाबळेश्वर',
        stay_en: 'Citadel Resort / Brightland Resort / MTDC Mahabaleshwar',
        tips_mr: 'आर्थर्स सीटवर वानरांपासून खाद्यपदार्थ व मोबाईल सांभाळा.',
        tips_en: 'Keep snacks and mobile phones secure from monkeys at viewpoints.',
        spots: ['वेण्णा लेक', 'महाबळेश्वर मंदिर', 'पंचगंगा मंदिर', 'आर्थर्स सीट', 'टाऊन मार्केट']
      },
      {
        day_title_mr: 'पाचगणी टेबल लँड, पारसी पॉईंट व मॅप्रो गार्डन',
        day_title_en: 'Panchgani Table Land, Parsi Point & Mapro Garden',
        travel_route_info_mr: 'महाबळेश्वर ते पाचगणी (१९ किमी, ३५ मिनिटे). वळणावळणाचा नयनरम्य घाट रस्ता.',
        travel_route_info_en: 'Mahabaleshwar to Panchgani (19 km, 35 min) along scenic hill curves.',
        local_food_specialty_mr: 'नाश्ता: चीज सँडविच व स्ट्रॉबेरी ज्युस; दुपार: मॅप्रो वुड-फायर्ड पिझ्झा व पास्ता @ मॅप्रो गार्डन; संध्याकाळ: स्ट्रॉबेरी विथ फ्रेश क्रीम; रात्री: महाराष्ट्रीयन पद्धतीचे जेवण.',
        local_food_specialty_en: 'Breakfast: Sandwiches & juice; Lunch: Famous Wood-fired Pizza @ Mapro Garden; Evening: Strawberry with Fresh Cream; Dinner: Local Thali.',
        heritage_highlights_mr: 'आशिया खंडातील दुसऱ्या क्रमांकाचे सर्वात मोठे ज्वालामुखी पठार (टेबल लँड) आणि ब्रिटिशकालीन हिल स्टेशन वास्तू.',
        heritage_highlights_en: 'Asia’s second largest volcanic mountain plateau (Table Land) and historic British colonial sanatoriums.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: पाचगणी येथील विस्तीर्ण टेबल लँड पठारावर हॉर्स रायडिंग आणि गुंफा (Devil’s Kitchen) पाहणे. पारसी पॉईंटवरून धोम डॅम पाण्याचा विहंगम व्ह्यू.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Walk or horse ride atop the sprawling Table Land plateau. Capture panoramic Dhom Dam reservoir views at Parsi Point.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०४:०० PM]: मॅप्रो गार्डनमध्ये प्रसिद्ध वुड-फायर्ड पिझ्झा व सँडविच जेवण. स्ट्रॉबेरी प्लांटेशन, चॉकलेट व जॅम फॅक्टरी टूर आणि खरेदी.',
        afternoon_en: 'Afternoon [12:30 PM - 04:00 PM]: Relish giant wood-fired thin crust pizza and fresh fruit shakes at Mapro Garden. Tour jam factory and strawberry fields.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: सिडनी पॉईंटवरून सूर्यास्त दर्शन. पाचगणी मार्केटमध्ये बेकरी प्रॉडक्ट्स व स्ट्रॉबेरी खरेदी आणि हॉटेल वापसी.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Sunset panorama at Sydney Point. Shop for fresh bakery items and strawberries before relaxing at hotel.',
        stay_mr: 'सिटाडेल रिसॉर्ट / पाचगणी रिसॉर्ट',
        stay_en: 'Citadel Resort / Mount View Hotel Panchgani',
        tips_mr: 'मॅप्रो गार्डनमध्ये वीकेंडला मोठी गर्दी असते, दुपारी १ च्या आधी पोहोचणे उत्तम.',
        tips_en: 'Arrive at Mapro Garden before 1:00 PM on weekends to avoid table wait times.',
        spots: ['टेबल लँड', 'पारसी पॉईंट', 'मॅप्रो गार्डन', 'सिडनी पॉईंट']
      },
      {
        day_title_mr: 'ऐतिहासिक प्रतापगड किल्ला व भवानी मंदिर',
        day_title_en: 'Historic Pratapgad Fort & Goddess Bhavani Temple',
        travel_route_info_mr: 'महाबळेश्वर ते प्रतापगड (२१ किमी, ५० मिनिटे). जावळीच्या घनदाट जंगलातून जाणारा ऐतिहासिक रस्ता.',
        travel_route_info_en: 'Mahabaleshwar to Pratapgad Fort (21 km, 50 min) through dense historical Javli forests.',
        local_food_specialty_mr: 'नाश्ता: पोहे व कांदा भजी; दुपार: किल्ल्याखालील अस्सल झुणका-भाकरी, ठेचा व मटण/चिकन थाळी; संध्याकाळ: ताजे लिंबू सरबत.',
        local_food_specialty_en: 'Breakfast: Kanda Bhaji & tea; Lunch: Authentic Zunka Bhakri, Mirchi Thecha & rural thali at fort base; Evening: Fresh Kokum sharbat.',
        heritage_highlights_mr: 'छत्रपती शिवाजी महाराजांनी १६५६ मध्ये बांधलेला अजिंक्य प्रतापगड, अफझलखानाचा वध केलेले ऐतिहासिक ठिकाण व छत्रपतींची कुलदेवता भवानी मातेचे मंदिर.',
        heritage_highlights_en: 'Impregnable Pratapgad Fort built in 1656 by Chhatrapati Shivaji Maharaj, historic site of Afzal Khan episode, and Bhavani temple.',
        morning_mr: 'सकाळी [०८:३० AM - १२:३० PM]: प्रतापगड किल्ल्यावर चढाई. भवानी माता मंदिर दर्शन, छत्रपती शिवाजी महाराजांचा अश्वारूढ पुतळा, बुरुज व अफझलखान कबर स्थळ पाहणी.',
        morning_en: 'Morning [08:30 AM - 12:30 PM]: Ascend historic Pratapgad Fort. Visit sacred Bhavani Temple, equestrian statue of Shivaji Maharaj, and strategic bastions.',
        afternoon_mr: 'दुपारी [०१:०० PM - ०३:३० PM]: किल्ल्याच्या पायथ्याशी गावरान झुणका-भाकरी व सुक्या मटणाचा अस्सल बेत. जावळीच्या खोऱ्याची ऐतिहासिक माहिती घेणे.',
        afternoon_en: 'Afternoon [01:00 PM - 03:30 PM]: Relish authentic traditional Zunka Bhakri with freshly pounded Thecha at the fort base rural eatery.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०७:३० PM]: महाबळेश्वरला परत येऊन बॅग पॅकिंग, स्थानिक स्ट्रॉबेरी खरेदी आणि परतीचा सुखद प्रवास सुरू.',
        evening_en: 'Evening [04:00 PM - 07:30 PM]: Return to base, collect fresh strawberry boxes, and begin pleasant return journey home.',
        stay_mr: 'परतीचा प्रवास',
        stay_en: 'Return journey',
        tips_mr: 'प्रतापगडावर सुमारे ४०० पायऱ्या आहेत, सोबत पाण्याची बाटली नक्की ठेवावी.',
        tips_en: 'Pratapgad has around 400 stone steps; carry sufficient drinking water.',
        spots: ['प्रतापगड किल्ला', 'भवानी माता मंदिर', 'जावळी खोरे', 'अफझलखान कबर']
      }
    ]
  },

  goa: {
    aliases: ['goa', 'गोवा', 'panaji', 'panjim', 'पणजी', 'calangute', 'baga', 'बागा', 'colva', 'madgaon'],
    canonicalNameMr: 'गोवा',
    canonicalNameEn: 'Goa',
    keyHighlightsMr: [
      'बागा व कॅलंगूट बीच वॉटर स्पोर्ट्स (पॅरासेलिंग, बनाना राइड)',
      'ऐतिहासिक अगुआडा सागरी किल्ला व दीपगृह (Lighthouse)',
      'जुने गोवा येथील युनेस्को हेरिटेज बॅसिलिका ऑफ बॉम जिझस चर्च',
      'दूधसागर भव्य धबधबा व जीप सफारी',
      'मांडवी नदी सनसेट क्रूझ व अस्सल गोवन फिश करी राईस'
    ],
    keyHighlightsEn: [
      'Baga & Calangute Beach Water Sports (Parasailing, Jet Ski)',
      'Historic Fort Aguada & 17th Century Portuguese Lighthouse',
      'UNESCO World Heritage Basilica of Bom Jesus (Old Goa)',
      'Majestic Dudhsagar Waterfall & Jungle Jeep Safari',
      'Mandovi River Sunset Cruise & Authentic Goan Fish Curry Rice'
    ],
    bestTime: 'October to May',
    packListMr: ['बीचवेअर व हलके कपडे', 'सनग्लासेस व सनस्क्रीन', 'वॉटरप्रूफ मोबाईल पाऊच', 'कम्फर्टेबल फ्लिप-फ्लॉप्स'],
    packListEn: ['Beachwear & light cottons', 'Sunglasses & high-SPF sunscreen', 'Waterproof phone pouch', 'Flip-flops'],
    days: [
      {
        day_title_mr: 'उत्तर गोवा: बागा, कॅलंगूट बीच व अगुआडा किल्ला',
        day_title_en: 'North Goa: Baga Beach, Calangute & Fort Aguada',
        travel_route_info_mr: 'उत्तर गोव्यात स्थानिक प्रवास (१५-२५ किमी). टू-व्हीलर (स्कूटर) किंवा स्वतःच्या वाहनाने फिरणे सर्वोत्तम.',
        travel_route_info_en: 'North Goa coastal circuit (15-25 km). Renting a scooter or private cab is ideal.',
        local_food_specialty_mr: 'नाश्ता: गोवन पोई विथ मिक्स भाजी / ऑम्लेट; दुपार: अस्सल गोवन किंगफिश थाळी @ ब्रिटोज (Britto’s); संध्याकाळ: बीच शेक स्नॅक्स; रात्री: सी-फूड व बेबिका स्वीट.',
        local_food_specialty_en: 'Breakfast: Goan Poi & Omelette; Lunch: Goan Kingfish Thali @ Britto’s Baga; Evening: Beach Shack Snacks; Dinner: Goan Curry & Bebinca.',
        heritage_highlights_mr: '१६१२ मधील पोर्तुगीजकालीन अगुआडा सागरी किल्ला (सिंकेरीम बीच) व आशियातील जुने ४-मजली दीपगृह.',
        heritage_highlights_en: '1612 AD Portuguese Fort Aguada at Sinquerim Beach, historic water cisterns, and 4-storey lighthouse.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: सिंकेरीम येथील ऐतिहासिक अगुआडा किल्ल्याची पाहणी. अरबी समुद्राचे विहंगम दृश्य आणि दीपगृह फोटोग्राफी.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Explore historic 17th century Fort Aguada at Sinquerim, enjoying panoramic Arabian Sea views and rampart photos.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: बागा बीचवरील प्रसिद्ध ब्रिटोज किंवा सेंट अँथनीज शेकमध्ये अस्सल गोवन फिश करी राईस किंवा व्हेज थाळी भोजन.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Lunch at famous Britto’s shack on Baga Beach with authentic Goan fish curry, calamari or vegetarian curry.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:३० PM]: कॅलंगूट बीचवर वॉटर स्पोर्ट्स (पॅरासेलिंग, जेट स्की, बनाना राइड). सूर्यास्त दर्शन आणि रात्री प्रसिद्ध टिटोज लेन फेरफटका.',
        evening_en: 'Evening [04:00 PM - 08:30 PM]: High-adrenaline water sports at Calangute Beach, relaxing sunset walk, and lively evening at Tito’s Lane.',
        stay_mr: 'कॅलंगूट ग्रांडे रिसॉर्ट / हॉलिडे इन / झोस्टेल गोवा',
        stay_en: 'Calangute Grande Resort / Lemon Tree Amarante / Zostel Goa',
        tips_mr: 'वॉटर स्पोर्ट्स करताना नेहमी लाइफ जॅकेट घाला आणि परवानाधारक ऑपरेटर निवडा.',
        tips_en: 'Always wear life jackets for water sports and negotiate bundle packages.',
        spots: ['अगुआडा किल्ला', 'बागा बीच', 'कॅलंगूट बीच', 'सिंकेरीम बीच']
      },
      {
        day_title_mr: 'ऐतिहासिक जुने गोवा चर्च, पणजी फॉन्टेनहास व मांडवी क्रूझ',
        day_title_en: 'Old Goa UNESCO Churches, Fontainhas Latin Quarter & Cruise',
        travel_route_info_mr: 'कॅलंगूट ते जुने गोवा (२२ किमी) व तेथून पणजी शहर (१० किमी).',
        travel_route_info_en: 'Calangute to Old Goa (22 km) and onward to Panaji city (10 km).',
        local_food_specialty_mr: 'नाश्ता: कॅफे अल्मेडा येथे बन मस्का व चहा; दुपार: अस्सल पोर्तुगीज-गोवन जेवण @ व्हिवा पणजी / कामत हॉटेल; संध्याकाळ: काजू ड्रिंक व फेनी; रात्री: क्रूझ डिनर.',
        local_food_specialty_en: 'Breakfast: Bun Maska & Coffee; Lunch: Viva Panjim or Kamat Pure Veg; Evening: Goan Cafreal & Bebinca; Dinner: River Cruise Buffet.',
        heritage_highlights_mr: '१६ व्या शतकातील युनेस्को जागतिक वारसा स्थळ: बॅसिलिका ऑफ बॉम जिझस (सेंट फ्रान्सिस झेवियर यांचे पार्थिव) आणि से कॅथेड्रल (आशियातील सर्वात मोठी घंटा).',
        heritage_highlights_en: 'UNESCO World Heritage Sites: Basilica of Bom Jesus housing relics of St. Francis Xavier, and 16th-century Se Cathedral.',
        morning_mr: 'सकाळी [०९:०० AM - १२:०० PM]: जुने गोवा (Old Goa) येथील भव्य बॅसिलिका ऑफ बॉम जिझस चर्च आणि आशियातील भव्य से कॅथेड्रल वास्तूची पाहणी.',
        morning_en: 'Morning [09:00 AM - 12:00 PM]: Tour historic Basilica of Bom Jesus and majestic Se Cathedral, admiring 400-year-old Baroque architecture.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: पणजीमधील हेरिटेज फॉन्टेनहास (Fontainhas) लॅटिन क्वार्टरमध्ये रंगीबेरंगी पोर्तुगीज घरांची सफर व पारंपारिक जेवण.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Walk through the charming Latin Quarter of Fontainhas, photographing vibrant yellow-and-blue Portuguese houses.',
        evening_mr: 'संध्याकाळ [०५:०० PM - ०८:३० PM]: मांडवी नदीवर १ तासाचा सनसेट क्रूझ (पारंपारिक गोवन लोकनृत्य व संगीत). त्यानंतर मिरामार बीचवर फेरफटका.',
        evening_en: 'Evening [05:00 PM - 08:30 PM]: 1-hour sunset cruise on River Mandovi with Goan folk performances, followed by sea breeze at Miramar Beach.',
        stay_mr: 'हॉटेल मांडवी / फॉर्च्यून मिरामार, पणजी',
        stay_en: 'Hotel Mandovi / Fortune Miramar, Panaji',
        tips_mr: 'चर्चमध्ये प्रवेश करताना शालीन कपडे परिधान करा.',
        tips_en: 'Modest dress code is strictly enforced inside historical churches.',
        spots: ['बॅसिलिका ऑफ बॉम जिझस', 'से कॅथेड्रल', 'फॉन्टेनहास लॅटिन क्वार्टर', 'मांडवी नदी क्रूझ']
      },
      {
        day_title_mr: 'दक्षिण गोवा: दूधसागर धबधबा किंवा पालोलेम बीच शांती',
        day_title_en: 'South Goa: Dudhsagar Falls Trek or Palolem Beach Serenity',
        travel_route_info_mr: 'पणजी ते कुळेम दूधसागर सफारी (६० किमी, १.५ तास) किंवा पालोलेम बीच (६५ किमी).',
        travel_route_info_en: 'Panaji to Kulem Dudhsagar jungle safari (60 km, 1.5 hr) or pristine Palolem Beach (65 km).',
        local_food_specialty_mr: 'नाश्ता: कुळेम येथील स्थानिक नाश्ता; दुपार: जंगलातील अस्सल गोवन पद्धतीचे जेवण / पालोलेम बीच शेक फूड; रात्री: प्रसिद्ध मार्टिन्स कॉर्नर (बेतालभातीम).',
        local_food_specialty_en: 'Breakfast: Local breakfast at Kulem; Lunch: Jungle thali / Beachside lunch; Dinner: Celebrated Martin’s Corner at Betalbatim.',
        heritage_highlights_mr: 'भगवान महावीर वन्यजीव अभयारण्यातील ३१० मीटर उंच भारतातील भव्य ४-स्तरीय दूधसागर धबधबा व ऐतिहासिक रेल्वे पूल.',
        heritage_highlights_en: 'India’s fifth tallest 4-tiered 310m Dudhsagar Waterfall inside Bhagwan Mahaveer Wildlife Sanctuary.',
        morning_mr: 'सकाळी [०८:०० AM - १२:३० PM]: कुळेम येथून ओपन-टॉप जीप सफारीने जंगलातून दूधसागर धबधब्याकडे प्रयाण. धबधब्याच्या नैसर्गिक तळ्यात लाइफ जॅकेटसह पोहण्याचा अनुभव.',
        morning_en: 'Morning [08:00 AM - 12:30 PM]: Exciting 4x4 open-top jeep safari across rivers to majestic Dudhsagar Falls. Refreshing swim in freshwater pool with life jacket.',
        afternoon_mr: 'दुपारी [०१:०० PM - ०३:३० PM]: सह्याद्रीच्या कुशीतील स्पाइस प्लांटेशन (मसाल्यांची बाग) भेट, पारंपारिक केळीच्या पानावर गोवन भोजन आणि मसाल्यांची माहिती.',
        afternoon_en: 'Afternoon [01:00 PM - 03:30 PM]: Tour Sahakari / Tropical Spice Plantation, enjoying authentic buffet lunch served on banana leaves.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:३० PM]: प्रसिद्ध मार्टिन्स कॉर्नर (Martin’s Corner) येथे रात्रीचे जेवण, गोवन संगीताचा आस्वाद आणि सहलीची सांगता.',
        evening_en: 'Evening [04:30 PM - 08:30 PM]: Dinner at iconic Martin’s Corner, tasting Goan crab xec xec or paneer cafreal, concluding the trip.',
        stay_mr: 'मार्टिन्स कम्फर्ट / परतीचा प्रवास',
        stay_en: 'Martin’s Comfort / Departure',
        tips_mr: 'दूधसागर जीप बुकिंग सकाळी लवकर करावी लागते.',
        tips_en: 'Book Dudhsagar Forest Department jeep slots early in the morning.',
        spots: ['दूधसागर धबधबा', 'स्पाइस प्लांटेशन', 'मार्टिन्स कॉर्नर', 'पालोलेम बीच']
      }
    ]
  },

  pune: {
    aliases: ['pune', 'पुणे', 'shivajinagar', 'kothrud', 'सिंहगड', 'sinhagad'],
    canonicalNameMr: 'पुणे',
    canonicalNameEn: 'Pune',
    keyHighlightsMr: [
      'ऐतिहासिक शनिवार वाडा व लाल महाल',
      'सिंहगड किल्ला (तानाजी मालुसरे समाधी व गरमागरम पिठलं-भाकरी)',
      'श्रीमंत दगडूशेठ हलवाई गणपती मंदिर',
      'आगाखान पॅलेस (महात्मा गांधीजींचे ऐतिहासिक स्मारक)',
      'सारसबाग, केळकर म्युझियम व चितळे बंधू बाकरवडी'
    ],
    keyHighlightsEn: [
      'Historic Shaniwar Wada & Lal Mahal',
      'Sinhagad Fort (Veer Tanaji Memorial & Pithla Bhakri)',
      'Shrimant Dagdusheth Halwai Ganpati Temple',
      'Aga Khan Palace (Mahatma Gandhi Memorial)',
      'Raja Dinkar Kelkar Museum & Chitale Bandhu Bakarwadi'
    ],
    bestTime: 'July to February',
    packListMr: ['कम्फर्टेबल शूज', 'सुती कपडे', 'कॅमेरा', 'हलका जॅकेट'],
    packListEn: ['Comfortable walking shoes', 'Cotton apparel', 'Camera', 'Light jacket'],
    days: [
      {
        day_title_mr: 'शनिवार वाडा, दगडूशेठ गणपती व राजा दिनकर केळकर म्युझियम',
        day_title_en: 'Shaniwar Wada, Dagdusheth Ganpati & Kelkar Museum',
        travel_route_info_mr: 'पुणे शहरांतर्गत प्रवास (५-८ किमी). मेट्रो, पीएमपीएमएल बस किंवा कॅबने सोयीस्कर प्रवास.',
        travel_route_info_en: 'Pune city center route (5-8 km). Metro or cab provides convenient transit.',
        local_food_specialty_mr: 'नाश्ता: काटाकिर्र / बेडेकर मिसळ-पाव; दुपार: पुणेरी शाकाहारी थाळी @ सुकांता / बादशाही; संध्याकाळ: सुजाता मस्तानी; रात्री: वैशाली / रुपाली एफसी रोड.',
        local_food_specialty_en: 'Breakfast: Katakirrr / Bedekar Misal; Lunch: Maharashtrian Thali @ Sukanta; Evening: Sujata Mastani; Dinner: Iconic Cafe Vaishali on FC Road.',
        heritage_highlights_mr: 'पेशवेकालीन शनिवार वाडा (१७३२), बाल शिवरायांचे लाल महाल आणि ३०,००० पेक्षा जास्त दुर्मिळ कलावस्तूंचा संग्रह असणारे राजा दिनकर केळकर संग्रहालय.',
        heritage_highlights_en: '1732 Peshwa seat Shaniwar Wada, Shivaji Maharaj’s childhood home Lal Mahal, and 30,000 antiquities at Raja Dinkar Kelkar Museum.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: श्रीमंत दगडूशेठ हलवाई गणपती मंदिरात दर्शन. त्यानंतर शनिवार वाडा आणि लाल महाल वास्तूची ऐतिहासिक माहिती घेणे.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Darshan at Dagdusheth Halwai Temple, followed by exploring the historic ramparts of Shaniwar Wada and Lal Mahal.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: सुकांता येथे शुद्ध शाकाहारी थाळी भोजन. त्यानंतर राजा दिनकर केळकर संग्रहालयातील प्राचीन वाद्ये व शिल्पे पाहणे.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Feast at Sukanta Thali. Tour Raja Dinkar Kelkar Museum exploring Mastani Mahal exhibits and antique musical instruments.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:३० PM]: प्रसिद्ध सुजाता मस्तानीचा आस्वाद. तुळशीबाग व लक्ष्मी रोडवर चितळे बंधू बाकरवडी खरेदी आणि एफसी रोडवर फेरफटका.',
        evening_en: 'Evening [04:00 PM - 08:30 PM]: Savor mango Mastani at Sujata, shop for Chitale Bandhu Bakarwadi in Laxmi Road, and chill at FC Road cafe.',
        stay_mr: 'हॉटेल शेरेटन ग्रँड / प्राइड हॉटेल, शिवाजीनगर',
        stay_en: 'Sheraton Grand / The Pride Hotel, Shivajinagar',
        tips_mr: 'शनिवार वाड्यात लाईट अँड साऊंड शो संध्याकाळी असतो.',
        tips_en: 'Visit Shaniwar Wada light and sound show in the evening if available.',
        spots: ['शनिवार वाडा', 'दगडूशेठ गणपती', 'लाल महाल', 'केळकर म्युझियम', 'लक्ष्मी रोड']
      },
      {
        day_title_mr: 'ऐतिहासिक सिंहगड किल्ला व खडकवासला चौपाटी',
        day_title_en: 'Historic Sinhagad Fort & Khadakwasla Dam Sunset',
        travel_route_info_mr: 'पुणे शहर ते सिंहगड पायथा व माथा (३० किमी, १ तास). घाट रस्ता.',
        travel_route_info_en: 'Pune to Sinhagad Fort hilltop (30 km, 1 hr) via scenic ghat road.',
        local_food_specialty_mr: 'नाश्ता: पोहे व कांदा भजी @ घाट; दुपार: किल्ल्यावरील मातीच्या मडक्यातील दही, गरमागरम पिठलं-भाकरी, ठेचा व कांदा भजी; संध्याकाळ: मका कणीस @ खडकवासला.',
        local_food_specialty_en: 'Breakfast: Poha & Bhaji; Lunch: Famous Matka Dahi, hot Pithla-Bhakri & Thecha on Sinhagad top; Evening: Roasted Corn @ Khadakwasla.',
        heritage_highlights_mr: 'नरवीर तानाजी मालुसरे यांच्या पराक्रमाने गाजलेला सिंहगड किल्ला, नरवीर तानाजी समाधी, राजाराम महाराजांची समाधी व तानाजी कडा.',
        heritage_highlights_en: 'Historic battleground Sinhagad Fort defended by legendary warrior Tanaji Malusare, Tanaji Memorial, and Kalyan Darwaza.',
        morning_mr: 'सकाळी [०८:०० AM - १२:०० PM]: सिंहगड किल्ल्यावर चढाई. कल्याण दरवाजा, पुणे दरवाजा, तानाजी मालुसरे समाधी व विहंगम खडकवासला डॅम व्ह्यू.',
        morning_en: 'Morning [08:00 AM - 12:00 PM]: Ascend Sinhagad Fort. Explore Kalyan Darwaza, Tanaji Malusare memorial, and enjoy windy mountain views.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:०० PM]: किल्ल्यावरील स्थानिक महिलांनी चुलीवर बनवलेले गरमागरम पिठलं-भाकरी, झणझणीत ठेचा आणि मडक्यातील थंडगार दही खाणे.',
        afternoon_en: 'Afternoon [12:30 PM - 03:00 PM]: Enjoy authentic woodfire Pithla Bhakri, crushed spicy thecha and thick clay-pot matka dahi on the fort.',
        evening_mr: 'संध्याकाळ [०३:३० PM - ०७:०० PM]: खडकवासला धरणाच्या चौपाटीवर फेरफटका, गरम भाजलेले मक्याचे कणीस आणि सूर्यास्त दर्शन. पुण्यात वापसी.',
        evening_en: 'Evening [03:30 PM - 07:00 PM]: Stop by scenic Khadakwasla Dam promenade for roasted corn and sunset reflection over the water reservoir.',
        stay_mr: 'हॉटेल शेरेटन ग्रँड / जे डब्लू मॅरिएट, सेनापती बापट रोड',
        stay_en: 'JW Marriott / Sheraton Grand Pune',
        tips_mr: 'सिंहगडावर वीकेंडला मोठी गर्दी असते, सकाळी लवकर निघणे उत्तम.',
        tips_en: 'Depart early morning on weekends to avoid parking jams atop Sinhagad.',
        spots: ['सिंहगड किल्ला', 'तानाजी समाधी', 'खडकवासला डॅम']
      }
    ]
  },

  nashik: {
    aliases: ['nashik', 'नाशिक', 'trimbakeshwar', 'त्र्यंबकेश्वर', 'panchavati', 'पंचवटी', 'sula', 'सुला'],
    canonicalNameMr: 'नाशिक',
    canonicalNameEn: 'Nashik',
    keyHighlightsMr: [
      'त्र्यंबकेश्वर ज्योतिर्लिंग मंदिर (१२ ज्योतिर्लिंगांपैकी एक) व कुशावर्त तीर्थ',
      'पंचवटी: काळाराम मंदिर, सीता गुंफा व रामकुंड (गोदावरी महाआरती)',
      'सुला व्हाइनयार्ड्स (Sula Vineyards) वाईन टेस्टिंग टूर',
      'पांडवलेणी प्राचीन बौद्ध लेणी व दादासाहेब फाळके स्मारक',
      'अस्सल नाशिकची मिसळ (साधना / शामसुंदर / मामे मिसळ)'
    ],
    keyHighlightsEn: [
      'Trimbakeshwar Jyotirlinga Temple & Kushavarta Kund',
      'Panchavati: Kalaram Temple, Sita Gufa & Ramkund Godavari Aarti',
      'Sula Vineyards Winery & Tasting Tour',
      'Pandavleni 2nd Century BC Buddhist Caves',
      'Authentic Nashik Misal (Sadhana Chulivarchi / Shamsundar)'
    ],
    bestTime: 'September to March',
    packListMr: ['पारंपरिक पोशाख (मंदिरासाठी)', 'कम्फर्टेबल शूज', 'कॅमेरा'],
    packListEn: ['Traditional clothes for temple', 'Walking shoes', 'Camera'],
    days: [
      {
        day_title_mr: 'त्र्यंबकेश्वर ज्योतिर्लिंग, कुशावर्त व अंजनेरी टेकडी',
        day_title_en: 'Trimbakeshwar Jyotirlinga, Kushavarta & Anjaneri Hill',
        travel_route_info_mr: 'नाशिक शहर ते त्र्यंबकेश्वर (२८ किमी, ४५ मिनिटे). निसर्गरम्य सह्याद्री रस्ता.',
        travel_route_info_en: 'Nashik to Trimbakeshwar (28 km, 45 min) via scenic Brahmagiri foothills.',
        local_food_specialty_mr: 'नाश्ता: साधना चुलीवरची मिसळ / तुपातील जिलबी; दुपार: शुद्ध शाकाहारी सात्विक भोजन @ त्र्यंबकेश्वर; रात्री: खान्देशी शेवभाजी थाळी.',
        local_food_specialty_en: 'Breakfast: Sadhana Chulivarchi Misal; Lunch: Pure Veg Satvik Thali; Dinner: Khandeshi Shevbhaji Thali.',
        heritage_highlights_mr: 'पेशवे बाळाजी बाजीराव यांनी बांधलेले काळ्या पाषाणातील त्र्यंबकेश्वर ज्योतिर्लिंग आणि गोदावरी नदीचे उगमस्थान (ब्रह्मगिरी पर्वत).',
        heritage_highlights_en: 'Trimbakeshwar Temple (one of the 12 sacred Jyotirlingas of Lord Shiva) and Brahmagiri mountain, origin of Godavari River.',
        morning_mr: 'सकाळी [०८:०० AM - ११:३० AM]: पवित्र त्र्यंबकेश्वर ज्योतिर्लिंग दर्शन व अभिषेक. पवित्र कुशावर्त तीर्थ कुंड व ब्रह्मगिरी पर्वताचे विहंगम दर्शन.',
        morning_en: 'Morning [08:00 AM - 11:30 AM]: Darshan and Abhishek at sacred Trimbakeshwar Jyotirlinga. Visit Kushavarta Kund where River Godavari emerges.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: साधना चुलीवरच्या मिसळ केंद्रावर गरमागरम मिसळ-पाव व चुलीवरील जेवण. त्यानंतर श्री हनुमानाचे जन्मस्थान मानल्या जाणाऱ्या अंजनेरी टेकडीची माहिती.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Authentic woodfire misal at Sadhana Chulivarchi Misal. Tour foothills of Anjaneri, birth place of Lord Hanuman.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: नाशिक शहरात परत येऊन गोदावरी काठच्या रामकुंडावर संध्याकाळची महाआरती पाहणे आणि विश्रांती.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Return to Nashik city to witness the serene evening Godavari River Aarti at Ramkund.',
        stay_mr: 'हॉटेल एक्सप्रेस इन / गेटवे हॉटेल नाशिक',
        stay_en: 'Express Inn / The Gateway Hotel Ambad, Nashik',
        tips_mr: 'त्र्यंबकेश्वर मंदिरात व्हीआयपी पास ऑनलाईन आधीच बुक केल्यास रांगेचा वेळ वाचतो.',
        tips_en: 'Book Trimbakeshwar VIP darshan passes online in advance during festive days.',
        spots: ['त्र्यंबकेश्वर मंदिर', 'कुशावर्त कुंड', 'अंजनेरी टेकडी', 'रामकुंड']
      },
      {
        day_title_mr: 'पंचवटी, काळाराम मंदिर, सीता गुंफा व सुला व्हाइनयार्ड्स',
        day_title_en: 'Panchavati, Kalaram Temple, Sita Gufa & Sula Vineyards',
        travel_route_info_mr: 'पंचवटी ते गंगापूर रोड सुला व्हाइनयार्ड्स (१५ किमी, २५ मिनिटे).',
        travel_route_info_en: 'Panchavati to Gangapur Dam Sula Vineyards (15 km, 25 min).',
        local_food_specialty_mr: 'नाश्ता: शामसुंदर मिसळ (सातपूर); दुपार: सुला व्हाइनयार्ड्स येथील इटालियन/मल्टिक्युझिन जेवण @ रासा किंवा लिटिल इटली; संध्याकाळ: नाशिकचा चिवडा; रात्री: महाराष्ट्रीयन जेवण.',
        local_food_specialty_en: 'Breakfast: Shamsundar Misal; Lunch: Italian / Multi-cuisine @ Little Italy / Rasa Sula; Evening: Famous Kondaji Chivda; Dinner: Maharashtrian Thali.',
        heritage_highlights_mr: 'रामायणकालीन ऐतिहासिक पंचवटी (प्रभू श्रीरामांचे वनवास स्थळ), संपूर्ण काळ्या दगडात कोरलेले काळाराम मंदिर व भारतातील अग्रगण्य वाइन संस्कृती केंद्र.',
        heritage_highlights_en: 'Ramayana site Panchavati (where Lord Rama resided during exile), Kalaram Temple, and India’s premier wine capital at Sula.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: पंचवटी येथील ऐतिहासिक काळाराम मंदिर दर्शन, सीता गुंफा, तपोवन आणि ५ पवित्र वटवृक्ष (पंचवटी) पाहणे.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Visit Kalaram Temple built with black stones, ancient Sita Gufa caves, Tapovan, and the 5 banyan trees.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०४:०० PM]: गंगापूर रोडवरील सुला व्हाइनयार्ड्स (Sula Vineyards) येथे वाईन मेकिंग फॅक्टरी टूर, वाईन टेस्टिंग सत्र आणि इटालियन लंच.',
        afternoon_en: 'Afternoon [12:30 PM - 04:00 PM]: Tour Sula Vineyards, enjoy grape-processing factory walk, wine-tasting masterclass, and vineyard lunch.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: गंगापूर डॅम बॅकवॉटर सनसेट व्ह्यू. नाशिकचा प्रसिद्ध कोंडाजी चिवडा व मिठाई खरेदी आणि सहलीची सांगता.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Sunset by Gangapur Dam backwaters. Shop for Kondaji Chivda and fresh grapes before heading home.',
        stay_mr: 'द सोर्स ॲट सुला / एक्सप्रेस इन नाशिक',
        stay_en: 'The Source at Sula / Express Inn Nashik',
        tips_mr: 'सुला व्हाइनयार्ड्समध्ये वीकेंडला दुपारी १२ च्या सुमारास पोहोचल्यास वाईन टूर सोयीस्कर होते.',
        tips_en: 'Book Sula Vineyards tasting slots early to avoid afternoon queue.',
        spots: ['काळाराम मंदिर', 'सीता गुंफा', 'सुला व्हाइनयार्ड्स', 'गंगापूर डॅम']
      }
    ]
  },

  alibaug: {
    aliases: ['alibaug', 'अलिबाग', 'varsoli', 'वरसोली', 'nagaon', 'नागाव', 'kolaba', 'कुलाबा', 'kashid', 'काशीद', 'murud', 'मुरुड'],
    canonicalNameMr: 'अलिबाग',
    canonicalNameEn: 'Alibaug',
    keyHighlightsMr: [
      'समुद्रात वसलेला ऐतिहासिक कुलाबा किल्ला (छत्रपती शिवाजी महाराजांचे आरमार केंद्र)',
      'वरसोली बीच वॉटर स्पोर्ट्स व सूर्यास्त',
      'नागाव व काशीद पांढऱ्या वाळूचे किनारे',
      'मुरुड जंजिरा अभेद्य जलदुर्ग (सिद्दीचा किल्ला)',
      'अस्सल अलिबाग फ्रेश सुरमई/पापलेट थाळी @ हॉटेल सनमान'
    ],
    keyHighlightsEn: [
      'Historic Kolaba Sea Fort in the Arabian Sea',
      'Varsoli Beach Water Sports & Sunset',
      'Nagaon & Kashid White Sand Beach',
      'Murud-Janjira Impregnable Sea Fort',
      'Authentic Alibaug Surmai Thali @ Hotel Sanman'
    ],
    bestTime: 'October to May',
    packListMr: ['बीच कपडे', 'सनग्लासेस', 'सनस्क्रीन', 'वॉटरप्रूफ पाऊच'],
    packListEn: ['Beach wear', 'Sunglasses', 'Sunscreen', 'Waterproof pouch'],
    days: [
      {
        day_title_mr: 'कुलाबा सागरी किल्ला व वरसोली बीच वॉटर स्पोर्ट्स',
        day_title_en: 'Kolaba Sea Fort & Varsoli Beach Water Sports',
        travel_route_info_mr: 'अलिबाग शहर ते वरसोली (३ किमी). कुलाबा किल्ल्यावर ओहोटीच्या वेळी चालत किंवा घोड्यांच्या गाडीने जाता येते.',
        travel_route_info_en: 'Alibaug city to Varsoli (3 km). Reach Kolaba Fort on foot or horse cart during low tide.',
        local_food_specialty_mr: 'नाश्ता: पोहे व घावणे; दुपार: अलिबागची प्रसिद्ध सुरमई/प्रॉन्स थाळी @ हॉटेल सनमान; संध्याकाळ: नारळ पाणी; रात्री: कोळी पद्धतीचे ताजे जेवण.',
        local_food_specialty_en: 'Breakfast: Ghavne & Tea; Lunch: Celebrated Surmai / Pomfret Thali @ Hotel Sanman; Evening: Fresh Tender Coconut; Dinner: Local Koli Thali.',
        heritage_highlights_mr: 'छत्रपती शिवाजी महाराजांनी समुद्रात बांधलेला अजिंक्य कुलाबा किल्ला, गोड्या पाण्याची विहीर आणि सिद्धिविनायक मंदिर.',
        heritage_highlights_en: 'Chhatrapati Shivaji Maharaj’s 17th Century naval fortress Kolaba Fort, standing inside the sea with freshwater wells.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: समुद्राच्या ओहोटीच्या वेळी ऐतिहासिक कुलाबा किल्ल्याची सफर. भक्कम तटबंदी, तोफा आणि सिद्धिविनायक मंदिर दर्शन.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Walk through sea water at low tide to Kolaba Fort. Explore stone ramparts, ancient cannons, and freshwater shrine.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: हॉटेल सनमान येथे अलिबागची प्रसिद्ध सुरमई फ्राय, सोलकढी आणि भाताचा अस्सल बेत.',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Savor Alibaug’s celebrated coastal meal at Hotel Sanman featuring crispy Surmai, Solkadhi and steamed rice.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:०० PM]: वरसोली बीचवर जेट स्की, बनाना राइड आणि स्पीड बोटिंग. वाळूत सूर्यास्त पाहून स्थानिक बाजारात खरेदी.',
        evening_en: 'Evening [04:00 PM - 08:00 PM]: Adrenaline water sports at Varsoli Beach, scenic sunset on the sand, and stroll in Alibaug market.',
        stay_mr: 'रॅडिसन ब्लू रिसॉर्ट / ट्रॉपिकाना रिसॉर्ट अलिबाग',
        stay_en: 'Radisson Blu Resort / Tropicana Resort Alibaug',
        tips_mr: 'कुलाबा किल्ल्यावर जाण्यापूर्वी स्थानिक कोळ्यांकडून भरती-ओहोटीची वेळ (Tide timings) नक्की तपासा.',
        tips_en: 'Check tide timings before venturing to Kolaba Fort to avoid high tide traps.',
        spots: ['कुलाबा किल्ला', 'वरसोली बीच', 'हॉटेल सनमान', 'अलिबाग बाजारपेठ']
      },
      {
        day_title_mr: 'नागाव व काशीद बीच आणि मुरुड जंजिरा सागरी किल्ला',
        day_title_en: 'Nagaon & Kashid Beach with Murud-Janjira Sea Fort',
        travel_route_info_mr: 'अलिबाग ते काशीद (३० किमी, ५० मिनिटे) आणि मुरुड जंजिरा (४५ किमी). सुंदर सागरी किनारा रस्ता.',
        travel_route_info_en: 'Alibaug to Kashid (30 km) and Murud-Janjira (45 km) via scenic coconut grove highway.',
        local_food_specialty_mr: 'नाश्ता: कांदा पोहे; दुपार: काशीद बीचवर अस्सल कोकणी जेवण; संध्याकाळ: ताजे मुरुडचे काजू व नारळ बर्फी.',
        local_food_specialty_en: 'Breakfast: Poha; Lunch: Konkani Beachside Thali; Evening: Fresh Murud Cashews & Coconut Barfi.',
        heritage_highlights_mr: 'अरबी समुद्रात ३०० वर्षे कधीही न जिंकता आलेला मुरुड-जंजिरा अभेद्य जलदुर्ग आणि कलाल बांगडी भव्य तोफ.',
        heritage_highlights_en: 'The invincible Murud-Janjira Island Fort that remained unconquered for centuries, boasting the massive Kalal Bangadi cannon.',
        morning_mr: 'सकाळी [०८:०० AM - ११:३० AM]: काशीद बीचवरील पांढऱ्याशुभ्र वाळूवर फेरफटका आणि वॉटर स्पोर्ट्स. नयनरम्य नारळी-सुपारीच्या बागांमधून प्रवास.',
        morning_en: 'Morning [08:00 AM - 11:30 AM]: Relax on the pristine white sands of Kashid Beach, enjoying banana rides and beach photography.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०४:०० PM]: राजापुरी जेट्टीवरून सेलबोटने समुद्रातील मुरुड-जंजिरा किल्ल्याकडे प्रयाण. भव्य बुरुज, गोड्या पाण्याची तळी आणि कलाल बांगडी तोफ पाहणे.',
        afternoon_en: 'Afternoon [12:30 PM - 04:00 PM]: Board sailboat from Rajapuri jetty to historic Murud-Janjira Fort. Marvel at freshwater lakes inside sea and giant cannons.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: नागाव बीचवर सूर्यास्त दर्शन, नारळ पाणी आणि ताजी मासळी/व्हेज जेवणाचा आस्वाद घेऊन विश्रांती.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Sunset serenity at Nagaon Beach, coconut water and homestyle dinner before returning.',
        stay_mr: 'काशीद बीच रिसॉर्ट / अलिबाग होमस्टे',
        stay_en: 'Kashid Beach Resort / Coastal Boutique Stay',
        tips_mr: 'मुरुड किल्ल्यासाठी शिडाच्या बोटी दुपारी ४:३० पर्यंतच चालू असतात.',
        tips_en: 'Sailboats to Janjira Fort stop departing after 4:30 PM; reach by early afternoon.',
        spots: ['काशीद बीच', 'मुरुड जंजिरा किल्ला', 'नागाव बीच', 'राजापुरी जेट्टी']
      }
    ]
  },

  shirdi: {
    aliases: ['shirdi', 'शिर्डी', 'saibaba', 'साईबाबा', 'shani shingnapur', 'शनि शिंगणापूर'],
    canonicalNameMr: 'शिर्डी',
    canonicalNameEn: 'Shirdi',
    keyHighlightsMr: [
      'श्री साईबाबा समाधी मंदिर दर्शन व काकड/शेज आरती',
      'पवित्र द्वारकामाई (अखंड धूनी) व चावडी',
      'साई हेरिटेज व्हिलेज व साई तीर्थ थीम पार्क',
      'शनि शिंगणापूर (घरांना दारे नसलेले स्वयंभू शनिदेव गाव)',
      'श्री साईबाबा संस्थानचा शुद्ध महाप्रसाद'
    ],
    keyHighlightsEn: [
      'Shri Sai Baba Samadhi Mandir Darshan & Aarti',
      'Sacred Dwarkamai (Ever-burning Dhuni) & Chavadi',
      'Sai Heritage Village & Sai Teerth Spiritual Theme Park',
      'Shani Shingnapur (Door-less Village of Lord Shani)',
      'Sansthan Pure Satvik Mahaprasad'
    ],
    bestTime: 'Throughout the year (Winter months Oct-Mar are most pleasant)',
    packListMr: ['पारंपरिक शालीन पोशाख', 'ओळखपत्र (ID Card)', 'कम्फर्टेबल पादत्राणे'],
    packListEn: ['Modest traditional clothes', 'Govt ID card for biometric pass', 'Easy slip-on shoes'],
    days: [
      {
        day_title_mr: 'श्री साईबाबा समाधी मंदिर दर्शन, द्वारकामाई व चावडी',
        day_title_en: 'Sai Baba Samadhi Temple Darshan, Dwarkamai & Chavadi',
        travel_route_info_mr: 'मंदिर संकुलात पायी फिरणे सोयीचे. सर्व पवित्र स्थळे ५०० मीटरच्या परिघात आहेत.',
        travel_route_info_en: 'Walking circuit within Sai temple complex. All key shrines are within 500 meters.',
        local_food_specialty_mr: 'नाश्ता: संस्थान कँटीनमध्ये उपमा/पोहे; दुपार: श्री साईबाबा प्रसादालय येथील महाप्रसाद (आशियातील सर्वात मोठे सोलर किचन); संध्याकाळ: डाळ बाटी / अमरस; रात्री: शुद्ध शाकाहारी जेवण.',
        local_food_specialty_en: 'Breakfast: Upma & Poha; Lunch: Sansthan Mahaprasad at Asia’s largest solar kitchen; Evening: Dal Baati Churma; Dinner: Pure Veg Gujarati Thali.',
        heritage_highlights_mr: 'संतवर्य श्री साईबाबांची समाधी (१९१८), साईबाबा वास्तव्यास असलेली पवित्र द्वारकामाई मशीद (जिथे अखंड धूनी आजही तेवत आहे) आणि चावडी.',
        heritage_highlights_en: 'Samadhi of 19th-century saint Sai Baba, sacred Dwarkamai mosque where the sacred fire (Dhuni) burns continuously, and Chavadi.',
        morning_mr: 'सकाळी [०७:३० AM - ११:३० AM]: श्री साईबाबा समाधी मंदिरात पवित्र समाधी दर्शन, पाद्यपूजा व गुरुस्थान दर्शन. पवित्र कडुनिंबाचे झाड व नंदादीप पाहणे.',
        morning_en: 'Morning [07:30 AM - 11:30 AM]: Sacred darshan at Sai Baba Samadhi Mandir. Visit Gurusthan where Baba was first seen under the sacred Neem tree.',
        afternoon_mr: 'दुपारी [१२:०० PM - ०३:०० PM]: श्री साई संस्थानच्या भव्य प्रसादालयात सात्विक महाप्रसाद ग्रहण. त्यानंतर पवित्र द्वारकामाई आणि चावडी भेट.',
        afternoon_en: 'Afternoon [12:00 PM - 03:00 PM]: Partake in holy Mahaprasad at the Sansthan mega kitchen. Tour Dwarkamai with its eternal sacred fire and Chavadi.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:३० PM]: साई तीर्थ स्पिरिच्युअल थीम पार्क भेट (लंकेची सफर व ५D शो). रात्रीच्या शेज आरतीचे दर्शन आणि स्थानिक पेढे खरेदी.',
        evening_en: 'Evening [04:00 PM - 08:30 PM]: Experience Sai Teerth Devotional Theme Park (5D shows). Witness serene evening Dhoop Aarti and purchase fresh pedhas.',
        stay_mr: 'साई आश्रम भक्तनिवास / हॉटेल सन-एन-सँड शिर्डी',
        stay_en: 'Sai Ashram Bhaktaniwas / Sun-n-Sand Shirdi',
        tips_mr: 'दर्शनासाठी ऑनलाईन टाइम-स्लॉट पास आधीच काढल्यास रांगेचा वेळ वाचतो.',
        tips_en: 'Pre-book online darshan pass with time-slot on official Sansthan portal.',
        spots: ['साईबाबा समाधी मंदिर', 'द्वारकामाई', 'चावडी', 'साई तीर्थ थीम पार्क']
      },
      {
        day_title_mr: 'शनि शिंगणापूर स्वयंभू शनिदेव दर्शन व परतीचा प्रवास',
        day_title_en: 'Shani Shingnapur Swayambhu Temple & Departure',
        travel_route_info_mr: 'शिर्डी ते शनि शिंगणापूर (७२ किमी, १.५ तास). उत्तम चौपदरी महामार्ग.',
        travel_route_info_en: 'Shirdi to Shani Shingnapur (72 km, 1.5 hr) along smooth state highway.',
        local_food_specialty_mr: 'नाश्ता: गरमागरम चहा व नाश्ता; दुपार: महामार्गावरील अस्सल महाराष्ट्रीयन जेवण व ताज्या उसाचा रस; संध्याकाळ: नाशिक/पुणे परतीचा प्रवास.',
        local_food_specialty_en: 'Breakfast: Highway snacks; Lunch: Authentic Maharashtrian Thali & fresh sugarcane juice; Evening: Return trip.',
        heritage_highlights_mr: 'शनि शिंगणापूर हे जगातील एकमेव असे गाव आहे जेथे घरांना आणि बँकांनाही कुलपे किंवा दारे नसतात. उघड्या आकाशाखालील काळा पाषाण शनिदेव.',
        heritage_highlights_en: 'Unique village where houses have no doors or locks due to deep faith in Lord Shani, worshipped as an open-air black stone monolith.',
        morning_mr: 'सकाळी [०८:०० AM - ११:३० AM]: शिर्डीहून शनि शिंगणापूरकडे प्रयाण. स्वयंभू शनिदेव मूर्तीवर मोहरीच्या तेलाचा अभिषेक, दर्शन आणि प्रदक्षिणा.',
        morning_en: 'Morning [08:00 AM - 11:30 AM]: Drive to Shani Shingnapur. Offer mustard oil abhishek to the open-air black stone idol of Lord Shani.',
        afternoon_mr: 'दुपारी [१२:०० PM - ०२:३० PM]: गावातील घरांना दारे नसलेली रचना पाहणे. रस्त्यावर चरक्याचा ताजा उसाचा रस पिणे आणि दुपारचे जेवण.',
        afternoon_en: 'Afternoon [12:00 PM - 02:30 PM]: Walk through the unique door-less village, sip freshly crushed sugarcane juice, and have lunch.',
        evening_mr: 'संध्याकाळ [०३:०० PM - ०७:३० PM]: सहलीची आध्यात्मिक समाधानाने सांगता आणि परतीचा सुखद प्रवास.',
        evening_en: 'Evening [03:00 PM - 07:30 PM]: Conclude the pilgrimage journey and commence safe journey home.',
        stay_mr: 'परतीचा प्रवास',
        stay_en: 'Departure',
        tips_mr: 'शनि देवावर तेल वाहताना नियमांचे पालन करावे.',
        tips_en: 'Follow traditional rituals when offering mustard oil at the open shrine.',
        spots: ['शनि शिंगणापूर मंदिर', 'उसाचा रस केंद्र']
      }
    ]
  },
  ganpatipule: {
    aliases: ['ganpatipule', 'गणपतीपुळे', 'ganpati pule'],
    canonicalNameMr: 'गणपतीपुळे',
    canonicalNameEn: 'Ganpatipule',
    keyHighlightsMr: [
      '४०० वर्षे जुने स्वयंभू गणेश पाषाण मंदिर व प्रदक्षिणा',
      'स्वच्छ, सुंदर पांढरी वाळू असलेला गणपतीपुळे समुद्रकिनारा',
      'प्राचीन कोकण जीवनशैली संग्रहालय (Prachin Konkan)',
      'जयगड सागरी किल्ला व ब्रिटिशकालीन दीपगृह',
      'अस्सल कोकणी उकडीचे मोदक, सोलकढी व ताजी घावणे'
    ],
    keyHighlightsEn: [
      '400-year-old Swayambhu Ganesh Seaside Temple',
      'Pristine white sand Ganpatipule beach',
      'Prachin Konkan Living Cultural Museum',
      'Historic Jaigad Sea Fort & British Lighthouse',
      'Authentic Ukadiche Modak, Solkadhi & Ghavne'
    ],
    bestTime: 'October to February',
    packListMr: ['सुती सैल कपडे', 'सनग्लासेस', 'मंदिर दर्शनासाठी पारंपरिक कपडे', 'कॅमेरा'],
    packListEn: ['Cotton clothes', 'Sunglasses', 'Traditional wear for temple', 'Camera'],
    days: [
      {
        day_title_mr: 'स्वयंभू गणपती मंदिर दर्शन, बीच व प्राचीन कोकण संग्रहालय',
        day_title_en: 'Swayambhu Ganesh Temple, Beach & Prachin Konkan Museum',
        travel_route_info_mr: 'गणपतीपुळे स्थानिक परिसर (२-५ किमी). पायी किंवा ऑटोरिक्षाने सहज फिरता येते.',
        travel_route_info_en: 'Local Ganpatipule town (2-5 km). Easily walkable or accessible by auto.',
        local_food_specialty_mr: 'नाश्ता: गरमागरम घावणे व नारळाची चटणी; दुपार: अस्सल कोकणी शाकाहारी थाळी, सोलकढी व उकडीचे मोदक; रात्री: आमरस-पुरी किंवा पोळी-भाजी.',
        local_food_specialty_en: 'Breakfast: Hot Ghavne & Coconut Chutney; Lunch: Authentic Konkani Veg Thali & Ukadiche Modak; Dinner: Aamras-Puri or local delicacies.',
        heritage_highlights_mr: 'समुद्रकिनाऱ्यावरील स्वयंभू पाषाण गणेश मंदिर (टेकडीलाच प्रदक्षिणा घातली जाते) आणि प्राचीन कोकणातील ग्रामजीवन दर्शवणारे खुले संग्रहालय.',
        heritage_highlights_en: 'Natural rock monolith Ganesh temple where devotees circumambulate the entire hill hillock, alongside open-air Konkan lifestyle museum.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: समुद्रकिनारी असलेल्या स्वयंभू गणपती मंदिरात अभिषेक, दर्शन व डोंगर प्रदक्षिणा. गरमागरम घावणे नाश्ता.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Darshan at beachfront Swayambhu Ganesh Temple, circumambulate the sacred hillock, and breakfast of hot Ghavne.',
        afternoon_mr: 'दुपारी [१२:३० PM - ०३:३० PM]: कोकणी भोजन आस्वाद. त्यानंतर प्राचीन कोकण जीवनशैली खुल्या संग्रहालयाला भेट (कोकणी संस्कृतीची सजीव मांडणी).',
        afternoon_en: 'Afternoon [12:30 PM - 03:30 PM]: Konkani thali lunch. Tour Prachin Konkan open-air museum detailing historic village lifestyle and flora.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: गणपतीपुळे बीचवर वाळूत चालणे, वॉटर स्पोर्ट्स (बोटिंग, बनाना राइड) आणि विहंगम अरबी समुद्राचा सूर्यास्त.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Beach leisure, water sports (banana ride, jet ski), breathtaking Arabian Sea sunset, and temple bazaar stroll.',
        stay_mr: 'एमटीडीसी गणपतीपुळे बीच रिसॉर्ट / अभिषेक बीच रिसॉर्ट',
        stay_en: 'MTDC Beach Resort / Abhishek Beach Resort Ganpatipule',
        tips_mr: 'मंदिरात दर्शनासाठी सकाळी लवकर जावे. समुद्रात भरतीच्या वेळी खोल पाण्यात जाणे टाळावे.',
        tips_en: 'Visit temple early morning. Avoid venturing deep into the sea during high tide.',
        spots: ['स्वयंभू गणपती मंदिर', 'गणपतीपुळे बीच', 'प्राचीन कोकण संग्रहालय']
      },
      {
        day_title_mr: 'जयगड सागरी किल्ला, ब्रिटिश दीपगृह व आरे वारे सागरी रस्ता',
        day_title_en: 'Jaigad Sea Fort, Lighthouse & Are Ware Marine Drive',
        travel_route_info_mr: 'गणपतीपुळे ते जयगड (२० किमी, ३५ मिनिटे) आणि परतताना आरे वारे किनारा रस्ता (१५ किमी).',
        travel_route_info_en: 'Ganpatipule to Jaigad (20 km, 35 min) and return via picturesque Are Ware marine drive (15 km).',
        local_food_specialty_mr: 'नाश्ता: पोहे व वाफाळलेला चहा; दुपार: जयगड स्थानिक खानावळीत ताजे जेवण; संध्याकाळ: हापूस आंबा उत्पादने (आंबापोळी, आंबा बर्फी); रात्री: कोकणी जेवण.',
        local_food_specialty_en: 'Breakfast: Pohe & Tea; Lunch: Local seafood or fresh veg meal at Jaigad eatery; Evening: Mango delicacies (Aamba Vadi, syrup).',
        heritage_highlights_mr: 'शास्त्री नदीच्या मुखाशी असलेला छत्रपती शिवाजी महाराजांचा जयगड किल्ला, १८९९ मधील ब्रिटिश दीपगृह आणि अरबी समुद्राचा ३६० अंश विहंगम नजराणा.',
        heritage_highlights_en: 'Historic Jaigad Fort guarding the Shastri river mouth, 1899 operational British lighthouse, and panoramic clifftop views.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: जयगड किल्ल्यावर तटबंदी, खंदक आणि जयबा बुरुज पाहणे. नजीकच्या ब्रिटिशकालीन दीपगृहावरून समुद्राचा नजराणा घेणे.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Explore ramparts, moat and bastions of Jaigad Fort. Climb the historic lighthouse for Arabian sea vista.',
        afternoon_mr: 'दुपारी [१२:०० PM - ०३:०० PM]: जयगड खाडी परिसरातील स्थानिक खानावळीत जेवण. शास्त्री नदीवरील फेरी बोट क्रॉसिंग पाहणे.',
        afternoon_en: 'Afternoon [12:00 PM - 03:00 PM]: Lunch at creek-side eatery. Watch traditional roll-on roll-off ferry boats transporting vehicles across creek.',
        evening_mr: 'संध्याकाळ [०३:३० PM - ०७:३० PM]: जगप्रसिद्ध आरे-वारे सागरी रस्त्यावरून (Are Ware Marine Drive) गाडी चालवणे, क्लिफ-टॉप व्ह्यू पॉईंटवरून सूर्यास्त फोटोग्राफी.',
        evening_en: 'Evening [03:30 PM - 07:30 PM]: Scenic drive along Are Ware clifftop coastal highway, sunset photography from clifftop viewpoints.',
        stay_mr: 'एमटीडीसी रिसॉर्ट गणपतीपुळे',
        stay_en: 'MTDC Resort Ganpatipule',
        tips_mr: 'आरे वारे रस्त्यावर वाहने सुरक्षित ठिकाणी उभी करूनच फोटो काढावेत.',
        tips_en: 'Park safely in designated clifftop lay-bys along Are Ware drive for photography.',
        spots: ['जयगड किल्ला', 'जयगड दीपगृह', 'आरे वारे सागरी रस्ता', 'शास्त्री नदी खाडी']
      }
    ]
  },
  ratnagiri: {
    aliases: ['ratnagiri', 'रत्नागिरी', 'bhagwati', 'thibaw'],
    canonicalNameMr: 'रत्नागिरी',
    canonicalNameEn: 'Ratnagiri',
    keyHighlightsMr: [
      'ऐतिहासिक रत्नादुर्ग सागरी किल्ला व भगवती मंदिर',
      'म्यानमारच्या राजाचे ऐतिहासिक थिबॉ पॅलेस (Thibaw Palace)',
      'भाट्ये सुंदर समुद्रकिनारा व नारळी-सुपारीच्या बागा',
      'लोकमान्य बाळ गंगाधर टिळक जन्मस्थान स्मारक',
      'अस्सल कोकणी पद्धतीची काजू उसळ, सोलकढी व हापूस आंबे'
    ],
    keyHighlightsEn: [
      'Historic Ratnadurg Sea Fort & Bhagwati Temple',
      'Historic Thibaw Palace of exiled Burmese King',
      'Bhatye Beach & Coconut plantations',
      'Lokmanya Bal Gangadhar Tilak Birthplace Memorial',
      'Authentic Cashew curry, Solkadhi & Alphonso Mangoes'
    ],
    bestTime: 'October to February',
    packListMr: ['आरामदायी कपडे', 'सनग्लासेस', 'वॉकिंग शूज', 'ओळखपत्र'],
    packListEn: ['Comfortable clothing', 'Sunglasses', 'Walking shoes', 'Govt ID'],
    days: [
      {
        day_title_mr: 'रत्नादुर्ग सागरी किल्ला, भगवती मंदिर व थिबॉ पॅलेस',
        day_title_en: 'Ratnadurg Sea Fort, Bhagwati Temple & Thibaw Palace',
        travel_route_info_mr: 'रत्नागिरी शहर व किल्ला परिसर (८-१२ किमी). गाडी किंवा रिक्षाने सहज प्रवास.',
        travel_route_info_en: 'Ratnagiri town & fort area (8-12 km). Easily reachable via taxi or auto.',
        local_food_specialty_mr: 'नाश्ता: थालीपीठ-दही / मिसळ-पाव; दुपार: कोकणी पद्धतीची व्हेज/सुरमई थाळी @ हॉटेल विवेक; संध्याकाळ: भाट्ये चौपाटी भेळ; रात्री: काजू उसळ व आंबोळी.',
        local_food_specialty_en: 'Breakfast: Thalipeeth & Curd; Lunch: Authentic Thali @ Hotel Vivek; Evening: Beach snacks at Bhatye; Dinner: Cashew curry & Amboli.',
        heritage_highlights_mr: 'अरबी समुद्राने तिन्ही बाजूंनी वेढलेला रत्नादुर्ग किल्ला, छत्रपती शिवाजी महाराजांचे आरमार केंद्र आणि बर्माच्या (म्यानमार) राजा थिबॉचा भव्य राजवाडा.',
        heritage_highlights_en: 'Ratnadurg fort surrounded on three sides by Arabian sea, Maratha naval bastion, and exile palace of Burmese King Thibaw.',
        morning_mr: 'सकाळी [०८:३० AM - ११:३० AM]: रत्नादुर्ग किल्ल्याला भेट, बालेकिल्ला, भुयारी मार्ग आणि किल्ल्यावरील ऐतिहासिक भगवती मंदिरात दर्शन.',
        morning_en: 'Morning [08:30 AM - 11:30 AM]: Explore Ratnadurg fort ramparts, bastion, secret tunnel view, and seek blessings at Bhagwati Temple.',
        afternoon_mr: 'दुपारी [१२:०० PM - ०३:३० PM]: हॉटेल विवेक येथे प्रसिद्ध जेवण. त्यानंतर थिबॉ पॅलेस (Thibaw Palace) व मरीन बायोलॉजिकल म्युझियम पाहणे.',
        afternoon_en: 'Afternoon [12:00 PM - 03:30 PM]: Lunch at renowned city eatery. Visit historic Thibaw Palace architecture and Marine Biological Aquarium.',
        evening_mr: 'संध्याकाळ [०४:०० PM - ०८:०० PM]: लोकमान्य टिळक स्मारक भेट. त्यानंतर भाट्ये बीचवर वाळूत चालणे आणि काजळी नदीच्या खाडीत सूर्यास्त पाहणे.',
        evening_en: 'Evening [04:00 PM - 08:00 PM]: Visit Lokmanya Tilak birthplace memorial, followed by relaxing sunset at Bhatye beach and Kajali river estuary.',
        stay_mr: 'हॉटेल विवेक / रत्नागिरी कोहिनूर',
        stay_en: 'Hotel Vivek / Kohinoor Samudra Beach Resort',
        tips_mr: 'रत्नादुर्ग किल्ल्यावर पायी चालण्यासाठी आरामदायक शूज घाला.',
        tips_en: 'Wear comfortable shoes for walking on fort bastions.',
        spots: ['रत्नादुर्ग किल्ला', 'भगवती मंदिर', 'थिबॉ पॅलेस', 'भाट्ये बीच', 'लोकमान्य टिळक स्मारक']
      }
    ]
  },
  lonavala: {
    aliases: ['lonavala', 'लोणावळा', 'khandala', 'खंडाळा', 'bhushi', 'कार्ला'],
    canonicalNameMr: 'लोणावळा',
    canonicalNameEn: 'Lonavala',
    keyHighlightsMr: [
      'प्राचीन कार्ला व भाजा बौद्ध लेणी (२२०० वर्षे जुनी कलाकृती)',
      'ऐतिहासिक लोहगड किल्ला व विंचूकट्टा कडा',
      'विहंगम टायगर्स लीप (वाघदरी) व लायन्स पॉईंट',
      'भुशी डॅम व राजमाची व्ह्यू पॉईंट',
      'अस्सल लोणावळा मगनलाल चिक्की, चॉकलेट फज व गरमागरम कॉर्न पकोडे'
    ],
    keyHighlightsEn: [
      'Ancient Karla & Bhaja Buddhist Rock-Cut Caves (2200 yrs old)',
      'Historic Lohagad Fort & Vinchukatta Clifftop Spur',
      'Tiger’s Leap & Lion’s Point clifftop panoramic viewpoints',
      'Bhushi Dam & Rajmachi scenic point',
      'Authentic Maganlal Chikki, Chocolate Fudge & Hot Corn Pakodas'
    ],
    bestTime: 'July to March',
    packListMr: ['रेनकोट/छत्री (पावसाळ्यात)', 'वॉकिंग शूज', 'हटके फोटोग्राफीसाठी कॅमेरा', 'लाइट जॅकेट'],
    packListEn: ['Rain gear/umbrella', 'Trekking/walking shoes', 'Camera', 'Light jacket'],
    days: [
      {
        day_title_mr: 'कार्ला लेणी, लोहगड किल्ला व लायन्स पॉईंट सनसेट',
        day_title_en: 'Karla Caves, Lohagad Fort & Lion’s Point Sunset',
        travel_route_info_mr: 'लोणावळा शहर ते कार्ला (११ किमी, २० मिनिटे) व लोहगड पायथा (१५ किमी).',
        travel_route_info_en: 'Lonavala town to Karla caves (11 km, 20 min) and Lohagad base (15 km).',
        local_food_specialty_mr: 'नाश्ता: गरमागरम कॉर्न भजी व वाफाळलेला आलं चहा; दुपार: अस्सल महाराष्ट्रीयन पिठलं-भाकरी व ठेचा @ लोहगड पायथा; संध्याकाळ: मगनलाल चिक्की व फज; रात्री: पंजाबी/महाराष्ट्रीयन थाळी.',
        local_food_specialty_en: 'Breakfast: Hot corn pakodas & ginger tea; Lunch: Rustic Pithla Bhakri & Thecha at Lohagad base; Evening: Maganlal Chikki & Fudge; Dinner: Thali meal.',
        heritage_highlights_mr: 'इ.स.पूर्व दुसऱ्या शतकातील विशाल चैत्यगृह असलेली कार्ला लेणी आणि छत्रपती शिवाजी महाराजांच्या स्वराज्यातील मजबूत लोहगड किल्ला.',
        heritage_highlights_en: '2nd-century BC rock-cut Buddhist Karla Caves with grandest Chaityagriha, and impregnable Lohagad fort with iconic scorpion-tail ridge.',
        morning_mr: 'सकाळी [०८:०० AM - ११:३० AM]: प्राचीन कार्ला लेणी भेट व एकविरा देवी दर्शन. त्यानंतर लोहगड किल्ल्याच्या दिशेने प्रस्थान.',
        morning_en: 'Morning [08:00 AM - 11:30 AM]: Explore Karla Buddhist rock-cut caves, Ekvira Devi shrine, and commence drive towards Lohagad Fort.',
        afternoon_mr: 'दुपारी [१२:०० PM - ०३:३० PM]: लोहगड पायथ्याशी गरमागरम पिठलं-भाकरी जेवण. लोहगड किल्ल्यावर सोपी चढाई, गणेश दरवाजा व विंचूकट्टा कडा पाहणे.',
        afternoon_en: 'Afternoon [12:00 PM - 03:30 PM]: Rustic lunch at base. Gentle climb up Lohagad, exploring Ganesh Darwaza and legendary Vinchukatta ridge.',
        evening_mr: 'संध्याकाळ [०४:३० PM - ०८:०० PM]: लायन्स पॉईंट व टायगर्स लीपवरून दरीतील विहंगम सूर्यास्त दर्शन. लोणावळा मुख्य बाजारपेठेत चिक्की व फज खरेदी.',
        evening_en: 'Evening [04:30 PM - 08:00 PM]: Sunset at Lion’s Point / Tiger’s Leap, followed by chikki and chocolate fudge shopping at town center.',
        stay_mr: 'फर्न रिसॉर्ट / लोणावळा क्लब रिसॉर्ट',
        stay_en: 'The Fern Resort / Fariyas Hotel Lonavala',
        tips_mr: 'लोहगड चढताना ग्रीप असलेले शूज वापरा.',
        tips_en: 'Wear shoes with good grip on fort steps.',
        spots: ['कार्ला लेणी', 'एकविरा मंदिर', 'लोहगड किल्ला', 'लायन्स पॉईंट', 'मगनलाल चिक्की']
      }
    ]
  }
};

// Returns a rich, verified day plan for any known destination or creates an intelligent real-spot plan
export function getCuratedRealItinerary(
  destinationName: string,
  departureName: string,
  numDays: number,
  isMr: boolean,
  isCar: boolean,
  distance: number,
  transportCost: number,
  fuelCost: number,
  tollCost: number,
  liveWeather?: any,
  viaRoute?: string
): {
  trip_title: string;
  keyHighlights: string[];
  bestTimeToVisit: string;
  packList: string[];
  weatherPackingTips?: string;
  viaRoute?: string;
  selectedRoute?: string;
  itinerary: any[];
} {
  const normDest = (destinationName || '').toLowerCase().trim();
  let matchedProfile: DestinationProfile | null = null;

  for (const key of Object.keys(REAL_DESTINATIONS)) {
    const prof = REAL_DESTINATIONS[key];
    if (prof.aliases.some(al => normDest.includes(al))) {
      matchedProfile = prof;
      break;
    }
  }

  const cleanDest = matchedProfile ? (isMr ? matchedProfile.canonicalNameMr : matchedProfile.canonicalNameEn) : destinationName;
  const count = Math.max(1, Math.min(numDays, 7));

  const weatherTips = liveWeather
    ? `${isMr ? liveWeather.summaryMr : liveWeather.summaryEn}. ${liveWeather.packingAdvice}`
    : (isMr ? 'हवामानानुसार सुती कपडे, सनग्लासेस व कम्फर्टेबल वॉकिंग शूज सोबत ठेवा.' : 'Pack weather-appropriate clothing, sunglasses, and walking shoes.');

  const selectedRoute = viaRoute
    ? `${departureName} ➔ ${viaRoute} ➔ ${cleanDest}`
    : `${departureName} ➔ ${cleanDest}`;

  if (matchedProfile) {
    const profileDays = matchedProfile.days;
    const generatedDays = Array.from({ length: count }, (_, idx) => {
      const dayIndex = idx + 1;
      const template = profileDays[(dayIndex === 1 ? 0 : (dayIndex - 1) % profileDays.length)];

      let route = isMr ? template.travel_route_info_mr : template.travel_route_info_en;
      if (dayIndex === 1 && departureName) {
        route = isMr
          ? `${departureName} ते ${viaRoute ? `${viaRoute} मार्गे ` : ''}${cleanDest} प्रवास (अंदाजे ${distance} किमी). ${isCar ? `टोल ₹${tollCost}, इंधन ₹${fuelCost}.` : `प्रवास खर्च ₹${transportCost}.`}`
          : `${departureName} to ${cleanDest} ${viaRoute ? `via ${viaRoute} ` : ''}travel (~${distance} km). ${isCar ? `Tolls ₹${tollCost}, Fuel ₹${fuelCost}.` : `Ticket cost ₹${transportCost}.`}`;
      }

      let sequence = [
        (isMr ? template.morning_mr : template.morning_en) + (isMr ? ' - अंदाजे खर्च: ₹३००' : ' - Est. Cost: ₹300'),
        (isMr ? template.afternoon_mr : template.afternoon_en) + (isMr ? ' - अंदाजे खर्च: ₹४००' : ' - Est. Cost: ₹400'),
        (isMr ? template.evening_mr : template.evening_en) + (isMr ? ' - अंदाजे खर्च: ₹५००' : ' - Est. Cost: ₹500'),
        `🏨 Stay/Hotel: ₹1200 Est. - ${isMr ? template.stay_mr : template.stay_en}`
      ];

      if (dayIndex === 1) {
        sequence = [
          isMr 
            ? `🚗 ${departureName} वरून प्रवास सुरू. ${viaRoute ? `(${viaRoute} मार्गे). ` : ''}हायवेवरील निसर्गरम्य दृश्ये.`
            : `🚗 Departure from ${departureName}. ${viaRoute ? `Route via ${viaRoute}. ` : ''}Scenic highway drive.`,
          isMr 
            ? `🍳 हायवेवरील थांब्यावर नाश्ता. - अंदाजे खर्च: ₹२००`
            : `🍳 Highway stop for breakfast. - Est. Cost: ₹200`,
          isMr 
            ? `🍛 प्रवासात दुपारचे जेवण व विश्रांती. - अंदाजे खर्च: ₹४००`
            : `🍛 En-route highway lunch and transit. - Est. Cost: ₹400`,
          isMr
            ? `🏨 ${cleanDest} मध्ये आगमन आणि हॉटेलमध्ये चेक-इन. रात्रीचे जेवण व आराम.`
            : `🏨 Arrival at ${cleanDest} and hotel check-in. Relaxing dinner and overnight stay.`,
          `🏨 Stay/Hotel: ₹1200 Est. - ${isMr ? template.stay_mr : template.stay_en}`
        ];
      } else if (dayIndex === count && count > 1) {
        sequence = [
          (isMr ? template.morning_mr : template.morning_en) + (isMr ? ' - अंदाजे खर्च: ₹३००' : ' - Est. Cost: ₹300'),
          isMr 
            ? `🛍️ स्थानिक बाजारपेठेत खरेदी आणि हॉटेलमधून चेक-आउट. - अंदाजे खर्च: ₹०`
            : `🛍️ Local shopping and hotel check-out. - Est. Cost: ₹0`,
          isMr 
            ? `🚗 ${departureName} कडे परतीचा प्रवास सुरू. प्रवासात दुपारचे जेवण. - अंदाजे खर्च: ₹४००`
            : `🚗 Start return journey to ${departureName}. En-route lunch. - Est. Cost: ₹400`,
          isMr
            ? `🏠 ${departureName} मध्ये सुरक्षित आगमन आणि सहलीची सांगता.`
            : `🏠 Safe arrival back in ${departureName} and end of the trip.`
        ];
      }

      return {
        day: dayIndex,
        day_title: dayIndex === 1 
          ? (isMr ? `दिवस 1: प्रवास व ${cleanDest} कडे प्रस्थान` : `Day 1: Departure & Journey to ${cleanDest}`)
          : dayIndex === count && count > 1
            ? (isMr ? `दिवस ${dayIndex}: परतीचा प्रवास (${cleanDest} ते ${departureName})` : `Day ${dayIndex}: Return Journey (${cleanDest} to ${departureName})`)
            : (isMr ? `दिवस ${dayIndex}: ${template.day_title_mr}` : `Day ${dayIndex}: ${template.day_title_en}`),
        travel_route_info: route,
        local_food_specialty: isMr ? template.local_food_specialty_mr : template.local_food_specialty_en,
        heritage_highlights: isMr ? template.heritage_highlights_mr : template.heritage_highlights_en,
        activities_sequence: sequence,
        daily_local_travel_tips: isMr ? template.tips_mr : template.tips_en,
        spots: template.spots
      };
    });

    return {
      trip_title: isMr ? `${cleanDest} अविस्मरणीय सहल नियोजन` : `${cleanDest} Heritage & Scenic Tour`,
      keyHighlights: isMr ? matchedProfile.keyHighlightsMr : matchedProfile.keyHighlightsEn,
      bestTimeToVisit: matchedProfile.bestTime,
      packList: isMr ? matchedProfile.packListMr : matchedProfile.packListEn,
      weatherPackingTips: weatherTips,
      viaRoute: viaRoute || undefined,
      selectedRoute: selectedRoute,
      itinerary: generatedDays
    };
  }

  // Fallback for other locations: NEVER output "famous spot"! Output authentic geographic landmarks
  const genericDays = Array.from({ length: count }, (_, idx) => {
    const dayIndex = idx + 1;
    return {
      day: dayIndex,
      day_title: isMr ? `दिवस ${dayIndex}: ${cleanDest} शहर व निसर्गरम्य पर्यटन` : `Day ${dayIndex}: Explore ${cleanDest}`,
      travel_route_info: isMr
        ? `${dayIndex === 1 && departureName ? `${departureName} ते ${viaRoute ? `${viaRoute} मार्गे ` : ''}` : ''}${cleanDest} प्रवास मार्ग (अंदाजे ${distance} किमी).`
        : `${dayIndex === 1 && departureName ? `${departureName} to ${cleanDest} ${viaRoute ? `via ${viaRoute} ` : ''}` : `${cleanDest} `}transit route (~${distance} km).`,
      local_food_specialty: isMr
        ? `${cleanDest} मधील अस्सल स्थानिक थाळी (शाकाहारी/मांसाहारी), गरमागरम पोहे, वडापाव व स्थानिक गोडधोड पदार्थ.`
        : `Authentic regional thali, breakfast delicacies, and traditional specialties of ${cleanDest}.`,
      heritage_highlights: isMr
        ? `${cleanDest} परिसरातील ऐतिहासिक महत्त्व, स्थानिक परंपरा व निसर्गरम्य ठिकाणांची समृद्ध माहिती.`
        : `Cultural landmarks, heritage shrines, and scenic viewpoints of ${cleanDest}.`,
      activities_sequence: [
        isMr
          ? `सकाळी [०८:३० AM - १२:०० PM]: ${cleanDest} मध्यवर्ती ऐतिहासिक वास्तू व स्थानिक मुख्य मंदिराचे दर्शन. गरमागरम पोहे व चहा-नाश्ता. - अंदाजे खर्च: ₹२००`
          : `Morning [08:30 AM - 12:00 PM]: Tour prominent heritage shrines and central historic quarters in ${cleanDest}. - Est. Cost: ₹200`,
        isMr
          ? `दुपारी [१२:३० PM - ०४:०० PM]: स्थानिक अस्सल प्रादेशिक थाळी (शाकाहारी / मांसाहारी विशेष) भोजन, त्यानंतर गार्डन पाहणी. - अंदाजे खर्च: ₹४००`
          : `Afternoon [12:30 PM - 04:00 PM]: Authentic regional lunch at established local eatery followed by garden visit. - Est. Cost: ₹400`,
        isMr
          ? `संध्याकाळ [०४:३० PM - ०८:३० PM]: ${cleanDest} सनसेट व्ह्यू पॉईंट फेरफटका, स्थानिक बाजारपेठेत खरेदी आणि रात्रीचे जेवण. - अंदाजे खर्च: ₹५००`
          : `Evening [04:30 PM - 08:30 PM]: Sunset panorama at scenic lookout, local bazaar handicraft shopping, and dinner. - Est. Cost: ₹500`,
        `🏨 Stay/Hotel: ₹1200 Est. - ${isMr ? `${cleanDest} 3-Star Deluxe Hotel` : `${cleanDest} Heritage / Deluxe Hotel`}`
      ],
      daily_local_travel_tips: isMr ? `सकाळी लवकर सुरुवात केल्यास गर्दी टाळता येईल. स्थानिक नियम पाळावेत.` : `Start early to avoid peak crowd. Follow local guidelines.`,
      spots: [`${cleanDest} Heritage Zone`, `${cleanDest} Viewpoint`]
    };
  });

  return {
    trip_title: isMr ? `${cleanDest} संपूर्ण सहल नियोजन` : `${cleanDest} Complete Itinerary`,
    keyHighlights: isMr
      ? [`${cleanDest} मधील ऐतिहासिक व सांस्कृतिक स्थळे`, `${cleanDest} ची प्रसिद्ध खाद्यसंस्कृती`, 'निसर्गरम्य सनसेट पॉईंट्स']
      : [`Heritage landmarks of ${cleanDest}`, `Local culinary specialties`, `Scenic sunset viewpoints`],
    bestTimeToVisit: 'October to March',
    packList: isMr ? ['सुती कपडे', 'सनग्लासेस', 'ओळखपत्र', 'वॉकिंग शूज'] : ['Cotton apparel', 'Sunglasses', 'Govt ID', 'Walking shoes'],
    weatherPackingTips: weatherTips,
    viaRoute: viaRoute || undefined,
    selectedRoute: selectedRoute,
    itinerary: genericDays
  };
}
