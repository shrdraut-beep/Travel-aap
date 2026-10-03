import React, { useState, useEffect } from "react";
import { 
  Check, User, Phone, Mail, MapPin, ShieldCheck, 
  Upload, Trash2, HeartHandshake, FileText, Sparkles, Utensils
} from "lucide-react";
import { DEFAULT_USER_AVATAR } from "../../components/common/GlobalBrandHeader";
import { SubPageHeader } from "../../components/common/SubPageHeader";

export interface ProfileFormData {
  name: string;
  tag: string;
  phone: string;
  email: string;
  avatar: string;
  gender?: "male" | "female" | "other";
  address?: string;
  departureCity: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryPreference: string;
  seatPreference: string;
  loyaltyProgram: string;
  tier: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  isKycVerified?: boolean;
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
    gender: "female",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    aadhaarNumber: "•••• •••• 9821",
    passportNumber: "",
    isKycVerified: true,
    ...initialData,
    name: cleanName(initialData.name)
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      gender: "female",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      aadhaarNumber: "•••• •••• 9821",
      passportNumber: "",
      isKycVerified: true,
      ...initialData,
      name: cleanName(initialData.name)
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      try {
        localStorage.setItem("routtripo_user_profile", JSON.stringify(formData));
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }
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
        {/* SubPageHeader with Bus Booking Flow Structure and Brand Header Ocean Colors */}
        <SubPageHeader
          title="Edit Profile"
          subtitle="Personal details & KYC verified credentials"
          badge="KYC Verified"
          icon={User}
          onClose={onClose}
          maxWidth="w-full"
        />

        {/* Form Body - Rich Stitch Form with Verification Badges */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* KYC Status Strip */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black leading-tight">Identity KYC Verified</p>
                <p className="text-[10px] text-emerald-700 font-medium">Govt ID &amp; Phone authentication confirmed</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-300 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0">
              Active
            </span>
          </div>

          {/* Avatar Picker & Custom Upload */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Profile Avatar</span>
              </label>
              <label className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

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

            {formData.avatar !== DEFAULT_USER_AVATAR && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, avatar: DEFAULT_USER_AVATAR })}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset to default avatar</span>
              </button>
            )}
          </div>

          {/* Section 1: Basic Identity */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
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

            {/* Gender Selection Pills (from Google Stitch) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["male", "female", "other"] as const).map((g) => {
                  const isSelected = formData.gender === g;
                  const label = g === "male" ? "Male" : g === "female" ? "Female" : "Other";
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 text-center ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-xs font-black"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@routripo.app"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Departure City & Home Address (from Google Stitch) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Primary City / Home Address</span>
              </label>
              <input
                type="text"
                value={formData.departureCity || ""}
                onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                placeholder="e.g. Pune / Mumbai, Maharashtra"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact (Safety Feature from Google Stitch) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Emergency Contact</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.emergencyContactName || ""}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Contact Person Name"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
              />
              <input
                type="tel"
                value={formData.emergencyContactPhone || ""}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="Emergency Phone Number"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Section 3: Travel Preferences (Seat & Meal from Google Stitch) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Travel &amp; Dining Preferences</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Dietary Preference</span>
                <select
                  value={formData.dietaryPreference || "Veg"}
                  onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Jain">Jain Pure Veg</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Seat Preference</span>
                <select
                  value={formData.seatPreference || "Window"}
                  onChange={(e) => setFormData({ ...formData, seatPreference: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Window">Window Seat</option>
                  <option value="Aisle">Aisle Seat</option>
                  <option value="Middle">Middle Seat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Travel Documents (Passport & Aadhaar from Google Stitch) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Government Identity &amp; Travel Docs</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Aadhaar (Last 4 Digits)</span>
                <input
                  type="text"
                  value={formData.aadhaarNumber || "•••• •••• 9821"}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Passport Number (Optional)</span>
                <input
                  type="text"
                  value={formData.passportNumber || ""}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  placeholder="e.g. T4891230"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Action buttons with Frosted Glass Pill & Primary Gradient */}
          <div className="pt-3 border-t border-slate-200 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-5 rounded-full bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-600 hover:brightness-105 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
