const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update getCloserAlternativeDestinations
code = code.replace(
  'function getCloserAlternativeDestinations(',
  'function getCloserAlternativeDestinations(lang: string, '
);

code = code.replace(
  'reason: item.descMr',
  "reason: lang === 'mr' ? item.descMr : item.descEn"
);

// Update evaluateTripFeasibility
code = code.replace(
  'async function evaluateTripFeasibility(',
  'async function evaluateTripFeasibility(lang: string, '
);

code = code.replace(
  'transitDetail = `विमान तिकीट (अंदाजित दर ₹५/किमी): ₹${flightFarePerPerson}/व्यक्ति x ${numMembers} = ₹${transitCost}`;',
  'transitDetail = lang === "mr" ? `विमान तिकीट (अंदाजित दर ₹५/किमी): ₹${flightFarePerPerson}/व्यक्ति x ${numMembers} = ₹${transitCost}` : `Flight Ticket (Est. ₹5/km): ₹${flightFarePerPerson}/person x ${numMembers} = ₹${transitCost}`;'
);

code = code.replace(
  'modeSpecificTip = `📌 **टीप (विमान दर)**: विमान प्रवास दर हे अंदाजित धरले आहेत. प्रवासाच्या तारखेनुसार विमान कंपन्यांचे प्रत्यक्ष तिकीट दर तपासावेत व त्यानुसार नियोजन करावे.`;',
  'modeSpecificTip = lang === "mr" ? `📌 **टीप (विमान दर)**: विमान प्रवास दर हे अंदाजित धरले आहेत. प्रवासाच्या तारखेनुसार विमान कंपन्यांचे प्रत्यक्ष तिकीट दर तपासावेत व त्यानुसार नियोजन करावे.` : `📌 **Note (Flight Fare)**: Flight fares are estimated. Check actual airline prices for your travel dates.`;'
);

code = code.replace(
  'transitDetail = `ट्रेन तिकीट (३AC अंदाजित दर ₹४/किमी): ₹${trainFare3AC}/व्यक्ति x ${numMembers} = ₹${transitCost} (२AC दर: ~₹${trainFare2AC}/व्यक्ति)`;',
  'transitDetail = lang === "mr" ? `ट्रेन तिकीट (३AC अंदाजित दर ₹४/किमी): ₹${trainFare3AC}/व्यक्ति x ${numMembers} = ₹${transitCost} (२AC दर: ~₹${trainFare2AC}/व्यक्ति)` : `Train Ticket (3AC Est. ₹4/km): ₹${trainFare3AC}/person x ${numMembers} = ₹${transitCost} (2AC fare: ~₹${trainFare2AC}/person)`;'
);

code = code.replace(
  'modeSpecificTip = `📌 **टीप (रेल्वे दर)**: रेल्वे तिकीट दर हे अंदाजित आहेत. बुकिंग करण्यापूर्वी IRCTC किंवा रेल्वे ॲपवर प्रत्यक्ष तिकीट दर तपासावेत व त्यानुसार नियोजन करावे.`;',
  'modeSpecificTip = lang === "mr" ? `📌 **टीप (रेल्वे दर)**: रेल्वे तिकीट दर हे अंदाजित आहेत. बुकिंग करण्यापूर्वी IRCTC किंवा रेल्वे ॲपवर प्रत्यक्ष तिकीट दर तपासावेत व त्यानुसार नियोजन करावे.` : `📌 **Note (Train Fare)**: Train fares are estimated. Check IRCTC for actual fares before booking.`;'
);

code = code.replace(
  'transitDetail = `बस तिकीट (दोन्ही बाजू अंदाज): ₹${busFarePerPerson}/व्यक्ति x ${numMembers} = ₹${transitCost}`;',
  'transitDetail = lang === "mr" ? `बस तिकीट (दोन्ही बाजू अंदाज): ₹${busFarePerPerson}/व्यक्ति x ${numMembers} = ₹${transitCost}` : `Bus Ticket (Round-trip est.): ₹${busFarePerPerson}/person x ${numMembers} = ₹${transitCost}`;'
);

code = code.replace(
  'modeSpecificTip = `📌 **टीप (बस दर)**: बस तिकीट दर अंदाजित आहेत. प्रवासाच्या तारखेनुसार आणि बस ऑपरेटरनुसार (सरकारी/खाजगी) प्रत्यक्ष दर तपासावेत व त्यानुसार नियोजन करावे.`;',
  'modeSpecificTip = lang === "mr" ? `📌 **टीप (बस दर)**: बस तिकीट दर अंदाजित आहेत. प्रवासाच्या तारखेनुसार आणि बस ऑपरेटरनुसार (सरकारी/खाजगी) प्रत्यक्ष दर तपासावेत व त्यानुसार नियोजन करावे.` : `📌 **Note (Bus Fare)**: Bus fares are estimated. Check actual operator rates for your travel dates.`;'
);

code = code.replace(
  'transitDetail = `गाडीचा इंधन व धावण्याचा खर्च (₹१२.५/किमी): ₹${carRunningCost} (सर्व सदस्यांत विभक्त) + टोल: ₹${estimatedTolls} = ₹${transitCost}`;',
  'transitDetail = lang === "mr" ? `गाडीचा इंधन व धावण्याचा खर्च (₹१२.५/किमी): ₹${carRunningCost} (सर्व सदस्यांत विभक्त) + टोल: ₹${estimatedTolls} = ₹${transitCost}` : `Car fuel & running cost (₹12.5/km): ₹${carRunningCost} (shared by all) + Toll: ₹${estimatedTolls} = ₹${transitCost}`;'
);

code = code.replace(
  'modeSpecificTip = `📌 **टीप (इंधन व टोल दर)**: गाडीचा खर्च हा अंदाजित इंधन दर व महामार्ग टोलवर आधारित असून सर्व सदस्यांत विभक्त होतो. प्रत्यक्ष टोल व इंधन दरानुसार नियोजन करावे.`;',
  'modeSpecificTip = lang === "mr" ? `📌 **टीप (इंधन व टोल दर)**: गाडीचा खर्च हा अंदाजित इंधन दर व महामार्ग टोलवर आधारित असून सर्व सदस्यांत विभक्त होतो. प्रत्यक्ष टोल व इंधन दरानुसार नियोजन करावे.` : `📌 **Note (Fuel & Toll)**: Car costs are estimated based on fuel and highway tolls, shared among all members. Plan according to actual rates.`;'
);

code = code.replace(
  'const hotelDetail = `हॉटेल/होमस्टे भाडे (प्रति रूम २ व्यक्ती): ${roomsNeeded} खोल्या x ${nights} रात्री x ₹${avgHotelRatePerNight} = ₹${totalHotelCost}`;',
  'const hotelDetail = lang === "mr" ? `हॉटेल/होमस्टे भाडे (प्रति रूम २ व्यक्ती): ${roomsNeeded} खोल्या x ${nights} रात्री x ₹${avgHotelRatePerNight} = ₹${totalHotelCost}` : `Hotel/Homestay (2 persons/room): ${roomsNeeded} rooms x ${nights} nights x ₹${avgHotelRatePerNight} = ₹${totalHotelCost}`;'
);

code = code.replace(
  'const foodDetail = `जेवण व पर्यटन: (₹४०० + ₹२००) x ${numMembers} व्यक्ती x ${totalDays} दिवस = ₹${totalFoodAndSightseeing}`;',
  'const foodDetail = lang === "mr" ? `जेवण व पर्यटन: (₹४०० + ₹२००) x ${numMembers} व्यक्ती x ${totalDays} दिवस = ₹${totalFoodAndSightseeing}` : `Food & Sightseeing: (₹400 + ₹200) x ${numMembers} persons x ${totalDays} days = ₹${totalFoodAndSightseeing}`;'
);

code = code.replace(
  'closerAlternatives = getCloserAlternativeDestinations(origin, userBudget, totalDays, numMembers, mode);',
  'closerAlternatives = getCloserAlternativeDestinations(lang, origin, userBudget, totalDays, numMembers, mode);'
);

code = code.replace(
  'const feasibility = await evaluateTripFeasibility(source, tripName, startDate, endDate, members, transportMode, totalBudget);',
  'const feasibility = await evaluateTripFeasibility(lang, source, tripName, startDate, endDate, members, transportMode, totalBudget);'
);

code = code.replace(
  'const feasibility = await evaluateTripFeasibility(\n      departure || "Mumbai", \n      cleanDest, \n      new Date().toISOString(), \n      new Date(Date.now() + (Number(days) || 3) * 86400000).toISOString(), \n      persons || 2, \n      transportMode || "car", \n      budget\n    );',
  'const feasibility = await evaluateTripFeasibility(\n      lang,\n      departure || "Mumbai", \n      cleanDest, \n      new Date().toISOString(), \n      new Date(Date.now() + (Number(days) || 3) * 86400000).toISOString(), \n      persons || 2, \n      transportMode || "car", \n      budget\n    );'
);


fs.writeFileSync('server.ts', code);
console.log("Done.");
