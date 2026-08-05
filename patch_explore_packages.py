import re

with open('src/components/views/ExplorePackagesView.tsx', 'r') as f:
    content = f.read()

# Add Bargain Modal State
state_str = """  const [searchQuery, setSearchQuery] = useState<string>('');"""
state_repl = """  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bargain Feature State
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [selectedBargainPkg, setSelectedBargainPkg] = useState<TourPackage | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [bargainSuccess, setBargainSuccess] = useState(false);

  const handleOpenBargain = (pkg: TourPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBargainPkg(pkg);
    setBargainModalOpen(true);
    setBargainSuccess(false);
    setOfferPrice('');
    setOfferMsg('');
  };

  const handleSubmitBargain = () => {
    setBargainSuccess(true);
    setTimeout(() => {
      setBargainModalOpen(false);
    }, 3000);
  };
"""

content = content.replace(state_str, state_repl)

# Add "Make an Offer" button next to "Book Now"
btn_str = """                      <CreditCard className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>"""
                    
btn_repl = """                      <CreditCard className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenBargain(pkg, e)}
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>वाटाघाटी करा</span>
                    </button>"""
content = content.replace(btn_str, btn_repl)

# Also in modal
modal_btn_str = """                  <CreditCard className="w-4 h-4" />
                  <span>Book Now (Pay Online)</span>
                </button>"""

modal_btn_repl = """                  <CreditCard className="w-4 h-4" />
                  <span>Book Now (Pay Online)</span>
                </button>
                <button
                  onClick={() => handleOpenBargain(selectedModalPackage)}
                  className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>वाटाघाटी करा (Make an Offer)</span>
                </button>"""
content = content.replace(modal_btn_str, modal_btn_repl)

# Add Bargain Modal to the end of the file
end_str = """    </div>
  );
};"""

end_repl = """

      {/* Bargain Modal */}
      {bargainModalOpen && selectedBargainPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !bargainSuccess && setBargainModalOpen(false)} />
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {bargainSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white">Offer Sent!</h3>
                <p className="text-sm text-slate-400">
                  Your offer of ₹{offerPrice} for {selectedBargainPkg.title} has been sent to top-rated agents. They will contact you shortly if accepted.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-400" />
                      वाटाघाटी करा (Negotiate)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Submit your counter-offer directly to the agent.</p>
                  </div>
                  <button onClick={() => setBargainModalOpen(false)} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Original Price</p>
                    <p className="text-xl font-black text-white flex items-center gap-2">
                      ₹{selectedBargainPkg.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">My Offer Price (₹)</label>
                      <input 
                        type="number" 
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder={`e.g. ${selectedBargainPkg.price - 2000}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Short Message (Optional)</label>
                      <textarea 
                        value={offerMsg}
                        onChange={(e) => setOfferMsg(e.target.value)}
                        placeholder="I'm looking to book immediately if we can agree on this price..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitBargain}
                    disabled={!offerPrice}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Submit Offer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
"""
content = content.replace(end_str, end_repl)

with open('src/components/views/ExplorePackagesView.tsx', 'w') as f:
    f.write(content)

