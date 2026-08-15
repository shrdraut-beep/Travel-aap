import re

with open('src/components/modals/FutureTripModal.tsx', 'r') as f:
    content = f.read()

agoda_text_block = """                            {/* Agoda Text Link Button */}
                            <div className="mt-3 mb-2 flex justify-start">
                              <a 
                                href="https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1969781&city=11304" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-block bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                              >
                                {lang === 'mr' ? 'येथे हॉटेल बुक करा 🏨' : lang === 'hi' ? 'यहाँ होटल बुक करें 🏨' : 'Book Hotel Here 🏨'}
                              </a>
                            </div>"""

content = content.replace(agoda_text_block, "")

with open('src/components/modals/FutureTripModal.tsx', 'w') as f:
    f.write(content)
