const fs = require('fs');

const file = fs.readFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', 'utf8');

const regex = /(<div id="ticketContainer"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<div className="flex gap-3">)/;

const match = file.match(regex);
if (!match) {
  console.log("Not found!");
  process.exit(1);
}

const openTag = match[1];
const innerHtml = match[2];
const closeTag = match[3];

const hotelHtml = `
                    {completedBooking.type === 'hotel' ? (
                      <>
                        {/* --- HOTEL PAGE 1: BOOKING CONFIRMATION --- */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-[#f25c3b] text-white font-black text-3xl px-5 py-2 rounded shadow-md tracking-tight">
                            RouTripO
                          </div>
                          <div className="text-right">
                            <h1 className="text-4xl font-black text-red-600 mb-1">Booking Confirmation</h1>
                            <p className="text-xs font-bold text-slate-600">Please present either an electronic or paper copy of your booking confirmation upon check-in.</p>
                          </div>
                        </div>

                        {/* Top red/gray dotted border decoration */}
                        <div className="flex h-4 mb-6">
                          <div className="w-1/6 bg-slate-400"></div>
                          <div className="w-1/6 bg-slate-300"></div>
                          <div className="w-1/6 bg-slate-200"></div>
                          <div className="w-1/6 bg-slate-300"></div>
                          <div className="w-1/6 bg-slate-400"></div>
                          <div className="w-1/6 bg-slate-500"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-medium border border-slate-300 p-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex"><span className="w-40 text-slate-600">Booking ID :</span> <span className="font-bold text-slate-900">{completedBooking.bookingId || completedBooking.orderId}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Client :</span> <span className="font-bold text-slate-900">{completedBooking.customer?.name}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Country of Residence :</span> <span className="font-bold text-slate-900">India</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Property :</span> <span className="font-bold text-slate-900">{completedBooking.itemTitle || completedBooking.title}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600">Address :</span> <span className="font-bold text-slate-900">Destination location provided at checkout</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Number of Rooms :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">{completedBooking.quantity}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Number of Adults :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">{completedBooking.quantity * 2}</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Room Type :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">Deluxe</span></div>
                            <div className="flex"><span className="w-40 text-slate-600 bg-slate-100 px-2 py-1">Promotion :</span> <span className="font-bold text-slate-900 flex-1 bg-slate-100 px-2 py-1 text-center">Standard Deal</span></div>
                          </div>
                        </div>

                        <div className="bg-slate-200 text-slate-800 p-2 text-xs font-medium mb-1">
                          Cancellation Policy: Any cancellation received within 1 day prior to arrival date will incur the first night charge. Failure to arrive at your hotel or property will be treated as a No-Show and will incur the first night charge.
                        </div>
                        <div className="bg-slate-200 text-slate-800 p-2 text-xs font-medium mb-4">
                          Benefits Included: Express check-in, Breakfast available, Free WiFi, Parking, Drinking water
                        </div>

                        <div className="border border-slate-300 p-4 mb-4 grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Arrival :</span>
                            <span className="bg-slate-200 px-4 py-1 text-sm font-bold text-center flex-1">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">Departure :</span>
                            <span className="bg-slate-200 px-4 py-1 text-sm font-bold text-center flex-1">
                              {(() => {
                                const d = new Date(completedBooking.date || completedBooking.travelDate);
                                d.setDate(d.getDate() + (completedBooking.quantity || 1));
                                return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="border border-slate-300 p-4 mb-4 grid grid-cols-2 gap-4">
                           <div className="space-y-4">
                             <div>
                               <p className="font-bold text-sm mb-2">Payment Details :</p>
                               <div className="flex gap-2 text-sm">
                                  <span className="bg-slate-200 px-2 py-1">Payment Method : -</span>
                                  <span className="bg-slate-200 px-2 py-1">Card No : -</span>
                                  <span className="bg-slate-200 px-2 py-1">EXP : -</span>
                               </div>
                             </div>
                             <div>
                               <p className="font-bold text-sm mb-1">Booked And Payable By :</p>
                               <p className="text-xs text-slate-600">RouTripO Company Pte, Ltd.<br/>30 Cecil Street, Prudential Tower #19-08,<br/>Singapore 049712</p>
                             </div>
                           </div>
                           <div className="flex flex-col justify-end items-end">
                             <div className="font-[cursive] text-4xl text-blue-800 font-black -rotate-6 mb-2">@RoutripO</div>
                             <div className="border-t border-slate-800 pt-1 text-xs font-bold text-center w-48">Authorized Stamp & Signature</div>
                           </div>
                        </div>

                        <div className="mb-4 text-xs font-medium space-y-1">
                          <p className="font-bold text-sm">Remarks :</p>
                          <p>Included : Taxes and fees INR {Math.round((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.18)}</p>
                          <p>NonSmoke, TwinBeds</p>
                          <p className="font-bold mt-2">All special requests are subject to availability upon arrival</p>
                        </div>
                        
                        <div className="border border-slate-800 p-4">
                          <p className="font-bold text-sm text-slate-900 mb-2">Notes</p>
                          <ul className="list-disc pl-4 text-[10px] space-y-1 text-slate-800 font-medium">
                            <li><span className="text-red-600 font-bold">IMPORTANT:</span> At check-in, you must present a valid photo ID with your address confirming the same name as the lead guest on the booking.</li>
                            <li>All rooms are guaranteed on the day of arrival. In the case of a no-show, your room(s) will be released and you will be subject to the terms and conditions of the Cancellation/No-Show Policy.</li>
                            <li>The total price for this booking does not include mini-bar items, telephone usage, laundry service, etc. The property will bill you directly.</li>
                          </ul>
                        </div>

                        {/* PAGE BREAK FOR PDF */}
                        <div style={{ pageBreakBefore: 'always' }} className="my-16 border-t-4 border-dashed border-slate-200"></div>

                        {/* --- HOTEL PAGE 2: TAX INVOICE --- */}
                        <div className="flex justify-between items-start mb-12">
                          <h1 className="text-3xl font-black text-slate-800">Tax Invoice</h1>
                          <div className="w-[300px] border border-slate-200 p-4 text-xs text-slate-500 space-y-1 bg-slate-50">
                            <div className="flex justify-between"><span>Transaction Category:</span> <span className="font-bold text-slate-700">B2C</span></div>
                            <div className="flex justify-between"><span>Transaction Detail:</span> <span className="font-bold text-slate-700">RG</span></div>
                            <div className="flex justify-between"><span>Date:</span> <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')}</span></div>
                            <div className="flex justify-between"><span>Invoice No.</span> <span className="font-bold text-slate-700">M23HL{Math.floor(Math.random() * 100000)}</span></div>
                            <div className="flex justify-between"><span>Place Of Supply:</span> <span className="font-bold text-slate-700">Maharashtra</span></div>
                            <div className="flex justify-between"><span>Booking ID:</span> <span className="font-bold text-slate-700">{completedBooking.bookingId || completedBooking.orderId}</span></div>
                          </div>
                        </div>

                        <div className="flex items-start mb-8 gap-12">
                           <QrCode className="w-32 h-32 text-slate-800" />
                        </div>

                        <div className="grid grid-cols-2 text-sm border border-slate-300">
                          <div className="p-4 border-r border-slate-300">
                            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Customer Information</h3>
                            <div className="space-y-4">
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Hotel Name</p>
                                <p className="font-bold text-slate-800">{completedBooking.itemTitle || completedBooking.title}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Check-in Date</p>
                                <p className="font-bold text-slate-800">{new Date(completedBooking.date || completedBooking.travelDate).toLocaleDateString('en-GB')}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Check-out Date</p>
                                <p className="font-bold text-slate-800">
                                  {(() => {
                                    const d = new Date(completedBooking.date || completedBooking.travelDate);
                                    d.setDate(d.getDate() + (completedBooking.quantity || 1));
                                    return d.toLocaleDateString('en-GB');
                                  })()}
                                </p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Customer Name</p>
                                <p className="font-bold text-slate-800">{completedBooking.customer?.name}</p>
                              </div>
                              <div className="border-b border-slate-200 pb-2">
                                <p className="text-xs text-slate-400">Customer Gstin</p>
                                <p className="font-bold text-slate-800">UNREGISTERED</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Payment Breakup</h3>
                            <div className="space-y-4 text-slate-800">
                              <div className="flex justify-between font-medium">
                                <span>Accommodation Charges</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.88).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>IGST @ 0.0%</span>
                                <span>INR 0.0</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>CGST @ 6.0%</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.06).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>SGST @ 6.0%</span>
                                <span>INR {((completedBooking.totalAmount || completedBooking.finalPayableAmount || 0) * 0.06).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg bg-[#f6f2a6] p-3 mt-4 rounded border border-[#e5df88]">
                                <span>Total Invoice Value</span>
                                <span>INR {(completedBooking.totalAmount || completedBooking.finalPayableAmount || 0).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 text-[10px] text-slate-500 leading-relaxed text-justify">
                          *Hotel is the primary service provider of accommodation services. RouTripO Pvt. Ltd. acts only as an intermediary for reservation of accommodation services. GST on accommodation services is collected and remitted by RouTripO Pvt. Ltd. in the capacity of E-commerce operator as per section 9(5) of the Central Goods and Services Act, 2017 and respective State GST Act. This invoice has been issued by RouTripO Pvt. Ltd. only with a limited purpose to comply with legal obligations as an e-commerce operator under GST law.
                          <br/><br/>
                          This is a computer generated Invoice and does not require Signature/Stamp.
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-slate-600 border-t border-slate-200 pt-8">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <p className="text-slate-400 mb-1">PAN</p>
                               <p className="font-bold text-slate-700">AADCM5146R</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">GST NUMBER</p>
                               <p className="font-bold text-slate-700">23AADCM5146R1Z3</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">HSN/SAC</p>
                               <p className="font-bold text-slate-700">996311</p>
                             </div>
                             <div>
                               <p className="text-slate-400 mb-1">Service Description</p>
                               <p className="font-bold text-slate-700">Accommodation Services</p>
                             </div>
                             <div className="col-span-2">
                               <p className="text-slate-400 mb-1">CIN</p>
                               <p className="font-bold text-slate-700">U63040HR2000PTC090846</p>
                             </div>
                          </div>
                        </div>

                        <div className="mt-8 border-t border-slate-300 pt-8 flex gap-12 text-xs">
                          <div className="bg-[#f25c3b] text-white font-black text-3xl px-4 py-2 self-start rounded">
                            RouTripO
                          </div>
                          <div>
                             <p className="font-black text-slate-800 mb-2">RouTripO Private Limited</p>
                             <p className="text-slate-500">Nishank Workspace Pvt Ltd Cabin No P-6<br/>3rd Floor Plot No.74 MP Nagar Zone-2 Tehsil<br/>Huzur Bhopal MP<br/>Madhya Pradesh 452003</p>
                          </div>
                          <div>
                             <p className="font-black text-slate-800 mb-2">REGISTERED OFFICE</p>
                             <p className="text-slate-500">19th Floor, Epitome Building No. 5, DLF<br/>Cyber City,<br/>DLF Phase III<br/>Gurugram-122002, Haryana</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        ${innerHtml}
                      </>
                    )}
`;

const newFile = file.replace(regex, `${openTag}${hotelHtml}${closeTag}`);
fs.writeFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', newFile);

console.log("Replaced successfully!");
