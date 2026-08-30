export type AccountTabId = "bargaining" | "expenses" | "booking" | "settings";

/**
 * Every user-account function the app exposes. Each id must be reachable from a
 * control inside one of the four account tabs.
 */
export type AccountItemId =
  | "profile"
  // Bargaining
  | "bargain-new-request"
  | "bargain-requests"
  | "bargain-offers"
  | "bargain-chat"
  | "bargain-secret-offers"
  | "bargain-custom-offers"
  | "bargain-vouchers"
  | "bargain-budget-advisory"
  | "bargain-escrow"
  // Expenses manager
  | "expenses-overview"
  | "expenses-add"
  | "expenses-log"
  | "expenses-scanner"
  | "expenses-split"
  | "expenses-pool-deposit"
  | "expenses-budget-alerts"
  | "wallet"
  // Booking
  | "booking-upcoming"
  | "booking-current"
  | "booking-past"
  | "my-tickets"
  | "hotel-reservations"
  | "booking-continue"
  | "refunds"
  | "calendar"
  | "explore-packages"
  | "planning"
  | "wishlist"
  | "memories"
  | "social"
  // Settings
  | "settings-profile"
  | "notifications"
  | "privacy"
  | "legal-vault"
  | "language"
  | "currency"
  | "sos"
  | "emergency-contacts"
  | "orchestrator"
  | "orchestrator-pipeline"
  | "support"
  | "feedback"
  | "share-app"
  | "about"
  | "agent-portal"
  | "admin-dashboard"
  | "delete-account"
  | "logout";
