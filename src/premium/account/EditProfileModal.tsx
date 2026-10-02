import React, { useState, useEffect } from "react";
import { X, Check, User, Phone, Mail } from "lucide-react";
import { DEFAULT_USER_AVATAR } from "../../components/common/GlobalBrandHeader";

export interface ProfileFormData {
  name: string;
  tag: string;
  phone: string;
  email: string;
  avatar: string;
  departureCity: string;
  dietaryPreference: string;
  seatPreference: string;
  loyaltyProgram: string;
  tier: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileFormData;
  onSave: (updatedData: ProfileFormData) => void;
}

export const PRESET_AVATARS = [
  {
    id: "female-voyager",
    label: "Female Voyager",
    url: DEFAULT_USER_AVATAR
  },
  {
    id: "male-voyager",
    label: "Male Explorer",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "executive-traveler",
    label: "VIP Traveler",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80"
  },
  {
    id: "solo-backpacker",
    label: "Solo Adventurer",
    url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80"
  }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const cleanName = (rawName: string) => {
    if (!rawName) return "Aditi Sharma";
    return rawName
      .replace(/\s*\((.*?)\)/g, "")
      .replace(/\s*-\s*Travell?er/gi, "")
      .replace(/\s+Travell?er/gi, "")
      .trim();
  };

  const [formData, setFormData] = useState<ProfileFormData>({
    ...initialData,
    name: cleanName(initialData.name)
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      ...initialData,
      name: cleanName(initialData.name)
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 px-5 py-4 border-b border-sky-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Edit Personal Profile
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Personal details &amp; contact verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Personal Details Only */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="space-y-4">
            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Profile Avatar
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = formData.avatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: avatar.url })}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer ${
                        isSelected
                          ? "border-sky-500 ring-2 ring-sky-300 scale-102 shadow-sm"
                          : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-sky-600/30 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: cleanName(e.target.value) })}
                placeholder="Enter full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@routripo.app"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
