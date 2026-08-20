// src/theme/tokens.ts
// RoutTripo design tokens — deep navy + gold, reused across every new booking screen.

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
  sm: 'rounded-lg',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  pill: 'rounded-full',
} as const;
