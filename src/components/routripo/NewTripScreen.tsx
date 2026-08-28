import React, { useState } from 'react';
import { ChevronLeft, Calendar, MapPin, Users, Wallet, Plus, Trash2, Calculator, Compass as Sparkles, Compass, UserCheck } from 'lucide-react';
import { Card, TopBar } from '../routripo/SharedUI';
import { CalculationMode, TripGroup } from '../../types';
import { useTripContext } from '../../context/TripContext';
import { useLanguage } from '../../context/LanguageContext';
import { SmartBudgetModal } from '../modals/SmartBudgetModal';

interface NewTripScreenProps {
  onBack: () => void;
  onCreate: (data: any) => void;
  trips?: TripGroup[];
  lang?: string;
}

export const NewTripScreen: React.FC<NewTripScreenProps> = ({ onBack, onCreate, trips = [], lang: propLang }) => {
  const { lang: contextLang } = useLanguage();
  const lang = propLang || contextLang || 'mr';
  const { addNewTrip } = useTripContext();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState('friends');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('admin_pooled');
  const [totalBudget, setTotalBudget] = useState('0');
  const [showSmartBudget, setShowSmartBudget] = useState(false);
  const [themeColor, setThemeColor] = useState('#1A365D');

  const [members, setMembers] = useState<{ name: string; deposit: string; upiId?: string; isAdmin: boolean }[]>([
    { name: '', deposit: '', upiId: '', isAdmin: true }
  ]);

  const handleTripTypeChange = (type: string) => {
    setTripType(type);
    if (type === 'solo') {
      setMembers([{ name: lang === 'mr' ? 'मी (सोलो)' : 'Me (Solo)', deposit: '0', upiId: '', isAdmin: true }]);
    }
  };

  const handleAddMember = () => {
    setMembers([...members, { name: '', deposit: '', upiId: '', isAdmin: false }]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, field: 'name' | 'deposit' | 'upiId' | 'isAdmin', value: string | boolean) => {
    setMembers(prev => prev.map((m, i) => {
      if (i !== index) {
        if (field === 'isAdmin' && value === true) return { ...m, isAdmin: false };
        return m;
      }
      return { ...m, [field]: value };
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() && !name.trim()) {
      alert(lang === 'mr' ? 'कृपया सहलीचे नाव / ठिकाण प्रविष्ट करा!' : 'Please enter trip name / destination!');
      return;
    }

    const validMembers = members
      .map(m => ({
        ...m,
        name: m.name.trim(),
        deposit: m.deposit || '0'
      }))
      .filter(m => m.name !== '');

    if (validMembers.length === 0) {
      validMembers.push({ name: lang === 'mr' ? 'प्रवास प्रतिनिधी' : 'Admin', deposit: '0', upiId: '', isAdmin: true });
    }

    const payload = {
      name: name || destination,
      destination: destination || name,
      startDate: startDate || new Date().toISOString().substring(0, 10),
      endDate: endDate || new Date(Date.now() + 86400000 * 5).toISOString().substring(0, 10),
      calculationMode,
      defaultCurrency: 'INR',
      themeColor,
      totalBudget: parseFloat(totalBudget) || 0,
      tripType,
      members: validMembers
    };

    onCreate(payload);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-[Inter] flex flex-col pb-20">
      <TopBar 
        title={lang === 'mr' ? 'नवीन सहल' : 'New Trip'} 
        onBack={onBack}
        scrolled={false}
        onLogout={() => {}} 
      />

      <div className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-4">
        <form onSubmit={handleCreate} className="space-y-6">
          
          {/* General Info */}
          <Card className="p-5 sm:p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              {lang === 'mr' ? '१. सहलीची प्राथमिक माहिती' : '1. Basic Details'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  {lang === 'mr' ? 'सहलीचे नाव' : 'Trip Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. गोव्याची सफर' : 'e.g. Goa Trip 2024'}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-sm text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  {lang === 'mr' ? 'ठिकाण' : 'Destination'}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder={lang === 'mr' ? 'उदा. गोवा' : 'e.g. Goa'}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-sm text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {lang === 'mr' ? 'सुरुवात तारीख' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {lang === 'mr' ? 'शेवटची तारीख' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Trip Type Select with Solo Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'mr' ? 'प्रवासाचा प्रकार (Trip Type)' : 'Trip Type'}
                </label>
                <select
                  value={tripType}
                  onChange={e => handleTripTypeChange(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-sm text-slate-900 outline-none"
                >
                  <option value="solo">{lang === 'mr' ? '👤 सोलो / एकटा प्रवास (Solo Trip)' : '👤 Solo Trip'}</option>
                  <option value="friends">{lang === 'mr' ? '👥 मित्रांसोबत (Friends Trip)' : '👥 Friends Trip'}</option>
                  <option value="family">{lang === 'mr' ? '👨‍👩‍👧‍👦 कौटुंबिक (Family Trip)' : '👨‍👩‍👧‍👦 Family Trip'}</option>
                  <option value="couple">{lang === 'mr' ? '👩‍❤️‍👨 कपल्स / जोडीदार (Couple)' : '👩‍❤️‍👨 Couple Trip'}</option>
                  <option value="business">{lang === 'mr' ? '💼 व्यवसाय / कामाचा प्रवास' : '💼 Business Trip'}</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Budget & Calculation Mode */}
          <Card className="p-5 sm:p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-rose-500" />
              {lang === 'mr' ? '२. बजेट आणि हिशोब पद्धती' : '2. Budget & Expense Mode'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === 'mr' ? 'एकूण बजेट (₹)' : 'Total Budget (₹)'}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={totalBudget}
                    onChange={e => setTotalBudget(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-sm text-slate-900 outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmartBudget(true)}
                    className="absolute right-2 top-2 p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                    title="Smart Budget Calculator"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'mr' ? 'हिशोब मोजणी पद्धत' : 'Calculation Mode'}
                </label>
                <select
                  value={calculationMode}
                  onChange={e => setCalculationMode(e.target.value as CalculationMode)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl font-bold text-sm text-slate-900 outline-none"
                >
                  <option value="admin_pooled">{lang === 'mr' ? 'एकत्रित पूल (Admin Pooled Deposit)' : 'Admin Pooled Fund'}</option>
                  <option value="individual_split">{lang === 'mr' ? 'समान वाटा (Individual Split)' : 'Individual Equal Split'}</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Members List Section */}
          <Card className="p-5 sm:p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                {lang === 'mr' ? '३. प्रवाशी / सदस्य यादी' : '3. Trip Members'}
              </h2>
              {tripType !== 'solo' && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'सदस्य जोडा' : 'Add Member'}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={m.name}
                      onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                      placeholder={idx === 0 ? (lang === 'mr' ? 'मुख्य प्रवासी (तुमचे नाव)' : 'Main Traveler (Your Name)') : `${lang === 'mr' ? 'सदस्य' : 'Member'} #${idx + 1}`}
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none"
                    />
                    {calculationMode === 'admin_pooled' && (
                      <input
                        type="number"
                        placeholder={lang === 'mr' ? 'जमा रक्कम ₹' : 'Deposit ₹'}
                        value={m.deposit}
                        onChange={e => handleMemberChange(idx, 'deposit', e.target.value)}
                        className="w-28 p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none"
                      />
                    )}
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5 fill-white/20" />
            <span>{lang === 'mr' ? 'सहल तयार करा' : 'Create Trip Now'}</span>
          </button>
        </form>
      </div>

      <SmartBudgetModal
        isOpen={showSmartBudget}
        onClose={() => setShowSmartBudget(false)}
        lang={lang}
        destination={destination || name || 'Trip'}
        days={5}
        persons={members.length || 1}
        transportMode="train"
        onApplyBudget={(total) => setTotalBudget(total.toString())}
      />
    </div>
  );
};
