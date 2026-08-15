import re

with open('src/components/views/DashboardView.tsx', 'r') as f:
    content = f.read()

agoda_block = """        {/* Agoda Image Banner */}
        <div className="mt-8 mb-6 flex justify-center w-full p-2">
          <a 
            href="https://www.agoda.com/partners/partnersearch.aspx?pcs=10&cid=1969781&hl=en-us&hid=25963734" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block transition-transform duration-300 hover:scale-105"
          >
            <img 
              src="https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=240x180" 
              srcSet="https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=240x180 1x, https://pix8.agoda.net/hotelImages/18952579/0/48512318c6f01ac53d2b7d9556d9b37c.jpg?ca=28&ce=0&s=480x360 2x" 
              alt="Agoda वर सर्वोत्तम हॉटेल बुक करा" 
              className="rounded-xl shadow-lg border border-gray-200"
            />
          </a>
        </div>"""

content = content.replace(agoda_block, "")

with open('src/components/views/DashboardView.tsx', 'w') as f:
    f.write(content)
