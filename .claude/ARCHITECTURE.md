# ARCHITECTURE.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PURPOSE

This document defines the software architecture of the project.

It explains:

- Project structure
- Module boundaries
- Responsibilities
- Communication between modules
- Layer responsibilities
- Dependency rules

The objective is to ensure every engineer and every AI agent builds the application following the exact same architecture.

This document is mandatory.

---

# ARCHITECTURAL PHILOSOPHY

This project follows a modular monolith architecture.

The project is intentionally NOT built using microservices.

Reasons:

• Single academy

• Small engineering team

• Shared database

• Simpler deployment

• Easier maintenance

Business complexity exists.

Infrastructure complexity should not.

---

# HIGH LEVEL ARCHITECTURE

                     Browser

                         │

                         ▼

                  Next.js App Router

                         │

             Server Components / Client Components

                         │

                         ▼

                  Server Actions

                         │

                         ▼

                     Services

                         │

                         ▼

                  Repositories

                         │

                         ▼

                     Prisma ORM

                         │

                         ▼

                    PostgreSQL

---

# ARCHITECTURE PRINCIPLES

The architecture follows five principles.

1.

Business rules live in Services.

2.

Database access lives in Repositories.

3.

Rendering lives in Components.

4.

Validation lives in Schemas.

5.

Everything is modular.

---

# DEPENDENCY DIRECTION

Dependencies always point inward.

UI

↓

Actions

↓

Services

↓

Repositories

↓

Database

Never the opposite.

Repositories never call Services.

Components never call Prisma.

Services never render UI.

---

# MODULE ORGANIZATION

Each business capability owns its own module.

Modules communicate through Services.

Never through database tables.

Modules should remain as independent as possible.

---

Example

students/

classes/

attendance/

recoveries/

finance/

events/

settings/

auth/

shared/

Each module owns its own implementation.

---

# STANDARD MODULE STRUCTURE

Every module should follow the same structure.

module/

components/

actions/

services/

repositories/

schemas/

validators/

types/

hooks/

constants/

utils/

README.md

Consistency is more important than personal preference.

---

# MODULE RESPONSIBILITIES

Student Module

Owns:

Student lifecycle

Student profile

Student activation

Student deactivation

Student search

Student cycles

Student dashboard

---

Class Module

Owns:

Classes

Schedules

Capacity

Responsible administrator

Promotion targets

---

Enrollment Module

Owns:

Enrollment creation

Enrollment completion

Enrollment blocking

Enrollment cancellation

Enrollment history

Promotion preparation

---

Attendance Module

Owns:

Attendance sessions

Attendance records

Late arrivals

Consecutive absences

Attendance reports

Recovery detection

---

Recovery Module

Owns:

Recovery generation

Recovery scheduling

Recovery completion

Recovery payment verification

Enrollment unblocking

---

Finance Module

Owns:

Charges

Receipts

Receipt allocations

Billing

Pricing calculations

Payment approval

Outstanding balances

---

Assessment Module

Owns:

Level assessments

Assessment payments

Assessment results

Recommended level

---

Events Module

Owns:

Public events

Calendar

Landing information

---

Settings Module

Owns:

Academy configuration

Pricing

Branding

Business hours

Capacity defaults

---

Audit Module

Owns:

Audit log generation

History queries

Administrative traceability

---

# SHARED MODULE

The shared module contains infrastructure.

Never business logic.

Allowed:

UI Components

Generic Hooks

Formatting

Date Helpers

Money Formatting

Validation Helpers

Constants

Icons

Utility Types

Forbidden:

Attendance calculations

Pricing calculations

Promotion rules

Recovery generation

Business decisions

Business logic belongs to business modules.

---

# SERVICE LAYER

The Service layer contains the entire business domain.

Every business rule belongs here.

Services should be deterministic.

Given the same input,

they should always produce the same output.

Services orchestrate repositories.

Never the opposite.

---

Example

ApproveReceiptService

↓

Load Receipt

↓

Load Charges

↓

Validate Allocation

↓

Create Allocations

↓

Update Charges

↓

Generate Audit Log

↓

Return Result

---

# REPOSITORY LAYER

Repositories isolate Prisma.

The rest of the application should not know Prisma exists.

Repository responsibilities:

Persist entities.

Load entities.

Transactions.

Nothing else.

---

Good

studentRepository.findByEmail()

Bad

studentRepository.generateRecovery()

That belongs in RecoveryService.

---

# ACTION LAYER

Server Actions are application entry points.

Responsibilities

Authentication

Authorization

Validation

Calling Services

Formatting Responses

Nothing more.

---

# COMPONENT LAYER

Components should be dumb.

Render data.

Emit actions.

Never calculate business rules.

Never modify business state.

Never access repositories.

Never access Prisma.

---

# SCHEMA LAYER

Every input entering the system should pass through a Schema.

Examples

Create Student

Create Class

Approve Receipt

Register Attendance

Schedule Recovery

Re-enter Student

Schemas validate shape.

Services validate business.

Never mix both.

---

# TYPES

Types represent contracts.

Never business behavior.

Examples

DTOs

Responses

View Models

API Contracts

Avoid placing business logic inside TypeScript types.

---

# VALIDATORS

Validators contain reusable validation logic.

Examples

Valid email

Valid phone

Image constraints

Password rules

Validators never access repositories.

Validators never know the database.

---

# UTILITIES

Utilities are pure functions.

Examples

Format currency

Generate UUID

Parse dates

Slugify

Utilities never contain business rules.

---

# MODULE COMMUNICATION

Modules communicate only through public Services.

Example

Attendance detects:

Two consecutive absences

↓

Calls RecoveryService

↓

RecoveryService creates Recovery

Attendance never creates Recoveries directly.

---

# APPLICATION STRUCTURE

The project should follow a feature-first organization.

```
app/
│
├── (public)/
│   ├── page.tsx
│   ├── schedule/
│   ├── events/
│   └── about/
│
├── dashboard/
│   ├── students/
│   ├── classes/
│   ├── attendance/
│   ├── finance/
│   ├── recoveries/
│   ├── assessments/
│   ├── settings/
│   └── reports/
│
├── api/
│
├── auth/
│
└── layout.tsx


modules/
│
├── students/
├── classes/
├── enrollments/
├── attendance/
├── recoveries/
├── finance/
├── assessments/
├── events/
├── settings/
├── audit/
├── auth/
└── shared/


prisma/

public/

lib/

types/

middleware.ts

```

The application should always keep business code inside **modules/**.

Never place business logic inside the app router.

---

# MODULE PUBLIC API

Each module exposes only its public interface.

Example

```
attendance/

services/

repositories/

components/

schemas/

index.ts
```

Other modules import only from:

```
modules/attendance
```

Never import internal implementation files directly.

Bad

```
import AttendanceRepository from ".../attendance/repositories/databaseRepository"
```

Good

```
import { AttendanceService } from "@/modules/attendance"
```

This allows internal refactoring without affecting the rest of the application.

---

# DEPENDENCY GRAPH

Allowed

```
Components

↓

Server Actions

↓

Services

↓

Repositories

↓

Prisma

↓

Database
```

Forbidden

```
Component

↓

Repository
```

Forbidden

```
Repository

↓

Service
```

Forbidden

```
Service

↓

React Component
```

Forbidden

```
Prisma

↓

UI
```

Dependencies always move downward.

---

# SERVER COMPONENT STRATEGY

Server Components are the default.

Use Client Components only when necessary.

Examples

Buttons

Forms

Dialogs

Drag & Drop

Calendar interactions

File uploads

Everything else should remain Server Components.

---

# CLIENT COMPONENT RULES

Client Components should never:

Contain business logic.

Query Prisma.

Modify entities directly.

Calculate business rules.

Generate prices.

Generate recoveries.

Client Components interact only through:

Server Actions.

---

# SERVER ACTION FLOW

Every mutation follows the same architecture.

```
User

↓

Form

↓

Server Action

↓

Schema Validation

↓

Authorization

↓

Service

↓

Repository

↓

Database

↓

Result

↓

UI Refresh
```

Every mutation should be traceable.

---

# STANDARD SERVICE FLOW

Every Service should follow a predictable structure.

Example

ApproveReceiptService

```
Validate Request

↓

Load Data

↓

Validate Business Rules

↓

Execute Transaction

↓

Generate Domain Events

↓

Generate Audit Logs

↓

Return DTO
```

Every Service should look similar.

Consistency reduces maintenance costs.

---

# BUSINESS TRANSACTIONS

The following operations require transactions.

Student Creation

Student Re-entry

Promotion

Attendance Registration

Recovery Generation

Recovery Completion

Receipt Approval

Monthly Billing

Assessment Completion

Enrollment Creation

Enrollment Cancellation

If one operation fails,

the transaction rolls back.

Never leave business data partially updated.

---

# TRANSACTION EXAMPLE

Recovery Generation

```
Attendance Saved

↓

Recovery Created

↓

Charge Created

↓

Enrollment Blocked

↓

Audit Log Created

↓

Commit
```

If Charge creation fails,

Attendance remains unchanged.

Everything rolls back.

---

# DOMAIN EVENTS

Services should emit Domain Events.

Examples

```
StudentCreated

EnrollmentCreated

AttendanceRegistered

RecoveryGenerated

RecoveryCompleted

PromotionCompleted

ReceiptApproved

ReceiptRejected

AssessmentCompleted

MonthlyBillingGenerated
```

Domain Events describe business facts.

They are not UI events.

---

# EVENT HANDLING

Example

AttendanceRegistered

↓

AttendanceService detects

↓

Two consecutive absences

↓

Emit

RecoveryRequired

↓

Recovery Module executes

↓

RecoveryCreated

↓

ChargeCreated

↓

EnrollmentBlocked

The Attendance module never creates Recoveries directly.

Modules communicate through business events.

---

# ERROR HANDLING

Business errors are expected.

Infrastructure errors are exceptional.

Business Examples

Student already enrolled.

Recovery already exists.

Receipt already approved.

Class is full.

Assessment already completed.

Infrastructure Examples

Database unavailable.

File storage unavailable.

SMTP unavailable.

Timeout.

Never mix them.

---

# ERROR OBJECT

Business errors should contain

Code

Message

Context

Optional metadata

Example

```
Code

ENROLLMENT_ALREADY_ACTIVE

Message

Student already has an active Regular Class enrollment.
```

Avoid generic exceptions.

---

# AUTHORIZATION

Authorization happens before Services execute.

Server Actions should verify

Authenticated user

↓

Administrator permissions

↓

Requested operation

↓

Service

Services assume authorization already occurred.

---

# FILE STORAGE

Database stores metadata.

Object Storage stores files.

Examples

Student photos

Receipt screenshots

Event banners

Never store binary files in PostgreSQL.

---

# IMAGE STRATEGY

Every uploaded image receives

UUID filename

↓

Object Storage

↓

Database URL

Images are immutable.

Replacing an image creates a new object.

---

# REPORTING

Reports never calculate raw business rules.

Reports consume historical entities.

Attendance

Recoveries

Promotions

Charges

Receipts

Student Cycles

History should already contain every required answer.

---

# BACKGROUND JOBS

Some business processes execute automatically.

Monthly Billing

Daily reminder emails

Future notifications

Expired recovery reminders

Database cleanup (temporary files)

Jobs must be idempotent.

Running them twice should never duplicate business data.

---

# SCHEDULER

Recommended schedule

Monthly

Generate Charges

Daily

Reminder emails

Hourly

Future integrations

Jobs should remain independent from HTTP requests.

---

# CONFIGURATION

Configuration belongs to Academy Settings.

Never hardcode

Pricing

Capacity

Recovery Fee

Assessment Fee

Brand colors

Social media

Business hours

Everything configurable belongs in the database.

---

# TEST STRATEGY

Testing priority

1

Domain Services

2

Repositories

3

Server Actions

4

Components

Business rules receive the highest testing priority.

---

# UNIT TESTS

Every Service should have unit tests.

Examples

Promotion

Recovery generation

Attendance validation

Billing calculation

Receipt approval

Student re-entry

These tests should not require React.

---

# INTEGRATION TESTS

Repositories

Transactions

Prisma

Database constraints

File uploads

Authentication

Should be tested together.

---

# E2E TESTS

Critical academy workflows

Student Registration

Attendance

Recovery

Monthly Payment

Promotion

Student Re-entry

Landing Page

Only business-critical flows require E2E coverage.

---

# MODULE DEFINITION OF DONE

A module is complete only if

Business rules implemented.

Schemas implemented.

Services implemented.

Repositories implemented.

Authorization implemented.

Audit logs implemented.

Tests implemented.

Documentation updated.

No duplicated logic exists.

No TODO placeholders remain.

---

# PERFORMANCE

Optimize only after measuring.

Never optimize speculative bottlenecks.

Avoid

Premature caching.

Premature memoization.

Premature denormalization.

Correctness is more valuable than speed.

---

# OBSERVABILITY

Every important Service should generate structured logs.

Example

```
RecoveryGenerated

Enrollment

Teacher

Student

Recovery ID

Timestamp
```

Logs help diagnose production issues.

Logs are not audit records.

---

# FINAL ARCHITECTURE PRINCIPLE

Architecture exists to protect the business model.

The goal is not to build the most sophisticated software.

The goal is to build software that remains understandable, maintainable and extensible years from now.

Every module should have a single responsibility.

Every dependency should have a clear direction.

Every business rule should have one—and only one—implementation.

If a future developer can understand the architecture without asking questions, then the architecture has succeeded.