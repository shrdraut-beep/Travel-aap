import type { PackingCategory } from "../types";
export const HARDCODED_PACKING_CATEGORIES = (lang: string): PackingCategory[] => {
  const isMr = lang === 'mr';
  return [
    {
      id: 'cat_docs',
      name: isMr ? 'महत्त्वाची कागदपत्रे (Documents)' : 'Important Documents',
      items: [
        { id: 'doc_1', name: isMr ? 'ओळखपत्र (आधार कार्ड / पॅन कार्ड / मतदान कार्ड)' : 'ID Proof (Aadhaar / PAN / Voter ID)', isChecked: false, essential: true },
        { id: 'doc_2', name: isMr ? 'ड्रायव्हिंग लायसन्स' : 'Driving License', isChecked: false, essential: true },
        { id: 'doc_3', name: isMr ? 'प्रवासाची तिकिटे (विमान / ट्रेन / बस)' : 'Travel Tickets (Flight / Train / Bus)', isChecked: false, essential: true },
        { id: 'doc_4', name: isMr ? 'हॉटेल बुकिंग कन्फर्मेशन' : 'Hotel Booking Confirmation', isChecked: false, essential: true },
        { id: 'doc_5', name: isMr ? 'पासपोर्ट आणि व्हिसा' : 'Passport & Visa', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_medicines',
      name: isMr ? 'औषधे आणि प्रथमोपचार (Medicines & First Aid)' : 'Medicines & First Aid',
      items: [
        { id: 'med_1', name: isMr ? 'नियमित औषधे (बीपी, शुगर इ.)' : 'Regular Medicines (BP, Sugar, etc.)', isChecked: false, essential: true },
        { id: 'med_2', name: isMr ? 'डोकेदुखी आणि ताप (पॅरासिटामॉल)' : 'Headache & Fever (Paracetamol)', isChecked: false, essential: true },
        { id: 'med_3', name: isMr ? 'ॲसिडिटी आणि गॅसची औषधे' : 'Acidity & Gas Relief', isChecked: false, essential: false },
        { id: 'med_4', name: isMr ? 'उलटी आणि मळमळ थांबवण्याची औषधे' : 'Motion Sickness / Nausea Relief', isChecked: false, essential: false },
        { id: 'med_5', name: isMr ? 'बँड-एड आणि अँटीसेप्टिक मलम' : 'Band-Aid & Antiseptic Ointment', isChecked: false, essential: true },
        { id: 'med_6', name: isMr ? 'ओआरएस (ORS) किंवा इलेक्ट्रॉल' : 'ORS / Electral Powder', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_clothing',
      name: isMr ? 'कपडे आणि पादत्राणे (Clothing & Footwear)' : 'Clothing & Footwear',
      items: [
        { id: 'cloth_1', name: isMr ? 'टी-शर्ट्स आणि टॉप्स' : 'T-Shirts & Tops', isChecked: false, essential: true },
        { id: 'cloth_2', name: isMr ? 'पँट्स / जीन्स / ट्रॅक पँट्स' : 'Pants / Jeans / Track Pants', isChecked: false, essential: true },
        { id: 'cloth_3', name: isMr ? 'अंडरवेअर / इनरवियर' : 'Underwear / Innerwear', isChecked: false, essential: true },
        { id: 'cloth_4', name: isMr ? 'रात्रीचे आरामदायक कपडे (Nightwear)' : 'Comfortable Nightwear', isChecked: false, essential: false },
        { id: 'cloth_5', name: isMr ? 'स्वेटर किंवा जॅकेट' : 'Sweater or Jacket', isChecked: false, essential: false },
        { id: 'cloth_6', name: isMr ? 'चालण्यासाठी शूज (ट्रेकिंग/स्पोर्ट)' : 'Walking Shoes (Trekking / Sports)', isChecked: false, essential: true },
        { id: 'cloth_7', name: isMr ? 'स्लीपर्स किंवा सँडल्स' : 'Slippers or Sandals', isChecked: false, essential: false },
        { id: 'cloth_8', name: isMr ? 'मोजे (Socks)' : 'Socks', isChecked: false, essential: true },
      ]
    },
    {
      id: 'cat_electronics',
      name: isMr ? 'इलेक्ट्रॉनिक्स (Electronics)' : 'Electronics',
      items: [
        { id: 'elec_1', name: isMr ? 'मोबाईल आणि चार्जर' : 'Mobile & Charger', isChecked: false, essential: true },
        { id: 'elec_2', name: isMr ? 'पॉवर बँक' : 'Power Bank', isChecked: false, essential: true },
        { id: 'elec_3', name: isMr ? 'इअरफोन्स / हेडफोन्स' : 'Earphones / Headphones', isChecked: false, essential: false },
        { id: 'elec_4', name: isMr ? 'कॅमेरा आणि अतिरिक्त बॅटरी' : 'Camera & Extra Battery', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_essentials',
      name: isMr ? 'इतर आवश्यक वस्तू (Essentials)' : 'Essentials & Toiletries',
      items: [
        { id: 'ess_1', name: isMr ? 'रोख रक्कम आणि UPI स्कॅनर' : 'Cash & UPI Scanner', isChecked: false, essential: true },
        { id: 'ess_2', name: isMr ? 'पाण्याची बाटली (पुन्हा वापरण्यायोग्य)' : 'Water Bottle (Reusable)', isChecked: false, essential: true },
        { id: 'ess_3', name: isMr ? 'छत्री / रेनकोट' : 'Umbrella / Raincoat', isChecked: false, essential: false },
        { id: 'ess_4', name: isMr ? 'साबण, शॅम्पू, टूथब्रश, टूथपेस्ट' : 'Soap, Shampoo, Toothbrush, Paste', isChecked: false, essential: true },
        { id: 'ess_5', name: isMr ? 'सनस्क्रीन आणि मॉइश्चरायझर' : 'Sunscreen & Moisturizer', isChecked: false, essential: false },
        { id: 'ess_6', name: isMr ? 'टॉवेल / रुमाल' : 'Towel / Napkin', isChecked: false, essential: true },
        { id: 'ess_7', name: isMr ? 'स्नॅक्स आणि बिस्किटे' : 'Snacks & Biscuits', isChecked: false, essential: false },
      ]
    }
  ];
};
