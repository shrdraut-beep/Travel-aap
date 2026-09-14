import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Play } from 'lucide-react';
import { TripGroup } from '../../types';

export const TimepassGame: React.FC<{ trip: TripGroup; lang: string }> = ({ trip, lang }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const members = trip.members && trip.members.length > 0 
    ? trip.members 
    : [
        { id: '1', name: 'Rahul', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
        { id: '2', name: 'Amit', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
        { id: '3', name: 'Sneha', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
        { id: '4', name: 'Pooja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja' },
      ];

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedMember(null);

    // Random extra spins (5 to 10 full rotations)
    const extraSpins = Math.floor(Math.random() * 5) + 5;
    const baseRotation = extraSpins * 360;
    
    // Choose a random member to stop at
    const randomIndex = Math.floor(Math.random() * members.length);
    const anglePerMember = 360 / members.length;
    
    // Calculate final rotation (pointer points to top, so offset if needed. Let's say bottle points up.)
    // We want the bottle to point at the member. The member is at (i * anglePerMember) degrees.
    const targetAngle = randomIndex * anglePerMember;
    const newRotation = rotation + baseRotation + targetAngle - (rotation % 360);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedMember(members[randomIndex].name);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-[32px] p-6 shadow-xl mb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10" />
      
      <div className="relative z-10 text-center mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1 shadow-sm">
          {lang === 'mr' ? 'प्रवासातील टाईमपास' : 'Travel Timepass Games'}
        </h3>
        <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">
          {lang === 'mr' ? 'स्पिन द बॉटल खेळूया!' : 'Let\'s Play Spin The Bottle!'}
        </p>
      </div>

      <div className="relative w-[280px] h-[280px] mx-auto flex items-center justify-center mb-6">
        {/* Avatars in a circle */}
        {members.map((member, index) => {
          const angle = (index * (360 / members.length)) * (Math.PI / 180);
          const radius = 110; // distance from center
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius; // negative so 0 degrees is top
          
          return (
            <div 
              key={`${member.id}-${index}`}
              className="absolute w-14 h-14 rounded-full border-2 border-white/40 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] bg-white overflow-hidden flex items-center justify-center"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: 'all 0.3s'
              }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-slate-800 text-sm">{member.name[0]}</span>
              )}
            </div>
          );
        })}

        {/* Center Bottle / Spinner */}
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-24 h-24 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center border-4 border-fuchsia-300 relative z-20 cursor-pointer active:scale-95 disabled:scale-100"
        >
          {/* A triangle to act as a pointer on top of the bottle */}
          <div className="absolute -top-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-fuchsia-500 drop-shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]" />
          <span className="font-black text-fuchsia-600 text-xs uppercase tracking-widest mt-1">
            {isSpinning ? (lang === 'mr' ? 'थांबा...' : 'Wait...') : (lang === 'mr' ? 'फिरवा!' : 'Spin!')}
          </span>
        </motion.button>
      </div>

      {selectedMember && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-md rounded-[20px] p-4 text-center border border-white/30 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] mb-6"
        >
          <p className="text-white font-bold text-sm uppercase tracking-wider">
            {lang === 'mr' ? 'पुढची पाळी:' : 'Next turn:'} <span className="text-fuchsia-200 font-black text-lg ml-1">{selectedMember}</span>
          </p>
        </motion.div>
      )}

      
    </div>
  );
};
