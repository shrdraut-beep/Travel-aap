import { ScrollView } from '../ScrollView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookUser, Plus, Trash2, Edit2, Phone, CreditCard, Save, Compass as Sparkles, Search } from 'lucide-react';
import { MasterContact } from '../../types';
import { getMasterContacts, saveMasterContacts, addMasterContact, updateMasterContact, deleteMasterContact } from '../../utils/contacts';

interface ManageContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  t: (key: string) => string;
}

const PRESET_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f97316', '#334155'
];

export const ManageContactsModal: React.FC<ManageContactsModalProps> = ({
  isOpen,
  onClose,
  lang,
  t
}) => {
  const [contacts, setContacts] = useState<MasterContact[]>([]);
  const [search, setSearch] = useState('');
  
  // Form editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContacts(getMasterContacts());
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setUpiId('');
    setSelectedColor('#6366f1');
    setShowAddForm(false);
  };

  const handleStartEdit = (contact: MasterContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone || '');
    setUpiId(contact.upiId || '');
    setSelectedColor(contact.color || '#6366f1');
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = deleteMasterContact(id);
    setContacts(updated);
    if (editingId === id) resetForm();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const updated = updateMasterContact(editingId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        upiId: upiId.trim() || undefined,
        color: selectedColor
      });
      setContacts(updated);
    } else {
      addMasterContact({
        name: name.trim(),
        phone: phone.trim() || undefined,
        upiId: upiId.trim() || undefined,
        color: selectedColor
      });
      setContacts(getMasterContacts());
    }

    resetForm();
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-white rounded-t-[36px] sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BookUser className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                {lang === 'mr' ? 'मास्तर संपर्क व्यवस्थापन' : lang === 'hi' ? 'मास्टर संपर्क प्रबंधन' : 'Manage Master Address Book'}
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                {lang === 'mr' ? 'मित्रांची नावे आणि तपशील जतन करा' : 'Save friends & family contacts permanently'}
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
          {/* Top Bar with Add Button and Search */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'mr' ? 'शोधा...' : 'Search contacts...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              {lang === 'mr' ? 'नवीन जोडणे' : '+ Add Friend'}
            </button>
          </div>

          {/* Add / Edit Contact Form Drawer */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSave}
                className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    {editingId ? (lang === 'mr' ? 'संपर्क संपादित करा' : 'Edit Contact') : (lang === 'mr' ? 'नवीन संपर्क जोडा' : 'Add New Contact')}
                  </span>
                  <button type="button" onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'mr' ? 'मित्राचे नाव (उदा. अमित पवार)' : 'Friend Name (e.g. Amit Pawar)'}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile Phone"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="UPI ID (VPA)"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Theme Color selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{lang === 'mr' ? 'रंग:' : 'Color:'}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? 'scale-110 border-indigo-900 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-indigo-200"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {lang === 'mr' ? 'जतन करा' : 'Save Contact'}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Master Contacts List */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
              {lang === 'mr' ? `साठवलेले संपर्क (${filteredContacts.length})` : `Saved Contacts (${filteredContacts.length})`}
            </div>

            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                {lang === 'mr' ? 'यादीत कोणतेही संपर्क नाहीत. नवीन जोडा.' : 'No saved contacts found. Click + Add Friend to create one.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between group hover:bg-white hover:border-indigo-200 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm overflow-hidden shrink-0"
                        style={{ backgroundColor: contact.color || '#6366f1' }}
                      >
                        {contact.avatar ? (
                          <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                        ) : (
                          contact.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{contact.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(contact)}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title={lang === 'mr' ? 'संपादित करा' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title={lang === 'mr' ? 'काढा' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-slate-900 transition-all"
          >
            {lang === 'mr' ? 'पूर्ण (Done)' : 'Done'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
