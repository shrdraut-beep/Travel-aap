import React from 'react';

export const SmartPackingAlert = ({ destinationCity, temp, isRaining }: { destinationCity: string; temp: number; isRaining: boolean }) => {
  if (!destinationCity) return null;

  let alertMessage = "";
  if (isRaining) {
    alertMessage = `🌧️ पावसाचा अंदाज आहे! ${destinationCity} ला जाताना छत्री किंवा रेनकोट नक्की सोबत ठेवा.`;
  } else if (temp > 35) {
    alertMessage = `☀️ कडक ऊन आहे! ${destinationCity} ला जाताना सनग्लासेस, टोपी आणि सुती कपडे सोबत ठेवायला विसरू नका.`;
  } else if (temp < 15) {
    alertMessage = `❄️ तिथे थंडी आहे! स्वेटर किंवा जॅकेट नक्की पॅक करा.`;
  } else {
    return null; // Don't show alert if weather is normal
  }

  return (
    <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', margin: '10px 0' }}>
      <strong>🎒 स्मार्ट पॅकिंग अलर्ट:</strong> {alertMessage}
    </div>
  );
};
