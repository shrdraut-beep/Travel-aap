import re

with open("src/components/TripRecap.tsx", "r") as f:
    content = f.read()

# Replace shareText assignments
content = content.replace("let shareText = `*स्मार्ट प्रवास आराखडा: ${trip.name}* 🚀\\n\\n`;", "let shareText = lang === 'mr' ? `*स्मार्ट प्रवास आराखडा: ${trip.name}* 🚀\\n\\n` : `*Smart Travel Plan: ${trip.name}* 🚀\\n\\n`;")
content = content.replace("shareText += `📅 तारीख: ${trip.startDate || 'N/A'} - ${trip.endDate || 'N/A'}\\n`;", "shareText += lang === 'mr' ? `📅 तारीख: ${trip.startDate || 'N/A'} - ${trip.endDate || 'N/A'}\\n` : `📅 Date: ${trip.startDate || 'N/A'} - ${trip.endDate || 'N/A'}\\n`;")
content = content.replace("shareText += `👥 प्रवास प्रकार: ${trip.tripType || 'N/A'}\\n`;", "shareText += lang === 'mr' ? `👥 प्रवास प्रकार: ${trip.tripType || 'N/A'}\\n` : `👥 Trip Type: ${trip.tripType || 'N/A'}\\n`;")
content = content.replace("shareText += `🚗 प्रवासाचे साधन: ${trip.transportMode || 'N/A'}\\n`;", "shareText += lang === 'mr' ? `🚗 प्रवासाचे साधन: ${trip.transportMode || 'N/A'}\\n` : `🚗 Transport: ${trip.transportMode || 'N/A'}\\n`;")
content = content.replace("shareText += `💰 एकूण अंदाजे खर्च: ₹${new Intl.NumberFormat('en-IN').format(finalBudget)}\\n\\n`;", "shareText += lang === 'mr' ? `💰 एकूण अंदाजे खर्च: ₹${new Intl.NumberFormat('en-IN').format(finalBudget)}\\n\\n` : `💰 Total Est. Cost: ${currencySymbol || '₹'}${new Intl.NumberFormat('en-US').format(finalBudget)}\\n\\n`;")

content = content.replace("shareText += `*सविस्तर नियोजन:*\\n`;", "shareText += lang === 'mr' ? `*सविस्तर नियोजन:*\\n` : `*Detailed Itinerary:*\\n`;")
content = content.replace("shareText += `\\n🏨 *हॉटेल्स:*\\n`;", "shareText += lang === 'mr' ? `\\n🏨 *हॉटेल्स:*\\n` : `\\n🏨 *Hotels:*\\n`;")
content = content.replace("shareText += `\\n📍 *पर्यटन स्थळे:*\\n`;", "shareText += lang === 'mr' ? `\\n📍 *पर्यटन स्थळे:*\\n` : `\\n📍 *Attractions:*\\n`;")
content = content.replace("shareText += `\\n📝 *इतर नियोजन:*\\n`;", "shareText += lang === 'mr' ? `\\n📝 *इतर नियोजन:*\\n` : `\\n📝 *Other Plans:*\\n`;")
content = content.replace("shareText += `\\n💸 *खर्च तपशील:*\\n`;", "shareText += lang === 'mr' ? `\\n💸 *खर्च तपशील:*\\n` : `\\n💸 *Expense Details:*\\n`;")

content = content.replace("shareText += `\\n\\n*AI टीप्स:*\\n${trip.aiPlan}`;", "shareText += lang === 'mr' ? `\\n\\n*AI टीप्स:*\\n${trip.aiPlan}` : `\\n\\n*AI Tips:*\\n${trip.aiPlan}`;")
content = content.replace("shareText += `\\n\\nही सहल Routripo ॲपवर तयार केली आहे!`;", "shareText += lang === 'mr' ? `\\n\\nही सहल Routripo ॲपवर तयार केली आहे!` : `\\n\\nGenerated via Routripo App!`;")

with open("src/components/TripRecap.tsx", "w") as f:
    f.write(content)
