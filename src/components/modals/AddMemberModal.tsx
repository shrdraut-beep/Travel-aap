import { ScrollView } from '../ScrollView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, Search, BookUser, Plus, Phone, CreditCard, Compass as Sparkles } from 'lucide-react';
import { Member, MasterContact } from '../../types';
import { getMasterContacts, addMasterContact } from '../../utils/contacts';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onAddMembers: (newMembers: Omit<Member, 'totalDeposited'>[]) => void;
  lang: string;
  t: (key: string) => string;
}

const PRESET_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#334155'
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  existingMembers,
  onAddMembers,
  lang,
  t
}) => {
  const [contacts, setContacts] = useState<MasterContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Custom contact input state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customUpi, setCustomUpi] = useState('');
  const [saveToMaster, setSaveToMaster] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setContacts(getMasterContacts());
      setSelectedContactIds(new Set());
      setSearchQuery('');
      setCustomName('');
      setCustomPhone('');
      setCustomUpi('');
      setShowCustomForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const existingNameSet = new Set(existingMembers.map(m => m.name.trim().toLowerCase()));

  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  const toggleSelectContact = (id: string) => {
    const next = new Set(selectedContactIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedContactIds(next);
  };

  const handleSelectAll = () => {
    const selectable = filteredContacts
      .filter(c => !existingNameSet.has(c.name.trim().toLowerCase()))
      .map(c => c.id);

    if (selectedContactIds.size >= selectable.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(selectable));
    }
  };

  const handleAddCustomToSelection = () => {
    if (!customName.trim()) return;

    let newContact: MasterContact;
    if (saveToMaster) {
      newContact = addMasterContact({
        name: customName.trim(),
        phone: customPhone.trim() || undefined,
        upiId: customUpi.trim() || undefined,
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
      });
      setContacts(getMasterContacts());
    } else {
      newContact = {
        id: 'temp-' + Date.now(),
        name: customName.trim(),
        phone: customPhone.trim() || undefined,
        upiId: customUpi.trim() || undefined,
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
      };
      setContacts(prev => [newContact, ...prev]);
    }

    const next = new Set(selectedContactIds);
    next.add(newContact.id);
    setSelectedContactIds(next);

    setCustomName('');
    setCustomPhone('');
    setCustomUpi('');
    setShowCustomForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMembersList: Omit<Member, 'totalDeposited'>[] = [];

    // Process selected master contacts
    contacts.forEach(c => {
      if (selectedContactIds.has(c.id) && !existingNameSet.has(c.name.trim().toLowerCase())) {
        newMembersList.push({
          id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: c.name,
          color: c.color || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
          avatar: c.avatar,
          phone: c.phone,
          upiId: c.upiId
        });
      }
    });

    // If custom name typed directly without adding to list first
    if (customName.trim() && !existingNameSet.has(customName.trim().toLowerCase())) {
      let color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
      if (saveToMaster) {
        addMasterContact({
          name: customName.trim(),
          phone: customPhone.trim() || undefined,
          upiId: customUpi.trim() || undefined,
          color
        });
      }
      newMembersList.push({
        id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: customName.trim(),
        color,
        phone: customPhone.trim() || undefined,
        upiId: customUpi.trim() || undefined
      });
    }

    if (newMembersList.length > 0) {
      onAddMembers(newMembersList);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-white rounded-t-[36px] sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <UserPlus className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                {lang === 'mr' ? 'नवीन सोबती जोडा' : lang === 'hi' ? 'नया सदस्य जोड़ें' : 'Add Trip Members'}
              </h3>
              <p className="text-xs font-semibold text-indigo-200">
                {lang === 'mr' ? 'मास्तर संपर्क यादीतून निवड करा' : lang === 'hi' ? 'मास्टर संपर्क सूची से चुनें' : 'Select friends from Master Contacts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto   p-5 space-y-4  ">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'mr' ? 'नाव किंवा नंबर शोधा...' : lang === 'hi' ? 'नाम या नंबर खोजें...' : 'Search name or phone...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-2xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Bar: Select All / Toggle Custom */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
            >
              <Check className="w-3.5 h-3.5" />
              {selectedContactIds.size > 0 ? (lang === 'mr' ? 'सर्व निवड रद्द' : 'Deselect All') : (lang === 'mr' ? 'सर्व निवडा' : 'Select All')}
            </button>

            <button
              type="button"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wider flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCustomForm ? (lang === 'mr' ? 'बंद करा' : 'Close Form') : (lang === 'mr' ? 'नवीन संपर्क टाईप करा' : '+ New Custom Contact')}
            </button>
          </div>

          {/* Custom Contact Form Input */}
          <AnimatePresence>
            {showCustomForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/60 space-y-3"
              >
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  {lang === 'mr' ? 'नवीन संपर्क माहिती' : 'New Contact Details'}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={lang === 'mr' ? 'पूर्ण नाव (उदा. अमित देशपांडे)' : 'Full Name (e.g. Amit Deshpande)'}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="Mobile Phone"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customUpi}
                        onChange={(e) => setCustomUpi(e.target.value)}
                        placeholder="UPI ID (VPA)"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveToMaster}
                      onChange={(e) => setSaveToMaster(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {lang === 'mr' ? 'मास्तर संपर्क यादीत जतन करा (Address Book)' : 'Save to Master Contacts permanently'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddCustomToSelection}
                    disabled={!customName.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all"
                  >
                    {lang === 'mr' ? 'यादीमध्ये जोडा' : 'Add to Checklist'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Master Contacts Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-widest px-1">
              <span className="flex items-center gap-1.5">
                <BookUser className="w-3.5 h-3.5 text-indigo-500" />
                {lang === 'mr' ? 'मास्तर संपर्क सूची' : 'Master Address Book'}
              </span>
              <span>{selectedContactIds.size} {lang === 'mr' ? 'निवडले' : 'selected'}</span>
            </div>

            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                {lang === 'mr' ? 'कोणताही संपर्क सापडला नाही.' : 'No contacts found.'}
              </div>
            ) : (
              <div className="overflow-y-auto space-y-2 max-h-[300px]  pr-1   ">
                {filteredContacts.map((contact) => {
                  const isAlreadyInTrip = existingNameSet.has(contact.name.trim().toLowerCase());
                  const isSelected = selectedContactIds.has(contact.id);

                  return (
                    <div
                      key={contact.id}
                      onClick={() => !isAlreadyInTrip && toggleSelectContact(contact.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isAlreadyInTrip
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 shadow-sm'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isAlreadyInTrip
                            ? 'bg-slate-200 border-slate-300'
                            : isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {(isSelected || isAlreadyInTrip) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Avatar / Color */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm overflow-hidden shrink-0"
                          style={{ backgroundColor: contact.avatar ? 'transparent' : (contact.color || '#6366f1') }}
                        >
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                          ) : (
                            contact.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-800">{contact.name}</span>
                            {isAlreadyInTrip && (
                              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                                {lang === 'mr' ? 'आधीच जोडले आहे' : 'In Trip'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {contact.phone}
                              </span>
                            )}
                            {contact.upiId && (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                💳 {contact.upiId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedContactIds.size === 0 && !customName.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {lang === 'mr' ? 'निवडलेले सोबती ट्रिपमध्ये जोडा' : 'Add Selected to Trip'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
