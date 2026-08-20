const fs = require('fs');
let code = fs.readFileSync('src/components/travel/BookingFunnelLayout.tsx', 'utf-8');

code = code.replace(
  "const isMr = lang === 'mr';",
  `const isMr = lang === 'mr';

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize timer
  React.useEffect(() => {
    let duration = 600; // 10 mins default
    if (mode === 'hotel') duration = 900; // 15 mins
    else if (mode === 'car' && cabType === 'regular') duration = 300; // 5 mins
    else if (mode === 'car' || mode === 'bus') duration = 600; // 10 mins
    
    setTimeLeft(duration);
  }, [mode, cabType]);

  // Timer countdown
  React.useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      alert("Session Expired. Please start a new booking.");
      onBack();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t !== null && t > 0) ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onBack]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  const dynamicTitle = mode === 'hotel' ? 'Book your Hotel' : 
                       mode === 'flight' ? 'Book your Flight' : 
                       mode === 'train' ? 'Book your Train' : 
                       mode === 'bus' ? 'Book your Bus' : 'Book your Cab';
`
);

fs.writeFileSync('src/components/travel/BookingFunnelLayout.tsx', code);
