import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Clock, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useCurrency } from '../components/booking/useCurrency';

export const FlightResultsPage: React.FC<{ flights: any[], onSelect: (flight: any) => void }> = ({ flights, onSelect }) => {
  const { formatToINRDisplay, convertToINR } = useCurrency();
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);

  // Grouping logic: group by first flight number
  const groupedFlights = flights.reduce((acc: any, flight: any) => {
    const key = flight.slices[0].segments[0].flight_number;
    if (!acc[key]) acc[key] = { main: flight, offers: [] };
    acc[key].offers.push(flight);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-4">
      {Object.values(groupedFlights).map((group: any) => {
        const cheapestOffer = group.offers.reduce((prev: any, curr: any) => 
          parseFloat(curr.total_amount) < parseFloat(prev.total_amount) ? curr : prev
        );
        
        return (
          <div key={group.main.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">{group.main.slices[0].segments[0].flight_number}</h3>
                <p className="text-sm text-slate-500">₹{formatToINRDisplay(convertToINR(cheapestOffer.total_amount, cheapestOffer.total_currency))}</p>
              </div>
              <button 
                onClick={() => setSelectedFlight(group)}
                className="bg-rose-600 text-white py-2 px-4 rounded-lg font-bold"
              >
                View Fares
              </button>
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {selectedFlight && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-white p-6 z-50 overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Select Fare Plan</h2>
            {selectedFlight.offers.map((offer: any) => (
              <div key={offer.id} className="border p-4 rounded-lg mb-3">
                <h4 className="font-bold">{offer.fare_name || 'Standard'}</h4>
                <p className="text-lg font-bold mb-2">₹{formatToINRDisplay(convertToINR(offer.total_amount, offer.total_currency))}</p>
                <button onClick={() => onSelect(offer)} className="w-full bg-pink-600 text-white py-2 rounded-lg font-bold">
                  Select
                </button>
              </div>
            ))}
            <button onClick={() => setSelectedFlight(null)} className="text-slate-500 mt-4 underline">Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
