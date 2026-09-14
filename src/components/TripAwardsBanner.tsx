import React from 'react';
import { Award, Camera, Compass, Crown, Wallet, Zap } from 'lucide-react';
import { TripGroup, Expense } from '../types';
import { getUniqueMembers } from '../utils';

interface TripAwardsBannerProps {
  trip: TripGroup;
  lang: string;
}

export const TripAwardsBanner: React.FC<TripAwardsBannerProps> = ({ trip, lang }) => {
  // Let's create dummy awards based on members
  // We need at least some logic to assign awards. We'll just distribute them sequentially or randomly.
  
  const awardsList = [
    {
      id: 'planner',
      icon: <Compass className="w-4 h-4" />,
      color: 'bg-premium-sky-soft0',
      titleMr: 'कॅप्टन',
      titleEn: 'The Planner',
      descMr: 'प्लॅनिंग मास्टर',
      descEn: 'Trip Admin'
    },
    {
      id: 'treasurer',
      icon: <Wallet className="w-4 h-4" />,
      color: 'bg-[var(--premium-pink)]',
      titleMr: 'खजिनदार',
      titleEn: 'The Treasurer',
      descMr: 'हिशोब मास्टर',
      descEn: 'Expense Manager'
    },
    {
      id: 'spender',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-purple-500',
      titleMr: 'रावसाहेब',
      titleEn: 'Big Spender',
      descMr: 'खर्चाचा राजा',
      descEn: 'Max Spender'
    },
    {
      id: 'vip',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-rose-500',
      titleMr: 'व्हीआयपी पाहुणा',
      titleEn: 'VIP Guest',
      descMr: 'सर्वात कमी खर्च',
      descEn: 'Chill Vibes'
    },
    {
      id: 'camera',
      icon: <Camera className="w-4 h-4" />,
      color: 'bg-rose-500',
      titleMr: 'कॅमेरामन',
      titleEn: 'The Paparazzi',
      descMr: 'फोटो एक्सपर्ट',
      descEn: 'Photo Expert'
    }
  ];

  // Distribute awards among members
  const memberAwards = getUniqueMembers(trip.members || []).map((member, index) => {
    const award = awardsList[index % awardsList.length];
    return { member, award };
  });

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200 mt-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-orange-100 text-premium-pink flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {lang === 'mr' ? 'सहल पुरस्कार 🏆' : 'Trip Awards 🏆'}
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'mr' ? 'मजेदार बॅजेस आणि टायटल्स' : 'Funny Badges & Titles'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {memberAwards.map(({ member, award }, idx) => (
          <div key={`${member.id}-${idx}`} className="flex flex-col items-center gap-2 min-w-[90px] shrink-0">
            <div className="relative">
              {/* Avatar */}
              <div 
                className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center justify-center text-xl font-black text-white"
                style={{ backgroundColor: member.avatar ? 'transparent' : member.color }}
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              
              {/* Badge Icon Overlay */}
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] flex items-center justify-center text-white ${award.color}`}>
                {award.icon}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-[11px] font-black text-slate-800 truncate w-[80px]">
                {member.name}
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${award.color.replace('bg-', 'text-')}`}>
                {lang === 'mr' ? award.titleMr : award.titleEn}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
