const fs = require('fs');
let content = fs.readFileSync('src/components/views/MyTicketsView.tsx', 'utf8');

const replacement = `
  const handleDownload = async () => {
    const el = document.getElementById('ixigo-pdf-template');
    if (!el) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(el, \`\${ticket.bookingId || 'Ticket'}.pdf\`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };
`;
content = content.replace(/const handleDownload = async \(\) => {[\s\S]*?};/, replacement.trim());

const ixigoTemplate = `
      {/* HIDDEN PRINT TEMPLATE FOR PDF */}
      <div className="absolute left-[-9999px] top-[-9999px] overflow-hidden">
        <div id="ixigo-pdf-template" className="w-[800px] bg-white text-black font-sans pb-10">
          
          {/* HEADER ROW */}
          <div className="flex justify-between items-start p-8 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-500 mb-1">Booking Id:</p>
              <p className="text-xl font-bold text-slate-900">{ticket.bookingId || ticket.orderId || 'IF26041438871696'}</p>
            </div>
            <div className="bg-[#ff4f4f] text-white font-bold text-3xl px-5 py-2 rounded-lg tracking-tight">
              RoutripO
            </div>
          </div>

          {/* FLIGHT INFO BLOCK */}
          <div className="px-8 py-6">
             <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-4">
               <div className="border border-slate-200 rounded text-center px-4 py-1">
                 <p className="text-xs font-bold bg-slate-200 uppercase px-2 py-0.5 rounded-sm mb-1">{travelDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
                 <p className="text-lg font-black">{travelDate.getDate()}</p>
                 <p className="text-[10px] uppercase">{travelDate.toLocaleDateString('en-US', { weekday: 'short' })}</p>
               </div>
               <div>
                 <h2 className="text-lg text-slate-600 uppercase tracking-widest">{ticket.title || ticket.itemTitle || 'NASHIK TO NEW DELHI'} - CONFIRMED</h2>
                 <p className="text-sm font-medium text-slate-500">{ticket.provider || 'IndiGo 6E-6636 - Economy'} • {ticket.duration || '1h 55m'}</p>
               </div>
             </div>

             <div className="flex justify-between items-center py-4">
               <div className="w-1/3">
                 <h3 className="text-3xl font-black">{ticket.travelTime ? ticket.travelTime.split('-')[0].trim() : '21:00'}</h3>
                 <p className="text-sm font-medium text-slate-600">{travelDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                 <p className="text-xs font-bold text-slate-400 mt-1">{ticket.departureInfo || 'Nashik Ozar Airport'}</p>
               </div>
               <div className="w-1/3 flex flex-col items-center">
                 <p className="text-sm font-bold bg-white px-3 relative z-10">{ticket.duration || '1h 55m'}</p>
                 <div className="w-full h-px bg-slate-300 -mt-2.5 mb-2 relative"><span className="absolute right-[-4px] top-[-4px] border-solid border-l-4 border-t-4 border-b-4 border-transparent border-l-slate-300"></span></div>
               </div>
               <div className="w-1/3 text-right">
                 <h3 className="text-3xl font-black">{ticket.travelTime ? ticket.travelTime.split('-')[1]?.trim() : '22:55'}</h3>
                 <p className="text-sm font-medium text-slate-600">{travelDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                 <p className="text-xs font-bold text-slate-400 mt-1">{ticket.arrivalInfo || 'Indira Gandhi International Airport'}</p>
                 <p className="text-xs font-black text-slate-800">Terminal 1</p>
               </div>
             </div>
          </div>

          {/* BAGGAGE */}
          <div className="bg-slate-100 mx-8 p-4 rounded mb-8">
            <h4 className="text-sm font-black mb-1">Baggage Allowance</h4>
            <p className="text-xs text-slate-700">Check-in: {ticket.baggage?.checkin || '15 kg per piece'} , Cabin: {ticket.baggage?.cabin || '7 kg per piece'}</p>
          </div>

          {/* PASSENGERS TABLE */}
          <div className="px-8">
            <table className="w-full text-left border-t border-slate-200">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2 px-2 text-sm font-black">Barcode</th>
                  <th className="py-2 px-2 text-sm font-black">Travellers</th>
                  <th className="py-2 px-2 text-sm font-black">PNR</th>
                  <th className="py-2 px-2 text-sm font-black">Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passengers.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-3 px-2">
                      <Barcode value={ticket.pnr || ticket.bookingId || 'RT123456'} width={1} height={30} displayValue={false} margin={0} />
                    </td>
                    <td className="py-3 px-2 text-sm font-medium">{p.name}</td>
                    <td className="py-3 px-2 text-sm font-medium">{ticket.pnr || 'KEEGKX'}</td>
                    <td className="py-3 px-2 text-sm font-medium">{p.seat || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD-ONS */}
          <div className="px-8 mt-6">
            <h4 className="text-lg font-black mb-4 border-b border-slate-200 pb-2">Important Information</h4>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-2">
              <li>You have paid ₹{(ticket.pricing?.total || ticket.totalAmount || 0).toLocaleString('en-IN')}</li>
              <li>For any queries or communication regarding this booking, please use your Booking ID.</li>
              <li>Please note that for all domestic flights, check-in counters close 60 minutes prior to flight departure.</li>
              <li>Travellers must present a valid photo ID proof to enter the airport and at the time of check-in.</li>
              <li>Kindly carry either a copy of your e-ticket on a tablet/mobile/laptop or a printed copy.</li>
            </ul>
          </div>

          <div className="px-8 mt-6">
            <h4 className="text-lg font-black mb-4 border-b border-slate-200 pb-2">Cancellation Information</h4>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-2">
              <li>To initiate booking cancellation, please visit the 'My Trips' section.</li>
              <li>Please note that in case of booking cancellation, both the airline and RoutripO will charge a cancellation fee.</li>
              <li>If the flight is cancelled by the airline, please initiate your refund request via RoutripO.</li>
            </ul>
          </div>

          <div className="px-8 mt-10 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> RoutripO Support: www.routripo.com/help</div>
             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Airline Support: 0124-6173838</div>
          </div>
        </div>
      </div>
`;
content = content.replace('        {/* PRINTABLE AREA */}', ixigoTemplate + '\n        {/* PRINTABLE AREA */}');
fs.writeFileSync('src/components/views/MyTicketsView.tsx', content);
