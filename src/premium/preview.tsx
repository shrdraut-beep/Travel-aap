import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
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
        onSignIn={() => console.log("sign in")}
        onSignUp={() => console.log("sign up")}
        onSelectDestination={(destination) =>
          console.log("destination", destination.id)
        }
      />
    </React.StrictMode>
  );
}
