# LawnMates – MVP Test Artifact Summary for Replit AI Assistant

This document aggregates all test artifacts required for QA verification, feature validation, and CI handoff for the LawnMates MVP.

---

## 🔍 Test Commands Summary

These commands are CI-integrated and should be executed from the project root:

```bash
# Unit Tests
yarn test:unit

# Integration Tests
yarn test:integration

# End-to-End (E2E) Tests
yarn test:e2e

# Accessibility Tests
yarn test:a11y
```

---

## ✅ Feature-to-Test Matrix

| Epic / Story          | Feature Area                 | Test Type          | Location/Script                     |
| --------------------- | ---------------------------- | ------------------ | ----------------------------------- |
| Epic 1 – Auth         | Signup, login, RBAC          | Unit, Integration  | `test/unit/auth.test.ts`            |
| Epic 2 – Jobs         | Post, discover, accept       | E2E, Integration   | `test/e2e/job-flow.cy.ts`           |
| Epic 3 – Payments     | Escrow, KYC, release, refund | Integration, E2E   | `test/integration/payments.test.ts` |
| Epic 4 – Verification | Photo upload & approval      | E2E                | `test/e2e/photo-verification.cy.ts` |
| Epic 5 – Admin Tools  | KPIs, dispute/refund tools   | Integration, E2E   | `test/e2e/admin-dashboard.cy.ts`    |
| Epic 6 – Messaging    | Per-job chat, notifications  | Unit, E2E          | `test/e2e/chat.cy.ts`               |
| Epic 7 – Reviews      | Modal, rating, moderation    | Unit, E2E          | `test/e2e/reviews.cy.ts`            |
| Epic 8 – Favorites    | Toggle, list, rebook helper  | Unit, E2E          | `test/e2e/favorites.cy.ts`          |
| Epic 9 – Loyalty      | Recurring jobs, points, refs | Integration, E2E   | `test/e2e/loyalty.cy.ts`            |
| Epic 10 – PWA         | Offline, install, push       | Manual, Lighthouse | Chrome DevTools Audit               |
| Epic 11 – Analytics   | Heatmap, anomalies, roles    | E2E                | `test/e2e/admin-analytics.cy.ts`    |
| Epic 12 – AI/NLP      | Trust scores, NLP flags      | Integration, E2E   | `test/e2e/moderation.cy.ts`         |

---

## 🧪 CI Test Layers & Expectations

| Layer         | Tooling              | Coverage Goal        |
| ------------- | -------------------- | -------------------- |
| Unit Tests    | Jest + RTL           | 80%+ logic coverage  |
| Integration   | Jest + Supertest     | All key workflows    |
| E2E Tests     | Cypress              | All job life cycles  |
| Accessibility | axe-core via Cypress | WCAG 2.1 AA standard |

CI config located at `.github/workflows/main.yml` auto-triggers tests and Vercel preview deploys.

---

## 📂 Example Test File Structure

```plaintext
/test
├── unit/
│   └── reviews.test.ts
├── integration/
│   └── payments.test.ts
├── e2e/
│   ├── job-flow.cy.ts
│   ├── reviews.cy.ts
│   ├── favorites.cy.ts
│   └── admin-analytics.cy.ts
```

---

## 🧠 Agent Notes for Replit Assistant

* Use file-based coverage in `/test` to guide refactoring
* Prioritize failed or skipped E2E tests for debug
* Ensure environment setup via `.env.local` and Supabase/Stripe test keys
* Refer to `docs/testing-strategy.md` and `docs/api-reference.md` for expected flows

---

## Last Updated: 2025-05-08
