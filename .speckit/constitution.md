# Project Constitution

## Core Engineering Principles

### 1. Spec-Driven First
* **No Unplanned Code**: All major features, architectural changes, and UI overhaul tasks must begin with an approved specification (`spec.md`), a technical execution plan (`plan.md`), and an ordered task list (`tasks.md`).
* **Source of Truth**: The specification is the single point of truth. Code implementation must strictly align with the documented requirements.

### 2. Architecture & Code Quality
* **Full-Stack Separated Concerns**: Server-side logic handles API proxying, secret keys, and data persistence. Client-side handles state, rendering, and user experience.
* **Type Safety**: Strictly typed TypeScript without implicit `any`. Standard `enum` declarations for state and role definitions.
* **Modular Structure**: Keep files focused and under recommended token/length limits. Shared types live in `/src/types.ts` or module-specific type files.

### 3. UI/UX Design Standards (Anti-Slop Guidelines)
* **Design Purpose**: Every typography, color, and spacing choice must be deliberate and accessible (WCAG AA minimum contrast).
* **Typography**: Clean hierarchy with distinct pairings. Minimum body text size 16px, line height 1.5–1.7.
* **Layout & Rhythm**: Responsive desktop-first precision built with mobile-first Tailwind CSS. Container outer padding must equal or exceed child inner padding.
* **Component Craft**: Complete event handlers for all controls. Never leave stubbed or broken interactive states.

### 4. Verification & Testing
* **Linter & Compiler Checks**: All pull requests and AI changes must pass `lint_applet` and `compile_applet` before completion.
* **Zero Console Noise**: Clean error handling without unhandled promise rejections or runtime warnings.
