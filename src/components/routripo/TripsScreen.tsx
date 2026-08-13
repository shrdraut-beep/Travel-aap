import React, { useRef } from "react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { MemoriesView } from "../views/MemoriesView";
import { useTripContext } from "../../context/TripContext";
import { useLanguage } from "../../context/LanguageContext";
import { TopBannerCarousel } from "../common/TopBannerCarousel";
import { OffersForYouSection } from "../common/OffersForYouSection";

interface SocialScreenProps {
  onLogout: () => void;
  onSOS?: () => void;
  onOpenSettings?: () => void;
}

export function SocialScreen({ onLogout, onSOS, onOpenSettings }: SocialScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip } = useTripContext();
  const { lang, t } = useLanguage();

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar 
        sub="Memories & Group Moments"
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || (() => alert("SOS Triggered!"))} 
        onOpenSettings={onOpenSettings}
      />
      
      <div className="px-4 mt-2">
        <TopBannerCarousel tab="social" />
      </div>

      <MemoriesView
        trip={activeTrip}
        lang={lang}
        t={t}
        onUpdateTrip={updateActiveTrip}
      />

      <div className="px-4 mt-4">
        <OffersForYouSection tab="social" />
      </div>
    </div>
  );
}

