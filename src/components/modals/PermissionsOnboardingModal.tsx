import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Bell, Mic, FileText, X, Check, ShieldAlert } from 'lucide-react';

interface PermissionsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const PermissionsOnboardingModal: React.FC<PermissionsOnboardingModalProps> = ({ isOpen, onClose, lang }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);

  const permissions = [
    { id: 'camera', icon: Camera, name: lang === 'mr' ? 'कॅमेरा (Camera)' : 'Camera', desc: lang === 'mr' ? 'पावत्यांचे फोटो काढण्यासाठी' : 'To capture receipt photos' },
    { id: 'location', icon: MapPin, name: lang === 'mr' ? 'लोकेशन (Location)' : 'Location', desc: lang === 'mr' ? 'तुमचा सध्याचा थांबा शोधण्यासाठी' : 'To find your current stop' },
    { id: 'notifications', icon: Bell, name: lang === 'mr' ? 'नोटिफिकेशन्स (Notifications)' : 'Notifications', desc: lang === 'mr' ? 'खर्चाचे अलर्ट मिळवण्यासाठी' : 'To receive expense alerts' },
    { id: 'listener', icon: FileText, name: lang === 'mr' ? 'नोटिफिकेशन रिडर (Background Listener)' : 'Notification Listener', desc: lang === 'mr' ? 'ऑटोमॅटिक खर्च ट्रॅक करण्यासाठी' : 'To automatically track expenses from payment apps' },
  ];

  const handleRequestPermission = (id: string) => {
    // In a real Native App (React Native/Flutter), you would use permissions plugins here.
    // Since this is a Web App preview, we simulate a graceful denial as requested.
    setDeniedPermissions([...deniedPermissions, id]);
    
    setToastMessage("परवानगी नाकारली. काही हरकत नाही! तुम्ही माहिती स्वतः (Manually) टाकू शकता. काही स्वयंचलित फीचर्स बंद राहतील.");
    
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-10 left-4 right-4 bg-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 z-[110]"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="p-6 pb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {lang === 'mr' ? 'परवानग्या (Permissions)' : 'App Permissions'}
          </h2>
          <p className="text-slate-600 mb-6">
            {lang === 'mr' 
              ? 'प्रवास अधिक सोपा करण्यासाठी आम्हाला काही परवानग्यांची आवश्यकता आहे. काळजी करू नका, तुम्ही या कधीही बदलू शकता.'
              : 'We need some permissions to make your travel planning seamless. Don\'t worry, you can change these later.'}
          </p>

          <div className="space-y-4">
            {permissions.map(perm => (
              <div key={perm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <perm.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{perm.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{perm.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRequestPermission(perm.id)}
                  disabled={deniedPermissions.includes(perm.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    deniedPermissions.includes(perm.id)
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {deniedPermissions.includes(perm.id) 
                    ? (lang === 'mr' ? 'नाकारली' : 'Denied') 
                    : (lang === 'mr' ? 'परवानगी द्या' : 'Allow')}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl transition-colors hover:bg-slate-200"
          >
            {lang === 'mr' ? 'पुढे जा (Continue)' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
