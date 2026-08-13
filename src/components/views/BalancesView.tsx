import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRightLeft, Plus, Smartphone, History, Users, ArrowUpRight, ArrowDownLeft, Camera, Share2, Edit2, Crown, Turtle, QrCode } from 'lucide-react';
import { Member, Deposit, CalculationMode, Expense } from '../../types';
import { Transfer, getUniqueMembers } from '../../utils';
import { UpiQrModal } from '../UpiQrModal';

interface BalancesViewProps {
  members: Member[];
  deposits: Deposit[];
  balances: { [key: string]: number };
  transfers: Transfer[];
  adminId?: string;
  calculationMode: CalculationMode;
  onAddDeposit: () => void;
  onEditDeposit?: (memberId: string) => void;
  onAddMember: () => void;
  onUpdateMemberAvatar?: (memberId: string, avatarUrl: string) => void;
  onUpdateMemberUPI?: (memberId: string, upiId: string) => void;
  onPayUPI: (toId: string, amount: number) => void;
  onShareRequest: (toId: string, amount: number) => void;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  themeColor?: string;
  onUpdateTrip?: (updatedTrip: any) => void;
  trip?: any;
}

export const BalancesView: React.FC<BalancesViewProps> = ({ 
  members: rawMembers, deposits, balances, transfers, adminId, calculationMode, onAddDeposit, onEditDeposit, onAddMember, onUpdateMemberAvatar, onUpdateMemberUPI, onPayUPI, onShareRequest, lang, t, currencySymbol, themeColor = '#6366f1',
  onUpdateTrip, trip
}) => {
  const members = getUniqueMembers(rawMembers);
  const [selectedMemberForQr, setSelectedMemberForQr] = useState<{ member: Member; amount?: number } | null>(null);

  const maxDeposited = Math.max(...members.map(m => m.totalDeposited));
  const minDeposited = Math.min(...members.map(m => m.totalDeposited));
  const superFunderId = members.find(m => m.totalDeposited === maxDeposited && maxDeposited > 0)?.id;
  const pennyPincherId = members.find(m => m.totalDeposited === minDeposited && members.length > 1)?.id;

  const expensesList = trip?.expenses || [];
  const totalTripExpense = expensesList.reduce((acc: number, exp: any) => acc + exp.amount, 0);
  const memberCount = members?.length || 1;
  const averageCostPerPerson = totalTripExpense / memberCount;

  // Individual total spent out of pocket: how much each member has paid out of pocket so far (expense paidBy === member.id)
  const individualTotalSpentMap = (members || []).reduce((acc, m) => {
    acc[m.id] = expensesList
      .filter((exp: any) => exp.paidBy === m.id)
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-5 py-2 space-y-6">
      <div className="flex flex-col items-center justify-center pt-2 space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-center">
          {t('settlements')}
        </h2>
        
        {/* Mode Indicator */}
        <div className={`px-4 py-2 rounded-2xl border border-slate-200/50 backdrop-blur-md flex items-center gap-2`} style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
           <Wallet className="w-4 h-4" />
           <span className="text-sm font-bold uppercase tracking-widest">
             {calculationMode === 'admin_pooled' 
               ? (lang === 'mr' ? 'अ‍ॅडमिन जमा (Pool)' : lang === 'hi' ? 'एडमिन पूल (Pool)' : 'Admin Pool Mode')
               : (lang === 'mr' ? 'प्रत्येकाने खर्च (Split)' : lang === 'hi' ? 'प्रत्येक का खर्च (Split)' : 'Split Mode')}
           </span>
        </div>

        <div className="w-full flex justify-center">
          <button 
            onClick={onAddMember}
            className="px-5 py-3 bg-white backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm active:scale-95 transition-all flex items-center gap-2 text-slate-800"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">{t('addMember')}</span>
          </button>
        </div>
      </div>

      {/* Trip Summary Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 border border-slate-200/50 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-widest">{t('tripSummary')}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === 'mr' ? 'एकूण खर्च आणि सरासरी' : lang === 'hi' ? 'कुल खर्च और औसत' : 'Total Expense & Average'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('totalTripExpenseKey')}</span>
            <span className="text-xl font-black text-slate-800 mt-2">
              {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalTripExpense)}
            </span>
          </div>
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('averageCostPerPerson')}</span>
            <span className="text-xl font-black text-indigo-600 mt-2">
              {currencySymbol}{new Intl.NumberFormat('en-IN').format(averageCostPerPerson)}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Total Spent Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-4 bg-teal-500 rounded-full" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            {t('individualTotalSpent')}
          </h3>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-slate-200/50 p-5 shadow-sm divide-y divide-slate-100">
          {members.map((member, idx) => {
            const spent = individualTotalSpentMap[member.id] || 0;
            return (
              <div key={`${member.id}-${idx}`} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-inner overflow-hidden"
                    style={{ backgroundColor: member.avatar ? 'transparent' : member.color }}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">{member.name}</span>
                    <span className="text-xs text-slate-700 uppercase font-bold tracking-wider">{lang === 'mr' ? 'स्वखर्चाने भरले' : lang === 'hi' ? 'स्वयं भुगतान किया' : 'Paid Out of Pocket'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-800">
                    {currencySymbol}{new Intl.NumberFormat('en-IN').format(spent)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfers / Settlements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
              {t('whoOwesWhom')}
            </h3>
          </div>
          {(transfers || []).length > 0 && (
            <button
              onClick={() => {
                let shareText = `📊 ${trip?.name || 'Trip'} Settlement 📊\n\n`;
                transfers.forEach(trans => {
                  shareText += `💸 ${trans.from} owes ${trans.to}: ${currencySymbol}${trans.amount}\n`;
                });
                shareText += `\nShared via Routripo`;
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              {t('shareWhatsApp')}
            </button>
          )}
        </div>

        {(transfers || []).length > 0 && (
          <div className="space-y-4">
            {(transfers || []).map((trans, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white backdrop-blur-md rounded-[28px] p-5 border border-slate-200/50 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm font-bold text-rose-400 uppercase tracking-widest leading-none">{t('owes')}</p>
                    <p className="text-[15px] font-bold text-slate-800 truncate">
                      {trans.from}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200/50">
                      <span className="text-[15px] font-black text-slate-800">{currencySymbol}{new Intl.NumberFormat('en-IN').format(trans.amount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-1 text-right">
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest leading-none">{t('getsBack')}</p>
                    <p className="text-[15px] font-bold text-slate-800 truncate">
                      {trans.to}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onPayUPI(trans.toId, trans.amount)}
                    className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    {t('payViaUpi')}
                  </button>
                  <button
                    onClick={() => {
                      const toMember = members.find(m => m.id === trans.toId);
                      if (toMember) {
                        setSelectedMemberForQr({ member: toMember, amount: trans.amount });
                      }
                    }}
                    className="px-4 py-3.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{lang === 'mr' ? 'QR कोड' : 'QR Code'}</span>
                  </button>
                  <button
                    onClick={() => onShareRequest(trans.toId, trans.amount)}
                    className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all text-slate-800 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Members & Balances List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Users className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            {t('members')} & {t('balance')}
          </h3>
        </div>

        <div className="bg-white backdrop-blur-md rounded-[28px] border border-slate-200/50 overflow-hidden shadow-sm">
          {(members || []).map((m, idx) => {
            const bal = balances[m.id] || 0;
            return (
              <div 
                key={`${m.id}-${idx}`} 
                className={`p-5 flex flex-col ${idx !== (members || []).length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer group block">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && onUpdateMemberAvatar) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              onUpdateMemberAvatar(m.id, reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div 
                        className="w-13 h-13 rounded-[20px] flex items-center justify-center text-[18px] font-bold text-white shadow-inner relative overflow-hidden"
                        style={{ backgroundColor: m.avatar ? 'transparent' : m.color }}
                      >
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name.charAt(0)
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </label>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-slate-800 leading-none">
                          {m.name} {m.id === adminId ? `(${lang === 'mr' ? 'अ‍ॅडमिन' : 'Admin'})` : ''}
                        </p>
                        {m.id === superFunderId && (
                          <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                             <Crown className="w-2.5 h-2.5" />
                             <span className="text-sm font-black uppercase tracking-wider">{lang === 'mr' ? 'सुपर फंडर' : 'Super Funder'}</span>
                          </div>
                        )}
                        {m.id === pennyPincherId && m.id !== superFunderId && (
                          <div className="flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                             <Turtle className="w-2.5 h-2.5" />
                             <span className="text-sm font-black uppercase tracking-wider">{lang === 'mr' ? 'कॅश सेव्हर' : 'Penny Pincher'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">{lang === 'mr' ? 'जमा' : lang === 'hi' ? 'जमा' : 'Deposited'}: {currencySymbol}{new Intl.NumberFormat('en-IN').format(m.totalDeposited)}</p>
                        <button
                          type="button"
                          onClick={() => onEditDeposit ? onEditDeposit(m.id) : onAddDeposit()}
                          className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 shadow-2xs active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                          title={lang === 'mr' ? 'रक्कम बदला (Edit Deposit)' : 'Edit Deposit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[17px] font-black ${bal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {bal >= 0 ? '+' : ''}{currencySymbol}{new Intl.NumberFormat('en-IN').format(bal)}
                    </p>
                  </div>
                </div>

                {/* UPI ID Section */}
                <div className="mt-4 flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <Smartphone className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">UPI:</span>
                    <span className="text-xs font-bold text-slate-800 truncate font-mono">
                      {m.upiId || (lang === 'mr' ? 'सेट नाही' : 'Not set')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedMemberForQr({ member: m, amount: bal > 0 ? bal : undefined })}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'QR कोड' : 'QR Code'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateMemberUPI) {
                          onUpdateMemberUPI(m.id, m.upiId || '');
                        }
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-slate-800 shadow-sm active:scale-95 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UPI QR Modal */}
      {selectedMemberForQr && (
        <UpiQrModal
          member={selectedMemberForQr.member}
          amount={selectedMemberForQr.amount}
          currencySymbol={currencySymbol}
          lang={lang}
          t={t}
          onClose={() => setSelectedMemberForQr(null)}
        />
      )}



      <button
        type="button"
        onClick={onAddDeposit}
        title={lang === 'mr' ? 'जमा रक्कम नोंदवा' : 'Add Deposit'}
        className="fixed bottom-24 right-5 w-12 h-12 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center z-40 active:scale-95 transition-all hover:scale-105 border-none ring-0 cursor-pointer"
        style={{ backgroundColor: themeColor || '#10b981' }}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
