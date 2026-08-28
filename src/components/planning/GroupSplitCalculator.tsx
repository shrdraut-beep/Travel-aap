import React, { useState } from 'react';
import { 
  DollarSign, Users, QrCode, Copy, Check, Share2, ArrowRight, ShieldCheck, 
  Wallet, RefreshCw, Send, Smartphone
} from 'lucide-react';
import { TripGroup } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { safeCopyToClipboard } from '../../utils';

interface GroupSplitCalculatorProps {
  trip: TripGroup;
  onShowToast?: (msg: string, type?: 'success' | 'alert') => void;
}

export const GroupSplitCalculator: React.FC<GroupSplitCalculatorProps> = ({
  trip,
  onShowToast,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [totalBill, setTotalBill] = useState<string>('6000');
  const [expenseTitle, setExpenseTitle] = useState<string>('Goa Resort & Cab Booking');
  const [upiId, setUpiId] = useState<string>('shrd.raut@okaxis');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const members = trip.members && trip.members.length > 0 ? trip.members : [
    { id: 'm1', name: 'Shrd Raut', role: 'admin' as const },
    { id: 'm2', name: 'Pooja Patil', role: 'member' as const },
    { id: 'm3', name: 'Amit Deshmukh', role: 'member' as const },
    { id: 'm4', name: 'Snehal Kadam', role: 'member' as const },
  ];

  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));

  const billAmount = parseFloat(totalBill) || 0;
  const count = selectedMembers.length || 1;
  const perPerson = Math.round(billAmount / count);

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter(m => m !== id));
      }
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const getUpiUrl = (amount: number, name: string) => {
    const encodedName = encodeURIComponent(`Routripo Split - ${name}`);
    const encodedNote = encodeURIComponent(`${expenseTitle} (Per head ₹${amount})`);
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
  };

  const copyShareText = async () => {
    const text = isMr
      ? `📢 *${trip.name || 'आमची ट्रिप'} - खर्च वाटप (Routripo)*\n\n📌 *खर्चाचा तपशील:* ${expenseTitle}\n💰 *एकूण रक्कम:* ₹${billAmount}\n👥 *सहभागी सदस्य:* ${count} जण\n👉 *प्रत्येकी वाटा:* *₹${perPerson}*\n\n💳 *UPI द्वारे पैसे पाठवा:* \n${upiId}\n\n📲 *थेट UPI पेमेंट लिंक:* \n${getUpiUrl(perPerson, 'Friend')}`
      : `📢 *${trip.name || 'Our Trip'} - Expense Split (Routripo)*\n\n📌 *Expense:* ${expenseTitle}\n💰 *Total Bill:* ₹${billAmount}\n👥 *Split Among:* ${count} friends\n👉 *Per Person Share:* *₹${perPerson}*\n\n💳 *Pay via UPI ID:* \n${upiId}\n\n📲 *Direct UPI Pay Link:* \n${getUpiUrl(perPerson, 'Friend')}`;

    const ok = await safeCopyToClipboard(text);
    if (ok && onShowToast) {
      onShowToast(isMr ? 'WhatsApp मेसेज कॉपी केला!' : 'Split message copied to clipboard!', 'success');
    }
  };

  const copyUpiLink = async (memberIndex: number, amount: number, name: string) => {
    const link = getUpiUrl(amount, name);
    await safeCopyToClipboard(link);
    setCopiedIndex(memberIndex);
    setTimeout(() => setCopiedIndex(null), 2000);
    if (onShowToast) {
      onShowToast(isMr ? `${name} साठी UPI लिंक कॉपी केली!` : `UPI link copied for ${name}!`, 'success');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shrink-0 shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'ग्रुप स्प्लिट बिल आणि UPI पेमेंट' : 'Group Split Bill & Instant UPI Pay'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                LetsFG
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {isMr ? 'मित्रांमध्ये समान खर्च वाटा आणि त्वरित UPI रिक्वेस्ट पाठवा' : 'Split flight, stay & cab fares with instant UPI links'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyShareText}
          className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{isMr ? 'WhatsApp वर शेअर करा' : 'Share on WhatsApp'}</span>
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
            {isMr ? 'एकूण रक्कम (₹)' : 'Total Bill Amount (₹)'}
          </label>
          <input
            type="number"
            value={totalBill}
            onChange={e => setTotalBill(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
            placeholder="6000"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
            {isMr ? 'खर्चाचा विषय / कारण' : 'Expense Title'}
          </label>
          <input
            type="text"
            value={expenseTitle}
            onChange={e => setExpenseTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
            placeholder="Goa Resort & Cab"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
            {isMr ? 'पैसे स्वीकारणारा UPI ID' : 'Receiving UPI ID'}
          </label>
          <input
            type="text"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
            placeholder="user@upi"
          />
        </div>
      </div>

      {/* Calculation Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
            {isMr ? 'प्रत्येकी वाटा (PER PERSON SHARE)' : 'PER PERSON EQUAL SHARE'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-0.5">
            ₹{new Intl.NumberFormat('en-IN').format(perPerson)}
          </div>
          <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
            {isMr ? `एकूण ₹${billAmount} ÷ ${count} सहभागी सदस्य` : `Split ₹${billAmount} evenly across ${count} members`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white px-3 py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
            {upiId}
          </div>
        </div>
      </div>

      {/* Member selection & UPI link generator */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
          {isMr ? 'सहभागी सदस्य निवडा आणि वैयक्तिक UPI लिंक' : 'Select Members & Per-User UPI Action'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {members.map((member, idx) => {
            const isSelected = selectedMembers.includes(member.id);
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={member.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMember(member.id)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-slate-900 truncate">
                      {member.name}
                    </span>
                    <span className="block text-[10px] font-bold text-emerald-700">
                      {isSelected ? `₹${perPerson}` : (isMr ? 'वगळले' : 'Excluded')}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyUpiLink(idx, perPerson, member.name)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-[10px] font-black text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? (isMr ? 'कॉपी झाले' : 'Copied') : 'UPI Link'}</span>
                    </button>
                    <a
                      href={getUpiUrl(perPerson, member.name)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                      title="Open UPI App"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
