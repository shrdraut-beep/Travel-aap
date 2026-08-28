import React, { useState } from 'react';
import { 
  PlusCircle, 
  Tag, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Edit3, 
  Power, 
  RotateCcw, 
  Compass as Sparkles, 
  Calendar, 
  DollarSign, 
  Layers,
  Search,
  Eye,
  Megaphone
} from 'lucide-react';
import { useOfferStore } from '../../store/useOfferStore';
import { Offer, OfferCategory, OfferTabContext } from '../../types';

const SAMPLE_PRESET_IMAGES = [
  { label: 'Private Pool Villa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Group Cab / SUV', url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Flight Takeoff', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Luxury Resort', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Heritage Stay', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80' },
];

export const AdOfferManager: React.FC = () => {
  const { offers, addOffer, updateOffer, toggleOfferActive, deleteOffer, resetOffers } = useOfferStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Fields as requested
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESET_IMAGES[0].url);
  const [category, setCategory] = useState<OfferCategory>('Banner');
  const [targetTab, setTargetTab] = useState<OfferTabContext>('hub');
  const [couponCode, setCouponCode] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [validTill, setValidTill] = useState('31 Aug 2026');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl(SAMPLE_PRESET_IMAGES[0].url);
    setCategory('Banner');
    setTargetTab('hub');
    setCouponCode('');
    setDiscountBadge('');
    setValidTill('31 Aug 2026');
    setIsActive(true);
  };

  const handleEditClick = (offer: Offer) => {
    setEditingId(offer.id);
    setTitle(offer.title);
    setSubtitle(offer.subtitle);
    setImageUrl(offer.imageUrl);
    setCategory(offer.category);
    setTargetTab(offer.targetTab || 'hub');
    setCouponCode(offer.couponCode || '');
    setDiscountBadge(offer.discountBadge || '');
    setValidTill(offer.validTill || '31 Aug 2026');
    setIsActive(offer.isActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert("Please provide a Title and Image URL.");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || title.trim(),
      imageUrl: imageUrl.trim(),
      category,
      targetTab,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
      discountBadge: discountBadge.trim() || undefined,
      validTill: validTill.trim() || '31 Aug 2026',
      isActive
    };

    if (editingId) {
      updateOffer(editingId, payload);
      alert("Promotion updated! HubScreen banner carousel refreshed.");
    } else {
      addOffer(payload);
      alert("New offer published! Active promotions now live on HubScreen's carousel.");
    }

    resetForm();
  };

  const categoriesList: OfferCategory[] = [
    'Banner',
    'Bank Offers',
    'Flights',
    'Hotels',
    'Cabs',
    'Flagship Store',
    'Pocket Friendly'
  ];

  const filteredList = offers.filter(o => {
    const matchesCategory = filterCategory === 'All' || o.category === filterCategory;
    const matchesSearch = o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.couponCode && o.couponCode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Megaphone className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black">Ad & Offer Manager</h2>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Live Hub Carousel Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
            Publish, edit, and toggle promotional banners, coupon codes, and deal cards displayed directly on the traveler HubScreen banner carousel.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            {editingId ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <PlusCircle className="w-5 h-5 text-rose-600" />}
            {editingId ? 'Edit Active Promotion' : 'Create New Promotion / Offer Banner'}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              type="button"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ad / Promotion Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Group Trip Villa Pass"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            </div>

            {/* Target Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as OfferCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                Image URL *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
                required
              />

              {/* Presets */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Sample Images:</span>
                {SAMPLE_PRESET_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold text-slate-600 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. GROUPVILLA or FLAT25"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Target Tab Context */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target App Screen
              </label>
              <select
                value={targetTab}
                onChange={(e) => setTargetTab(e.target.value as OfferTabContext)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="hub">🏠 Hub / Active Trip Screen</option>
                <option value="all-trips">🌍 All Trips & Explore Screen</option>
                <option value="planning">🗺️ Trip Planner Screen</option>
                <option value="booking">✈️ Flight & Hotel Search Screen</option>
                <option value="social">📸 Social & Memories Screen</option>
                <option value="expenses">💰 Expense & Split Screen</option>
                <option value="all">🌟 All Screens</option>
              </select>
            </div>

            {/* Subtitle / Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Offer Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Flat 25% OFF on 3BHK & 4BHK Private Pool Villas for groups"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Discount Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Discount Badge Tag
              </label>
              <input
                type="text"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                placeholder="e.g. FLAT 25% OFF or ZERO FEE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Validity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Valid Till
              </label>
              <input
                type="text"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
                placeholder="e.g. 31 Aug 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Active Toggle */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-xs font-bold text-slate-800">
                {isActive ? 'Active Promotion (Live on Hub Carousel)' : 'Inactive Promotion (Draft / Hidden)'}
              </span>
            </div>

          </div>

          {/* Hub Carousel Live Preview */}
          {title && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-white">
              <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                HubScreen Banner Carousel Live Preview
              </div>
              <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-700">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent p-4 flex flex-col justify-between text-white">
                  <div className="space-y-1 max-w-[75%]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                      <Sparkles className="w-2.5 h-2.5 text-slate-950" />
                      {discountBadge || 'SPECIAL OFFER'}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base leading-tight text-white">{title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{subtitle || title}</p>
                  </div>
                  {couponCode && (
                    <div className="inline-flex items-center gap-1.5 self-start bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[11px] font-mono font-bold text-amber-300">
                      <Tag className="w-3 h-3 text-amber-400" />
                      CODE: {couponCode.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Save & Update Promotion' : 'Publish to Hub Carousel'}
            </button>
          </div>

        </form>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Active Promotions ({filteredList.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Toggle or edit live offers rendered on HubScreen and category tabs.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => {
                if (confirm("Reset all offer banners back to defaults?")) {
                  resetOffers();
                }
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset default offers"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs font-bold text-slate-500">
              No promotions match your search or filter.
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.isActive
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-100 text-slate-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                        Tab: {item.targetTab || 'hub'}
                      </span>
                      {item.couponCode && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                          Code: {item.couponCode}
                        </span>
                      )}
                      {item.discountBadge && (
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                          {item.discountBadge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 truncate mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleOfferActive(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>

                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    title="Edit Promotion"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete promotion "${item.title}"?`)) {
                        deleteOffer(item.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
                    title="Delete Promotion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
