# 005 — Technical plan

## Stack

Unchanged: React 19, TypeScript (strict), Tailwind 4, framer-motion,
lucide-react. No new dependencies.

## Shared foundations

Reuse everything from spec 004:

- Tokens in `src/premium/premium.css` (`--premium-sky`, `--premium-violet`,
  `--premium-pink`, `--premium-ink`, `--premium-page`, ...).
- Components in `src/premium/account/ui.tsx`
  (`SectionHeader`, `ListRow`, `PillButton`, `StatCard`).
- Sheet shell pattern from `src/premium/account/AccountScreen.tsx`:
  sky panel header, tab strip overlapping the header, independently scrolling
  body, scroll reset on tab change, Escape to close, body scroll lock.

Both portals have more tabs than the account screen's four, so the tab strip
becomes a horizontally scrollable pill row instead of a fixed four-up grid.
That row lives in a new shared `src/premium/shared/TabStrip.tsx` so admin and
agent stay consistent.

## Files

```
src/premium/shared/TabStrip.tsx        horizontal scrollable pill tabs
src/premium/shared/PortalShell.tsx     sky header + tab strip + scroll body
src/premium/admin/types.ts             AdminTabId, AdminActionId unions
src/premium/admin/AdminScreen.tsx      shell + tab routing
src/premium/admin/tabs.tsx             the eight admin panels
src/premium/agent/types.ts             AgentTabId, AgentActionId unions
src/premium/agent/AgentScreen.tsx      shell + tab routing
src/premium/agent/tabs.tsx             the nine agent panels
```

## Contracts

```ts
onAction: (action: AdminActionId) => void
onAction: (action: AgentActionId) => void
```

Discriminated string unions, one id per feature, so a missing wire-up is a
compile error once the production navigation layer is added.

## Preview wiring

`src/premium/preview.tsx` keeps a `portal` state. Choosing `admin-dashboard`
or `agent-portal` from the account Setting tab opens the matching screen;
closing returns to the user portal.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Then open `http://localhost:3000/premium.html` at 390x844 and walk every tab.
