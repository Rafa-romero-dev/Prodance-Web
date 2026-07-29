# PRODUCT_DECISIONS.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PURPOSE

This document records the major architectural and business decisions made during the design of the Academy Management System.

It explains **why** decisions were made.

The Domain explains **what** the business does.

The Database explains **how** it is stored.

This document explains **why** the system behaves that way.

Future developers should read this document before changing business behavior.

---

# DECISION 001

## Single Academy

Decision

The application is built exclusively for one academy.

It is not a SaaS platform.

Reason

The academy has unique business processes that should not be generalized.

Avoiding multi-tenancy dramatically reduces complexity.

Consequences

No Tenant entity.

No organization switching.

No subscription model.

No tenant isolation.

Future multi-academy support would require a dedicated redesign.

---

# DECISION 002

## Teachers are Administrators

Decision

Every teacher is an administrator.

There are no independent teacher accounts.

Reason

Teachers are responsible for:

Attendance

Recoveries

Level assessments

Student promotions

These responsibilities already require administrative permissions.

Consequences

Single authentication model.

Simpler permission system.

Smaller maintenance cost.

---

# DECISION 003

## Students Never Create Accounts

Decision

Administrators create every student.

Students receive an invitation email.

Reason

The academy controls enrollment.

Students should never self-register.

Consequences

Email is mandatory.

Password creation occurs after invitation.

No public registration page.

---

# DECISION 004

## Student History Is Permanent

Decision

Students are never deleted.

Reason

The academy needs historical information for:

Re-entry

Attendance

Payments

Reports

Future analytics

Consequences

Inactive students remain searchable.

Historical reports remain accurate.

Audit integrity is preserved.

---

# DECISION 005

## StudentCycle Exists

Decision

Student participation is divided into cycles.

Reason

A student may leave the academy and return months later.

The academy wants to measure each participation period independently.

Consequences

History remains continuous.

Reports become more accurate.

Re-entry becomes explicit.

---

# DECISION 006

## Enrollments Are Immutable

Decision

Enrollments are never overwritten.

Reason

Changing historical enrollments destroys valuable information.

Consequences

Promotions create new enrollments.

Schedule history remains valid.

Reports remain historically accurate.

---

# DECISION 007

## Promotions Create New Enrollments

Decision

Promotion never edits an existing enrollment.

Reason

Each regular class represents a different learning stage.

Students should have measurable progress.

Consequences

Duration per level becomes measurable.

Historical reports remain correct.

---

# DECISION 008

## Schedule Versioning

Decision

Schedules are versioned.

Reason

Class schedules occasionally change.

Historical attendance should continue referencing the original schedule.

Consequences

Attendance remains historically correct.

Landing page always displays the latest schedule.

---

# DECISION 009

## One Active Regular Enrollment

Decision

Students may only have one active Regular Class.

Reason

The academy progression is linear.

Students cannot belong to multiple regular levels simultaneously.

Complementary classes remain unrestricted.

---

# DECISION 010

## Complementary Classes

Decision

Students may enroll in unlimited complementary classes.

Examples

Styling

Ladies Styling

Men's Styling

Dance Formation

Workshops

Reason

These classes do not represent the academy's main progression.

---

# DECISION 011

## Two Consecutive Absences Trigger Recovery

Decision

Two consecutive absences automatically generate a Recovery.

Reason

Every regular class meets once per week.

Missing two weeks means the student has likely fallen behind.

Recovery protects overall class quality.

---

# DECISION 012

## Recovery Blocks Only One Enrollment

Decision

Recoveries affect only the enrollment that generated them.

Reason

A student may remain active in unrelated classes.

Consequences

Recoveries are scoped to one enrollment.

No global student blocking exists.

---

# DECISION 013

## Recovery Requires Payment

Decision

Every Recovery generates a Charge.

Reason

Recoveries consume teacher time and academy resources.

Recoveries are additional services.

---

# DECISION 014

## Recovery Completion Is Manual

Decision

Teachers manually complete Recoveries.

Reason

Recovery lessons occur outside the regular schedule.

Automatic completion is impossible.

The teacher confirms the lesson actually occurred.

---

# DECISION 015

## Level Assessment Exists

Decision

Inactive students returning to Regular Classes require a Level Assessment.

Reason

Skill levels deteriorate over time.

Students should rejoin the appropriate level.

Complementary classes may skip this requirement at teacher discretion.

---

# DECISION 016

## Assessment Generates a Charge

Decision

Every Level Assessment creates a Charge.

Reason

The assessment is a paid service.

The financial model should reflect reality.

---

# DECISION 017

## Charges Are Immutable

Decision

Charges never change value after creation.

Reason

Historical financial records must remain accurate.

Future pricing changes must not rewrite history.

---

# DECISION 018

## Receipts Are Independent From Charges

Decision

Receipts represent proof of payment.

Charges represent debts.

Reason

One receipt may pay multiple charges.

One charge may be paid by multiple receipts.

Manual allocation provides maximum flexibility.

---

# DECISION 019

## Manual Receipt Allocation

Decision

Administrators choose how receipts are allocated.

Reason

Bank transfers may cover multiple obligations.

Automatic allocation could incorrectly apply funds.

Human validation is required.

---

# DECISION 020

## Attendance Is Immutable

Decision

Attendance represents what happened on a specific date.

Corrections update the record while preserving audit history.

Attendance sessions themselves are never recreated.

---

# DECISION 021

## Audit Logs Are Permanent

Decision

Administrative actions generate immutable audit records.

Reason

Financial and academic actions must always be traceable.

Audit Logs are append-only.

---

# DECISION 022

## Business Rules Live in Services

Decision

Only Services contain business rules.

Reason

Business logic should exist exactly once.

Repositories persist data.

Components render data.

Server Actions orchestrate requests.

---

# DECISION 023

## Server Components by Default

Decision

Next.js Server Components are the default rendering strategy.

Reason

Reduce JavaScript.

Improve performance.

Simplify data loading.

Client Components exist only for interaction.

---

# DECISION 024

## Manual Administrative Control

Decision

The academy intentionally favors manual approval over automation for sensitive processes.

Examples

Receipt approval.

Recovery completion.

Level assessments.

Student promotions.

Reason

These processes require human judgment.

Automation should assist administrators, not replace them.

---

# FINAL PRINCIPLE

Every decision documented here represents a conscious trade-off made during product design.

Future changes should not be evaluated only by implementation cost.

They should also be evaluated against the business reasons that motivated these decisions.

If a future requirement invalidates one of these decisions, update this document before changing the implementation.

The documentation is the long-term memory of the project.