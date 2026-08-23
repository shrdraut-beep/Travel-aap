const fs = require('fs');
let content = fs.readFileSync('src/components/travel/BookingFunnelLayout.tsx', 'utf8');

if (!content.includes('formatDisplayDate')) {
  content = content.replace(
    /const formatTime =/,
    "const formatDisplayDate = (dStr) => { if(!dStr) return ''; const parts = dStr.split('-'); if(parts.length===3) return `${parts[2]}/${parts[1]}/${parts[0]}`; return dStr; };\n  const formatTime ="
  );
  
  // Replace {date || 'Select Date'}
  content = content.replace(
    /\{date \|\| 'Select Date'\}/g,
    "{formatDisplayDate(date) || 'Select Date'}"
  );

  // Replace {!(mode === 'car' && cabType === 'regular') ? (date || 'Any Date') : 'Regular Cab'}
  content = content.replace(
    /\(date \|\| 'Any Date'\)/g,
    "(formatDisplayDate(date) || 'Any Date')"
  );
  
  fs.writeFileSync('src/components/travel/BookingFunnelLayout.tsx', content);
}
