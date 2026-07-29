# PROJECT.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PROJECT OVERVIEW

## Vision

Academy Management System is a custom-built web application developed exclusively for a single dance academy.

This application is NOT intended to become a SaaS platform.

The software must solve the operational needs of one academy as accurately as possible.

Every design decision should optimize for simplicity, maintainability and correctness instead of configurability.

The objective is to replace spreadsheets, WhatsApp conversations, paper attendance sheets and manual administrative processes with a centralized platform.

The software should become the operational heart of the academy.

---

# PROJECT GOALS

The application has five primary goals.

1. Centralize all academy information.

2. Automate repetitive administrative work.

3. Preserve complete historical information.

4. Reduce human errors.

5. Make future growth easier.

Every feature added to the system should contribute to at least one of these goals.

---

# PRODUCT PHILOSOPHY

This application represents business processes.

It is not simply a database with forms.

The software should behave as if it were another administrator working inside the academy.

Whenever possible:

Business processes should be automated.

Human intervention should only be required for decisions.

Not for repetitive administrative work.

---

# TARGET USERS

The application has only two user roles during the MVP.

## Administrator

Administrators are academy staff.

Administrators are also teachers.

There is no Teacher entity.

Every teacher is an administrator.

Every administrator may or may not have classes assigned.

Administrators are responsible for:

• Student management

• Class management

• Attendance

• Promotions

• Re-entry

• Recoveries

• Payment validation

• Event management

• Schedule management

• Landing page content

• Academy configuration

---

## Student

Students access the platform using their own account.

Students can:

• View assigned classes

• Upload payment receipts

• Review payment history

• Review attendance history

• Check recovery requirements

• View academy calendar

• View regular class schedule

Students cannot modify academy information.

---

# OUT OF SCOPE

The following features are intentionally excluded from the MVP.

• Multiple academies

• Multiple branches

• Online payment gateway

• Accounting integration

• Payroll

• Mobile application

• WhatsApp integration

• SMS notifications

• Video classes

• AI features

Those features may be implemented in future versions.

The MVP should not be architected around them.

---

# BUSINESS OBJECTIVES

The academy currently struggles with:

Manual attendance tracking.

Student follow-up.

Payment validation.

Recovery lesson management.

Re-entry management.

Historical information.

Monthly administration.

The application exists to solve those problems.

---

# CORE BUSINESS PROCESSES

The academy operates around several fundamental processes.

These processes define the entire domain.

Student Lifecycle

↓

Enrollment

↓

Monthly Payments

↓

Attendance

↓

Recovery

↓

Promotion

↓

Re-entry

↓

Graduation or Inactivity

Everything else supports those processes.

---

# DESIGN PRINCIPLES

The application should feel like an internal business tool.

Not like a social network.

Not like an e-commerce platform.

Not like a CMS.

The interface should optimize productivity.

A secretary should be able to use the system for eight hours every day comfortably.

---

# HISTORICAL DATA

Historical information is more valuable than current information.

Current information answers:

"What is happening?"

Historical information answers:

"What happened?"

"When?"

"Why?"

"Who?"

Every important action should become part of history.

History should never disappear.

---

# AUTOMATION

Whenever the application can safely automate a process, it should.

Examples.

Automatic recovery creation.

Automatic debt generation.

Automatic enrollment blocking.

Automatic payment status updates.

Automatic notifications.

Administrators should spend time making decisions.

Not remembering repetitive tasks.

---

# BUSINESS EVENTS

The application is event-driven from a business perspective.

Examples.

Student Created

↓

Enrollment Created

↓

Enrollment Charge Created

↓

Payment Uploaded

↓

Payment Approved

↓

Student Activated

Another example.

Attendance Registered

↓

Consecutive Absence Detected

↓

Recovery Created

↓

Recovery Charge Created

↓

Enrollment Blocked

The system should think in events.

Not CRUD operations.

---

# STUDENT LIFECYCLE

Every student follows the same general lifecycle.

Lead (future version)

↓

Student Created

↓

Enrollment Fee

↓

Monthly Payment

↓

Enrollment

↓

Attendance

↓

Promotion

↓

Graduation

or

Inactive Student

↓

Re-entry

↓

Level Assessment

↓

Enrollment

↓

Attendance

History should preserve every stage.

---

# REGULAR CLASSES

Regular classes represent the student's main academic progression.

A student may only belong to ONE regular class at any time.

Regular classes are organized as:

Basic 1

Basic 2

Basic 3

Basic 4

Intermediate 1

Intermediate 2

Intermediate 3

Intermediate 4

Advanced 1

Advanced 2

Advanced 3

Advanced 4

Changing level creates a new enrollment.

History is preserved.

---

# COMPLEMENTARY CLASSES

Complementary classes have no progression restrictions.

Examples.

Styling

Men Styling

Ladies Styling

Performance Team

Special Workshops

Students may enroll in multiple complementary classes simultaneously.

Each complementary class has its own attendance history.

Each complementary class has its own recovery process.

---

# RECOVERY LESSSONS

Recovery lessons exist to preserve the learning rhythm.

A recovery is automatically generated after two consecutive absences.

The rule applies independently to each enrollment.

Missing two Men's Styling classes does not affect Salsa Casino.

Missing two Salsa Casino classes does not affect Ladies Styling.

Recoveries block only the affected enrollment.

Never the entire student.

---

# RE-ENTRY

Inactive students remain in the system forever.

When returning to the academy:

The administrator clicks:

Re-enter Student

The system starts a re-entry process.

For regular classes:

A level assessment is mandatory.

For complementary classes:

Level assessment is optional and depends on the teacher.

Every assessment becomes historical information.

---

# FINANCIAL MODEL

The academy charges based on the number of active enrollments.

Pricing policy.

First class:

$15

Every additional class:

$5

Example.

One class

↓

$15

Two classes

↓

$20

Three classes

↓

$25

Recovery lessons generate an additional charge.

Level assessments generate an additional charge.

Enrollment generates an enrollment fee.

Payment receipts do not automatically pay debts.

Administrators decide how uploaded receipts are allocated.

---

# PAYMENT VALIDATION

Students upload one or more receipts.

Administrators validate them.

One receipt may pay:

One charge.

Multiple charges.

Partial charges.

Multiple receipts may pay the same charge.

The financial system should not assume one-to-one relationships.

---

# ATTENDANCE

Attendance is registered once per class session.

Students have only two attendance states.

Present

Absent

Late arrival is additional metadata.

Not a separate attendance state.

Attendance may be corrected later.

Corrections become historical events.

---

# CLASS SCHEDULES

Classes have fixed schedules.

However.

Schedules may change.

Schedule changes must preserve history.

Previous schedules should remain available for historical reports.

Schedules are versioned.

Never overwritten.

---

# EVENTS

The academy organizes special events.

Examples.

Workshops

Social dancing

Competitions

Master classes

Announcements

Events appear on the public landing page.

Events are independent from regular classes.

---

# LANDING PAGE

The landing page has two goals.

Inform visitors.

Inform students.

The landing page should contain:

Academy information.

Calendar of events.

Regular class schedule.

General contact information.

No administrative functionality belongs on the landing page.

---

# SUCCESS METRICS

The MVP will be considered successful if administrators can completely replace:

Paper attendance.

Spreadsheet payment tracking.

Manual recovery tracking.

Student notebooks.

WhatsApp payment verification.

Class progression spreadsheets.

with this application.

---

# LONG-TERM VISION

Future versions may include:

Online payments.

Teacher payroll.

Student evaluations.

Mobile application.

Analytics.

Marketing automation.

Lead management.

Competition management.

Certification tracking.

However.

The MVP should not be overengineered in preparation for these features.

Future expansion should happen naturally through the existing architecture.

---

# FINAL PRODUCT PRINCIPLE

Every feature must represent a real business process.

If a feature exists only because it is technically interesting,

it should not exist.

The software serves the academy.

The academy should never adapt its processes to accommodate poor software design.