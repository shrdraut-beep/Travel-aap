const fs = require('fs');
let code = fs.readFileSync('src/components/views/MyTicketsView.tsx', 'utf8');

const regex = /<div id="ixigo-pdf-template" className="w-\[800px\] bg-white text-black font-sans pb-10">[\s\S]*?{ticket\.baggage\?.cabin \|\| '7 kg per piece'\}<\/p>\n          <\/div>/;

const newTemplate = `<div id="ixigo-pdf-template" className="w-[800px] bg-white text-black font-sans pb-10">
          {/* HEADER ROW */}
          <div className="flex justify-between items-start p-8 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-500 mb-1">Booking Id:</p>
              <p className="text-xl font-bold text-slate-900">{ticket.bookingId || ticket.orderId || 'IF26041438871696'}</p>
            </div>
            <div>
              <img src="/routripo_brand_logo.svg" alt="RoutripO" className="h-10" />
            </div>
          </div>

          {/* FLIGHT/HOTEL INFO BLOCK */}
          <div className="px-8 py-6">
             <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-4">
               <div className="border border-slate-200 rounded text-center px-4 py-1">
                 <p className="text-xs font-bold bg-slate-200 uppercase px-2 py-0.5 rounded-sm mb-1">{travelDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</p>
                 <p className="text-lg font-black">{travelDate.getDate()}</p>
                 <p className="text-[10px] uppercase">{travelDate.toLocaleDateString('en-US', { weekday: 'short' })}</p>
               </div>
               <div>
                 <h2 className="text-lg text-slate-600 uppercase tracking-widest">{ticket.title || ticket.itemTitle || 'Booking'} - {ticket.status || 'CONFIRMED'}</h2>
                 <p className="text-sm font-medium text-slate-500">{ticket.provider || (ticket.vertical === 'flight' ? 'IndiGo' : 'RoutripO Booking')} • QTY: {ticket.quantity || 1}</p>
               </div>
             </div>

             {(ticket.vertical === 'flight' || ticket.vertical === 'train' || ticket.vertical === 'bus') ? (
               <div className="flex justify-between items-center py-4">
                 <div className="w-1/3">
                   <h3 className="text-3xl font-black">{ticket.travelTime ? ticket.travelTime.split('-')[0].trim() : '10:00'}</h3>
                   <p className="text-sm font-medium text-slate-600">{travelDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                   <p className="text-xs font-bold text-slate-400 mt-1">{ticket.departureInfo || 'Source'}</p>
                 </div>
                 <div className="w-1/3 flex flex-col items-center">
                   <p className="text-sm font-bold bg-white px-3 relative z-10">{ticket.duration || 'Travel'}</p>
                   <div className="w-full h-px bg-slate-300 -mt-2.5 mb-2 relative"><span className="absolute right-[-4px] top-[-4px] border-solid border-l-4 border-t-4 border-b-4 border-transparent border-l-slate-300"></span></div>
                 </div>
                 <div className="w-1/3 text-right">
                   <h3 className="text-3xl font-black">{ticket.travelTime ? ticket.travelTime.split('-')[1]?.trim() : '12:00'}</h3>
                   <p className="text-sm font-medium text-slate-600">{travelDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}</p>
                   <p className="text-xs font-bold text-slate-400 mt-1">{ticket.arrivalInfo || 'Destination'}</p>
                 </div>
               </div>
             ) : (
               <div className="flex justify-between items-center py-4">
                 <div className="w-full">
                   <h3 className="text-xl font-black text-slate-800">Booking Details</h3>
                   <p className="text-sm font-medium text-slate-600 mt-2">Date: {travelDate.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                 </div>
               </div>
             )}
          </div>

          {/* BAGGAGE */}
          {(ticket.vertical === 'flight' || ticket.vertical === 'train' || ticket.vertical === 'bus') && (
            <div className="bg-slate-100 mx-8 p-4 rounded mb-8">
              <h4 className="text-sm font-black mb-1">Baggage Allowance</h4>
              <p className="text-xs text-slate-700">Check-in: {ticket.baggage?.checkin || '15 kg per piece'} , Cabin: {ticket.baggage?.cabin || '7 kg per piece'}</p>
            </div>
          )}`;

code = code.replace(regex, newTemplate);

fs.writeFileSync('src/components/views/MyTicketsView.tsx', code);
