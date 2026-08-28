import React from "react";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { TrustStrip } from "./sections/TrustStrip";
import {
  FeaturedDestinations,
  type Destination
} from "./sections/FeaturedDestinations";
import { Footer } from "./sections/Footer";
import type { SearchPayload } from "./sections/SearchWidget";

export interface UserLandingPageProps {
  /** Fired with the fully-formed query when the user hits Search. */
  onSearch?: (payload: SearchPayload) => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSelectDestination?: (destination: Destination) => void;
  onToggleWishlist?: (destination: Destination, wishlisted: boolean) => void;
  onViewAllDestinations?: () => void;
}

/**
 * Premium user portal landing page. Purely presentational: every interactive
 * element is exposed as a callback prop so existing services can be attached
 * without touching the markup.
 */
export const UserLandingPage: React.FC<UserLandingPageProps> = ({
  onSearch,
  onSignIn,
  onSignUp,
  onSelectDestination,
  onToggleWishlist,
  onViewAllDestinations
}) => (
  <div className="min-h-screen w-full bg-slate-50">
    <Header onSignIn={onSignIn} onSignUp={onSignUp} />
    <main>
      <Hero onSearch={onSearch} />
      <TrustStrip />
      <FeaturedDestinations
        onSelect={onSelectDestination}
        onToggleWishlist={onToggleWishlist}
        onViewAll={onViewAllDestinations}
      />
    </main>
    <Footer />
  </div>
);

export default UserLandingPage;
