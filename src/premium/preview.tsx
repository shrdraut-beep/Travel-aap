import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./premium.css";
import { UserLandingPage } from "./UserLandingPage";

/**
 * Standalone preview entry for the premium redesign. Served at /premium.html so
 * the new UI can be reviewed without touching the live app shell.
 */
const container = document.getElementById("premium-root");

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <UserLandingPage
        onSearch={(payload) => console.log("search", payload)}
        onNotifications={() => console.log("notifications")}
        onAccountItem={(item) => console.log("account", item)}
        onQuickAction={(action) => console.log("quick action", action)}
        onSelectOffer={(offer) => console.log("offer", offer.code)}
        onSelectDestination={(destination) =>
          console.log("destination", destination.id)
        }
        onNavigate={(tab) => console.log("navigate", tab)}
      />
    </React.StrictMode>
  );
}
