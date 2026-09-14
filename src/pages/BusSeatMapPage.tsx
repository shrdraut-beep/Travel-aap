import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Armchair, Circle, ArrowRight, User } from 'lucide-react';

export const BusSeatMapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bus: any; searchParams: any };
  const bus = state?.bus;

  const [layout, setLayout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  useEffect(() => {
    if (!bus?.id) {
      setIsLoading(false);
      return;
    }
    const fetchLayout = async () => {
      try {
        const res = await fetch('/api/buses/seatlayout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ busId: bus.id })
        });
        const data = await res.json();
        if (data.success && data.layout) {
          setLayout(data.layout);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayout();
  }, [bus]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  const renderDeck = (seats: any[]) => {
    if (!seats || seats.length === 0) return null;
    
    // Group by row
    const rows: { [key: number]: any[] } = {};
    seats.forEach(s => {
      if (!rows[s.row]) rows[s.row] = [];
      rows[s.row].push(s);
    });

    const maxRows = Math.max(...Object.keys(rows).map(Number));

    return (
      <div className="bg-white rounded-[30px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100 max-w-sm mx-auto relative overflow-hidden">
        {/* Steering Wheel Icon for Lower Deck Front */}
        {activeDeck === 'lower' && (
          <div className="absolute top-6 right-6 text-slate-300">
            <Circle className="w-8 h-8" />
          </div>
        )}
        <div className="mt-12 space-y-4">
          {Array.from({ length: maxRows }).map((_, rIdx) => {
             const rowSeats = rows[rIdx + 1] || [];
             return (
               <div key={rIdx} className="flex justify-between items-center gap-6">
                 {/* Left Side (Col 1 & 2) */}
                 <div className="flex gap-2">
                    {[1, 2].map(col => {
                      const seat = rowSeats.find(s => s.col === col);
                      if (!seat) return <div key={col} className="w-10 h-16" />; // empty space
                      
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <button
                          key={seat.id}
                          disabled={!seat.isAvailable}
                          onClick={() => toggleSeat(seat.id)}
                          className={`
                            relative w-10 h-16 rounded-lg border-2 flex items-center justify-center transition-all
                            ${!seat.isAvailable ? 'bg-slate-200 border-slate-200 cursor-not-allowed' : 
                              isSelected ? 'bg-pink-600 border-pink-600 text-white shadow-md' : 'bg-white border-slate-300 hover:border-pink-400'}
                          `}
                        >
                          <div className={`absolute -top-1 w-6 h-2 rounded-t-md ${isSelected ? 'bg-pink-500' : 'bg-slate-200'}`} />
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>{seat.seatNumber}</span>
                        </button>
                      )
                    })}
                 </div>

                 {/* Aisle */}
                 <div className="flex-1"></div>

                 {/* Right Side (Col 4) */}
                 <div className="flex gap-2">
                    {[4].map(col => {
                      const seat = rowSeats.find(s => s.col === col);
                      if (!seat) return <div key={col} className="w-10 h-16" />;
                      
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <button
                          key={seat.id}
                          disabled={!seat.isAvailable}
                          onClick={() => toggleSeat(seat.id)}
                          className={`
                            relative w-10 h-16 rounded-lg border-2 flex items-center justify-center transition-all
                            ${!seat.isAvailable ? 'bg-slate-200 border-slate-200 cursor-not-allowed' : 
                              isSelected ? 'bg-pink-600 border-pink-600 text-white shadow-md' : 'bg-white border-slate-300 hover:border-pink-400'}
                          `}
                        >
                          <div className={`absolute -top-1 w-6 h-2 rounded-t-md ${isSelected ? 'bg-pink-500' : 'bg-slate-200'}`} />
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>{seat.seatNumber}</span>
                        </button>
                      )
                    })}
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * (bus?.fare || 1200);

  return (
    <div className="min-h-screen  pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-6 rounded-b-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div className="text-center">
             <h1 className="text-base font-bold text-slate-900">{bus?.name || 'Bus'}</h1>
             <p className="text-xs text-slate-500 font-medium">{bus?.busNumber}</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Deck Switcher */}
        {layout?.upperDeck?.length > 0 && (
          <div className="flex bg-slate-100 p-1 rounded-full max-w-[200px] mx-auto mt-2">
            <button 
              onClick={() => setActiveDeck('lower')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeDeck === 'lower' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              Lower
            </button>
            <button 
              onClick={() => setActiveDeck('upper')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${activeDeck === 'upper' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              Upper
            </button>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-center gap-6 mb-6 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-300 rounded bg-white"></div> Available</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200"></div> Booked</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-pink-600"></div> Selected</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          </div>
        ) : (
          renderDeck(activeDeck === 'lower' ? layout?.lowerDeck : layout?.upperDeck)
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-between items-center max-w-lg mx-auto">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">{selectedSeats.length} Seat(s) Selected</p>
              <div className="text-xl font-black text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</div>
            </div>
            <button 
              onClick={() => alert('Proceeding to checkout with seats: ' + selectedSeats.join(', '))}
              className="bg-pink-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center gap-2"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
