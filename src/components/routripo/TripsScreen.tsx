import React, { useRef } from "react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { MemoriesView } from "../views/MemoriesView";
import { useTripContext } from "../../context/TripContext";
import { useLanguage } from "../../context/LanguageContext";

import { TripAwardsBanner } from "../TripAwardsBanner";
import { FlightTrackerWidget } from "../FlightTrackerWidget";
import { TransitSchedules } from "../TransitSchedules";
import { TimepassGame } from "../views/TimepassGame";
import { QuirkyLanguageSelector } from "../QuirkyLanguageSelector";


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
              </div>

      <MemoriesView
        trip={activeTrip}
        lang={lang}
        t={t}
        onUpdateTrip={updateActiveTrip}
      />

      
      <div className="px-4 mt-4 space-y-4">
        {activeTrip && <TripAwardsBanner trip={activeTrip} lang={lang} />}
        {activeTrip && <FlightTrackerWidget lang={lang} />}
        {activeTrip && <TransitSchedules source={activeTrip.source || "Mumbai"} destination={activeTrip.destination || "Ujjain"} />}
        {activeTrip && <TimepassGame trip={activeTrip} lang={lang} />}
        <QuirkyLanguageSelector />
      </div>

    </div>
  );
}

