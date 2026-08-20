// theme/tokens.ts
// RoutTripo design tokens — deep navy + gold, reused across every new booking screen.
// Import these instead of hardcoding colors so the new modules stay visually
// identical to the rest of the app.

export const colors = {
  navy: '#0B1E3D',        // primary background / headers
  navyDeep: '#071527',    // darkest surface, modals backdrop
  navyMuted: '#1C3358',   // cards on navy
  gold: '#D4AF37',        // primary accent, CTAs, selected states
  goldSoft: '#F2E4B3',    // hover/soft accent fills
  white: '#FFFFFF',
  offWhite: '#F7F8FA',
  slate: '#5B6472',       // secondary text
  slateLight: '#A6ADB8',  // placeholder text
  border: '#E4E7EC',
  success: '#1E8E5A',
  successSoft: '#E7F6EE',
  danger: '#C4432B',
  dangerSoft: '#FBEAE6',
  seatFree: '#1E8E5A',
  seatXL: '#4A6FA5',
  seatPaid: '#D4AF37',
  seatDisabled: '#D9DDE3',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  display: 'PlayfairDisplay-Bold',   // headings — keep in line with Trip Wallet identity
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemibold: 'Inter-SemiBold',
} as const;

// Tailwind/NativeWind equivalents for quick className use in JSX
export const tw = {
  bgNavy: 'bg-[#0B1E3D]',
  bgNavyDeep: 'bg-[#071527]',
  bgNavyMuted: 'bg-[#1C3358]',
  textGold: 'text-[#D4AF37]',
  bgGold: 'bg-[#D4AF37]',
  textNavy: 'text-[#0B1E3D]',
  textSlate: 'text-[#5B6472]',
  border: 'border-[#E4E7EC]',
} as const;
