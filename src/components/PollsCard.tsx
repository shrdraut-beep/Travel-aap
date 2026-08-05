import React from 'react';
import { motion } from 'framer-motion';
import { Vote, Plus, X, Check, BarChart3, Users } from 'lucide-react';
import { Poll, TripGroup } from '../types';

interface PollsCardProps {
  trip: TripGroup;
  lang: string;
  userId: string;
  onVote: (pollId: string, optionId: string) => void;
  onCreatePoll: (question: string, options: string[]) => void;
  onClosePoll: (pollId: string) => void;
}

export const PollsCard: React.FC<PollsCardProps> = ({ trip, lang, userId, onVote, onCreatePoll, onClosePoll }) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [options, setOptions] = React.useState(['', '']);

  const handleCreate = () => {
    if (question.trim() && options.every(o => o.trim())) {
      onCreatePoll(question, options);
      setIsCreating(false);
      setQuestion('');
      setOptions(['', '']);
    }
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));

  const activePolls = (trip.polls || []).filter(p => p.isOpen);

  return (
    <div className="bg-white backdrop-blur-md rounded-[32px] p-6 border border-slate-200/50 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Vote className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-widest leading-none mb-1">
              {lang === 'mr' ? 'ग्रुप पोल' : 'Group Polls'}
            </h3>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              {lang === 'mr' ? 'एकत्र ठरवूया!' : 'Decide Together'}
            </p>
          </div>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-90 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {isCreating ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">
              {lang === 'mr' ? 'प्रश्न' : 'Question'}
            </label>
            <input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={lang === 'mr' ? 'उदा. कुठे जेवायचे?' : 'e.g. Where to eat?'}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 placeholder:text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">
              {lang === 'mr' ? 'पर्याय' : 'Options'}
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                  placeholder={`${lang === 'mr' ? 'पर्याय' : 'Option'} ${i + 1}`}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 placeholder:text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 text-sm"
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addOption}
              className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1 pl-1 py-2"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'mr' ? 'पर्याय जोडा' : 'Add Option'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsCreating(false)}
              className="flex-1 py-3.5 bg-white text-slate-800 rounded-2xl font-bold uppercase tracking-widest text-sm border border-slate-200"
            >
              {lang === 'mr' ? 'रद्द' : 'Cancel'}
            </button>
            <button 
              onClick={handleCreate}
              className="flex-[2] py-3.5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg"
            >
              {lang === 'mr' ? 'सुरू करा' : 'Start Poll'}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {activePolls.length === 0 ? (
            <div className="py-8 text-center bg-white/90 rounded-[24px] border border-dashed border-slate-200/50">
              <BarChart3 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                {lang === 'mr' ? 'सध्या पोल नाहीत' : 'No active polls'}
              </p>
            </div>
          ) : (
            activePolls.map(poll => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
              return (
                <div key={poll.id} className="space-y-5 bg-white/90 border border-slate-200/50 p-5 rounded-[24px]">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight flex-1 pr-4">
                      {poll.question}
                    </h4>
                    {poll.createdBy === userId && (
                      <button 
                        onClick={() => onClosePoll(poll.id)}
                        className="text-sm font-bold text-rose-500 uppercase tracking-widest px-2 py-1 bg-rose-50 rounded-lg border border-rose-100"
                      >
                        {lang === 'mr' ? 'बंद' : 'End'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {poll.options.map(option => {
                      const voteCount = option.votes.length;
                      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                      const hasVoted = option.votes.includes(userId);

                      return (
                        <button 
                          key={option.id}
                          onClick={() => onVote(poll.id, option.id)}
                          className="w-full text-left space-y-2 group relative"
                        >
                          <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              {option.text}
                              {hasVoted && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                            </span>
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                              {voteCount} {lang === 'mr' ? 'मत' : 'votes'}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`h-full rounded-full ${hasVoted ? 'bg-slate-900' : 'bg-slate-300'} transition-all`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest pt-2 border-t border-slate-100/50">
                    <Users className="w-3.5 h-3.5" />
                    {totalVotes} {lang === 'mr' ? 'एकूण मते' : 'total votes'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
