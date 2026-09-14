import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Share2, Copy, Compass as  User, Calendar, MapPin, Globe, ArrowRight, Heart, MessageSquare, Download, CloudDownload, X, Eye, Clock, CheckCircle2 } from 'lucide-react';
import { PublicTripTemplate, TransportMode, TripPlan } from '../../types';

interface CommunityHubViewProps {
  lang: string;
  onCloneTemplate: (template: PublicTripTemplate) => void;
  themeColor?: string;
}

export const CommunityHubView: React.FC<CommunityHubViewProps> = ({ lang, onCloneTemplate, themeColor = '#6366f1' }) => {
  const [templates, setTemplates] = useState<PublicTripTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TransportMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PublicTripTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setTemplates([
        {
          id: 'tpl_mock_1',
          name: '3 Days in Goa',
          description: 'A perfect weekend getaway to the beaches of North Goa.',
          days: 3,
          transportMode: 'air',
          itinerary: [],
          tags: ['beach', 'party', 'weekend'],
          authorName: 'TravelGuru',
          authorId: 'usr-42',
          clonesCount: 124,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAITrips = async (destinationToUse?: string) => {
    const dest = destinationToUse || searchQuery.trim();
    if (!dest) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-destination-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest, lang })
      });
      const data = await res.json();
      if (data.success && data.templates?.length > 0) {
        setTemplates(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTpls = data.templates.filter((t: any) => !existingIds.has(t.id));
          return [...newTpls, ...prev];
        });
      }
    } catch (err) {
      console.error("Smart destination template error:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || t.transportMode === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Helper to group itinerary items by day or render structured timeline
  const renderItineraryTimeline = (template: PublicTripTemplate) => {
    if (!template.itinerary || template.itinerary.length === 0) {
      return (
        <div className="bg-transparent border border-slate-200/60 rounded-[20px] p-6 text-center">
          <p className="text-slate-500 font-bold text-sm">
            {lang === 'mr' ? 'तपशीलवार नियोजन उपलब्ध नाही.' : 'No detailed itinerary items available.'}
          </p>
        </div>
      );
    }

    // Group items by day if day property exists, else organize by index
    const daysMap: { [dayNum: number]: TripPlan[] } = {};
    template.itinerary.forEach((item, index) => {
      const dayNum = (item as any).day || Math.floor(index / 2) + 1;
      if (!daysMap[dayNum]) daysMap[dayNum] = [];
      daysMap[dayNum].push(item);
    });

    const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b);

    return (
      <div className="space-y-6">
        {dayNumbers.map((dayNum) => (
          <div key={dayNum} className="bg-transparent/80 rounded-[20px] p-4 border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 bg-premium-sky-deep text-white rounded-lg font-black text-xs flex items-center justify-center">
                D{dayNum}
              </div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                {lang === 'mr' ? `दिवस ${dayNum}` : `Day ${dayNum}`}
              </h4>
            </div>

            <div className="space-y-3 pl-2">
              {daysMap[dayNum].map((plan, idx) => (
                <div key={plan.id || idx} className="flex items-start gap-3 bg-white p-3.5 rounded-[16px] border border-slate-100 shadow-sm">
                  <div className="p-2 bg-premium-sky-soft text-premium-sky-deep rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-extrabold text-slate-900 text-sm truncate">{plan.title}</h5>
                      {plan.cost ? (
                        <span className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft px-2 py-0.5 rounded-md shrink-0">
                          ₹{plan.cost}
                        </span>
                      ) : null}
                    </div>
                    {plan.detail && (
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                        {plan.detail}
                      </p>
                    )}
                    {plan.datetime && (
                      <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                        {(plan as any).time || plan.datetime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-slate-900 pt-16 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-premium-sky-soft0/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] -ml-24 -mb-24" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral/20 rounded-full border border-coral/30 backdrop-blur-md"
          >
            <span className="text-sm font-black text-coral uppercase tracking-widest">
              {lang === 'mr' ? 'सुट्ट्या (Holidays)' : 'Holidays'}
            </span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
            {lang === 'mr' ? 'Holidays Hub' : 'Holidays Hub'}
          </h1>

          <p className="text-slate-300 font-bold text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {lang === 'mr' 
              ? 'सर्वोत्कृष्ट पर्यटन स्थळांच्या तयार सहली पहा किंवा कोणत्याही शोधासाठी ऑटो २-३ नवीन तयार सहली बनवा!' 
              : 'Discover pre-made trips for top destinations or generate custom 2-3 Smart ready trips for any place!'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-6 -mt-8 relative z-20 max-w-4xl mx-auto w-full space-y-5">
        

        <div className="bg-white rounded-[28px] p-2 shadow-2xl shadow-pink-900/10 border border-slate-100 flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-700 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={lang === 'mr' ? 'ठिकाण शोधा (उदा. महाबळेश्वर, गोवा, लडाख)...' : 'Search destination (e.g. Mahabaleshwar, Goa)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateAITrips();
            }}
            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery.trim().length > 0 && (
            <button 
              onClick={() => handleGenerateAITrips()}
              disabled={isGeneratingAI}
              className="px-3.5 py-2.5 premium-gradient hover:from-pink-700 hover:to-pink-800 text-white rounded-[20px] font-black text-xs uppercase tracking-wider shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>{lang === 'mr' ? 'Smart सहल बनवा' : 'Smart Generate'}</span>
            </button>

          )}
        </div>

        {/* Popular Destination Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider shrink-0 mr-1">
            {lang === 'mr' ? 'प्रसिद्ध:' : 'Popular:'}
          </span>
          {['महाबळेश्वर', 'गोवा', 'कोकण', 'लडाख', 'मनाली', 'केरळ', 'उदयपूर'].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSearchQuery(chip);
                const matches = templates.filter(t => t.name.includes(chip) || t.description.includes(chip) || t.tags.includes(chip.toLowerCase()));
                if (matches.length === 0) {
                  handleGenerateAITrips(chip);
                }
              }}
              className="px-3 py-1 bg-white hover:bg-premium-sky-soft border border-slate-200/80 rounded-[16px] font-bold text-xs text-slate-700 hover:text-premium-sky-deep hover:border-premium-sky-deep shrink-0 transition-all shadow-2xs"
            >

              📍 {chip}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {['all', 'road', 'air', 'rail', 'sea'].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveFilter(mode as any)}
              className={`px-5 py-2.5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === mode 
                ? 'bg-premium-sky-deep text-white shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-200' 
                : 'bg-white text-slate-800 border border-slate-200'
              }`}

            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Generating Indicator Banner */}
      {isGeneratingAI && (
        <div className="px-6 mt-4 max-w-4xl mx-auto w-full">
          <div className="premium-gradient text-white rounded-[24px] p-6 shadow-xl border border-premium-sky-deep/30 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-premium-sky-soft0/30 rounded-[20px] flex items-center justify-center shrink-0">
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide text-pink-200">
                {lang === 'mr' ? 'ऑटो सहली बनवत आहे...' : 'Generating Smart Holidays...'}
              </h4>

              <p className="text-xs font-bold text-slate-300 mt-1">
                {lang === 'mr' 
                  ? `'${searchQuery}' साठी २ ते ३ परिपूर्ण दिवस-निहाय वेळापत्रक तयार होत आहे, कृपया क्षणभर थांबा.` 
                  : `Creating 2-3 detailed itineraries for '${searchQuery}', please wait a moment.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="p-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[32px] p-6 h-80 animate-pulse border border-slate-100">
              <div className="w-20 h-4 bg-slate-100 rounded-full mb-4" />
              <div className="w-full h-8 bg-slate-100 rounded-[16px] mb-4" />
              <div className="w-2/3 h-4 bg-slate-100 rounded-full mb-8" />
              <div className="mt-auto w-full h-12 bg-slate-100 rounded-[20px]" />
            </div>
          ))
        ) : (
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedTemplate(template)}
                className="group bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-pink-900/10 transition-all p-6 flex flex-col relative overflow-hidden cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-premium-sky-soft rounded-full">
                    <Calendar className="w-3 h-3 text-premium-sky-deep" />
                    <span className="text-sm font-black text-premium-sky-deep uppercase tracking-widest">
                      {template.days} {lang === 'mr' ? 'दिवस' : 'Days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-500">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span className="text-sm font-black text-slate-800">24</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-premium-sky-deep transition-colors">
                  {template.name}
                </h3>

                <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {template.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-black text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase">
                      {template.authorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <CloudDownload className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{template.clonesCount}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[20px] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    {lang === 'mr' ? 'पहा' : 'View Details'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloneTemplate(template);
                    }}
                    className="flex-1 py-3 bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white rounded-[20px] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-pink-200"
                  >
                    <Copy className="w-4 h-4" />
                    {lang === 'mr' ? 'कॉपी करा' : 'Clone'}
                  </button>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredTemplates.length === 0 && (
          <div className="col-span-full py-12 px-4 text-center space-y-4 bg-white rounded-[32px] border border-slate-200/80 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-premium-sky-soft text-premium-sky-deep rounded-[28px] mx-auto flex items-center justify-center">
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
                {lang === 'mr' ? `'${searchQuery || 'या ठिकाणाची'}' सुट्ट्या सापडल्या नाहीत` : `No holidays found for '${searchQuery || 'this location'}'`}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {lang === 'mr' 
                  ? 'काळजी करू नका! ऑटो या ठिकाणासाठी २ ते ३ परिपूर्ण तयार सहली तयार करा.' 
                  : 'No worries! Generate 2-3 complete ready trips for this destination using AI.'}
              </p>
            </div>
            <button
              onClick={() => handleGenerateAITrips()}
              disabled={isGeneratingAI}
              className="px-6 py-3.5 premium-gradient hover:from-pink-700 hover:to-pink-800 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-200 transition-all active:scale-95"
            >
              {lang === 'mr' ? `ऑटो २-३ तयार सहली बनवा` : `Generate 2-3 Smart Ready Trips`}
            </button>
          </div>
        )}
      </div>

      {/* TRIP TEMPLATE DETAIL MODAL */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white relative">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-premium-sky-soft0/20 text-pink-300 border border-premium-sky-deep/30 rounded-full font-black text-xs uppercase tracking-wider">
                    {selectedTemplate.days} {lang === 'mr' ? 'दिवस सहल' : 'Days Trip'}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full font-black text-xs uppercase tracking-wider">
                    {selectedTemplate.transportMode}
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight">{selectedTemplate.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-premium-sky-deep" /> By {selectedTemplate.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudDownload className="w-3.5 h-3.5 text-premium-sky-deep" /> {selectedTemplate.clonesCount} Clones
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {lang === 'mr' ? 'सहलीबद्दल' : 'About this Trip'}
                  </h4>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-transparent p-4 rounded-[20px] border border-slate-100">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft px-3 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Day by Day Itinerary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {lang === 'mr' ? 'दिवस-निहाय वेळापत्रक (Itinerary)' : 'Day-by-Day Itinerary'}
                  </h4>
                  {renderItineraryTimeline(selectedTemplate)}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-transparent border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-[20px] font-black text-xs uppercase tracking-wider transition-all"
                >
                  {lang === 'mr' ? 'बंद करा' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    onCloneTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 py-3.5 bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-200"
                >
                  <Copy className="w-4 h-4" />
                  {lang === 'mr' ? 'ही सहल कॉपी करा' : 'Clone This Trip'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

