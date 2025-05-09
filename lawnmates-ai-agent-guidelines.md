LawnMates AI Agent Guidelines
Project Overview

LawnMates is a two-sided Canadian platform connecting property owners with landscapers. The platform is built around core principles of trust and security, featuring photo verification, escrow payments, and realtime messaging. The application serves three primary user roles: Property Owners, Landscapers, and Admins.
Technology Stack

    Frontend: Next.js, Tailwind CSS, React Context for state management
    Backend: Supabase (PostgreSQL, Auth, Realtime)
    Payments: Stripe Connect for escrow payments
    Images: Cloudinary for secure image uploads
    Notifications: Supabase Realtime + optional email (SendGrid)
    Testing: Jest, React Testing Library, Supertest, Cypress

Project Structure

lawnmates/
├── .github/                    # CI/CD workflows (GitHub Actions)
├── public/                    # Static assets
├── src/                       # Core application source
│   ├── common/                # Shared utilities, types, constants
│   │   ├── types/             # TypeScript interfaces (User, Job, etc.)
│   │   ├── utils/             # Formatters, validators, helpers
│   ├── components/            # Reusable UI components (e.g., JobCard, Modal)
│   ├── pages/                 # Next.js route files (API + UI)
│   │   ├── api/               # API route handlers (Next.js serverless functions)
│   │   ├── index.tsx          # Homepage UI
│   │   └── dashboard/         # Role-specific dashboards
│   ├── features/              # Feature modules (job, auth, messaging, admin)
│   │   ├── auth/              # Signup, login, role-based session logic
│   │   ├── jobs/              # Post, discover, view, accept jobs
│   │   ├── payments/          # Stripe logic (escrow, payout, refunds)
│   │   ├── photos/            # Upload, store, verify images
│   │   ├── messaging/         # Realtime chat threads per job
│   │   ├── notifications/     # Notification center, bell icon, email fallback
│   │   └── admin/             # Admin dashboard, moderation tools
│   ├── services/              # External SDKs and integrations
│   │   ├── supabase.ts        # Supabase client
│   │   ├── stripe.ts          # Stripe SDK setup
│   │   ├── cloudinary.ts      # Image upload/signature helpers
│   │   └── email.ts           # Email service (e.g., SendGrid)
│   ├── core/                  # Business logic (job rules, photo validation)
│   └── app.tsx                # App entrypoint
├── test/                      # All test files
│   ├── unit/                  # Utility and component tests (Jest)
│   ├── integration/           # Cross-module flow tests (Supertest)
│   └── e2e/                   # Cypress end-to-end specs
├── docs/                      # Project documentation (PRD, architecture, etc.)

Core Data Models
User

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'landscaper' | 'admin';
  isVerified: boolean;
  stripeAccountId?: string;
  createdAt: string;
}

Job

export interface Job {
  id: string;
  ownerId: string;
  landscaperId?: string;
  tier: string;
  squareFootage: number;
  date: string;
  location: string;
  price: number;
  status: 'open' | 'in-progress' | 'completed' | 'disputed';
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  createdAt: string;
}

Message

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  message: string;
  timestamp: string;
}

Notification

export interface Notification {
  id: string;
  userId: string;
  type: 'chat' | 'status' | 'payment';
  content: string;
  read: boolean;
  timestamp: string;
}

Dispute

export interface Dispute {
  id: string;
  jobId: string;
  raisedBy: string;
  reason: string;
  status: 'open' | 'resolved';
  resolution?: string;
  createdAt: string;
}

Developer Agent Workflow
Initialization

    Read entire story file focusing on requirements, acceptance criteria, and technical context
    Reference project structure/standards without needing them repeated

Implementation

    Execute tasks sequentially from story file
    Implement code in specified locations using defined technologies and patterns
    Use judgment for reasonable implementation details
    Update task status in story file as completed
    Follow coding standards from docs/coding-standards.md

Testing

    Implement tests as specified in story requirements following docs/testing-strategy.md
    Run tests frequently during development
    Ensure all required tests pass before completion

Handling Blockers

    If blocked by genuine ambiguity in story file:
        Try to resolve using available documentation first
        Ask specific questions about the ambiguity
        Wait for clarification before proceeding
        Document clarification in story file

Completion

    Mark all tasks complete in story file
    Verify all tests pass
    Update story Status: Review
    Wait for feedback/approval

Coding Standards
Naming Conventions

    Variables/Functions: camelCase
    Classes/Interfaces: PascalCase
    Constants: UPPER_SNAKE_CASE
    Files: kebab-case.ts

Architectural Patterns

    Modular Monolith – Single-deployable unit with separated domain logic
    Role-Based Access Control (RBAC) – Enforced via Supabase RLS and frontend route guards
    Escrow Payment Flow – Stripe Connect Custom, payment intent on job creation
    Realtime Messaging – Supabase Realtime channels per job
    JWT Auth + Claims – For session handling and role enforcement

Error Handling Strategy

    Use try/catch around external calls (Stripe, Cloudinary)
    Central error handler middleware in API layer
    Contextual logging (user ID, job ID, action)

Security Best Practices

    JWT expiry checks and refresh
    Signed image URLs with expiration
    RLS enforced at DB level
    Stripe webhook validation
    Rate limiting middleware for auth endpoints

Testing Strategy
Layer	Tooling	Coverage Goal
Unit Tests	Jest + RTL	80%+ logic coverage
Integration	Jest + Supertest	All key workflows
E2E Tests	Cypress	All job life cycles
Accessibility	axe-core via Cypress	WCAG 2.1 AA standard
Key Reference Documents

    Product Requirements: docs/prd.md
    Architecture Documentation: docs/architecture.md
    API Reference: docs/api-reference.md
    Testing Strategy: docs/testing-strategy.md
    UI/UX Spec: docs/ui-ux-spec.md
    Epic Documentation: docs/epicN.md files

AI Agent Tips

    Follow naming conventions and file structure strictly
    All APIs are REST endpoints in pages/api/
    Types should be defined in common/types/
    Feature logic should be organized under src/features/{domain}/
    Ensure tests are created for all new functionality
    Reference documentation when implementing new features
    Focus on modularity and clean separation of concerns
