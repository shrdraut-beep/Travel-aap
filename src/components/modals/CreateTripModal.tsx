import { ScrollView } from '../ScrollView';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MapPin, Plus, Trash2, FileSpreadsheet, Crown, Upload, Wallet, Calculator } from 'lucide-react';

import { CalculationMode, Expense, TripGroup } from '../../types';
import { getMasterContacts } from '../../utils/contacts';
import { BookUser } from 'lucide-react';
import { sanitizeString } from '../../utils/security';
import { PrimaryButton } from '../common/PrimaryButton';
import { OldTripImportModal } from './OldTripImportModal';
import { SmartBudgetModal } from './SmartBudgetModal';
import { useLanguage } from '../../context/LanguageContext';

interface CreateTripModalProps {
  trips?: TripGroup[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (tripData: { 
    name: string; 
    startDate: string; 
    endDate: string; 
    calculationMode: CalculationMode;
    defaultCurrency?: string;
    themeColor?: string;
    members: {name: string; deposit: string; upiId?: string; isAdmin: boolean}[];
    importedExpenses?: Omit<Expense, 'id'>[];
  }) => void;
  initialData?: { name: string; startDate: string; endDate: string; calculationMode?: CalculationMode; defaultCurrency?: string; themeColor?: string; totalBudget?: number; members: {name: string; deposit: string; upiId?: string; isAdmin: boolean}[]; };
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose, onCreate, initialData, trips = [] }) => {
  const { lang, t } = useLanguage();
  const [name, setName] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [calculationMode, setCalculationMode] = React.useState<CalculationMode>('admin_pooled');
  const [defaultCurrency, setDefaultCurrency] = React.useState('INR');
  const [totalBudget, setTotalBudget] = React.useState('0');
  const [showSmartBudget, setShowSmartBudget] = React.useState(false);
  const [themeColor, setThemeColor] = React.useState('#FF5A5F'); // Default to Coral Red
  const [members, setMembers] = React.useState<{name: string; deposit: string; upiId?: string; isAdmin: boolean}[]>([]);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importedExpenses, setImportedExpenses] = React.useState<Omit<Expense, 'id'>[]>([]);


  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setStartDate(initialData?.startDate || '');
      setEndDate(initialData?.endDate || '');
      setCalculationMode(initialData?.calculationMode || 'admin_pooled');
      setDefaultCurrency(initialData?.defaultCurrency || 'INR');
      setTotalBudget(initialData?.totalBudget ? initialData.totalBudget.toString() : '0');
      setThemeColor(initialData?.themeColor || '#FF5A5F');
      setMembers(initialData?.members?.length ? initialData.members : [{name: '', deposit: '', upiId: '', isAdmin: true}]);
      setImportedExpenses([]);
    }
  }, [isOpen, initialData]);

  const dynamicContacts = React.useMemo(() => {
    const allMembers = trips.flatMap(t => t.members || []);
    const uniqueMembers = [];
    const seenNames = new Set();
    
    for (const member of allMembers) {
      if (member.name && !seenNames.has(member.name.toLowerCase().trim())) {
        seenNames.add(member.name.toLowerCase().trim());
        uniqueMembers.push(member);
      }
    }
    return uniqueMembers;
  }, [trips]);

  const handleAddMember = () => setMembers([...members, {name: '', deposit: '', upiId: '', isAdmin: false}]);
  
  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, field: 'name' | 'deposit' | 'upiId' | 'isAdmin', value: string | boolean) => {
    setMembers(prev => prev.map((m, i) => {
      if (i !== index) {
        if (field === 'isAdmin' && value === true) {
          return { ...m, isAdmin: false };
        }
        return m;
      }
      return { ...m, [field]: value };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(name);
    if (!cleanName || !startDate || !endDate) return;
    
    const validMembers = members
      .map(m => ({ 
        ...m, 
        name: sanitizeString(m.name), 
        upiId: sanitizeString(m.upiId || ''),
        deposit: m.deposit || '0'
      }))
      .filter(m => m.name.trim() !== '');

    if (validMembers.length === 0) {
      validMembers.push({name: 'Admin', upiId: '', deposit: '0', isAdmin: true});
    } else if (!validMembers.some(m => m.isAdmin)) {
      validMembers[0].isAdmin = true;
    }

    onCreate({ 
      name: cleanName, 
      startDate, 
      endDate, 
      calculationMode, 
      defaultCurrency, 
      themeColor, 
      members: validMembers, 
      importedExpenses 
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-premium-sky-soft">
                <h3 className="text-xl font-black text-[var(--premium-sky-deep)] tracking-tight">
                  {initialData ? (lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip') : (lang === 'mr' ? 'नवीन सहल सुरू करा' : 'Start a new trip')}
                </h3>
                <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-transparent transition-colors">
                  <X className="w-5 h-5 text-premium-sky-deep" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 pb-[30px]">
                {/* Import Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-pink-950 to-slate-900 text-white p-5 rounded-[24px] border border-pink-800 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-premium-sky-deep tracking-widest flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Import Old Trip
                    </span>
                    <p className="text-xs font-bold text-slate-300 leading-tight">
                      {lang === 'mr' ? 'जुनी सहल? एक्सेलवरून हिशोब थेट इम्पोर्ट करा' : 'Old trip? Import expenses directly from Excel'}
                    </p>
                    {importedExpenses.length > 0 && (
                      <span className="inline-block mt-2 px-2.5 py-1 bg-premium-sky-soft0/20 text-pink-300 font-black text-[10px] rounded-lg border border-premium-sky-deep/30">
                        ✅ {importedExpenses.length} {lang === 'mr' ? 'खर्च लोड झाले!' : 'expenses loaded!'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2.5 bg-premium-sky-deep hover:bg-premium-sky-soft0 text-white font-black text-[10px] uppercase tracking-widest rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all active:scale-95 shrink-0 flex items-center gap-1.5 border border-premium-sky-deep/30"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                  </button>
                </div>

                {/* Trip Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {lang === 'mr' ? 'सहल नाव (Destination)' : 'Destination'}
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'mr' ? "उदा. लोणावळा पावसाळी सहल" : "e.g. Lonavala Monsoon Trip"}
                      className="w-full px-5 py-4 bg-transparent border-2 border-slate-100 rounded-[20px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {lang === 'mr' ? 'सुरु तारीख' : 'Start Date'}
                      </label>
                      <input
                        required
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border-2 border-slate-100 rounded-[20px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {lang === 'mr' ? 'शेवटची तारीख' : 'End Date'}
                      </label>
                      <input
                        required
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border-2 border-slate-100 rounded-[20px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> {lang === 'mr' ? 'एकूण बजेट (Total Budget)' : 'Total Budget'}
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        className="w-full px-5 py-4 bg-transparent border-2 border-slate-100 rounded-[20px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmartBudget(true)}
                        className="absolute right-2 top-2.5 p-2 bg-premium-sky-soft text-premium-sky-deep hover:bg-[var(--premium-sky-soft)] rounded-[16px] transition-colors active:scale-95"
                        title="Smart Budget Calculator"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep">
                      🪙 {lang === 'mr' ? 'मुख्य चलन' : 'Base Currency'}
                    </label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border-2 border-slate-100 rounded-[20px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 text-sm shadow-sm"
                    >
                      <option value="INR">₹ INR (India)</option>
                      <option value="USD">$ USD (USA)</option>
                      <option value="EUR">€ EUR (Europe)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Mode */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center gap-2">
                    📊 {lang === 'mr' ? 'हिशोब पद्धत (Calculation Mode)' : 'Calculation Mode'}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalculationMode('admin_pooled')}
                      className={`p-4 rounded-[20px] border-2 transition-all text-left flex flex-col gap-1 ${
                        calculationMode === 'admin_pooled' 
                          ? 'bg-premium-sky-soft border-premium-sky-deep shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]' 
                          : 'bg-white border-slate-100 hover:border-premium-sky-deep'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-xs uppercase tracking-wider ${calculationMode === 'admin_pooled' ? 'text-premium-sky-deep' : 'text-slate-800'}`}>
                          💰 {lang === 'mr' ? 'अ‍ॅडमिन कडे पैसे जमा (Pool)' : 'Admin Pool (Pool)'}
                        </span>
                        {calculationMode === 'admin_pooled' && <div className="w-4 h-4 bg-premium-sky-soft0 rounded-full border-2 border-white shadow-sm" />}
                      </div>
                      <p className={`text-[11px] font-bold leading-relaxed ${calculationMode === 'admin_pooled' ? 'text-premium-sky-deep' : 'text-slate-500'}`}>
                        {lang === 'mr' ? 'सर्व मित्र अ‍ॅडमिनकडे पैसे जमा करतील आणि अ‍ॅडमिन खर्च करेल.' : 'All friends deposit money to admin and admin spends.'}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalculationMode('individual_split')}
                      className={`p-4 rounded-[20px] border-2 transition-all text-left flex flex-col gap-1 ${
                        calculationMode === 'individual_split' 
                          ? 'bg-premium-sky-soft border-premium-sky-deep shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]' 
                          : 'bg-white border-slate-100 hover:border-premium-sky-deep'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-xs uppercase tracking-wider ${calculationMode === 'individual_split' ? 'text-premium-sky-deep' : 'text-slate-800'}`}>
                          🤝 {lang === 'mr' ? 'प्रत्येकाने खर्च करणे (Split)' : 'Split Expense (Split)'}
                        </span>
                        {calculationMode === 'individual_split' && <div className="w-4 h-4 bg-premium-sky-soft0 rounded-full border-2 border-white shadow-sm" />}
                      </div>
                      <p className={`text-[11px] font-bold leading-relaxed ${calculationMode === 'individual_split' ? 'text-premium-sky-deep' : 'text-slate-500'}`}>
                        {lang === 'mr' ? 'प्रत्येकजण स्वतःचे पैसे खर्च करेल आणि शेवटी आपापसात हिशोब होईल.' : 'Everyone spends their own money and settles up later.'}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-premium-sky-deep flex items-center gap-2">
                      <Users className="w-3 h-3" /> {lang === 'mr' ? 'सहभागी मित्र' : 'Trip Members'} ({members.length})
                    </label>
                  </div>

                  {/* Contacts Bar */}
                  {dynamicContacts.length > 0 && (
                    <div className="bg-premium-sky-soft/50 p-4 rounded-[28px] border border-premium-sky-deep/60 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-premium-sky-deep uppercase tracking-widest">
                        <BookUser className="w-3.5 h-3.5" /> Quick Pick
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {dynamicContacts.map(contact => {
                          const isAdded = members.some(m => m.name.toLowerCase().trim() === contact.name.toLowerCase().trim());
                          return (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => {
                                if (!isAdded) {
                                  setMembers([...members, { name: contact.name, deposit: '0', upiId: contact.upiId || '', isAdmin: false }]);
                                }
                              }}
                              className={`px-4 py-2 rounded-[16px] text-[11px] font-black transition-all shrink-0 border ${
                                isAdded 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-white text-premium-sky-deep border-premium-sky-deep hover:bg-premium-sky-deep hover:text-white hover:border-pink-600 shadow-sm'
                              }`}
                            >
                              {contact.name} {isAdded ? '✓' : '+'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <div key={idx} className="p-5 bg-white border border-slate-200 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex gap-3 items-center">
                          <span className="w-8 h-8 rounded-[16px] bg-premium-sky-soft text-premium-sky-deep font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            placeholder={lang === 'mr' ? "मित्राचे नाव" : "Friend Name"}
                            className="flex-1 min-w-0 px-4 py-2.5 bg-transparent border border-slate-100 rounded-[16px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 text-sm"
                          />
                          {members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              className="p-2.5 bg-rose-50 text-rose-500 rounded-[16px] hover:bg-rose-100 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                            <input
                              type="number"
                              value={member.deposit}
                              onChange={(e) => handleMemberChange(idx, 'deposit', e.target.value)}
                              placeholder={lang === 'mr' ? "जमा रक्कम" : "Deposit"}
                              className="w-full pl-8 pr-4 py-2.5 bg-transparent border border-slate-100 rounded-[16px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={member.upiId || ''}
                            onChange={(e) => handleMemberChange(idx, 'upiId', e.target.value)}
                            placeholder={lang === 'mr' ? "UPI ID (उदा. name@upi)" : "UPI ID (e.g. name@upi)"}
                            className="w-full px-4 py-2.5 bg-transparent border border-slate-100 rounded-[16px] focus:border-premium-sky-deep focus:bg-white outline-none font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMemberChange(idx, 'isAdmin', true)}
                          className={`w-full flex items-center justify-between p-3 rounded-[20px] border transition-all ${
                            member.isAdmin
                              ? 'bg-premium-pink-soft border-premium-pink text-premium-pink ring-2 ring-orange-100'
                              : 'bg-transparent border-slate-100 text-slate-600 hover:border-premium-pink'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${member.isAdmin ? 'border-premium-pink bg-[var(--premium-pink)]' : 'border-slate-300 bg-white'}`}>
                              {member.isAdmin && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <Crown className={`w-4 h-4 ${member.isAdmin ? 'text-premium-pink fill-orange-300' : 'text-slate-400'}`} />
                              {lang === 'mr' ? 'प्रशासक (Trip Admin)' : 'Admin (Trip Admin)'}
                            </span>
                          </div>
                          {member.isAdmin && (
                            <span className="text-[9px] font-black bg-[var(--premium-pink)] text-white px-2 py-0.5 rounded-lg">PRIMARY</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="w-full py-4 border-2 border-dashed border-premium-sky-deep text-premium-sky-deep rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-premium-sky-soft transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> {lang === 'mr' ? 'आणखी सभासद जोडा' : 'Add another member'}
                  </button>
                </div>

                <PrimaryButton
                  type="submit"
                  label={initialData ? (lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip') : (lang === 'mr' ? 'सहल तयार करा' : 'Create Trip')}
                  fullWidth
                  className="bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] py-4 text-xs uppercase tracking-widest shadow-xl shadow-pink-200 mt-4 rounded-[20px] font-black"
                />
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OldTripImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        lang={lang}
        onImportSuccess={(extracted) => {
          if (extracted.name) setName(extracted.name);
          if (extracted.startDate) setStartDate(extracted.startDate);
          if (extracted.endDate) setEndDate(extracted.endDate);
          if (extracted.members && extracted.members.length > 0) setMembers(extracted.members);
          if (extracted.expenses && extracted.expenses.length > 0) setImportedExpenses(extracted.expenses);
        }}
      />
    </>
  );
};
