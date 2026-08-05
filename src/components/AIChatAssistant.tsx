import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, User, PlusCircle, Plane, Fuel, Share2, CalendarPlus, UserPlus, RefreshCw } from 'lucide-react';
import { TripGroup } from '../types';

interface ActionChip {
  label: string;
  actionType: 'add_expense' | 'search_flight' | 'fuel_calc' | 'whatsapp_invite' | 'add_plan' | 'add_member';
  icon: React.FC<{ className?: string }>;
  color: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionChips?: ActionChip[];
}

interface AIChatAssistantProps {
  avatarGender: 'male' | 'female';
  setAvatarGender: (gender: 'male' | 'female') => void;
  botProfile: any;
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  onAddExpense?: () => void;
  onSearchFlights?: () => void;
  onOpenFuelCalculator?: () => void;
  onInviteWhatsApp?: () => void;
  onAddItineraryPlan?: () => void;
  onAddMember?: () => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  avatarGender,
  setAvatarGender,
  botProfile,
  trip,
  lang,
  t,
  currencySymbol,
  onAddExpense,
  onSearchFlights,
  onOpenFuelCalculator,
  onInviteWhatsApp,
  onAddItineraryPlan,
  onAddMember
}) => {
  const initialAiMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'ai',
    text: botProfile.greeting,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionChips: [
      {
        label: lang === 'mr' ? '✈️ विमाने व तिकीट शोधा' : '✈️ Search Flights',
        actionType: 'search_flight',
        icon: Plane,
        color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
      },
      {
        label: lang === 'mr' ? '⛽ पेट्रोल आणि टोल खर्च' : '⛽ Fuel Calculator',
        actionType: 'fuel_calc',
        icon: Fuel,
        color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      },
      {
        label: lang === 'mr' ? '💬 व्हॉट्सॲप आमंत्रण पाठवा' : '💬 WhatsApp Invite',
        actionType: 'whatsapp_invite',
        icon: Share2,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      }
    ]
  };
  const [messages, setMessages] = useState<ChatMessage[]>([initialAiMessage]);
  const [inputText, setInputText] = useState('');
  

  const [isTyping, setIsTyping] = useState(false);

  const handleExecuteAction = (actionType: ActionChip['actionType']) => {
    switch (actionType) {
      case 'add_expense':
        if (onAddExpense) onAddExpense();
        break;
      case 'search_flight':
        if (onSearchFlights) onSearchFlights();
        break;
      case 'fuel_calc':
        if (onOpenFuelCalculator) onOpenFuelCalculator();
        break;
      case 'whatsapp_invite':
        if (onInviteWhatsApp) onInviteWhatsApp();
        break;
      case 'add_plan':
        if (onAddItineraryPlan) onAddItineraryPlan();
        break;
      case 'add_member':
        if (onAddMember) onAddMember();
        break;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call server Gemini endpoint or perform smart response with action chips
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          tripName: trip.name,
          startDate: trip.startDate,
          endDate: trip.endDate,
          membersCount: trip.members.length,
          expensesTotal: trip.expenses.reduce((s, e) => s + e.amount, 0),
          lang
        })
      });

      const data = await response.json();
      const replyText = data.text || (
        lang === 'mr'
          ? `मी तुमच्या प्रेरणेने या सहलीची माहिती तपासली आहे! तुम्हाला खर्चाची नोंद करायची आहे किंवा नवीन तिकीट बुकिंग?`
          : `I have analyzed your trip preferences! Would you like to record a new expense or search live flight deals?`
      );

      // Determine smart action chips based on keywords
      const chips: ActionChip[] = [];
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes('expense') || lowerQ.includes('खर्च') || lowerQ.includes('bill') || lowerQ.includes('पैसे') || lowerQ.includes('split')) {
        chips.push({
          label: lang === 'mr' ? '➕ खर्च नोंदवा' : '➕ Open Add Expense Modal',
          actionType: 'add_expense',
          icon: PlusCircle,
          color: 'bg-rose-50 text-rose-700 border-rose-200'
        });
      }
      if (lowerQ.includes('flight') || lowerQ.includes('plane') || lowerQ.includes('विमान') || lowerQ.includes('ticket') || lowerQ.includes('book')) {
        chips.push({
          label: lang === 'mr' ? '✈️ विमाने शोधा' : '✈️ Open Live Flight Search',
          actionType: 'search_flight',
          icon: Plane,
          color: 'bg-sky-50 text-sky-700 border-sky-200'
        });
      }
      if (lowerQ.includes('fuel') || lowerQ.includes('petrol') || lowerQ.includes('diesel') || lowerQ.includes('toll') || lowerQ.includes('पेट्रोल')) {
        chips.push({
          label: lang === 'mr' ? '⛽ इंधन कॅल्क्युलेटर' : '⛽ Calculate Petrol & Toll',
          actionType: 'fuel_calc',
          icon: Fuel,
          color: 'bg-amber-50 text-amber-700 border-amber-200'
        });
      }
      if (chips.length === 0) {
        chips.push(
          {
            label: lang === 'mr' ? '➕ खर्च जोडा' : '➕ Add Expense',
            actionType: 'add_expense',
            icon: PlusCircle,
            color: 'bg-rose-50 text-rose-700 border-rose-200'
          },
          {
            label: lang === 'mr' ? '✈️ विमाने शोधा' : '✈️ Search Flights',
            actionType: 'search_flight',
            icon: Plane,
            color: 'bg-sky-50 text-sky-700 border-sky-200'
          }
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionChips: chips
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI Chat API fallback:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai_fallback_${Date.now()}`,
        sender: 'ai',
        text: lang === 'mr'
          ? `मी तुमची मदत करण्यास उत्सुक आहे! खालील बटणांवर क्लिक करून हवी ती क्रिया करा:`
          : `I am ready to help! Click any action button below to proceed directly:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionChips: [
          {
            label: lang === 'mr' ? '➕ खर्च नोंदवा' : '➕ Add Expense',
            actionType: 'add_expense',
            icon: PlusCircle,
            color: 'bg-rose-50 text-rose-700 border-rose-200'
          },
          {
            label: lang === 'mr' ? '✈️ विमाने शोधा' : '✈️ Search Flights',
            actionType: 'search_flight',
            icon: Plane,
            color: 'bg-sky-50 text-sky-700 border-sky-200'
          },
          {
            label: lang === 'mr' ? '⛽ इंधन कॅल्क्युलेटर' : '⛽ Fuel Calculator',
            actionType: 'fuel_calc',
            icon: Fuel,
            color: 'bg-amber-50 text-amber-700 border-amber-200'
          }
        ]
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 flex flex-col h-[520px]">
      {/* Header Removed (Lifted up) */}
{/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar pb-[30px]">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${botProfile.gradient} text-white flex items-center justify-center shrink-0 mt-1 text-sm shadow-md`}>
                  {botProfile.emoji}
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${isAi ? 'text-left' : 'text-right'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                    isAi
                      ? 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/80'
                      : 'bg-indigo-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] font-bold mt-1 block ${isAi ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Clickable Action Chips */}
                {isAi && msg.actionChips && msg.actionChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.actionChips.map((chip, cIdx) => {
                      const IconComp = chip.icon;
                      return (
                        <motion.button
                          key={cIdx}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleExecuteAction(chip.actionType)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-sm transition-all ${chip.color}`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{chip.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>AI thinking...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="pt-2 border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={lang === 'mr' ? 'स्मार्ट असिस्टंटला विचारा...' : 'Ask Assistant or type e.g. "Add expense"...'}
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md disabled:opacity-50 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
