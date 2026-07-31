# DEVELOPMENT.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PURPOSE

This document defines the engineering standards for the entire project.

Every module, service, component, migration and feature must follow these rules.

These rules exist to maximize:

- Readability
- Maintainability
- Predictability
- Domain correctness
- Scalability

Breaking these rules requires explicit approval.

---

# ENGINEERING PHILOSOPHY

The project should always be easy to understand.

The best code is not the shortest.

The best code is the code another engineer understands immediately.

Optimize for humans.

Not for compilers.

---

# CORE PRINCIPLES

Every implementation must respect these principles.

1.
Business first.

2.
Explicit over clever.

3.
Simple over abstract.

4.
Composition over inheritance.

5.
Domain over database.

6.
Readability over brevity.

7.
Maintainability over performance.

---

# DOMAIN DRIVEN DEVELOPMENT

The project follows a lightweight Domain Driven Design approach.

The domain determines the architecture.

The database does not.

The UI does not.

Every implementation begins by understanding the business process.

Never start from the schema.

Never start from the API.

Always start from the domain.

---

# MODULE ARCHITECTURE

Every business capability belongs to a module.

Modules own their own:

Components

Actions

Services

Repositories

Schemas

Validators

Types

Utilities

Each module should be independent.

Cross-module communication should happen only through public services.

Never access internal implementation details of another module.

---

# STANDARD MODULE STRUCTURE

students/

components/

actions/

services/

repositories/

schemas/

validators/

types/

utils/

hooks/

constants/

The same structure should be used whenever applicable.

Consistency is more important than personal preference.

---

# RESPONSIBILITY RULES

Every layer has exactly one responsibility.

Components

Render UI.

Nothing else.

Actions

Authenticate.

Validate.

Call Services.

Return response.

Nothing else.

Services

Business rules.

Business decisions.

Business validations.

Business events.

Repositories

Database access only.

Schemas

Input validation.

Types

Shared contracts.

Validators

Complex validation logic.

Utilities

Pure helper functions.

---

# COMPONENT RULES

Components should never:

Access Prisma.

Contain business rules.

Call repositories.

Modify database state.

Know implementation details.

Components receive data.

Render data.

Emit actions.

Nothing more.

---

# SERVER COMPONENTS

Server Components are responsible for:

Fetching already prepared data.

Rendering UI.

They are not responsible for:

Business calculations.

Business validation.

Complex orchestration.

---

# CLIENT COMPONENTS

Client Components should only exist when necessary.

Examples.

Forms.

Interactive tables.

Dialogs.

Dropdowns.

Search.

Avoid making components client-side by default.

---

# SERVER ACTIONS

Server Actions coordinate use cases.

Responsibilities.

Authentication.

Authorization.

Validation.

Calling services.

Returning typed results.

Never place business logic inside Server Actions.

---

# SERVICE LAYER

The Service Layer is the heart of the application.

Every business rule belongs here.

Examples.

AttendanceService

RecoveryService

PromotionService

FinanceService

EnrollmentService

Never bypass Services.

---

# REPOSITORY LAYER

Repositories exist only to communicate with Prisma.

Repositories may:

Create.

Read.

Update.

Delete.

Execute transactions.

Repositories may NOT:

Generate recoveries.

Calculate pricing.

Validate enrollments.

Block students.

Create debts.

Repositories are infrastructure.

Nothing more.

---

# DATABASE RULES

Every important operation should execute inside a transaction.

Examples.

Student Promotion

Old enrollment closes.

New enrollment opens.

Promotion history created.

Statistics updated.

One transaction.

Recovery Generation

Recovery created.

Debt created.

Enrollment blocked.

Audit record created.

One transaction.

Payment Approval

Receipt validated.

Charges allocated.

Charges updated.

Audit record created.

One transaction.

---

# TRANSACTION PRINCIPLE

If two records must always change together,

they belong inside the same transaction.

---

# VALIDATION

Every external input is validated.

Always.

Validation occurs before business logic.

Never trust:

Forms.

Uploads.

URLs.

JSON payloads.

Cookies.

Headers.

Validation library.

Zod.

No exceptions.

---

# TYPESCRIPT

Strict mode must always remain enabled.

Never use:

any

Avoid:

unknown

Prefer:

Explicit interfaces.

Explicit types.

Explicit return values.

---

# TYPE SAFETY

Every public function should define:

Input.

Output.

Exceptions.

Never rely on inference for public APIs.

---

# FILE SIZE

Recommended maximum.

Components

200 lines.

Services

300 lines.

Repositories

250 lines.

Actions

100 lines.

Validators

150 lines.

When approaching these limits,

split the file.

---

# FUNCTION SIZE

Target.

20–30 lines.

Hard limit.

50 lines.

Long functions usually indicate multiple responsibilities.

Extract them.

---

# FUNCTION DESIGN

Every function should answer one question.

Good.

calculateMonthlyPrice()

Bad.

calculatePriceAndCreateStudentAndSendEmail()

One function.

One responsibility.

---

# VARIABLE NAMING

Variable names should explain intent.

Good.

activeEnrollment

pendingRecovery

approvedReceipt

Bad.

data

item

obj

value

tmp

Never abbreviate business concepts.

---

# CLASS NAMING

Use names from the business domain.

Examples.

StudentCycle

Recovery

AttendanceRecord

ReceiptAllocation

Avoid generic names.

Manager

Engine

Processor

Controller

Utils

Helper

Factory

Unless they represent a well-known design pattern.

---

# COMMENTS

Code should explain itself.

Avoid comments.

Comments are allowed only when documenting business rules that cannot be understood from code alone.

Never use comments to explain poor code.

Improve the code instead.

---

# BOOLEAN RULE

Avoid multiple booleans.

Wrong.

isPaid

isActive

isBlocked

isCompleted

Correct.

status

Enums better represent business processes.

---

# ENUMS

All business processes should use enums.

Never free strings.

Never magic constants.

Enums must describe the business.

Examples.

EnrollmentStatus

RecoveryStatus

ChargeStatus

AttendanceStatus

AssessmentStatus

---

# CONFIGURATION

Never hardcode business values.

Examples.

Monthly pricing.

Enrollment fee.

Recovery fee.

Maximum students.

These belong in configuration.

Not code.

---

# DEPENDENCY RULE

Before installing a dependency ask.

Can this be solved with native APIs?

Can existing dependencies solve it?

Does it reduce complexity?

Will it still be maintained in five years?

If not,

do not install it.

---

# ERROR HANDLING

Every error should represent a business problem.

Never.

throw new Error()

Create explicit errors.

StudentNotFoundError

RecoveryAlreadyCompletedError

EnrollmentConflictError

InvalidReceiptAllocationError

BusinessRuleError

Errors are part of the domain.

---

# LOGGING

Logging exists to help diagnose production problems.

Logging is NOT auditing.

Logging is NOT analytics.

Logging should provide enough information to reconstruct what happened during execution.

Every log should include:

- Timestamp
- Module
- Operation
- User ID (when applicable)
- Entity ID (when applicable)
- Correlation ID
- Result

Never log passwords.

Never log tokens.

Never log sensitive personal information.

Never log payment screenshots.

---

# AUDIT LOG

Business auditing is mandatory.

Every important administrative action must generate an Audit Log entry.

Examples:

Student Created

Student Updated

Student Deactivated

Student Reactivated

Student Promoted

Enrollment Created

Enrollment Blocked

Enrollment Closed

Attendance Registered

Attendance Edited

Recovery Generated

Recovery Completed

Level Assessment Completed

Charge Generated

Receipt Approved

Receipt Rejected

Schedule Changed

Event Created

Administrator Created

Administrator Permissions Updated

Audit records should contain:

Action

Actor

Affected Entity

Entity Identifier

Timestamp

Optional metadata

Audit history must never be deleted.

Audit history must never be edited.

---

# EVENT DRIVEN THINKING

Think in business events.

Never think in CRUD.

Instead of:

Update Student

Think:

Student Reactivated

Instead of:

Insert Attendance

Think:

Attendance Registered

Instead of:

Update Payment

Think:

Receipt Approved

Business events should describe reality.

Database operations are implementation details.

---

# BUSINESS AUTOMATION

Whenever a business rule can execute automatically, automate it.

Examples:

Two consecutive absences

↓

Generate recovery

↓

Generate charge

↓

Block enrollment

No administrator should manually execute these steps.

Automation reduces operational mistakes.

---

# DATE HANDLING

All dates must be stored in UTC.

Display dates using the academy timezone.

Never compare formatted strings.

Always compare Date objects.

Never store business logic using locale-specific formatting.

---

# MONEY

Money should never use floating point arithmetic.

Represent monetary values using integer cents.

Example

$15.00

Stored as

1500

Business calculations should always operate on integers.

Formatting occurs only when displaying values.

---

# FILE UPLOADS

Uploaded files are immutable.

Never overwrite uploaded files.

Never rename uploaded files after upload.

Every upload receives a unique identifier.

Metadata belongs in the database.

Files belong in object storage.

---

# IMAGE STORAGE

Student profile photos

Receipt screenshots

Landing page images

Event banners

All images should be stored outside the application server.

The database stores only references.

---

# SECURITY PRINCIPLES

Every request must be authenticated unless explicitly public.

Every administrative operation must be authorized.

Never trust hidden fields.

Never trust client-side validation.

Never expose implementation details in error messages.

Always validate ownership before returning private information.

---

# AUTHORIZATION

Authorization belongs in the Service layer.

Never rely exclusively on UI restrictions.

Hidden buttons are not authorization.

Disabled inputs are not authorization.

Every protected operation must validate permissions on the server.

---

# PERFORMANCE PRINCIPLES

Correctness always comes first.

Performance comes second.

Optimize only after measuring.

Do not optimize speculative bottlenecks.

Avoid premature caching.

Avoid unnecessary memoization.

Avoid unnecessary indexes.

Measure first.

Then optimize.

---

# DATABASE PERFORMANCE

Avoid N+1 queries.

Prefer explicit loading.

Only load fields required by the use case.

Avoid deeply nested includes unless required.

Repository methods should return exactly the data required.

Nothing more.

Nothing less.

---

# CACHING

Do not introduce caching until a measurable need exists.

If caching is added:

Document:

Reason

Invalidation strategy

Lifetime

Owner

Never cache business state without understanding consistency implications.

---

# API DESIGN

Actions should represent business operations.

Examples

createStudent()

registerAttendance()

completeRecovery()

approveReceipt()

promoteStudent()

Avoid generic APIs.

Examples

save()

update()

process()

handle()

execute()

Names should communicate business intent.

---

# RETURN VALUES

Services should return structured results.

Avoid returning raw Prisma models directly.

Prefer explicit result objects.

Example

success

data

warnings

domainEvents

This makes future evolution easier.

---

# NULL HANDLING

Avoid nullable fields whenever possible.

Prefer explicit states.

Example

Instead of

completedAt = null

consider

status = PENDING

Only store nullable values when the business truly allows unknown information.

---

# FEATURE FLAGS

Do not introduce feature flags during the MVP.

The project is developed for a single academy.

Complex rollout strategies are unnecessary.

---

# MIGRATIONS

Every migration should represent a business evolution.

Migration names should describe intent.

Good

add_recovery_payments

support_multiple_receipts

track_student_cycles

Bad

migration2

fix_tables

new_columns

Never modify historical migrations.

Always create new ones.

---

# TESTING PHILOSOPHY

Business logic must be independently testable.

UI testing is secondary.

Priority order

1. Business Rules

2. Services

3. Repositories

4. Components

A service should be testable without rendering React.

---

# TEST TYPES

Unit Tests

Business rules

Integration Tests

Repositories

Transactions

Service orchestration

End-to-End Tests

Critical academy workflows

Examples

Student Enrollment

Monthly Payment

Attendance Registration

Recovery Generation

Student Promotion

Student Re-entry

---

# DEFINITION OF DONE

A task is complete only if ALL of the following are true.

The feature works.

Business rules are respected.

No existing behavior is broken.

Code follows module architecture.

No duplicated business logic exists.

Validation exists.

Authorization exists.

Errors are handled.

Database changes use migrations.

Types are explicit.

Lint passes.

Build passes.

Tests pass (when applicable).

Documentation updated (if necessary).

---

# CODE REVIEW CHECKLIST

Before considering a task complete ask:

Does this accurately represent the business?

Can the implementation be simpler?

Did I duplicate logic?

Is every validation in the correct layer?

Are responsibilities separated?

Will another engineer understand this immediately?

Did I accidentally introduce hidden coupling?

Is the code easy to test?

Did I preserve historical information?

Did I violate any document inside the .claude folder?

If any answer is "No" or "I'm not sure",

review the implementation again.

---

# SELF REVIEW

Every completed task should include a self-review.

Format:

Summary

Business Rules Implemented

Files Modified

Potential Risks

Future Improvements

Technical Debt

This review is mandatory.

---

# WHEN REQUIREMENTS ARE UNCLEAR

Never guess.

Never invent.

Never silently choose one interpretation.

Instead:

Explain the ambiguity.

List the possible interpretations.

Recommend one.

Wait for approval.

---

# WHEN DISCOVERING BETTER ARCHITECTURE

Do not immediately refactor.

Instead:

Explain the issue.

Explain the proposed solution.

Explain impact.

Explain migration effort.

Wait for approval.

Architecture evolves through deliberate decisions.

Not spontaneous refactors.

---

# DOCUMENTATION

Documentation is part of the codebase.

Whenever a business rule changes,

update the documentation first.

Then update the implementation.

Never let documentation become outdated.

---

# FINAL ENGINEERING PRINCIPLE

Every line of code should make the software easier to understand.

Every module should make the business easier to understand.

Every abstraction should remove complexity rather than introduce it.

If an abstraction makes the code harder to understand,

remove it.

The objective of this project is not to write impressive code.

The objective is to build software that accurately represents the operation of the academy and can be maintained confidently for many years.