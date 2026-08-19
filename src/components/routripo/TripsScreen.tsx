import React, { useRef } from "react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { TabDashboardLayout } from "./TabDashboardLayout";
import { Share2, Image as ImageIcon, Camera, Smile } from "lucide-react";
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
  onOpenMyTickets?: () => void;
  onBack?: () => void;
}

export function SocialScreen({ onLogout, onSOS, onOpenSettings, onOpenMyTickets, onBack }: SocialScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip } = useTripContext();
  const { lang, t } = useLanguage();
  const [activeSocialTab, setActiveSocialTab] = React.useState<'gallery'|'widgets'>('gallery');

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50">
      <TopBar 
        sub="Memories & Group Moments"
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || (() => alert("SOS Triggered!"))} 
        onOpenSettings={onOpenSettings}
        onBack={onBack}
      />
      
      
      <div className="pt-3 pb-8">
        <TabDashboardLayout
          cards={[
            {
              title: "NEW MEMORY",
              subtitle: "Upload group photo",
              icon: Camera,
              iconColor: "text-white",
              gradient: "from-pink-500 via-pink-600 to-rose-600 border border-pink-400/30 shadow-pink-200/60",
              subtitleColorClass: "text-pink-100",
              onClick: () => window.dispatchEvent(new Event('open-upload-memory'))
            },
            {
              title: "SHARE ALBUM",
              subtitle: "Invite friends",
              icon: Share2,
              iconColor: "text-rose-200",
              gradient: "from-orange-500 via-orange-600 to-amber-600 border border-orange-400/30 shadow-orange-200/60",
              subtitleColorClass: "text-orange-100",
              onClick: () => {
                if (navigator.share) {
                  navigator.share({ title: 'Join our trip!', text: 'Join our awesome trip on Grouptravel', url: window.location.href }).catch(() => {});
                }
              }
            }
          ]}
          gridTitle="Social Hub"
          gridIcon={Smile}
          gridItems={[
            { icon: ImageIcon, label: "Gallery", color: "from-pink-500 to-rose-600", isActive: activeSocialTab === 'gallery', onClick: () => setActiveSocialTab('gallery') },
            { icon: Smile, label: "Fun & Games", color: "from-purple-500 to-indigo-600", isActive: activeSocialTab === 'widgets', onClick: () => setActiveSocialTab('widgets') },
            { icon: Share2, label: "Invite", color: "from-orange-500 to-amber-600", onClick: () => {
              if (navigator.share) {
                navigator.share({ title: 'Join our trip!', text: 'Join our awesome trip on Grouptravel', url: window.location.href }).catch(() => {});
              }
            } }
          ]}
        >


      <div className="mt-4">
        {activeSocialTab === 'gallery' && (
          <MemoriesView
            trip={activeTrip}
            lang={lang}
            t={t}
            onUpdateTrip={updateActiveTrip}
          />
        )}
        
        {activeSocialTab === 'widgets' && (
          <div className="px-2 space-y-4">
            {activeTrip && <TripAwardsBanner trip={activeTrip} lang={lang} />}
            {activeTrip && <FlightTrackerWidget lang={lang} />}
            {activeTrip && <TransitSchedules source={activeTrip.source || "Mumbai"} destination={activeTrip.destination || "Ujjain"} />}
            {activeTrip && <TimepassGame trip={activeTrip} lang={lang} />}
            <QuirkyLanguageSelector />
          </div>
        )}
      </div>
        </TabDashboardLayout>
      </div>
    </div>
  );
}

