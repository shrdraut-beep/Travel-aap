import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const SmartPackingAlert = ({ destinationCity, temp, isRaining }: { destinationCity: string; temp: number; isRaining: boolean }) => {
  const { lang } = useLanguage();
  if (!destinationCity) return null;

  let alertMessage = "";
  if (isRaining) {
    alertMessage = lang === 'mr'
      ? `🌧️ पावसाचा अंदाज आहे! ${destinationCity} ला जाताना छत्री किंवा रेनकोट नक्की सोबत ठेवा.`
      : lang === 'hi'
      ? `🌧️ बारिश की संभावना है! ${destinationCity} जाते समय छाता या रेनकोट जरूर साथ रखें।`
      : `🌧️ Rain expected! Don't forget an umbrella or raincoat when traveling to ${destinationCity}.`;
  } else if (temp > 35) {
    alertMessage = lang === 'mr'
      ? `☀️ कडक ऊन आहे! ${destinationCity} ला जाताना सनग्लासेस, टोपी आणि सुती कपडे सोबत ठेवायला विसरू नका.`
      : lang === 'hi'
      ? `☀️ तेज धूप है! ${destinationCity} जाते समय धूप का चश्मा, टोपी और सूती कपड़े रखना न भूलें।`
      : `☀️ It's hot! Make sure to pack sunglasses, a cap, and cotton clothes for ${destinationCity}.`;
  } else if (temp < 15) {
    alertMessage = lang === 'mr'
      ? `❄️ तिथे थंडी आहे! स्वेटर किंवा जॅकेट नक्की पॅक करा.`
      : lang === 'hi'
      ? `❄️ वहाँ ठंड है! स्वेटर या जैकेट जरूर पैक करें।`
      : `❄️ It's chilly there! Make sure to pack a sweater or jacket for ${destinationCity}.`;
  } else {
    return null; // Don't show alert if weather is normal
  }

  return (
    <div className="p-3 bg-premium-pink-soft text-premium-pink rounded-[16px] border border-premium-pink text-xs font-semibold my-2 shadow-sm">
      <strong>🎒 {lang === 'mr' ? 'स्मार्ट पॅकिंग अलर्ट:' : lang === 'hi' ? 'स्मार्ट पैकिंग अलर्ट:' : 'Smart Packing Alert:'}</strong> {alertMessage}
    </div>
  );
};
