# RoutTripo — Security & Global-Readiness Roadmap

Based on direct audit of `server.ts`, `server/security/*`, and `src/` (Sep 2026).

---

## Phase 0 — This Week (Critical, blocking)

| # | Item | File | Action |
|---|------|------|--------|
| 1 | CORS wildcard risk | `server.ts:283-284` | Remove `.endsWith(".run.app")` / `.endsWith(".google.com")` in production. Replace with exact-match allowlist of real prod/preview domains only. |
| 2 | Credential rotation | `.env`, `.env.local` | Rotate Travelport, Razorpay, Firebase, SMTP keys (previously shared in a zip). Move to Secret Manager, not committed `.env`. |
| 3 | Verify webhook secret is set in prod | `server/security/paymentWebhook.ts:65-67` | Confirm `RAZORPAY_WEBHOOK_SECRET` is actually set in the production environment — code fails closed if missing, but silent misconfig = payments webhook dead. |

---

## Phase 1 — 1–2 Months: Security & Compliance Hardening

**Security**
- [ ] Modularize `server.ts` (6,761 lines → per-domain services: flights, buses, payments, admin) — reduces blast radius of bugs, easier to audit
- [ ] Add WAF layer (Cloudflare / Google Cloud Armor) in front of rate limiters
- [ ] Centralize secrets in Secret Manager / Vault with rotation policy
- [ ] Dependency & SAST scanning in CI (`npm audit`, Snyk, or GitHub CodeQL)
- [ ] Re-verify `zeroTrustCrypto.ts` fixes hold after any refactor (KEK/DEK, AAD binding)

**Compliance**
- [ ] India DPDP Act: consent capture, data-deletion API, breach-notification workflow (flagged earlier — Schedule 1 enforcement approaching)
- [ ] PCI-DSS SAQ-A: confirm card data never touches your servers (hosted checkout only — Razorpay/Stripe)
- [ ] Draft privacy policy + ToS covering data retention, third-party sharing (Duffel/Travelport/Amadeus)

**Observability**
- [ ] Centralized logging/APM (Sentry or Datadog) — `secureLogger` exists but no aggregation
- [ ] Alerting on rate-limit trips, webhook failures, payment mismatches

---

## Phase 2 — 3–6 Months: Infra & Scale

- [ ] Multi-region deployment (currently `asia-southeast1` only) — add a second region for latency + DR
- [ ] Define RTO/RPO and backup strategy for Firestore + payment records
- [ ] Load testing on flight/bus search endpoints (Travelport auth error 1012116 needs resolving before scale testing)
- [ ] CDN for static assets + image optimization
- [ ] Split monolith into independently deployable services (payments, search, admin)

---

## Phase 3 — 6–12 Months: Global Product Readiness

**Localization**
- [ ] Introduce `react-i18next` (only currency formatting exists today — no UI language framework)
- [ ] Multi-currency across all flows, not just display formatting
- [ ] Region-specific payment gateways (Razorpay = India; add Stripe/Adyen for other regions — partially started)

**Accessibility**
- [ ] WCAG 2.1 AA audit — legal requirement in US/EU markets

**Certifications (enterprise/agent trust)**
- [ ] ISO 27001 / SOC 2 roadmap — needed once agent/partner B2B sales start
- [ ] Formal penetration test from a third party (replace self-generated `SECURITY_AUDIT_REPORT.txt` with an independent one before claiming "100% secured" anywhere public-facing)

---

## Already Solid (keep as-is)
- Helmet + strict CSP/HSTS in production
- Razorpay + Stripe webhook HMAC verification with `timingSafeEqual`, replay protection
- Test-key rejection in production
- Layered rate limiting (global / per-IP / AI-specific)

---

*Prioritize Phase 0 before anything else — CORS misconfig + unrotated credentials are live risk today.*
