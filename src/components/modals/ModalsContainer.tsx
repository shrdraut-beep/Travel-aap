import { ScrollView } from '../ScrollView';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Calculator, Coins, Calendar, Sparkles, RefreshCw, Smartphone, Download, CheckCircle, Info, Share2, Wifi, Users, Mic, MicOff } from 'lucide-react';
import { Category, Member, Stage, TripGroup, DialogConfig } from '../../types';
import { getUniqueMembers } from '../../utils';

interface ModalsContainerProps {
  // Modal visibility
  showExpenseModal: boolean;
  setShowExpenseModal: (show: boolean) => void;
  showDepositModal: boolean;
  setShowDepositModal: (show: boolean) => void;
  smartDepositPrompt?: {
    isOpen: boolean;
    memberId: string;
    memberName: string;
    oldAmount: number;
    newAmount: number;
    note: string;
  } | null;
  onConfirmDepositAction?: (memberId: string, amount: number, note: string, mode: 'add' | 'edit') => void;
  onCancelSmartDeposit?: () => void;
  showPlanModal: boolean;
  setShowPlanModal: (show: boolean) => void;
  showSyncModal: boolean;
  setShowSyncModal: (show: boolean) => void;
  showPwaModal: boolean;
  setShowPwaModal: (show: boolean) => void;
  showPinChangeModal: boolean;
  setShowPinChangeModal: (show: boolean) => void;

  // Form states & handlers
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  isCloudSynced: boolean;
  onVoiceCommand?: (text: string) => void;
  isProcessingVoice?: boolean;
  isAdmin: boolean;

  // Expense Form
  expenseForm: {
    title: string;
    setTitle: (v: string) => void;
    amount: string;
    setAmount: (v: string) => void;
    category: Category;
    setCategory: (v: Category) => void;
    customCategoryName?: string;
    setCustomCategoryName?: (v: string) => void;
    paidBy: string;
    setPaidBy: (v: string) => void;
    splitWith: string[];
    setSplitWith: (v: string[]) => void;
    date: string;
    setDate: (v: string) => void;
    stageId: string;
    setStageId: (v: string) => void;
    receiptImage: string | undefined;
    setReceiptImage: (v: string | undefined) => void;
    onSubmit: (e: React.FormEvent) => void;
  };

  // Scan Logic
  scan: {
    isScanning: boolean;
    onScan: (file: string) => void;
    demoReceipts: any[];
    selectedDemoId: string | null;
    setSelectedDemoId: (id: string | null) => void;
  };

  // Deposit Form
  depositForm: {
    memberId: string;
    setMemberId: (v: string) => void;
    amount: string;
    setAmount: (v: string) => void;
    note: string;
    setNote: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
  };

  // Plan Form
  planForm: {
    type: 'ticket' | 'hotel' | 'activity' | 'other';
    setType: (v: any) => void;
    title: string;
    setTitle: (v: string) => void;
    detail: string;
    setDetail: (v: string) => void;
    datetime: string;
    setDatetime: (v: string) => void;
    cost: string;
    setCost: (v: string) => void;
    bookingRef: string;
    setBookingRef: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    tab: 'manual' | 'sms';
    setTab: (v: 'manual' | 'sms') => void;
    bookingText: string;
    setBookingText: (v: string) => void;
    isParsing: boolean;
    onParseSMS: (e: React.FormEvent) => void;
  };

  // Pin Change
  pinForm: {
    newPinInput: string;
    setNewPinInput: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
  };

  // Sync Logic
  sync: {
    tripCode: string;
    inputCode: string;
    setInputCode: (v: string) => void;
    onStartSharing: () => void;
    onJoinTrip: (e: React.FormEvent) => void;
    onDisconnect: () => void;
    onShareLink: () => void;
  };

  // PWA Logic
  pwa: {
    isInstallable: boolean;
    onInstall: () => void;
  };
  dialog: {
    config: DialogConfig;
    onClose: () => void;
    onSubmit: (value?: string) => void;
  };
}

const CATEGORY_STYLES: { [key in Category]: { labelEn: string; labelMr: string; color: string; bg: string } } = {
  food: { labelEn: "Food", labelMr: "जेवण", color: "text-amber-600", bg: "bg-amber-50" },
  traveling: { labelEn: "Traveling", labelMr: "प्रवास", color: "text-blue-600", bg: "bg-blue-50" },
  hotels: { labelEn: "Hotels", labelMr: "हॉटेल", color: "text-emerald-600", bg: "bg-emerald-50" },
  personal: { labelEn: "Personal", labelMr: "वैयक्तिक", color: "text-teal-600", bg: "bg-teal-50" },
  restaurant: { labelEn: "Restaurant", labelMr: "रेस्टॉरंट", color: "text-amber-800", bg: "bg-amber-100" },
  tips: { labelEn: "Tips", labelMr: "टिप्स", color: "text-yellow-600", bg: "bg-yellow-50" },
  transport: { labelEn: "Transport", labelMr: "ट्रान्सपोर्ट", color: "text-orange-600", bg: "bg-orange-50" },
  fuel: { labelEn: "Fuel", labelMr: "इंधन", color: "text-emerald-800", bg: "bg-emerald-100" },
  fun: { labelEn: "Entertainment", labelMr: "मनोरंजन", color: "text-pink-600", bg: "bg-pink-50" },
  highway: { labelEn: "Highway/Toll", labelMr: "टोल/हायवे", color: "text-slate-800", bg: "bg-indigo-50" },
  other: { labelEn: "Other", labelMr: "इतर", color: "text-gray-600", bg: "bg-gray-50" }
};

export const ModalsContainer: React.FC<ModalsContainerProps> = (props) => {

  const [isListening, setIsListening] = React.useState(false);
  const [voiceError, setVoiceError] = React.useState<string | null>(null);

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      setVoiceError(lang === 'mr' ? 'तुमचा ब्राउझर व्हॉइस कमांडला सपोर्ट करत नाही.' : 'Voice commands not supported.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      if (navigator.vibrate) navigator.vibrate(50);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (onVoiceCommand) onVoiceCommand(text);
    };

    recognition.onerror = (event: any) => {
      setVoiceError(lang === 'mr' ? 'काहीतरी चुकले. पुन्हा प्रयत्न करा.' : 'Error listening. Try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const { 
    showExpenseModal, setShowExpenseModal,
    showDepositModal, setShowDepositModal,
    smartDepositPrompt, onConfirmDepositAction, onCancelSmartDeposit,
    showPlanModal, setShowPlanModal,
    showSyncModal, setShowSyncModal,
    showPwaModal, setShowPwaModal,
    showPinChangeModal, setShowPinChangeModal,
    trip, lang, t, currencySymbol, isCloudSynced, isAdmin, onVoiceCommand, isProcessingVoice,
    expenseForm, scan, depositForm, planForm, pinForm, sync, pwa, dialog
  } = props;

  const [promptInput, setPromptInput] = React.useState(dialog.config.defaultValue || '');

  React.useEffect(() => {
    if (dialog.config.isOpen) {
      setPromptInput(dialog.config.defaultValue || '');
    }
  }, [dialog.config.isOpen, dialog.config.defaultValue]);

  const [showCalculator, setShowCalculator] = React.useState(false);
  const [calcInput, setCalcInput] = React.useState('');

  const handleCalcButton = (char: string) => {
    if (char === '=') {
      try {
        const result = new Function('return ' + calcInput)();
        if (isFinite(result)) {
          expenseForm.setAmount(String(result));
          setShowCalculator(false);
          setCalcInput('');
        }
      } catch (e) {
        // invalid math
      }
    } else if (char === 'C') {
      setCalcInput('');
    } else if (char === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
    } else {
      setCalcInput(prev => prev + char);
    }
  };

  return (
    <>
      {/* MODAL 1: ADD EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-indigo-50 rounded-t-[40px] sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-400" />
                {t("addExpense")}
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              id="expense-form" 
              onSubmit={expenseForm.onSubmit} 
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="overflow-y-auto   p-6 space-y-6  ">
                {/* Scan Section - Merged Clean Dropzone */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Smart</span>
                        <span className="text-xs font-bold text-slate-600 uppercase">{lang === 'mr' ? 'स्मार्ट एन्ट्री' : 'Smart Entry'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleVoiceCommand}
                        disabled={isListening || isProcessingVoice}
                        className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all shadow-md active:scale-95 ${
                          isListening || isProcessingVoice
                            ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                      >
                        {isListening || isProcessingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        id="receipt-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => scan.onScan(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="receipt-upload" className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
                        {t("uploadBill")}
                      </label>
                    </div>
                  </div>
                  
                  {scan.isScanning && (
                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-2xl text-white">
                        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest">{t("scanning")}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Demo:</span>
                    {scan.demoReceipts.slice(0, 3).map(demo => (
                      <button 
                        key={demo.id} 
                        type="button" 
                        onClick={() => scan.onScan(demo.base64Data)}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all uppercase shrink-0"
                      >
                        {demo.amount} {currencySymbol}
                      </button>
                    ))}
                  </div>

                  {expenseForm.receiptImage && (
                    <div className="relative group">
                      <img 
                        src={expenseForm.receiptImage} 
                        alt="Receipt" 
                        className="w-full h-40 object-cover rounded-2xl border border-slate-200"
                      />
                      <button 
                        type="button"
                        onClick={() => expenseForm.setReceiptImage(undefined)}
                        className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-3 py-1 bg-slate-900/70 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-widest">
                        {lang === 'mr' ? 'पावती जोडली आहे' : 'Receipt Linked'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div>
                    <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-2 ml-2">{t("titleLabel")}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lunch at Mahabaleshwar"
                      value={expenseForm.title}
                      onChange={(e) => expenseForm.setTitle(e.target.value)}
                      className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-2 ml-2">{t("amount")} ({currencySymbol})</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={expenseForm.amount}
                          onChange={(e) => expenseForm.setAmount(e.target.value)}
                          className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCalculator(!showCalculator)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                          <Calculator className="w-5 h-5" />
                        </button>
                      </div>

                      {showCalculator && (
                        <div className="absolute z-20 left-0 top-[110%] w-[calc(200%+16px)] bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl">
                          <div className="mb-2 bg-indigo-50 px-3 py-2 rounded-xl text-right font-mono font-bold text-indigo-950 overflow-hidden text-sm h-9 flex items-center justify-end">
                            {calcInput || '0'}
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {['C','(',')','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','DEL','='].map(char => (
                              <button
                                key={char}
                                type="button"
                                onClick={() => handleCalcButton(char)}
                                className={`h-10 rounded-xl text-sm font-bold active:scale-95 transition-all ${
                                  ['/','*','-','+','='].includes(char) 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : ['C', 'DEL'].includes(char)
                                      ? 'bg-rose-100 text-rose-600'
                                      : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
                                }`}
                              >
                                {char}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest ml-2">{t("category")}</label>
                      
                      <div className="relative">
                        <select
                          value={expenseForm.category}
                          onChange={(e) => expenseForm.setCategory(e.target.value as Category)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all text-indigo-950 appearance-none"
                        >
                          {Object.entries(CATEGORY_STYLES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {lang === 'mr' ? value.labelMr : value.labelEn}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expenseForm.category === 'other' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -5 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -5 }}
                            className="mt-2 space-y-1 overflow-hidden"
                          >
                            <input
                              type="text"
                              value={expenseForm.customCategoryName || ''}
                              onChange={(e) => expenseForm.setCustomCategoryName?.(e.target.value)}
                              placeholder={lang === 'mr' ? 'इतर खर्चाचे नाव टाका...' : 'Enter custom category...'}
                              className="w-full bg-indigo-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all text-indigo-950"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-2 ml-2">{t("paidBy")}</label>
                      <select
                        required
                        value={expenseForm.paidBy}
                        onChange={(e) => expenseForm.setPaidBy(e.target.value)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all"
                      >
                        <option value="">{lang === "mr" ? "निवडा..." : "Select..."}</option>
                        {isAdmin && <option value="pool">{t('commonPool')}</option>}
                        {getUniqueMembers(trip.members).map((m, idx) => (
                          <option key={`${m.id}-${idx}`} value={m.id}>
                            {m.name} {m.id === trip.adminId ? `(${lang === 'mr' ? 'अ‍ॅडमिन' : 'Admin'})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-2 ml-2">{t("date")}</label>
                      <input
                        type="date"
                        required
                        value={expenseForm.date}
                        onChange={(e) => expenseForm.setDate(e.target.value)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-300 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Split checkboxes (Android Multi-select Chip Style) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-2">
                      <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest">{t("splitWith")}</label>
                      <button 
                        type="button"
                        onClick={() => {
                          if (expenseForm.splitWith.length === trip.members.length) {
                            expenseForm.setSplitWith([]);
                          } else {
                            expenseForm.setSplitWith(trip.members.map(m => m.id));
                          }
                        }}
                        className="text-xs font-black text-teal-700 uppercase tracking-wider hover:underline"
                      >
                        {expenseForm.splitWith.length === trip.members.length ? (lang === 'mr' ? 'सर्व रद्द करा' : 'Unselect All') : (lang === 'mr' ? 'सर्व निवडा' : 'Select All')}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getUniqueMembers(trip.members).map((m, idx) => {
                        const checked = expenseForm.splitWith.includes(m.id);
                        return (
                          <button
                            key={`${m.id}-${idx}`}
                            type="button"
                            onClick={() => {
                              if (checked) {
                                expenseForm.setSplitWith(expenseForm.splitWith.filter(id => id !== m.id));
                              } else {
                                expenseForm.setSplitWith([...expenseForm.splitWith, m.id]);
                              }
                            }}
                            className={`px-4 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                              checked ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {m.name} {m.id === trip.adminId ? `(${lang === 'mr' ? 'अ‍ॅडमिन' : 'Admin'})` : ''}
                          </button>
                        );
                      })}
                    </div>

                    {/* Real-time Per Person Split Calculation */}
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                          {lang === 'mr' ? 'प्रति व्यक्ती हिस्सा:' : 'Split Per Person:'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-indigo-700 font-mono">
                          {currencySymbol}{
                            expenseForm.amount && !isNaN(Number(expenseForm.amount)) && expenseForm.splitWith.length > 0
                              ? new Intl.NumberFormat('en-IN').format(Math.round(Number(expenseForm.amount) / expenseForm.splitWith.length))
                              : '0'
                          }
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          ({expenseForm.splitWith.length} {lang === 'mr' ? 'जण' : 'members'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-200 shrink-0 flex gap-4 pb-safe-offset-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-4 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 rounded-3xl font-black text-xs uppercase tracking-[0.15em] active:scale-95 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-slate-200 active:scale-95 transition-all hover:bg-slate-800"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: DEPOSIT */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
           <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[40px] sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Coins className="w-6 h-6 text-emerald-400" />
                {t("addDeposit")}
              </h3>
              <button onClick={() => setShowDepositModal(false)} className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="deposit-form" onSubmit={depositForm.onSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-y-auto   p-6 space-y-6  ">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">{t("paidBy")}</label>
                    <select
                      required
                      value={depositForm.memberId}
                      onChange={(e) => depositForm.setMemberId(e.target.value)}
                      className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                    >
                      <option value="">{lang === "mr" ? "निवडा..." : "Select..."}</option>
                      {getUniqueMembers(trip.members).map((m, idx) => (
                        <option key={`${m.id}-${idx}`} value={m.id}>
                          {m.name} {m.id === trip.adminId ? `(${lang === 'mr' ? 'अ‍ॅडमिन' : 'Admin'})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">{t("amount")} ({currencySymbol})</label>
                    <input
                      type="number"
                      required
                      value={depositForm.amount}
                      onChange={(e) => depositForm.setAmount(e.target.value)}
                      className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">{t("note")}</label>
                    <input
                      type="text"
                      value={depositForm.note}
                      onChange={(e) => depositForm.setNote(e.target.value)}
                      className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-200 shrink-0 flex gap-4 pb-safe-offset-4">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-4 bg-slate-50 border border-slate-100 text-indigo-300 rounded-3xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2B: SMART DEPOSIT OVERWRITE / ADD CONFIRMATION */}
      {smartDepositPrompt && smartDepositPrompt.isOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {lang === 'mr' ? 'जमा रक्कम निश्चित करा' : 'Confirm Deposit Action'}
                  </h3>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {lang === 'mr' ? 'सुरक्षित जमा नियम (Safety Check)' : 'Smart Deposit Check'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onCancelSmartDeposit && onCancelSmartDeposit()} 
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>{lang === 'mr' ? 'सदस्य' : 'Member'}:</span>
                  <span className="font-black text-slate-900 text-sm">{smartDepositPrompt.memberName}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>{lang === 'mr' ? 'सध्याची एकूण जमा रक्कम' : 'Current Deposit Total'}:</span>
                  <span className="font-black text-emerald-700 text-sm">{currencySymbol}{new Intl.NumberFormat('en-IN').format(smartDepositPrompt.oldAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>{lang === 'mr' ? 'प्रविष्ट केलेली नवीन रक्कम' : 'Entered New Amount'}:</span>
                  <span className="font-black text-indigo-700 text-sm">{currencySymbol}{new Intl.NumberFormat('en-IN').format(smartDepositPrompt.newAmount)}</span>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-800 leading-relaxed text-center">
                {lang === 'mr' 
                  ? `तुम्हाला ${smartDepositPrompt.memberName} ची मागील जमा रक्कम (${currencySymbol}${smartDepositPrompt.oldAmount}) बदलायची (Edit) आहे, की त्यात नवीन रक्कम (${currencySymbol}${smartDepositPrompt.newAmount}) मिळवायची (Add) आहे?`
                  : `Do you want to edit (overwrite) ${smartDepositPrompt.memberName}'s previous deposit (${currencySymbol}${smartDepositPrompt.oldAmount}) or add (${currencySymbol}${smartDepositPrompt.newAmount}) to it?`}
              </p>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onConfirmDepositAction) {
                      onConfirmDepositAction(
                        smartDepositPrompt.memberId,
                        smartDepositPrompt.newAmount,
                        smartDepositPrompt.note,
                        'add'
                      );
                    }
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>
                    {lang === 'mr' ? 'नवीन रक्कम मिळवा (Add)' : 'Add Amount'} ({currencySymbol}{new Intl.NumberFormat('en-IN').format(smartDepositPrompt.oldAmount + smartDepositPrompt.newAmount)})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onConfirmDepositAction) {
                      onConfirmDepositAction(
                        smartDepositPrompt.memberId,
                        smartDepositPrompt.newAmount,
                        smartDepositPrompt.note,
                        'edit'
                      );
                    }
                  }}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-100 active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {lang === 'mr' ? 'रक्कम बदला (Edit / Overwrite)' : 'Edit / Overwrite'} ({currencySymbol}{new Intl.NumberFormat('en-IN').format(smartDepositPrompt.newAmount)})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onCancelSmartDeposit && onCancelSmartDeposit()}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: ADD PLAN */}
       {showPlanModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
           <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[40px] sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-400" />
                {t("addPlan")}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex p-1 bg-slate-100 mx-6 mt-6 rounded-2xl">
              <button
                onClick={() => planForm.setTab('manual')}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${planForm.tab === 'manual' ? 'bg-white text-indigo-950 shadow-sm' : 'text-indigo-300'}`}
              >
                Manual
              </button>
              <button
                onClick={() => planForm.setTab('sms')}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${planForm.tab === 'sms' ? 'bg-white text-teal-600 shadow-sm' : 'text-indigo-300'}`}
              >
                Smart SMS Reader
              </button>
            </div>

            {planForm.tab === 'manual' ? (
              <form id="plan-form" onSubmit={planForm.onSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="overflow-y-auto   p-6 space-y-6  ">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">{t("planType")}</label>
                      <select
                        value={planForm.type}
                        onChange={(e) => planForm.setType(e.target.value as any)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                      >
                        <option value="ticket">{t("ticket")}</option>
                        <option value="hotel">{t("hotel")}</option>
                        <option value="activity">{t("activity")}</option>
                        <option value="other">{t("other")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">DateTime</label>
                      <input
                        type="datetime-local"
                        required
                        value={planForm.datetime}
                        onChange={(e) => planForm.setDatetime(e.target.value)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">{lang === 'mr' ? 'नियोजनाचे शीर्षक' : 'Plan Title'}</label>
                    <input
                      type="text"
                      required
                      value={planForm.title}
                      onChange={(e) => planForm.setTitle(e.target.value)}
                      className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">Cost</label>
                      <input
                        type="number"
                        value={planForm.cost}
                        onChange={(e) => planForm.setCost(e.target.value)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest mb-1.5 ml-2">Ref ID</label>
                      <input
                        type="text"
                        value={planForm.bookingRef}
                        onChange={(e) => planForm.setBookingRef(e.target.value)}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-200 shrink-0 flex gap-4 pb-safe-offset-4">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="flex-1 py-4 bg-slate-50 border border-slate-100 text-indigo-300 rounded-3xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
                  >
                    {t("save")}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={planForm.onParseSMS} className="p-6 space-y-6">
                <div className="space-y-2">
                   <label className="block text-sm font-black text-indigo-300 uppercase tracking-widest ml-2">{lang === 'mr' ? 'SMS मेसेज पेस्ट करा' : 'Paste SMS'}</label>
                   <textarea
                    value={planForm.bookingText}
                    onChange={(e) => planForm.setBookingText(e.target.value)}
                    className="w-full h-40 bg-indigo-50 border border-slate-100 rounded-3xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all"
                    placeholder="PNR 4213941215 Train 12138 seat S3..."
                   />
                </div>
                <button
                  type="submit"
                  disabled={planForm.isParsing}
                  className="w-full py-4 bg-teal-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {planForm.isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {lang === 'mr' ? 'माहिती मिळवा' : 'Extract Info'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
           <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[40px] sm:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Share2 className="w-6 h-6 text-amber-400" />
                {lang === 'mr' ? 'मित्रांना जोडा' : 'Sync Friends'}
              </h3>
              <button onClick={() => setShowSyncModal(false)} className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-center">
              {isCloudSynced ? (
                <div className="space-y-6">
                  <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                    <Wifi className="w-10 h-10 text-emerald-600 mx-auto animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em]">Live Sync Active</p>
                      <p className="text-4xl font-black text-indigo-950 tracking-widest">{sync.tripCode}</p>
                    </div>
                  </div>
                  <button 
                    onClick={sync.onShareLink}
                    className="w-full py-4 bg-teal-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-teal-200 active:scale-95 transition-all"
                  >
                    Share Link
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="space-y-4">
                      <p className="text-sm font-bold text-slate-800">Start sharing this trip in real-time</p>
                      <button 
                        onClick={sync.onStartSharing}
                        className="w-full py-4 bg-amber-500 text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-200 active:scale-95 transition-all"
                      >
                        {t('createSharedTrip')}
                      </button>
                   </div>
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                      <span className="relative bg-white px-6 text-sm font-black text-indigo-200 uppercase tracking-widest">OR</span>
                   </div>
                   <form onSubmit={sync.onJoinTrip} className="space-y-4">
                      <input 
                        type="text" 
                        required
                        value={sync.inputCode}
                        onChange={(e) => sync.setInputCode(e.target.value.toUpperCase())}
                        placeholder={t('enterTripCode')}
                        className="w-full bg-indigo-50 border border-slate-100 rounded-2xl px-6 py-4 text-center text-lg font-black tracking-[0.3em] focus:outline-none"
                      />
                      <button 
                        type="submit"
                        className="w-full py-4 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                      >
                        {t('joinExistingTrip')}
                      </button>
                   </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* CUSTOM DIALOG MODAL (Replacement for alert/confirm/prompt) */}
      {dialog.config.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-6 space-y-6 flex flex-col max-h-[85vh]"
          >
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight">{dialog.config.title}</h3>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">{dialog.config.message}</p>
            </div>

            {dialog.config.type === 'prompt' && (
              <input
                type="text"
                autoFocus
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-2xl px-6 py-4 text-lg font-black text-indigo-950 focus:outline-none focus:border-teal-500 transition-all text-center"
                placeholder="..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') dialog.onSubmit(promptInput);
                }}
              />
            )}

            <div className="flex gap-3">
              {(dialog.config.type === 'confirm' || dialog.config.type === 'prompt') && (
                <button
                  onClick={dialog.onClose}
                  className="flex-1 py-4 bg-slate-50 border border-slate-100 text-indigo-300 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                >
                  {dialog.config.cancelLabel || (lang === 'mr' ? 'नको' : 'Cancel')}
                </button>
              )}
              <button
                onClick={() => dialog.onSubmit(dialog.config.type === 'prompt' ? promptInput : undefined)}
                className={`flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all ${
                  dialog.config.type === 'confirm' && (dialog.config.title.toLowerCase().includes('delete') || dialog.config.title.includes('हटव'))
                    ? 'bg-rose-600 text-white shadow-rose-200'
                    : 'bg-indigo-950 text-white shadow-indigo-200'
                }`}
              >
                {dialog.config.confirmLabel || (lang === 'mr' ? 'हो' : 'Confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
