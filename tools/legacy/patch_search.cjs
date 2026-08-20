const fs = require('fs');
let code = fs.readFileSync('src/components/SearchInput.tsx', 'utf-8');

// Update TransportMode
code = code.replace(
  "export type TransportMode = 'flights' | 'trains';",
  "export type TransportMode = 'flights' | 'trains' | 'hotels' | 'buses' | 'cars';"
);

// Add DEFAULT_CITIES right before SearchInputProps or after DEFAULT_TRAIN_STATIONS
const citiesData = `
const DEFAULT_CITIES: LocationItem[] = [
  { city: 'Mumbai', code: 'MUM', country: 'India' },
  { city: 'Delhi', code: 'DEL', country: 'India' },
  { city: 'Bengaluru', code: 'BLR', country: 'India' },
  { city: 'Hyderabad', code: 'HYD', country: 'India' },
  { city: 'Chennai', code: 'MAA', country: 'India' },
  { city: 'Kolkata', code: 'CCU', country: 'India' },
  { city: 'Pune', code: 'PNQ', country: 'India' },
  { city: 'Ahmedabad', code: 'AMD', country: 'India' },
  { city: 'Jaipur', code: 'JAI', country: 'India' },
  { city: 'Goa', code: 'GOI', country: 'India' },
  { city: 'New York', code: 'NYC', country: 'USA' },
  { city: 'London', code: 'LON', country: 'UK' },
  { city: 'Dubai', code: 'DXB', country: 'UAE' },
  { city: 'Singapore', code: 'SIN', country: 'Singapore' },
  { city: 'Paris', code: 'PAR', country: 'France' }
];
`;

code = code.replace(
  "export const SearchInput",
  citiesData + "\nexport const SearchInput"
);

// Update dataset selection logic
code = code.replace(
  "const [currentDataset, setCurrentDataset] = useState<LocationItem[]>([]);",
  "const [currentDataset, setCurrentDataset] = useState<LocationItem[]>([]);"
);

// Find the useEffect that loads the dataset
const loadDatasetRegex = /useEffect\(\(\) => \{\s*let isMounted = true;\s*const loadDataset = async \(\) => \{[\s\S]*?\} \}, \[mode\]\);/;
const loadDatasetReplacement = `useEffect(() => {
    let isMounted = true;
    const loadDataset = async () => {
      try {
        if (mode === 'flights') {
          const module = await import('../data/airports');
          const data = module.default || module;
          if (isMounted) setCurrentDataset(Array.isArray(data) ? data : data.airports || []);
        } else if (mode === 'trains') {
          if (isMounted) setCurrentDataset(DEFAULT_TRAIN_STATIONS);
        } else {
          if (isMounted) setCurrentDataset(DEFAULT_CITIES);
        }
      } catch (e) {
        console.error('Error loading dataset:', e);
      }
    };
    loadDataset();
    return () => { isMounted = false; };
  }, [mode]);`;

code = code.replace(loadDatasetRegex, loadDatasetReplacement);

// Update name match logic
code = code.replace(
  "const nameMatch = mode === 'flights'",
  "const nameMatch = mode === 'flights' ? (item.airport && item.airport.toLowerCase().includes(cleanQuery)) : mode === 'trains' ? (item.station && item.station.toLowerCase().includes(cleanQuery)) : false;\n        // @ts-ignore\n        const __dummy = mode === 'flights'"
);

fs.writeFileSync('src/components/SearchInput.tsx', code);
