import React from 'react';

// This accepts the date and the already fetched holiday list from Nager.Date API
export const HolidayAlert = ({ tripDate, holidaysList }: { tripDate: string; holidaysList: any[] }) => {
  if (!holidaysList || holidaysList.length === 0 || !tripDate) return null;

  // Simple check to see if the trip date falls on a public holiday
  const matchingHoliday = holidaysList.find(holiday => holiday.date === tripDate);

  if (!matchingHoliday) return null;

  return (
    <div style={{ padding: '10px', backgroundColor: '#e2e3e5', color: '#383d41', borderRadius: '8px', margin: '10px 0', borderLeft: '4px solid #17a2b8' }}>
      <strong>🎉 सुट्टीचा अलर्ट (Holiday Alert):</strong> तुमच्या प्रवासाच्या तारखेला <b>'{matchingHoliday.name}'</b> ची सुट्टी आहे! या काळात प्रवाशांची गर्दी असू शकते, त्यामुळे तुमचे बुकिंग आणि प्लॅनिंग पक्के असल्याची खात्री करा.
    </div>
  );
};
