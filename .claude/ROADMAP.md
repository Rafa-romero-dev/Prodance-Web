# ROADMAP.md
Version: 1.0
Project: Academy Management System
Status: Living Document

---

# PURPOSE

This roadmap defines the long-term evolution of the Academy Management System.

It establishes what belongs to the MVP and what intentionally does not.

The roadmap exists to prevent scope creep.

A feature is not included because it is easy to build.

A feature is included because it creates business value.

Whenever new ideas appear, they should first be evaluated against this roadmap before being added to the project.

---

# PRODUCT VISION

The Academy Management System should become the central operating platform of the academy.

The system should manage the complete lifecycle of a student.

From the moment they enroll,

through attendance,

payments,

promotions,

temporary inactivity,

re-entry,

and eventually historical reporting.

The objective is that administrators never need spreadsheets again.

---

# PRODUCT PRINCIPLES

Every new feature should satisfy at least one of the following objectives.

• Reduce administrative work.

• Reduce repetitive tasks.

• Preserve historical information.

• Improve decision making.

• Improve communication.

• Improve student experience.

If a feature satisfies none of these objectives,

it probably should not exist.

---

====================================================

MVP (Version 1.0)

====================================================

The MVP represents the minimum complete product that allows the academy to replace its current operational process.

The MVP is considered complete only when every module below has been implemented.

---

MODULE 01

Authentication

Status

Required

Features

Administrator Login

Student Login

Invitation Email

Password Creation

Password Reset

Session Management

Protected Routes

---

MODULE 02

Students

Status

Required

Features

Student Registration

Student Profile

Inactive Students

Student Search

Student History

Profile Photo

Personal Information

Contact Information

Guardian Information

Re-entry

---

MODULE 03

Classes

Status

Required

Features

Regular Classes

Complementary Classes

Capacity

Professor Assignment

Schedule Versioning

Class History

Promotion Support

---

MODULE 04

Enrollments

Status

Required

Features

Create Enrollment

Transfer Enrollment

Promotion

Enrollment History

One Active Regular Enrollment Rule

Multiple Complementary Enrollments

---

MODULE 05

Attendance

Status

Required

Features

Attendance Sessions

Attendance Registration

Late Arrival Tracking

Attendance History

Attendance Editing

Automatic Consecutive Absence Detection

Recovery Trigger

---

MODULE 06

Recoveries

Status

Required

Features

Automatic Recovery Creation

Recovery Payment

Recovery Completion

Recovery History

Enrollment Blocking

Recovery Dashboard

---

MODULE 07

Level Assessments

Status

Required

Features

Inactive Student Re-entry

Assessment Payment

Teacher Assignment

Target Level Selection

Assessment History

---

MODULE 08

Finance

Status

Required

Features

Charges

Enrollment Fee

Monthly Tuition

Recovery Fee

Assessment Fee

Receipt Upload

Receipt Approval

Receipt Rejection

Manual Charge Allocation

Outstanding Balance

Financial History

---

MODULE 09

Landing Page

Status

Required

Features

Home

About Academy

Regular Schedule

Special Events Calendar

Contact Information

Social Media

---

MODULE 10

Events

Status

Required

Features

Special Events

Calendar

Landing Page Integration

Administrative CRUD

---

MODULE 11

Dashboard

Status

Required

Features

Today's Classes

Pending Recoveries

Pending Payments

Student Statistics

Upcoming Events

Recent Activity

---

MODULE 12

Administration

Status

Required

Features

Academy Settings

Pricing Configuration

Recovery Configuration

Email Templates (basic)

Audit Log Viewer

---

====================================================

POST-MVP

Version 1.1

====================================================

The following features improve productivity but are not required for launch.

Student Notifications

Email reminders

Upcoming recovery reminders

Payment reminders

Birthday reminders

---

Attendance Improvements

Attendance statistics

Attendance trends

Teacher attendance reports

Weekly attendance summary

---

Reports

Monthly revenue

Attendance reports

Enrollment reports

Student growth

Recovery statistics

Promotion statistics

---

Financial Improvements

Payment history exports

Monthly closing report

Revenue dashboard

Outstanding balances report

---

Landing Page

Gallery

Teacher profiles

Testimonials

Frequently Asked Questions

Embedded Google Maps

---

====================================================

VERSION 1.2

====================================================

Operational improvements.

Recurring Events

Advanced Calendar

Holiday Management

Teacher Availability

Schedule Conflict Detection

Advanced Search

Saved Filters

CSV Import

CSV Export

Bulk Student Operations

---

====================================================

VERSION 2.0

====================================================

Student Experience

Student Dashboard

Attendance History

Payment History

Recovery Tracking

Assessment Results

Announcements

Download Receipts

Profile Management

---

Teacher Experience

Teacher Dashboard

Daily Schedule

Attendance Summary

Pending Recoveries

Assessment Queue

---

Communication

Email Notifications

In-App Notifications

Announcement System

Notification Preferences

---

====================================================

VERSION 3.0

====================================================

Business Intelligence

Revenue Trends

Student Retention

Dropout Analysis

Teacher Performance

Attendance Heatmaps

Forecasting

Custom Reports

Export Engine

---

Artificial Intelligence

Student Risk Detection

Recovery Recommendations

Promotion Suggestions

Attendance Predictions

Financial Forecasting

Administrative Assistant

Natural Language Search

---

====================================================

EXPLICITLY OUT OF SCOPE

====================================================

The following features are intentionally excluded.

Multi-academy support.

Multi-tenant architecture.

Marketplace.

Online class streaming.

Video hosting.

Online payments.

Accounting system.

Inventory management.

Payroll.

CRM.

Marketing automation.

Mobile application.

Offline mode.

Public APIs.

Plugin ecosystem.

GraphQL.

Microservices.

Redis.

Event sourcing.

CQRS.

These ideas may become future products but are not part of this roadmap.

---

====================================================

SUCCESS CRITERIA FOR MVP

====================================================

The MVP is considered successful when the academy can perform every daily administrative task using the application.

Specifically:

Students can be registered.

Students can become inactive.

Students can return through assessments.

Classes can be managed.

Attendance is recorded.

Recoveries are generated automatically.

Recoveries are completed.

Monthly charges are generated.

Receipts are uploaded.

Receipts are approved.

Financial history is preserved.

Landing page displays schedules and events.

No spreadsheets are required for daily operation.

---

====================================================

ROADMAP GOVERNANCE

====================================================

Every new feature request should answer:

What business problem does it solve?

Can the academy operate without it?

Does it belong in the MVP?

Does it increase complexity?

Does it preserve existing architecture?

If these questions cannot be answered clearly,

the feature should remain outside the roadmap.

---

====================================================

FINAL PRINCIPLE

====================================================

The roadmap represents strategic direction,

not a promise of immediate implementation.

The objective is not to build the largest system possible.

The objective is to build the smallest system that completely solves the academy's operational needs,

and then evolve it through deliberate, incremental improvements without compromising architectural quality.