# RouTripo Design System Specification (DESIGN.md)

**Brand Identity**: **RouTripo** (All-in-One Travel & Group Planning Platform)  
**Philosophy**: Seamless, delightful, high-contrast, modern Indian travel ecosystem.

---

## 1. 3-Tier Portal Color Architecture

RouTripo features three distinct role-based interfaces, each with its own signature color palette and gradient:

### 1.1 USER APP PORTAL (Soft Sky Blue)
*Target: Consumers, travellers, group holiday planners.*
* **Primary Color**: `#0EA5E9` (Sky 500)
* **Primary Deep**: `#0284C7` (Sky 600)
* **Primary Dark / Headers**: `#0369A1` (Sky 700)
* **Header Gradient**: `linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)`
* **Card Border**: `#E0F2FE` (Inner border: `#BAE6FD`)
* **Role Badge**: Background `#FFFFFF`, Text `#0284C7`, Border-radius `12px`
* **Button Style**: `#0EA5E9` with shadow `0 4px 10px rgba(14, 165, 233, 0.2)`
* **Card Shadow**: `0 4px 15px rgba(14, 165, 233, 0.08)`

### 1.2 VENDOR PARTNER PORTAL (Fresh Mint Green)
*Target: B2B agents, hotel partners, cab vendors, tour operators.*
* **Primary Color**: `#10B981` (Emerald 500)
* **Primary Deep**: `#059669` (Emerald 600)
* **Primary Dark / Headers**: `#047857` (Emerald 700)
* **Header Gradient**: `linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)`
* **Card Border**: `#D1FAE5` (Inner border: `#A7F3D0`)
* **Role Badge**: Background `#FFFFFF`, Text `#059669`, Border-radius `12px`
* **Button Style**: `#10B981` with shadow `0 4px 10px rgba(16, 185, 129, 0.2)`
* **Card Shadow**: `0 4px 15px rgba(16, 185, 129, 0.08)`

### 1.3 ADMIN DASHBOARD PORTAL (Soft Lavender / Violet)
*Target: Platform administrators, finance/GST teams, compliance officers.*
* **Primary Color**: `#8B5CF6` (Violet 500)
* **Primary Deep**: `#7C3AED` (Violet 600)
* **Primary Dark / Headers**: `#5B21B6` (Violet 800)
* **Header Gradient**: `linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)`
* **Card Border**: `#EDE9FE` (Inner border: `#DDD6FE`)
* **Role Badge**: Background `#FFFFFF`, Text `#7C3AED`, Border-radius `12px`
* **Button Style**: `#8B5CF6` with shadow `0 4px 10px rgba(139, 92, 246, 0.2)`
* **Card Shadow**: `0 4px 15px rgba(139, 92, 246, 0.08)`

---

## 2. Core Neutrals & Backgrounds
* **App Canvas Background**: `#F8FAFC` (Slate 50)
* **Surface Background**: `#FFFFFF`
* **Primary Text**: `#0F172A` (Slate 900)
* **Secondary Text / Subtitles**: `#475569` (Slate 600)
* **Muted / Hint Text**: `#94A3B8` (Slate 400)
* **Dividers & Borders**: `#E2E8F0` (Slate 200)

---

## 3. Typography
* **Primary Font Family**: `'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
* **Display / Numerals**: `'JetBrains Mono', 'D-DIN', sans-serif`
* **Body Text**: `16px` base size, line-height `1.5 - 1.7` for maximum legibility (WCAG AA compliant).
* **Headings**: 
  - `h1`: `1.875rem` (30px), font-weight 700 / 800
  - `h2`: `1.5rem` (24px), font-weight 700
  - `h3`: `1.25rem` (20px), font-weight 700

---

## 4. UI Geometry & Radii
* **Cards**: `16px` (rounded-2xl)
* **Interactive Buttons**: `8px` - `12px`
* **Badges / Chips**: `12px` / `9999px` (pill)
* **Mobile Sheets**: `24px` top corners (`rounded-t-[24px]`)
