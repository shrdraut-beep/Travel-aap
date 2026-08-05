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
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
                <h3 className="text-xl font-black text-emerald-950 tracking-tight">
                  {initialData ? 'सहल अपडेट करा' : 'नवीन सहल सुरू करा'}
                </h3>
                <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5 text-emerald-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 pb-[30px]">
                {/* Import Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-3xl border border-emerald-800 shadow-lg flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Import Old Trip
                    </span>
                    <p className="text-xs font-bold text-slate-300 leading-tight">
                      जुनी सहल? एक्सेलवरून हिशोब थेट इम्पोर्ट करा
                    </p>
                    {importedExpenses.length > 0 && (
                      <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-black text-[10px] rounded-lg border border-emerald-500/30">
                        ✅ {importedExpenses.length} खर्च लोड झाले!
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5 border border-emerald-400/30"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                  </button>
                </div>

                {/* Trip Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> सहल नाव (Destination)
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. लोणावळा पावसाळी सहल"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> सुरु तारीख
                      </label>
                      <input
                        required
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> शेवटची तारीख
                      </label>
                      <input
                        required
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> एकूण बजेट (Total Budget)
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmartBudget(true)}
                        className="absolute right-2 top-2.5 p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-xl transition-colors active:scale-95"
                        title="Smart Budget Calculator"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                      🪙 मुख्य चलन
                    </label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 text-sm shadow-sm"
                    >
                      <option value="INR">₹ INR (India)</option>
                      <option value="USD">$ USD (USA)</option>
                      <option value="EUR">€ EUR (Europe)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Mode */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                    📊 हिशोब पद्धत (Calculation Mode)
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setCalculationMode('admin_pooled')}
                      className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                        calculationMode === 'admin_pooled' 
                          ? 'bg-emerald-50 border-emerald-500 shadow-md' 
                          : 'bg-white border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-xs uppercase tracking-wider ${calculationMode === 'admin_pooled' ? 'text-emerald-700' : 'text-slate-800'}`}>
                          💰 अ‍ॅडमिन कडे पैसे जमा (Pool)
                        </span>
                        {calculationMode === 'admin_pooled' && <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                      </div>
                      <p className={`text-[11px] font-bold leading-relaxed ${calculationMode === 'admin_pooled' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        सर्व मित्र अ‍ॅडमिनकडे पैसे जमा करतील आणि अ‍ॅडमिन खर्च करेल.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalculationMode('individual_split')}
                      className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                        calculationMode === 'individual_split' 
                          ? 'bg-emerald-50 border-emerald-500 shadow-md' 
                          : 'bg-white border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-xs uppercase tracking-wider ${calculationMode === 'individual_split' ? 'text-emerald-700' : 'text-slate-800'}`}>
                          🤝 प्रत्येकाने खर्च करणे (Split)
                        </span>
                        {calculationMode === 'individual_split' && <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                      </div>
                      <p className={`text-[11px] font-bold leading-relaxed ${calculationMode === 'individual_split' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        प्रत्येकजण स्वतःचे पैसे खर्च करेल आणि शेवटी आपापसात हिशोब होईल.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                      <Users className="w-3 h-3" /> सहभागी मित्र ({members.length})
                    </label>
                  </div>

                  {/* Contacts Bar */}
                  {dynamicContacts.length > 0 && (
                    <div className="bg-emerald-50/50 p-4 rounded-[28px] border border-emerald-100/60 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-800 uppercase tracking-widest">
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
                              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                                isAdded 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm'
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
                          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            placeholder="मित्राचे नाव"
                            className="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 text-sm"
                          />
                          {members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors shrink-0"
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
                              placeholder="जमा रक्कम"
                              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={member.upiId || ''}
                            onChange={(e) => handleMemberChange(idx, 'upiId', e.target.value)}
                            placeholder="UPI ID (उदा. name@upi)"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleMemberChange(idx, 'isAdmin', true)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            member.isAdmin
                              ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-100'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${member.isAdmin ? 'border-amber-500 bg-amber-500' : 'border-slate-300 bg-white'}`}>
                              {member.isAdmin && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <Crown className={`w-4 h-4 ${member.isAdmin ? 'text-amber-600 fill-amber-300' : 'text-slate-400'}`} />
                              प्रशासक (Trip Admin)
                            </span>
                          </div>
                          {member.isAdmin && (
                            <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg">PRIMARY</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="w-full py-4 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> आणखी सभासद जोडा
                  </button>
                </div>

                <PrimaryButton
                  type="submit"
                  label={initialData ? 'सहल अपडेट करा' : 'सहल तयार करा'}
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-700 py-4 text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 mt-4 rounded-2xl font-black"
                />
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OldTripImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        lang="mr"
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
