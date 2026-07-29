# TECH_STACK.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the official technology stack of the Academy Management System.

The objective is consistency.

Claude should never replace libraries with alternatives unless explicitly instructed.

Every implementation must follow this stack.

---

# TECHNOLOGY PHILOSOPHY

The stack has been intentionally selected to maximize:

- Long-term maintainability
- Type safety
- Developer experience
- Performance
- Community support
- Simplicity

The goal is not to use the newest technology.

The goal is to build reliable software.

---

# FRONTEND

Framework

Next.js 16

Architecture

App Router

Rendering Strategy

Server Components by default.

Client Components only when necessary.

Reasons

Server Components reduce client JavaScript.

Improve performance.

Improve SEO.

Simplify data fetching.

---

# LANGUAGE

TypeScript

Strict Mode

Enabled

Rules

Never disable strict mode.

Never bypass compiler errors.

Never use `any`.

All business logic must be fully typed.

---

# STYLING

Tailwind CSS

Purpose

Layout

Spacing

Responsive Design

Utility-first styling

Rules

Never write inline styles.

Avoid custom CSS unless absolutely necessary.

Prefer Tailwind utilities.

Extract repeated patterns into reusable components.

---

# COMPONENT LIBRARY

shadcn/ui

Purpose

Reusable UI primitives.

Forms

Dialogs

Tables

Dropdowns

Navigation

Cards

Buttons

Rules

Never modify the original components directly.

Wrap components when custom behavior is needed.

Business-specific UI belongs inside project components.

---

# ICONS

lucide-react

Purpose

Entire application iconography.

Do not mix icon libraries.

---

# FORMS

React Hook Form

Purpose

State management.

Validation integration.

Performance.

---

Validation

Zod

Purpose

Input validation.

DTO validation.

Form validation.

Server validation.

Rules

Every form has a Zod schema.

Client and Server share the same schema whenever possible.

Business validation belongs in Services.

---

# DATABASE

PostgreSQL

Purpose

Primary relational database.

Reasons

ACID compliance.

Excellent relational support.

Reliable transactions.

Excellent Prisma integration.

---

# ORM

Prisma

Responsibilities

Database schema.

Migrations.

Queries.

Transactions.

Type-safe database access.

Rules

Prisma exists only inside Repositories.

Never access Prisma directly from Components or Services.

---

# AUTHENTICATION

Auth.js

Responsibilities

Authentication

Session management

User login

Password reset

Protected routes

Rules

Authorization remains application-specific.

Authentication identifies users.

Services enforce permissions.

---

# FILE STORAGE

UploadThing

Purpose

Student profile photos

Receipt screenshots

Event banners

Future media uploads

Rules

Database stores metadata only.

UploadThing stores binary files.

Uploaded files are immutable.

Replacing a file creates a new upload.

---

# EMAILS

Resend

Purpose

Password invitation

Password reset

Future notifications

Receipt notifications

Recovery reminders

Rules

Email generation belongs to dedicated services.

Business logic never depends on email success.

Email failures should never rollback completed business transactions.

---

# DATA TABLES

TanStack Table

Purpose

Administrative tables.

Students

Payments

Attendance

Recoveries

Events

Reports

Rules

Server-side pagination.

Server-side filtering.

Server-side sorting.

Avoid loading unnecessary records into the browser.

---

# CALENDAR

React Big Calendar

Purpose

Regular class schedule.

Special events.

Administrative calendar.

Landing page calendar.

Rules

Calendar displays information.

Business scheduling remains handled by the backend.

Calendar never owns business logic.

---

# STATE MANAGEMENT

React built-in state.

Server Components.

Server Actions.

Use React state only for UI interactions.

Avoid introducing global state libraries unless future requirements justify them.

Current MVP does not require Redux, Zustand or MobX.

---

# SERVER ACTIONS

Server Actions are the primary write interface.

Responsibilities

Authentication

Authorization

Validation

Calling Services

Returning typed responses

Avoid creating REST endpoints unless external integrations require them.

---

# DATA FETCHING

Use Server Components whenever possible.

Client-side fetching should be reserved for:

Interactive filtering

Search

Infinite scrolling

Optimistic updates

Real-time interactions (future)

---

# HOSTING

Frontend

Vercel

Responsibilities

Hosting

Server Actions

Deployment

Environment variables

Edge optimizations

---

# DATABASE HOSTING

Supabase PostgreSQL

Responsibilities

Managed PostgreSQL

Automatic backups

Connection pooling

Monitoring

Rules

Supabase Auth is NOT used.

Only PostgreSQL services are used.

Authentication is handled by Auth.js.

---

# MIGRATIONS

Managed exclusively by Prisma.

Never modify existing migrations.

Every schema change creates a new migration.

Migration names should describe business intent.

---

# ENVIRONMENT VARIABLES

Examples

DATABASE_URL

AUTH_SECRET

AUTH_URL

RESEND_API_KEY

UPLOADTHING_TOKEN

NEXT_PUBLIC_UPLOADTHING_APP_ID

Environment variables must never be hardcoded.

Never commit secrets.

---

# TESTING STACK

Unit Testing

Vitest

Component Testing

React Testing Library

End-to-End

Playwright

These tools are the official testing stack.

Do not introduce alternatives unless explicitly approved.

---

# CODE QUALITY

Linting

ESLint

Formatting

Prettier

Rules

Formatting should be automatic.

Lint errors must be resolved before merging.

Warnings should not accumulate over time.

---

# PACKAGE MANAGER

pnpm

Reasons

Performance

Disk efficiency

Deterministic installs

Consistency across development environments

Do not use npm or yarn for this project.

---

# PROJECT STRUCTURE

Business logic belongs inside:

modules/

Application routing belongs inside:

app/

Infrastructure belongs inside:

lib/

Shared utilities belong inside:

shared/

Database schema belongs inside:

prisma/

Public assets belong inside:

public/

---

# FUTURE TECHNOLOGIES

The following technologies are intentionally excluded from the MVP.

Redis

Message Queues

Microservices

GraphQL

Redux

Zustand

Docker

Kubernetes

Event Bus

CQRS

These may be introduced only when a real business requirement justifies the additional complexity.

---

# FINAL PRINCIPLE

The technology stack exists to support the business—not to showcase technologies.

When multiple implementation options exist, prefer the one that is simpler, more explicit, easier to maintain, and aligns with the conventions established in this document.