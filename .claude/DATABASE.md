# DATABASE.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PURPOSE

This document defines the persistence model of the Academy Management System.

It is NOT merely a database schema.

It explains WHY each table exists, how entities relate to each other and which business rules must be enforced at the persistence layer.

The database exists to support the Domain.

The Domain never exists to support the database.

---

# DATABASE PHILOSOPHY

The database must preserve business history.

The database is not optimized for minimizing the number of tables.

The database is optimized for:

• Explicit relationships

• Historical integrity

• Referential integrity

• Future reporting

• Business traceability

Avoid denormalization unless performance measurements justify it.

---

# DATABASE PRINCIPLES

## Principle 1

Nothing important is deleted.

Use soft deletes only when explicitly required.

Prefer status changes.

Historical information is more valuable than free storage.

---

## Principle 2

Never overwrite historical records.

If reality changes,

create a new record.

Examples

Schedule changes

↓

New Schedule Version

Promotion

↓

New Enrollment

Recovery completed

↓

Status change + timestamps

---

## Principle 3

Every important entity should contain audit metadata.

Minimum fields:

createdAt

updatedAt

createdBy (when applicable)

updatedBy (when applicable)

---

## Principle 4

Foreign keys are mandatory.

Never store IDs without constraints.

Relationships are part of the business.

Protect them.

---

# DATABASE CONVENTIONS

Tables

Singular names.

Examples

Student

Enrollment

Recovery

Receipt

Columns

camelCase.

Primary Keys

id

UUID

Foreign Keys

studentId

classId

receiptId

createdById

updatedById

Boolean names

isLate

isMinor

Never

late

minor

---

# ENUM STRATEGY

Every business status should use enums.

Never free strings.

Examples

EnrollmentStatus

ChargeStatus

RecoveryStatus

ReceiptStatus

AttendanceStatus

AssessmentStatus

EventStatus

StudentStatus

---

# PRIMARY IDENTIFIERS

Every table uses UUIDs.

Never sequential IDs.

Reasons

Safer URLs.

No information leakage.

Better distributed systems compatibility.

Simpler synchronization.

---

# TIMESTAMPS

Every table includes

createdAt

updatedAt

Whenever meaningful,

also include

completedAt

cancelledAt

approvedAt

scheduledAt

activatedAt

deactivatedAt

Avoid generic date fields.

Dates should describe business meaning.

---

# CORE ENTITY GROUPS

People

Academic

Finance

Public

Configuration

Audit

Each group owns its own tables.

---

================================================

PEOPLE DOMAIN

================================================

# TABLE

Administrator

Represents academy staff.

Fields

id

firstName

lastName

email

phone

passwordHash

profilePhoto

isActive

lastLoginAt

createdAt

updatedAt

Relationships

One Administrator

↓

Many Classes

Many Attendance Records

Many Payment Approvals

Many Recoveries

Many Audit Logs

Indexes

email UNIQUE

isActive

---

# TABLE

Student

Represents a person.

Never deleted.

Fields

id

firstName

lastName

email

phone

birthDate

guardianName

profilePhoto

enrollmentDate

status

notes

createdAt

updatedAt

Relationships

One Student

↓

Many StudentCycles

Many Enrollments

Many Receipts

Many Charges

Many Assessments

Indexes

email UNIQUE

status

phone

lastName

---

================================================

ACADEMIC DOMAIN

================================================

# TABLE

Class

Fields

id

name

type

level

capacity

status

administratorId

createdAt

updatedAt

Relationships

One Class

↓

Many ScheduleVersions

Many Enrollments

Indexes

type

status

administratorId

---

# TABLE

ScheduleVersion

Purpose

Preserve historical schedules.

Fields

id

classId

weekday

startTime

endTime

effectiveFrom

effectiveUntil

isCurrent

createdAt

Relationships

Many Versions

↓

One Class

Indexes

classId

isCurrent

effectiveFrom

Business Rule

Only one ScheduleVersion per Class may have

isCurrent = true

---

# TABLE

StudentCycle

Purpose

Represents one continuous participation period.

Fields

id

studentId

startDate

endDate

status

createdAt

Relationships

Many Cycles

↓

One Student

Indexes

studentId

status

---

# TABLE

Enrollment

Purpose

Student participation in one class.

Fields

id

studentId

studentCycleId

classId

status

startDate

endDate

createdById

notes

createdAt

updatedAt

Relationships

Many Enrollments

↓

One Student

Many Enrollments

↓

One Class

Many Enrollments

↓

One StudentCycle

Indexes

studentId

classId

status

studentCycleId

Composite

(studentId,status)

Business Rule

Application layer enforces:

Only one ACTIVE Regular Enrollment.

---

# TABLE

AttendanceSession

Purpose

Represents one class occurrence.

Fields

id

classId

scheduleVersionId

sessionDate

status

createdById

notes

createdAt

Indexes

classId

sessionDate

status

Relationships

One Session

↓

Many Attendances

---

# TABLE

Attendance

Purpose

Student attendance.

Fields

id

attendanceSessionId

enrollmentId

status

isLate

minutesLate

observation

registeredById

registeredAt

updatedById

updatedAt

Indexes

attendanceSessionId

enrollmentId

Composite Unique

(attendanceSessionId,enrollmentId)

Business Rule

Only one Attendance per Enrollment per Session.

---

# TABLE

Recovery

Purpose

Recovery lesson.

Fields

id

enrollmentId

status

generatedAt

scheduledAt

completedAt

teacherId

chargeId

completionNotes

createdAt

updatedAt

Indexes

enrollmentId

status

teacherId

Relationships

One Enrollment

↓

Many Recoveries

---

================================================

FINANCIAL DOMAIN

================================================

# TABLE

Charge

## Purpose

Represents a financial obligation generated by a business process.

A Charge is not a payment.

A Charge represents money the academy expects to receive.

---

## Fields

id

studentId

enrollmentId (nullable)

recoveryId (nullable)

assessmentId (nullable)

type

status

description

amount

remainingAmount

dueDate

paidAt

cancelledAt

createdById

createdAt

updatedAt

---

## Relationships

Many Charges

↓

One Student

Many Charges

↓

Zero or One Enrollment

Many Charges

↓

Zero or One Recovery

Many Charges

↓

Zero or One LevelAssessment

One Charge

↓

Many ReceiptAllocations

---

## Charge Types

ENROLLMENT

MONTHLY

RECOVERY

LEVEL_ASSESSMENT

Future

PRIVATE_LESSON

WORKSHOP

COMPETITION

MERCHANDISE

---

## Charge Status

PENDING

PARTIALLY_PAID

PAID

CANCELLED

---

## Indexes

studentId

status

type

dueDate

enrollmentId

---

## Business Rules

Amount never changes.

RemainingAmount is automatically recalculated after allocations.

Status is derived from RemainingAmount.

Existing Charges never change when academy pricing changes.

---

# TABLE

Receipt

## Purpose

Represents proof of payment uploaded by a student.

A Receipt does not represent an approved payment.

Approval is a business decision.

---

## Fields

id

studentId

billingMonth

amount

currency

status

bank

referenceNumber

imageUrl

notes

uploadedAt

reviewedAt

reviewedById

createdAt

updatedAt

---

## Relationships

Many Receipts

↓

One Student

One Receipt

↓

Many ReceiptAllocations

Many Receipts

↓

One Administrator

---

## Receipt Status

PENDING

APPROVED

REJECTED

---

## Indexes

studentId

billingMonth

status

uploadedAt

---

## Business Rules

Receipts are immutable.

Images are never replaced.

Rejected Receipts remain in history.

Students may upload multiple Receipts for the same Billing Month.

---

# TABLE

ReceiptAllocation

## Purpose

Represents how money from one Receipt is applied to one Charge.

This table enables:

Partial payments

Split payments

Multiple Receipts paying one Charge

One Receipt paying multiple Charges

---

## Fields

id

receiptId

chargeId

allocatedAmount

allocatedById

notes

createdAt

---

## Relationships

Many Allocations

↓

One Receipt

Many Allocations

↓

One Charge

Many Allocations

↓

One Administrator

---

## Composite Constraints

(receiptId, chargeId)

Should be unique.

A Receipt should allocate to the same Charge only once.

---

## Business Rules

AllocatedAmount

>

0

AllocatedAmount

≤

Remaining Receipt Balance

AllocatedAmount

≤

Remaining Charge Balance

Allocations cannot be edited.

If an error occurs,

reverse the allocation.

Never overwrite financial history.

---

================================================

ACADEMIC PROGRESSION

================================================

# TABLE

Promotion

## Purpose

Represents advancement between Regular Classes.

Promotions preserve history.

---

## Fields

id

studentId

fromEnrollmentId

toEnrollmentId

performedById

notes

createdAt

---

## Relationships

One Promotion

↓

One Previous Enrollment

One Promotion

↓

One New Enrollment

---

## Indexes

studentId

createdAt

---

## Business Rules

Promotion closes the previous Enrollment.

Promotion creates a new Enrollment.

Promotion never edits historical Enrollments.

---

# TABLE

LevelAssessment

## Purpose

Represents an evaluation performed before a student enters or re-enters a Regular Class.

---

## Fields

id

studentId

studentCycleId

recommendedClassId

status

teacherId

chargeId

performedAt

notes

createdAt

updatedAt

---

## Status

PENDING_PAYMENT

READY

COMPLETED

CANCELLED

---

## Relationships

Many Assessments

↓

One Student

Many Assessments

↓

One StudentCycle

Many Assessments

↓

One Administrator

---

## Business Rules

Only one completed recommendation exists per Assessment.

Assessment always creates a Charge.

Assessment history is immutable.

---

================================================

PUBLIC DOMAIN

================================================

# TABLE

Event

## Fields

id

title

description

location

bannerImage

visibility

status

startsAt

endsAt

createdById

createdAt

updatedAt

---

## Visibility

PUBLIC

PRIVATE

---

## Status

DRAFT

VISIBLE

CANCELLED

ARCHIVED

---

## Indexes

status

visibility

startsAt

---

## Business Rules

Events never generate Attendance.

Events never generate Charges.

Events are informational.

---

================================================

CONFIGURATION

================================================

# TABLE

AcademySettings

## Purpose

Stores global academy configuration.

Only one record should exist.

---

## Fields

id

academyName

academyLogo

academyEmail

academyPhone

academyAddress

timezone

currency

monthlyBasePrice

additionalClassPrice

enrollmentFee

recoveryFee

assessmentFee

maximumClassCapacity

facebookUrl

instagramUrl

youtubeUrl

tiktokUrl

websiteUrl

createdAt

updatedAt

---

## Business Rules

Only administrators may edit.

Pricing changes affect future Charges only.

Historical Charges never change.

---

================================================

AUDIT

================================================

# TABLE

AuditLog

## Purpose

Stores immutable administrative history.

Every important business action generates an AuditLog.

---

## Fields

id

administratorId

entityType

entityId

action

previousState

newState

metadata

ipAddress

userAgent

createdAt

---

## Relationships

Many Logs

↓

One Administrator

---

## Business Rules

Audit records are immutable.

Audit records are never deleted.

Audit records are append-only.

---

================================================

DATABASE CONSTRAINTS

================================================

Student.email

UNIQUE

Administrator.email

UNIQUE

Attendance

(attendanceSessionId, enrollmentId)

UNIQUE

ReceiptAllocation

(receiptId, chargeId)

UNIQUE

AcademySettings

Single Row

ScheduleVersion

Only one active version per Class

Student

Never physically deleted

Receipt

Never physically deleted

Charge

Never physically deleted

AuditLog

Never updated

Never deleted

---

================================================

SOFT DELETE POLICY

================================================

The following entities should NEVER be deleted.

Student

Enrollment

Attendance

Recovery

Promotion

Receipt

ReceiptAllocation

Charge

AuditLog

StudentCycle

Instead, use:

Status

CompletedAt

CancelledAt

EndDate

depending on the business process.

---

================================================

RECOMMENDED INDEXES

================================================

Student

(email)

(status)

(lastName)

---

Enrollment

(studentId)

(classId)

(status)

(studentCycleId)

---

AttendanceSession

(classId, sessionDate)

---

Attendance

(enrollmentId)

(attendanceSessionId)

---

Recovery

(status)

(enrollmentId)

---

Charge

(studentId)

(status)

(type)

(dueDate)

---

Receipt

(studentId)

(status)

(billingMonth)

---

Promotion

(studentId)

---

Assessment

(studentId)

(status)

---

AuditLog

(entityType)

(entityId)

(createdAt)

(administratorId)

---

================================================

TRANSACTION BOUNDARIES

================================================

The following operations MUST execute inside database transactions.

Student Re-entry

Student Promotion

Recovery Generation

Recovery Completion

Receipt Approval

Receipt Reversal

Monthly Billing Generation

Enrollment Creation

Enrollment Cancellation

Level Assessment Completion

If one step fails,

the entire operation rolls back.

---

================================================

DATABASE RELATIONSHIP DIAGRAM

================================================

Administrator

│

├──────────────┐

│              │

Class      AuditLog

│

│

ScheduleVersion

│

AttendanceSession

│

Attendance

│

Enrollment

│

├──────────────┐

│              │

Recovery   Charge

│            │

│            │

└──────┐     │

       │     │

Student │ ReceiptAllocation

│     │

│     │

Receipt

│

StudentCycle

│

LevelAssessment

│

Promotion

---

================================================

DATABASE EVOLUTION PRINCIPLES

================================================

The database should evolve without losing historical information.

Every schema change should answer:

Does this preserve history?

Does this preserve business traceability?

Does this preserve reporting capabilities?

If the answer is "No",

the migration should be redesigned.

---

# FINAL DATABASE PRINCIPLE

The database is not simply where data is stored.

It is the permanent memory of the academy.

Every student, every class, every payment, every absence, every promotion and every recovery should remain explainable years into the future through the records stored in this database.

Future developers should be able to reconstruct the complete operational history of the academy without relying on external spreadsheets, emails or manual notes.