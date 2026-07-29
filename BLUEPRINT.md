# BLUEPRINT.md
Version: 1.0
Project: Academy Management System
Status: Master Development Blueprint

---

# PURPOSE

This document defines the order in which the Academy Management System should be built.

It is not a PRD.

It is not an implementation guide.

It is not a roadmap.

It is simply the recommended construction sequence.

Every phase should be completed before moving to the next.

Do not skip phases.

Do not implement future modules early because they seem easy.

The order exists to minimize refactoring.

---

# DEVELOPMENT PRINCIPLES

Always prefer vertical slices over isolated code.

Every completed phase should leave the project in a working state.

Never write code that depends on modules that do not exist yet.

Finish one module before beginning the next.

Run tests before starting another phase.

---

====================================================

PHASE 1

Project Initialization

====================================================

Objective

Create the project foundation.

Tasks

Initialize Next.js

Install dependencies

Configure Tailwind

Configure shadcn/ui

Configure ESLint

Configure Prettier

Configure TypeScript

Configure Auth.js

Configure UploadThing

Configure Resend

Configure Prisma

Configure PostgreSQL

Configure environment variables

Create initial folder structure

Deliverable

A running project with all infrastructure configured.

---

====================================================

PHASE 2

Database

====================================================

Objective

Build the complete database layer.

Tasks

Create Prisma schema

Create enums

Create relationships

Create migrations

Create seed data

Validate schema

Deliverable

A working database with migrations and seed.

---

====================================================

PHASE 3

Shared Infrastructure

====================================================

Objective

Create everything shared by the application.

Tasks

Authentication

Authorization

Layouts

Sidebar

Navigation

Permissions

Utilities

Shared Components

Theme

Providers

Deliverable

A navigable application shell.

---

====================================================

PHASE 4

Landing Page

====================================================

Objective

Build the public website.

Tasks

Home

About

Regular Schedule

Special Events Calendar

Contact

Responsive Layout

Deliverable

Public academy website.

---

====================================================

PHASE 5

Students Module

====================================================

Objective

Manage students.

Tasks

Student CRUD

Inactive Students

Student Detail

Student History

Invitation Email

Profile Photos

Deliverable

Complete Student Management.

---

====================================================

PHASE 6

Classes Module

====================================================

Objective

Manage classes.

Tasks

Class CRUD

Professor Assignment

Capacity

Schedule Versioning

Class History

Deliverable

Complete Class Management.

---

====================================================

PHASE 7

Enrollment Module

====================================================

Objective

Manage enrollments.

Tasks

Create Enrollment

Promotion

Transfers

Enrollment History

Validation Rules

Deliverable

Complete Enrollment Management.

---

====================================================

PHASE 8

Attendance Module

====================================================

Objective

Manage attendance.

Tasks

Attendance Sessions

Attendance Registration

Attendance Editing

Late Tracking

Attendance History

Automatic Recovery Detection

Deliverable

Attendance fully operational.

---

====================================================

PHASE 9

Recovery Module

====================================================

Objective

Manage recoveries.

Tasks

Recovery Creation

Recovery Dashboard

Recovery Payment

Recovery Completion

Enrollment Blocking

History

Deliverable

Recovery workflow completed.

---

====================================================

PHASE 10

Assessment Module

====================================================

Objective

Manage student re-entry.

Tasks

Assessment Creation

Assessment Payment

Teacher Evaluation

Target Level

History

Deliverable

Re-entry workflow completed.

---

====================================================

PHASE 11

Finance Module

====================================================

Objective

Manage academy finances.

Tasks

Charges

Enrollment Fee

Monthly Tuition

Recovery Fee

Assessment Fee

Receipt Upload

Receipt Approval

Manual Allocation

Financial History

Deliverable

Complete financial workflow.

---

====================================================

PHASE 12

Events Module

====================================================

Objective

Manage academy events.

Tasks

CRUD

Calendar

Landing Integration

Deliverable

Events available publicly and internally.

---

====================================================

PHASE 13

Dashboard

====================================================

Objective

Provide operational visibility.

Tasks

Statistics

Today's Classes

Pending Recoveries

Pending Payments

Recent Activity

Upcoming Events

Deliverable

Operational Dashboard.

---

====================================================

PHASE 14

Settings

====================================================

Objective

Configure academy behavior.

Tasks

Pricing

Recovery Configuration

Academy Settings

Email Templates

Deliverable

Configurable application.

---

====================================================

PHASE 15

Reports

====================================================

Objective

Generate business reports.

Tasks

Attendance Reports

Financial Reports

Student Reports

Recovery Reports

Export Data

Deliverable

Reporting module.

---

====================================================

PHASE 16

Testing

====================================================

Objective

Validate the complete application.

Tasks

Unit Tests

Integration Tests

End-to-End Tests

Accessibility Review

Bug Fixes

Deliverable

Stable application.

---

====================================================

PHASE 17

Production Readiness

====================================================

Objective

Prepare for deployment.

Tasks

Performance Review

Security Review

Documentation Review

Environment Validation

Production Build

Deliverable

Application ready for deployment.

---

# GENERAL RULES

Before starting a phase:

Read DOMAIN.md

Read DATABASE.md

Read ARCHITECTURE.md

Read PRODUCT_DECISIONS.md

Implement only the current phase.

Do not begin the next phase until the current one is complete.

---

# FINAL PRINCIPLE

The Blueprint defines the construction order of the project.

It is intentionally simple.

Whenever implementation questions arise, consult the corresponding documentation rather than expanding this Blueprint.

The Blueprint should remain stable throughout the life of the project.