import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export type ServiceType = 'vendor_commission' | 'direct_app_booking' | 'vendor_ads' | 'hotel_registration';

export const calculateServerTax = async (
  supplierBaseFare: number, // Travelport कडून आलेले Base Fare
  supplierTaxes: number,    // Travelport कडून आलेले Taxes (Airline/Hotel GST)
  serviceType: ServiceType,
  buyerStateCode: string
) => {
  const ROUTRIPO_STATE_CODE = 'MH'; 

  // १. ॲडमिन पॅनेलमधून तुमच्या फी वरील GST चा दर मिळवणे (उदा. १८%)
  const docId = `${buyerStateCode}_${serviceType}`;
  let taxDoc = await db.collection('tax_configurations').doc(docId).get();
  
  if (!taxDoc.exists) {
    taxDoc = await db.collection('tax_configurations').doc(`DEFAULT_${serviceType}`).get();
  }
  const routripoGstRate = taxDoc.exists ? taxDoc.data()?.gstRate : 0.18; // Default 18%

  // २. Routripo ची फी (Platform Fee) आणि त्यावर टॅक्स काढणे
  let routripoFee = 0;
  let routripoGstAmount = 0;

  // Travelport कडून आलेली एकूण रक्कम
  const totalSupplierAmount = supplierBaseFare + supplierTaxes;

  if (serviceType === 'vendor_commission' || serviceType === 'direct_app_booking') {
    // ५% फी एकूण बुकिंग रकमेवर लावली जाईल
    routripoFee = totalSupplierAmount * 0.05; 
  } else {
    // ॲड्स किंवा सबस्क्रिप्शन असल्यास पूर्ण रक्कम
    routripoFee = supplierBaseFare; 
  }

  // फक्त Routripo च्या फीवर १८% GST
  routripoGstAmount = routripoFee * routripoGstRate;

  // ३. राज्यानुसार CGST/SGST/IGST ची विभागणी (फक्त तुमच्या फीवरील टॅक्सची)
  const isInterstate = buyerStateCode.toUpperCase() !== ROUTRIPO_STATE_CODE;
  const routripoCgst = isInterstate ? 0 : routripoGstAmount / 2;
  const routripoSgst = isInterstate ? 0 : routripoGstAmount / 2;
  const routripoIgst = isInterstate ? routripoGstAmount : 0;

  // ४. ग्राहकाला द्यावी लागणारी एकूण रक्कम आणि व्हेंडर पेआउट
  let customerPays = 0;
  let vendorPayout = 0;

  if (serviceType === 'vendor_commission') {
    // B2B: ग्राहक फक्त Travelport ची रक्कम देतो, तुमची फी व्हेंडरच्या पेआउटमधून कापली जाते
    customerPays = totalSupplierAmount; 
    vendorPayout = totalSupplierAmount - (routripoFee + routripoGstAmount); 
  } else if (serviceType === 'direct_app_booking') {
    // B2C: ग्राहकाला सर्व रकमा जोडून द्याव्या लागतात
    customerPays = totalSupplierAmount + routripoFee + routripoGstAmount; 
    vendorPayout = totalSupplierAmount; // Travelport ला द्यायची रक्कम
  } else {
    customerPays = routripoFee + routripoGstAmount; // ॲड्स/सबस्क्रिप्शन
  }

  return { 
    supplierBaseFare,
    supplierTaxes,
    totalSupplierAmount,
    routripoFee, 
    routripoCgst, 
    routripoSgst, 
    routripoIgst, 
    routripoGstAmount, 
    customerPays, 
    vendorPayout 
  };
};
