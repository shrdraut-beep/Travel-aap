// src/theme/tokens.ts
// RouTripo Design Tokens — User (Sky Blue), Vendor (Mint Green), and Admin (Soft Lavender)

export const BRAND_NAME = 'RouTripo';

/**
 * 3-Tier Portal Theme Architecture
 * User App: Soft Sky Blue
 * Vendor Partner: Fresh Mint Green
 * Admin Dashboard: Soft Lavender
 */
export const portalThemes = {
  user: {
    name: 'USER APP',
    primary: '#0EA5E9',
    primaryDeep: '#0284C7',
    primaryDark: '#0369A1',
    gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
    gradientStart: '#E0F2FE',
    gradientEnd: '#BAE6FD',
    border: '#BAE6FD',
    borderLight: '#E0F2FE',
    shadow: 'rgba(14, 165, 233, 0.2)',
    boxShadow: '0 4px 15px rgba(14, 165, 233, 0.08)',
    badgeBg: '#FFFFFF',
    badgeText: '#0284C7',
    surface: '#FFFFFF',
  },
  vendor: {
    name: 'VENDOR PARTNER',
    primary: '#10B981',
    primaryDeep: '#059669',
    primaryDark: '#047857',
    gradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    gradientStart: '#D1FAE5',
    gradientEnd: '#A7F3D0',
    border: '#A7F3D0',
    borderLight: '#D1FAE5',
    shadow: 'rgba(16, 185, 129, 0.2)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)',
    badgeBg: '#FFFFFF',
    badgeText: '#059669',
    surface: '#FFFFFF',
  },
  admin: {
    name: 'ADMIN DASHBOARD',
    primary: '#8B5CF6',
    primaryDeep: '#7C3AED',
    primaryDark: '#5B21B6',
    gradient: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
    gradientStart: '#EDE9FE',
    gradientEnd: '#DDD6FE',
    border: '#DDD6FE',
    borderLight: '#EDE9FE',
    shadow: 'rgba(139, 92, 246, 0.2)',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.08)',
    badgeBg: '#FFFFFF',
    badgeText: '#7C3AED',
    surface: '#FFFFFF',
  },
} as const;

export const colors = {
  // User Portal Tokens (Soft Sky Blue)
  sky: '#0EA5E9',
  skyDeep: '#0284C7',
  skyDark: '#0369A1',
  skySoft: '#E0F2FE',
  skyBorder: '#BAE6FD',

  // Vendor Portal Tokens (Fresh Mint Green)
  mint: '#10B981',
  mintDeep: '#059669',
  mintDark: '#047857',
  mintSoft: '#D1FAE5',
  mintBorder: '#A7F3D0',

  // Admin Portal Tokens (Soft Lavender / Violet)
  violet: '#8B5CF6',
  violetDeep: '#7C3AED',
  violetDark: '#5B21B6',
  violetSoft: '#EDE9FE',
  violetBorder: '#DDD6FE',

  // Brand Core Neutrals
  ink: '#1E293B',
  muted: '#64748B',
  page: '#F8FAFC',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  border: '#E2E8F0',

  // Status & Utility Colors
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',

  // Booking & Seat Map
  seatFree: '#10B981',
  seatXL: '#8B5CF6',
  seatPaid: '#0EA5E9',
  seatDisabled: '#CBD5E1',
} as const;

export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  pill: 'rounded-full',
} as const;
