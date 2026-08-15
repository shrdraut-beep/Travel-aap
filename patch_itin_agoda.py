import re

with open('src/components/ItineraryCard.tsx', 'r') as f:
    content = f.read()

agoda_block = """            {/* Show Hotel booking only if it's a hotel stay AND not last day AND not in transit */}
            {hasHotelStay && dayNumber < totalDays && plan.type !== 'ticket' && (
              <div className="mt-3">
                <a 
                  href={`https://www.agoda.com/search?cid=1969781&textToSearch=${city}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-blue-700 transition duration-300"
                >
                  {lang === 'mr' ? 'येथे हॉटेल बुक करा 🏨' : lang === 'hi' ? 'यहाँ होटल बुक करें 🏨' : 'Book Hotel Here 🏨'}
                </a>
              </div>
            )}"""

content = content.replace(agoda_block, "")

with open('src/components/ItineraryCard.tsx', 'w') as f:
    f.write(content)
