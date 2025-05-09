# 🏁 LawnMates Sprint 1 README – Dev & AI Onboarding Guide

Welcome to Sprint 1! This README provides setup and task orientation for developers and AI agents (like Replit's Assistant) working on the LawnMates post-MVP epics.

---

## 📦 What We're Building

Focus on:

* Reviews & Ratings (Epic 7)
* Favorites & Repeat Booking (Epic 8)

---

## 📁 Key File Paths

| Path                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `src/features/reviews/`      | Review modal, rating UI, review API logic |
| `src/features/favorites/`    | Favorite button logic, rebook helpers     |
| `pages/api/reviews.ts`       | New POST/GET review endpoints             |
| `pages/api/favorites.ts`     | New POST/GET favorites endpoints          |
| `components/ReviewModal.tsx` | New modal UI for reviews                  |
| `components/RatingStars.tsx` | UI for star ratings display               |
| `test/unit/reviews.test.ts`  | Unit test file for review logic           |
| `test/e2e/reviews.cy.ts`     | Cypress E2E flow for submitting a review  |

---

## 🧪 Local Setup (Replit, Vercel Dev, or Local)

1. Clone the repo or open Replit workspace
2. Install deps: `yarn install`
3. Set env vars from `.env.example`
4. Run dev server: `yarn dev`
5. Run tests:

   * Unit: `yarn test:unit`
   * Integration: `yarn test:integration`
   * E2E: `yarn test:e2e`

---

## 🔑 New Supabase Tables

* `reviews`: jobId, reviewerId, revieweeId, rating, comment, createdAt
* `favorites`: userId, targetUserId, createdAt

**RLS Enabled** – Only allow inserts by logged-in users, filters by reviewerId or userId

---

## 🧠 Agent Hints

* Use `ReviewModal` as entry point for UI logic
* Add new API routes in `pages/api/` using REST conventions
* Use `common/types/review.ts` for schema consistency
* Backend logic for reviews belongs in `features/reviews/server/`

---

## ✅ Tasks Overview (Linked to Sprint 1 Plan)

* [ ] Review modal, rating system
* [ ] API: POST/GET reviews
* [ ] Profile: show average rating
* [ ] Favorite button and storage
* [ ] Rebook UI prefill logic

---

## 🧭 Help & Docs

* Architecture: `docs/architecture.md`
* API: `docs/api-reference.md`
* Epics: `docs/epic7-reviews.md`, `epic8-favorites.md`

---

## Change Log

| Change        | Date       | Version | Description                | Author  |
| ------------- | ---------- | ------- | -------------------------- | ------- |
| Initial draft | 2025-05-08 | 0.1     | Sprint 1 AI/dev onboarding | ChatGPT |
