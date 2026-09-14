import React, { useState } from 'react';
import { Compass as  Utensils, Heart, Compass, Wallet, Camera, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TripGroup, TripPlan } from '../../types';

interface SmartAiPromptPresetsProps {
  trip: TripGroup;
  onApplyPreset?: (promptText: string, newActivities?: TripPlan[]) => void;
  onOpenAiPlanner?: () => void;
}

export const SmartAiPromptPresets: React.FC<SmartAiPromptPresetsProps> = ({
  trip,
  onApplyPreset,
  onOpenAiPlanner,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  const presets = [
    {
      id: 'foodie',
      icon: Utensils,
      color: 'bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)] border-transparent',
      titleMr: 'अस्सल स्थानिक फूड व स्ट्रीट फूड ट्रेल',
      titleEn: 'Local Street Food & Authentic Dining Trail',
      descMr: 'स्थानिक प्रसिद्ध खानावळी, चहाचे स्पॉट्स आणि सी-फूड रेस्टॉरंट्स जोडा.',
      descEn: 'Adds famous local thali joints, hidden sunset cafes, and night street food hubs.',
      suggestedPlans: [
        {
          id: `ai_food_1_${Date.now()}`,
          title: isMr ? 'प्रसिद्ध स्थानिक थाळी व सी-फूड जेवण' : 'Famous Traditional Thali & Seafood Lunch',
          detail: isMr ? 'स्थानिक अस्सल मसाल्यांची मेजवानी आणि पारंपरिक पद्धतीचे जेवण.' : 'Authentic regional spices and fresh local delicacies.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T13:30:00`,
          travelTime: '01:30 PM',
          exactLocation: trip.destination || 'City Center',
          realisticCost: '₹450',
          briefDescription: isMr ? 'स्थानिक अस्सल मसाल्यांची मेजवानी आणि पारंपरिक पद्धतीचे जेवण.' : 'Authentic regional spices and fresh local delicacies.',
          type: 'activity' as const,
          cost: 450
        },
        {
          id: `ai_food_2_${Date.now()}`,
          title: isMr ? 'नाईट मार्केट व स्ट्रीट फूड वॉक' : 'Night Market & Street Food Evening Walk',
          detail: isMr ? 'स्थानिक मिठाई, स्नॅक्स आणि कुलफीचा आस्वाद.' : 'Tasting local desserts, live stalls, and signature night snacks.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T20:00:00`,
          travelTime: '08:00 PM',
          exactLocation: trip.destination || 'Market Lane',
          realisticCost: '₹300',
          briefDescription: isMr ? 'स्थानिक मिठाई, स्नॅक्स आणि कुलफीचा आस्वाद.' : 'Tasting local desserts, live stalls, and signature night snacks.',
          type: 'activity' as const,
          cost: 300
        }
      ]
    },
    {
      id: 'budget',
      icon: Wallet,
      color: 'bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] border-transparent',
      titleMr: 'बजेट बॅकपॅकर ऑप्टिमायझर (खर्च बचत)',
      titleEn: 'Budget Backpacker Optimizer (Cost-Saver)',
      descMr: 'मोफत प्रवेश असणारी निसर्गरम्य ठिकाणे, चालण्याचे मार्ग व सार्वजनिक वाहतूक प्राधान्य.',
      descEn: 'Prioritizes free-entry view points, walking tours, and economical travel alternatives.',
      suggestedPlans: [
        {
          id: `ai_budget_1_${Date.now()}`,
          title: isMr ? 'विनामूल्य सनसेट व्ह्यू पॉइंट व फोटोग्राफी' : 'Free Scenic Sunset Point & Photo Spot',
          detail: isMr ? 'निसर्गाचा विहंगम नजराणा, शांत वातावरण आणि फोटोसाठी उत्तम ठिकाण.' : 'Panoramic viewpoint with zero entry fee and golden hour view.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T17:30:00`,
          travelTime: '05:30 PM',
          exactLocation: trip.destination || 'Scenic Cliff',
          realisticCost: '₹0 (Free)',
          briefDescription: isMr ? 'निसर्गाचा विहंगम नजराणा, शांत वातावरण आणि फोटोसाठी उत्तम ठिकाण.' : 'Panoramic viewpoint with zero entry fee and golden hour view.',
          type: 'activity' as const,
          cost: 0
        }
      ]
    },
    {
      id: 'romance',
      icon: Heart,
      color: 'bg-[var(--premium-pink-soft)] text-[var(--premium-pink)] border-transparent',
      titleMr: 'रोमँटिक सनसेट व कॅन्डललाईट डिनर',
      titleEn: 'Romantic Sunset & Candlelight Dining',
      descMr: 'शांत बीच व्ह्यू, सनसेट पॉईंट आणि संगीतयुक्त डिनर प्लॅन.',
      descEn: 'Curates peaceful viewpoints, seaside walks, and ambient romantic dinners.',
      suggestedPlans: [
        {
          id: `ai_romance_1_${Date.now()}`,
          title: isMr ? 'सनसेट क्रूझ किंवा शांत बीच वॉक' : 'Sunset Beach Walk & Seaside Cafe',
          detail: isMr ? 'समुद्रकिनाऱ्यावर शांत फेरफटका आणि सुंदर सूर्यास्त.' : 'Relaxed coastal stroll during sunset with ambient music.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T18:00:00`,
          travelTime: '06:00 PM',
          exactLocation: trip.destination || 'Beachfront',
          realisticCost: '₹800',
          briefDescription: isMr ? 'समुद्रकिनाऱ्यावर शांत फेरफटका आणि सुंदर सूर्यास्त.' : 'Relaxed coastal stroll during sunset with ambient music.',
          type: 'activity' as const,
          cost: 800
        }
      ]
    },
    {
      id: 'adventure',
      icon: Compass,
      color: 'bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)] border-transparent',
      titleMr: 'ॲडव्हेंचर, ट्रेकिंग व वॉटर स्पोर्ट्स',
      titleEn: 'Adventure, Trekking & Water Sports',
      descMr: 'किल्ले ट्रेक, पॅरासेलिंग, स्कुबा किंवा निसर्ग सफारी ट्रिपमध्ये जोडा.',
      descEn: 'Adds thrilling outdoor treks, parasailing, kayaking, or wildlife excursions.',
      suggestedPlans: [
        {
          id: `ai_adv_1_${Date.now()}`,
          title: isMr ? 'सकाळची वॉटर स्पोर्ट्स किंवा ट्रेकिंग सफारी' : 'Morning Adventure Trek & Water Sports',
          detail: isMr ? 'मार्गदर्शकासह निसर्ग भ्रमंती आणि रोमांचक अनुभव.' : 'Guided exploration with certified instructors and gear.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T07:30:00`,
          travelTime: '07:30 AM',
          exactLocation: trip.destination || 'Adventure Point',
          realisticCost: '₹1,200',
          briefDescription: isMr ? 'मार्गदर्शकासह निसर्ग भ्रमंती आणि रोमांचक अनुभव.' : 'Guided exploration with certified instructors and gear.',
          type: 'activity' as const,
          cost: 1200
        }
      ]
    },
    {
      id: 'photo',
      icon: Camera,
      color: 'bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] border-transparent',
      titleMr: 'इन्स्टाग्राम फोटो हॉट्सपॉट्स आणि हेरिटेज',
      titleEn: 'Instagram Hotspots & Heritage Architecture',
      descMr: 'कलात्मक हेरिटेज वास्तू, जुन्या गल्ल्या आणि उत्कृष्ट फोटो स्पॉट्स.',
      descEn: 'Focuses on picturesque Portuguese / colonial streets, ancient forts, and viewpoint frames.',
      suggestedPlans: [
        {
          id: `ai_photo_1_${Date.now()}`,
          title: isMr ? 'हेरिटेज गल्ली व रंगीबेरंगी वास्तू दर्शन' : 'Historic Heritage Street & Photo Walk',
          detail: isMr ? 'उत्कृष्ट छायाचित्रांसाठी सुंदर पार्श्वभूमी.' : 'Unique architecture and picture-perfect photo backgrounds.',
          datetime: `${trip.startDate || new Date().toISOString().split('T')[0]}T16:00:00`,
          travelTime: '04:00 PM',
          exactLocation: trip.destination || 'Old Town Quarter',
          realisticCost: '₹0 (Free)',
          briefDescription: isMr ? 'उत्कृष्ट छायाचित्रांसाठी सुंदर पार्श्वभूमी.' : 'Unique architecture and picture-perfect photo backgrounds.',
          type: 'activity' as const,
          cost: 0
        }
      ]
    }
  ];

  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const handleSelectPreset = async (preset: typeof presets[0]) => {
    setLoadingPreset(preset.id);
    try {
      const res = await fetch("/api/generate-theme-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.destination || "Goa",
          themeName: isMr ? preset.titleMr : preset.titleEn,
          lang: isMr ? 'mr' : 'en',
          startDate: trip.startDate || new Date().toISOString().split("T")[0]
        })
      });
      const data = await res.json();
      
      if (data.success && data.activities && data.activities.length > 0) {
        const finalActivities = data.activities.map((act: any) => ({
          ...act,
          id: `ai_${preset.id}_${Date.now()}_${Math.floor(Math.random()*1000)}`
        }));
        setAppliedPreset(preset.id);
        if (onApplyPreset) {
          onApplyPreset(isMr ? preset.titleMr : preset.titleEn, finalActivities);
        }
        setTimeout(() => setAppliedPreset(null), 3000);
      } else {
        throw new Error("AI returned empty");
      }
    } catch (e) {
      console.error("AI Generation failed, falling back", e);
      setAppliedPreset(preset.id);
      if (onApplyPreset) {
        onApplyPreset(isMr ? preset.titleMr : preset.titleEn, preset.suggestedPlans);
      }
      setTimeout(() => setAppliedPreset(null), 3000);
    } finally {
      setLoadingPreset(null);
    }
  };

  return (
    <div className="premium-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[20px] bg-premium-pink-soft text-premium-pink flex items-center justify-center font-bold border border-orange-100 shrink-0 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'AI ट्रिप ऑप्टिमायझर व थीम प्रीसेट्स' : 'AI Trip Optimizer & Theme Presets'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-premium-pink">
                AI Agent
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {isMr ? '१-क्लिकमध्ये तुमच्या ट्रिपला विशिष्ट थीम व अतिरिक्त ठिकाणे जोडा' : '1-click enhancements for food, budget, romance & photography'}
            </p>
          </div>
        </div>

        {onOpenAiPlanner && (
          <button
            type="button"
            onClick={onOpenAiPlanner}
            className="px-3 py-1.5 bg-premium-violet-soft hover:bg-premium-violet-soft text-premium-violet rounded-[16px] text-xs font-black uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isMr ? 'AI मॅनेजर उघडा' : 'Open AI Planner'}</span>
          </button>
        )}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = appliedPreset === p.id;

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-[20px] border transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[var(--premium-sky-soft)] border-[var(--premium-sky-deep)] ring-2 ring-[var(--premium-sky-soft)]'
                  : 'bg-transparent border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-[16px] flex items-center justify-center border ${p.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[var(--premium-sky-deep)] text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {isMr ? 'जोडले!' : 'Added!'}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-black text-[var(--premium-ink)]">
                  {isMr ? p.titleMr : p.titleEn}
                </h4>
                <p className="text-[11px] text-[var(--premium-muted)] font-medium leading-relaxed">
                  {isMr ? p.descMr : p.descEn}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="w-full py-2 px-3 bg-white border border-slate-200 hover:border-[var(--premium-violet)] hover:text-[var(--premium-violet)] rounded-[16px] text-[11px] font-black uppercase tracking-wider text-[var(--premium-ink)] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {loadingPreset === p.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[var(--premium-violet)] border-t-transparent rounded-full animate-spin"></div>
                    <span>{isMr ? 'माहिती शोधत आहे...' : 'Generating Authentic Info...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[var(--premium-violet)]" />
                    <span>{isMr ? 'ट्रिपमध्ये ॲक्टिव्हिटी जोडा' : 'Add to Trip Itinerary'}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
