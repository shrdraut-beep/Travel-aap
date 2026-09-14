// Train catalog data loader

export interface TrainCatalogEntry {
  trainNumber: string;
  trainName: string;
  accommodation: string;
}

export interface ParsedClass {
  code: string;
  name: string;
  priceMultiplier: number;
}

export interface EnrichedTrainInfo {
  trainNumber: string;
  trainName: string;
  accommodation: string;
  accommodationTypes: string[];
  classes: ParsedClass[];
  isFromCatalog: boolean;
}

let exactMap = new Map<string, TrainCatalogEntry>();
let numberPartMap = new Map<string, TrainCatalogEntry>();
let catalogArray: TrainCatalogEntry[] = [];
let _dataLoaded = false;

export async function loadTrainCatalog() {
  if (_dataLoaded) return;
  try {
    const module = await import('../data/trainname.json');
    const trainNamesData = module.default || module;
    
    trainNamesData.forEach((item: any) => {
      if (!item || !item.trainNumber) return;
      const numRaw = String(item.trainNumber).trim();
      const entry: TrainCatalogEntry = {
        trainNumber: numRaw,
        trainName: String(item.trainName || '').trim(),
        accommodation: String(item.accommodation || '').trim()
      };

      catalogArray.push(entry);
      exactMap.set(numRaw, entry);
      exactMap.set(numRaw.replace(/\D/g, ''), entry);

      // Split multi-train numbers like 12330/12380
      const parts = numRaw.split(/[\/\,\s]+/);
      parts.forEach((p) => {
        const cleanP = p.replace(/\D/g, '').trim();
        if (cleanP && !numberPartMap.has(cleanP)) {
          numberPartMap.set(cleanP, entry);
        }
      });
    });

    _dataLoaded = true;
  } catch (error) {
    console.error("Failed to load train catalog:", error);
  }
}

export function searchTrainCatalog(query: string): TrainCatalogEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return catalogArray.filter(entry => 
    entry.trainName.toLowerCase().includes(q) || entry.trainNumber.includes(q)
  ).slice(0, 10); // limit results
}

/**
 * Parses raw accommodation string into human-readable accommodation types and structured classes
 * Example: "1A,2A,3A SL,II,P" => accommodationTypes: ["1st AC (1A)", "2nd AC (2A)", "3rd AC (3A)", "Sleeper (SL)", "General (II)"]
 */
export function parseAccommodation(accStr: string): { accommodationTypes: string[]; classes: ParsedClass[] } {
  if (!accStr || typeof accStr !== 'string') {
    return {
      accommodationTypes: ['Sleeper (SL)', '3rd AC (3A)', '2nd AC (2A)'],
      classes: [
        { code: 'SL', name: 'Sleeper', priceMultiplier: 0.55 },
        { code: '3A', name: '3rd AC', priceMultiplier: 1.4 },
        { code: '2A', name: '2nd AC', priceMultiplier: 2.1 }
      ]
    };
  }

  const rawUpper = accStr.toUpperCase();
  const typesSet = new Set<string>();
  const classesList: ParsedClass[] = [];

  const addClass = (code: string, name: string, mult: number) => {
    const typeLabel = `${name} (${code})`;
    if (!typesSet.has(typeLabel)) {
      typesSet.add(typeLabel);
      classesList.push({ code, name, priceMultiplier: mult });
    }
  };

  if (rawUpper.includes('EC') || rawUpper.includes('EXECUTIVE')) addClass('EC', 'Executive Chair Car', 1.8);
  if (rawUpper.includes('1A') || rawUpper.includes('1ST AC') || rawUpper.includes('FIRST AC')) addClass('1A', '1st AC', 2.8);
  if (rawUpper.includes('2A') || rawUpper.includes('2ND AC') || rawUpper.includes('SECOND AC')) addClass('2A', '2nd AC', 2.1);
  if (rawUpper.includes('3A') || rawUpper.includes('3RD AC') || rawUpper.includes('THIRD AC')) addClass('3A', '3rd AC', 1.4);
  if (rawUpper.includes('3E') || rawUpper.includes('3A(E)') || rawUpper.includes('ECONOMY')) addClass('3E', '3AC Economy', 1.25);
  if (rawUpper.includes('CC') || rawUpper.includes('CHAIR CAR')) addClass('CC', 'AC Chair Car', 0.9);
  if (rawUpper.includes('SL') || rawUpper.includes('SLEEPER')) addClass('SL', 'Sleeper', 0.55);
  if (rawUpper.includes('2S') || rawUpper.includes('SECOND SITTING')) addClass('2S', '2nd Sitting', 0.3);
  if (rawUpper.includes('II') || rawUpper.includes('GEN') || rawUpper.includes('GENERAL')) addClass('II', 'General Unreserved', 0.25);
  if (rawUpper.includes('EV')) addClass('EV', 'Vistadome', 2.0);
  if (rawUpper.includes('GAC')) addClass('GAC', 'Garib Rath AC', 1.1);

  if (classesList.length === 0) {
    // Default standard classes if unparsed
    addClass('SL', 'Sleeper', 0.55);
    addClass('3A', '3rd AC', 1.4);
    addClass('2A', '2nd AC', 2.1);
  }

  return {
    accommodationTypes: Array.from(typesSet),
    classes: classesList
  };
}

/**
 * Finds train in trainname.json catalog by train number
 * Rules:
 * 1. Match train number with trainname.json
 * 2. Extract official Train Name and Accommodation Types
 * 3. Fallback: "Express Train {trainNumber}" if missing
 */
export function getTrainFromCatalog(trainNumberInput: string | number): EnrichedTrainInfo {
  const cleanInput = String(trainNumberInput || '').trim();
  const digitsOnly = cleanInput.replace(/\D/g, '');

  let entry = exactMap.get(cleanInput) ||
              (digitsOnly ? exactMap.get(digitsOnly) : undefined) ||
              (digitsOnly ? numberPartMap.get(digitsOnly) : undefined);

  if (!entry && digitsOnly) {
    for (const [key, val] of exactMap.entries()) {
      if (key.includes(digitsOnly) || digitsOnly.includes(key)) {
        entry = val;
        break;
      }
    }
  }

  if (entry && entry.trainName) {
    const parsedAcc = parseAccommodation(entry.accommodation);
    return {
      trainNumber: entry.trainNumber || cleanInput || '12345',
      trainName: entry.trainName,
      accommodation: entry.accommodation || '2A, 3A, SL, II',
      accommodationTypes: parsedAcc.accommodationTypes,
      classes: parsedAcc.classes,
      isFromCatalog: true
    };
  }

  // Rule 3: Clean Fallback
  const fallbackNum = digitsOnly || cleanInput || '12345';
  const defaultAcc = parseAccommodation('2A, 3A, SL, II');
  return {
    trainNumber: fallbackNum,
    trainName: `Express Train ${fallbackNum}`,
    accommodation: '2A, 3A, SL, II',
    accommodationTypes: defaultAcc.accommodationTypes,
    classes: defaultAcc.classes,
    isFromCatalog: false
  };
}

/**
 * Utility lookup function getTrainDetails(trainNumber)
 * Returns the official name, available classes/accommodation, or fallback with 'Express Train {trainNumber}'
 */
export function getTrainDetails(trainNumber: string | number) {
  const info = getTrainFromCatalog(trainNumber);
  return {
    trainNumber: info.trainNumber,
    trainName: info.trainName,
    name: info.trainName,
    accommodation: info.accommodation,
    accommodationTypes: info.accommodationTypes,
    availableClasses: info.accommodationTypes,
    classes: info.classes,
    isFound: info.isFromCatalog
  };
}

