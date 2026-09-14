// src/theme/tokens.ts
// RoutTripo design tokens — Premium Sky, Violet & Pink theme

export const colors = {
  // Primary brand gradient tokens
  sky: '#44c6f7',
  skyDeep: '#22b0ea',
  skySoft: '#e4f6fe',
  violet: '#7b3ff2',
  violetSoft: '#efe9fe',
  pink: '#ff4fa3',
  pinkSoft: '#ffe7f2',
  ink: '#28204f',
  muted: '#8e8ca3',
  page: '#eef1f6',

  // Common aliases mapped to premium theme
  navy: '#28204f',        // maps to premium ink
  navyDeep: '#1e183d',
  navyMuted: '#3d336b',
  gold: '#7b3ff2',        // maps to premium violet CTA
  goldSoft: '#efe9fe',
  white: '#FFFFFF',
  offWhite: '#F7F8FA',
  slate: '#64748b',       // secondary text
  slateLight: '#8e8ca3',  // placeholder text
  border: '#E2E8F0',
  success: '#1E8E5A',
  successSoft: '#E7F6EE',
  danger: '#ff4fa3',      // maps to premium pink
  dangerSoft: '#ffe7f2',
  seatFree: '#1E8E5A',
  seatXL: '#7b3ff2',
  seatPaid: '#ff4fa3',
  seatDisabled: '#D9DDE3',
} as const;

export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  pill: 'rounded-full',
} as const;
