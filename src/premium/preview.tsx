import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./premium.css";
import { LoginScreen } from "./LoginScreen";
import type { LoginPayload } from "./LoginScreen";
import { UserLandingPage } from "./UserLandingPage";

/**
 * Standalone preview entry for the premium redesign. Served at /premium.html so
 * the new UI can be reviewed without touching the live app shell.
 */
const PremiumPreview: React.FC = () => {
  const [session, setSession] = useState<LoginPayload | null>(null);

  if (!session) {
    return (
      <LoginScreen
        onSubmit={(payload) => {
          console.log("auth", payload);
          setSession(payload);
        }}
        onSocial={(provider) => console.log("social login", provider)}
        onForgotPassword={(identifier) => console.log("forgot", identifier)}
        onContinueAsGuest={() =>
          setSession({
            mode: "login",
            identifier: "guest@routripo.app",
            password: "",
            name: "Guest traveller",
            remember: false
          })
        }
      />
    );
  }

  return (
    <UserLandingPage
      userName={session.name ?? "Cara Sharma"}
      userEmail={session.identifier}
      onSearch={(payload) => console.log("search", payload)}
      onNotifications={() => console.log("notifications")}
      onAccountItem={(item) => {
        console.log("account", item);
        if (item === "logout") setSession(null);
      }}
      onQuickAction={(action) => console.log("quick action", action)}
      onSelectOffer={(offer) => console.log("offer", offer.code)}
      onSelectDestination={(destination) =>
        console.log("destination", destination.id)
      }
      onNavigate={(tab) => console.log("navigate", tab)}
    />
  );
};

const container = document.getElementById("premium-root");

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <PremiumPreview />
    </React.StrictMode>
  );
}
