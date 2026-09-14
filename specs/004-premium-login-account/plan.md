# Technical Plan: Premium Login Screen & 4-Tab User Account Screen

## Stack
React 19 + TypeScript + Tailwind CSS 4 + lucide-react (no new dependencies).

## Files
- `public/fonts/D-DIN.woff2`, `public/fonts/D-DIN-Bold.woff2` — kit font (SIL OFL), converted
  from the Font Squirrel OTF release; licence copied to `public/fonts/D-DIN-OFL.txt`.
- `src/premium/premium.css` — design tokens from the kit (`--premium-sky`, `--premium-violet`,
  `--premium-pink`, `--premium-ink`), `@font-face` for D-DIN, and the shared
  `.premium-card` / `.premium-pill` / `.premium-clouds` primitives.
- `src/premium/LoginScreen.tsx` — login/sign-up screen.
- `src/premium/account/types.ts` — `AccountItemId` union + `AccountTabId`.
- `src/premium/account/AccountScreen.tsx` — tab shell (profile header + 4 tabs).
- `src/premium/account/BargainingTab.tsx`
- `src/premium/account/ExpensesTab.tsx` (SVG donut + bar charts, no chart dependency)
- `src/premium/account/BookingTab.tsx`
- `src/premium/account/SettingsTab.tsx`
- `src/premium/UserLandingPage.tsx` — opens `AccountScreen` instead of the old list sheet.
- `src/premium/preview.tsx` — login → landing flow for the preview.
- Removed: `src/premium/mobile/AccountSheet.tsx` (superseded by the tabbed screen).

## Contracts
```ts
type LoginMode = "login" | "signup";
interface LoginPayload { mode: LoginMode; identifier: string; password: string; name?: string; remember: boolean; }
type SocialProvider = "google" | "facebook" | "apple";
type AccountTabId = "bargaining" | "expenses" | "booking" | "settings";
```
`AccountScreen` receives `onSelect(item: AccountItemId)` and renders every id in the union.

## Verification
`npx tsc --noEmit`, `npm run lint`, `npm run build`, plus manual review of `/premium.html`.
