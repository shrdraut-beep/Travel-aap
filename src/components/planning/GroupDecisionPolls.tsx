import React, { useState } from 'react';
import { Vote, Plus, CheckCircle2, Users, Trophy, Compass as Sparkles, X, AlertCircle } from 'lucide-react';
import { TripGroup, Poll } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface GroupDecisionPollsProps {
  trip: TripGroup;
  userId?: string;
  onUpdateTrip?: (updated: TripGroup) => void;
}

export const GroupDecisionPolls: React.FC<GroupDecisionPollsProps> = ({
  trip,
  userId = 'user_1',
  onUpdateTrip,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');

  // Default pre-populated polls if trip doesn't have any
  const polls: Poll[] = trip.polls && trip.polls.length > 0 ? trip.polls : [
    {
      id: 'poll_hotel_pref',
      question: isMr ? 'कोणते हॉटेल बुक करायचे?' : 'Which hotel should we book in the destination?',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      isOpen: true,
      options: [
        { id: 'opt_1', text: isMr ? 'बीच-फ्रंट रिसॉर्ट (स्विमिंग पूलसह)' : 'Beach-Front Resort (with Pool)', votes: ['user_1', 'user_2'] },
        { id: 'opt_2', text: isMr ? 'हेरिटेज व्हिला / होमस्टे' : 'Heritage Villa / Homestay', votes: ['user_3'] },
        { id: 'opt_3', text: isMr ? 'बजेट फ्रेंडली ३-स्टार हॉटेल' : 'Budget 3-Star City Hotel', votes: [] }
      ]
    },
    {
      id: 'poll_food_pref',
      question: isMr ? 'पहिल्या रात्री जेवणासाठी कोणती जागा योग्य राहील?' : 'Where should we go for Day 1 Welcome Dinner?',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      isOpen: true,
      options: [
        { id: 'opt_food_1', text: isMr ? 'स्थानिक सी-फूड व अस्सल थाळी' : 'Local Traditional Thali & Seafood', votes: ['user_1', 'user_3'] },
        { id: 'opt_food_2', text: isMr ? 'रूफटॉप कॅफे व लाईव्ह म्युझिक' : 'Rooftop Cafe with Live Music', votes: ['user_2', 'user_4'] }
      ]
    }
  ];

  const handleVote = (pollId: string, optionId: string) => {
    const updatedPolls = polls.map(p => {
      if (p.id !== pollId) return p;
      const updatedOptions = p.options.map(opt => {
        // Remove previous vote by this user if any
        const filteredVotes = opt.votes.filter(v => v !== userId);
        if (opt.id === optionId) {
          return { ...opt, votes: [...filteredVotes, userId] };
        }
        return { ...opt, votes: filteredVotes };
      });
      return { ...p, options: updatedOptions };
    });

    if (onUpdateTrip) {
      onUpdateTrip({ ...trip, polls: updatedPolls });
    }
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !option1.trim() || !option2.trim()) return;

    const validOptions = [option1, option2, option3, option4]
      .filter(o => o.trim().length > 0)
      .map((text, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text: text.trim(),
        votes: []
      }));

    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      question: question.trim(),
      createdBy: userId,
      createdAt: new Date().toISOString(),
      isOpen: true,
      options: validOptions
    };

    const updatedPolls = [newPoll, ...polls];
    if (onUpdateTrip) {
      onUpdateTrip({ ...trip, polls: updatedPolls });
    }

    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setShowCreateModal(false);
  };

  const handleClosePoll = (pollId: string) => {
    const updatedPolls = polls.map(p => {
      if (p.id === pollId) return { ...p, isOpen: false };
      return p;
    });
    if (onUpdateTrip) {
      onUpdateTrip({ ...trip, polls: updatedPolls });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100 shrink-0 shadow-xs">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'ग्रुप निर्णय आणि व्होटिंग पोल' : 'Group Decision & Voting Polls'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                LetsFG
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {isMr ? 'ग्रुप सदस्यांची मते जाणून घेऊन निर्णय घ्या' : 'Vote with friends on stays, dining & activities'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ नवीन पोल तयार करा' : '+ New Poll'}</span>
        </button>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
          // Find winning option if votes exist
          const maxVotes = Math.max(...poll.options.map(o => o.votes.length), 0);
          const winningOption = maxVotes > 0 ? poll.options.find(o => o.votes.length === maxVotes) : null;

          return (
            <div key={poll.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      {totalVotes} {isMr ? 'मते' : 'Votes'}
                    </span>
                    {!poll.isOpen && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {isMr ? 'पूर्ण' : 'Finalized'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1">{poll.question}</h4>
                </div>

                {poll.isOpen && (
                  <button
                    type="button"
                    onClick={() => handleClosePoll(poll.id)}
                    className="text-[10px] font-bold text-slate-500 hover:text-purple-600 uppercase px-2 py-1 rounded-lg bg-white border border-slate-200"
                  >
                    {isMr ? 'पोल बंद करा' : 'Lock Poll'}
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {poll.options.map((opt) => {
                  const hasVoted = opt.votes.includes(userId);
                  const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                  const isWinning = winningOption?.id === opt.id && totalVotes > 0;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!poll.isOpen}
                      onClick={() => handleVote(poll.id, opt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden cursor-pointer ${
                        hasVoted
                          ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/40'
                          : 'bg-white border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      {/* Vote progress fill */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-500 opacity-20 ${
                          isWinning ? 'bg-purple-600' : 'bg-slate-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            hasVoted ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {hasVoted && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-xs font-bold truncate ${hasVoted ? 'text-purple-900' : 'text-slate-800'}`}>
                            {opt.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isWinning && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="text-xs font-black text-slate-700">{percentage}%</span>
                          <span className="text-[10px] font-bold text-slate-400">({opt.votes.length})</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Vote className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {isMr ? 'नवीन ग्रुप पोल तयार करा' : 'Create Group Poll'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'पोलचा प्रश्न' : 'Poll Question'} *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder={isMr ? 'उदा. कोणते हॉटेल निवडायचे?' : 'e.g. Which hotel should we book?'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'पर्याय १' : 'Option 1'} *
                </label>
                <input
                  type="text"
                  required
                  value={option1}
                  onChange={e => setOption1(e.target.value)}
                  placeholder={isMr ? 'पर्याय १ नाव' : 'Option 1'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'पर्याय २' : 'Option 2'} *
                </label>
                <input
                  type="text"
                  required
                  value={option2}
                  onChange={e => setOption2(e.target.value)}
                  placeholder={isMr ? 'पर्याय २ नाव' : 'Option 2'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'पर्याय ३ (पर्यायी)' : 'Option 3 (Optional)'}
                </label>
                <input
                  type="text"
                  value={option3}
                  onChange={e => setOption3(e.target.value)}
                  placeholder={isMr ? 'पर्याय ३ नाव' : 'Option 3'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 cursor-pointer"
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 shadow-md cursor-pointer"
                >
                  {isMr ? 'पोल सुरू करा' : 'Publish Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
