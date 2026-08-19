const fs = require('fs');
let code = fs.readFileSync('src/components/travel/BookingFunnelLayout.tsx', 'utf-8');

// 1. Add Timer Logic & Dynamic Titles
code = code.replace(
  "const [step, setStep] = useState<'main' | 'origin' | 'destination' | 'date'>('main');",
  `const [step, setStep] = useState<'main' | 'origin' | 'destination' | 'date' | 'passenger'>('main');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize timer
  useEffect(() => {
    let duration = 600; // 10 mins default
    if (mode === 'hotel') duration = 900; // 15 mins
    else if (mode === 'car' && cabType === 'regular') duration = 300; // 5 mins
    else if (mode === 'car' || mode === 'bus') duration = 600; // 10 mins
    
    setTimeLeft(duration);
  }, [mode, cabType]);

  // Timer countdown
  useEffect(() => {
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

// 2. Add Title and Timer to Header
const headerRegex = /<LogoName \/>/;
const headerReplacement = `<span className="font-black text-sm text-slate-800 uppercase tracking-wider">{dynamicTitle}</span>
      {timeLeft !== null && (
        <div className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest shadow-sm">
          {formatTime(timeLeft)}
        </div>
      )}`;
code = code.replace(headerRegex, headerReplacement);

// 3. Fix SearchInput in 'origin' step
code = code.replace(
  /mode=\{mode === 'train' \? 'trains' : 'flights'\}/g,
  `mode={mode === 'train' ? 'trains' : mode === 'bus' ? 'buses' : mode === 'car' ? 'cars' : mode === 'hotel' ? 'hotels' : 'flights'}`
);

// 4. Update Placeholders dynamically
code = code.replace(
  /placeholder="Search city or airport..."/g,
  `placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}`
);
code = code.replace(
  /placeholder="Search destination..."/g,
  `placeholder={mode === 'hotel' ? "Search City, Area, or Property Name" : mode === 'bus' ? "Search City or Bus Stand" : mode === 'car' ? "Search Pick-up Location / Drop Location" : mode === 'train' ? "Search City or Railway Station" : "Search City or Airport"}`
);

// 5. Ensure Auto-advance sets step properly and quickly (Wait, we can just pass autoFocus to SearchInput)
code = code.replace(
  /label="Origin"/g,
  `label="Origin" autoFocus={true}`
);
code = code.replace(
  /label="Destination"/g,
  `label="Destination" autoFocus={true}`
);

// Fix the auto-advance setStep
code = code.replace(
  "setOrigin(code);\n              setStep('destination');",
  "setOrigin(code);\n              setTimeout(() => setStep('destination'), 10);"
);

fs.writeFileSync('src/components/travel/BookingFunnelLayout.tsx', code);
