import React, { useState, useEffect } from 'react';
import { TripBidRequest } from '../../types';
import { AlertCircle, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';

interface DealManagerViewProps {
  role: 'user' | 'vendor';
  userId: string;
}

export const DealManagerView: React.FC<DealManagerViewProps> = ({ role, userId }) => {
  const [deals, setDeals] = useState<TripBidRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      // In a real app, we'd fetch only deals matching the user/vendor and have unlocked status
      const res = await fetch('/api/bids/requests').then(r => r.json()); 
      if (res.success) {
        setDeals(res.requests.filter((r: any) => 
          role === 'user' ? r.userId === userId : true 
          // For vendor, would filter by vendorId
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (tripRequestId: string, status: 'Deal Finalized Offline' | 'Deal Cancelled' | 'Report Issue') => {
    try {
      await fetch('/api/bids/deal-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripRequestId, status }) });
      fetchDeals();
    } catch (e) {
      alert("Error updating deal status.");
    }
  };

  if (loading) return <div className="p-4 text-xs text-slate-500 text-center">Loading Deals...</div>;

  const unlockedDeals = deals.filter(d => true); // In a real app, only show deals where contact was unlocked.

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <h2 className="text-xl font-black mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          Offline Deal Manager
        </h2>
        <p className="text-xs text-slate-400">
          Track trips where direct contact was unlocked. Since these are settled outside platform escrow, 
          you must manually log the final outcome here for reputation tracking and issue reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unlockedDeals.length === 0 ? (
          <p className="text-slate-500 text-xs">No unlocked deals found.</p>
        ) : (
          unlockedDeals.map(deal => (
            <div key={deal.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{deal.origin} <ArrowRight className="inline w-3 h-3 mx-1" /> {deal.destination}</h3>
                  <p className="text-xs text-slate-500 mt-1">Trip ID: {deal.id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  deal.offlineDealStatus === 'Deal Finalized Offline' ? 'bg-emerald-100 text-emerald-700' :
                  deal.offlineDealStatus === 'Deal Cancelled' ? 'bg-red-100 text-red-700' :
                  deal.offlineDealStatus === 'Report Issue' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {deal.offlineDealStatus || 'PENDING LOG'}
                </span>
              </div>

              {!deal.offlineDealStatus && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => updateDealStatus(deal.id, 'Deal Finalized Offline')}
                    className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Deal Finalized Offline
                  </button>
                  <button 
                    onClick={() => updateDealStatus(deal.id, 'Deal Cancelled')}
                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Deal Cancelled
                  </button>
                  <button 
                    onClick={() => updateDealStatus(deal.id, 'Report Issue')}
                    className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" /> Report Issue (Fraud/No-Show)
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
