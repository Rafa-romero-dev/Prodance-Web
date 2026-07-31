# DOMAIN.md
Version: 1.0
Project: Academy Management System
Status: Source of Truth

---

# PURPOSE

This document defines the complete business domain of the Academy Management System.

It is the most important document of the project.

Everything implemented by the application must faithfully represent the business domain described here.

If implementation contradicts this document:

This document wins.

---

# DOMAIN PHILOSOPHY

The application models business processes.

It does not model screens.

It does not model forms.

It does not model tables.

Everything begins with a real-world business process.

Every entity exists because it represents something that exists inside the academy.

Every relationship exists because it exists in real life.

Every business rule should be traceable to an academy operation.

---

# DOMAIN PRINCIPLES

The following principles govern every module.

## Principle 1

People are permanent.

Processes change.

A student never becomes another student.

The same student experiences different enrollments, payments, recoveries and promotions throughout their journey.

---

## Principle 2

History is immutable.

Business history should never disappear.

Historical information explains the current state.

Never overwrite historical records.

Always create new records representing business events.

---

## Principle 3

Every important action creates a business event.

Examples:

Student Created

Enrollment Created

Attendance Registered

Recovery Generated

Receipt Approved

Promotion Completed

Events explain the evolution of the academy.

---

## Principle 4

Business rules belong to the domain.

They never belong to:

React

Pages

Components

Repositories

Database

The domain decides.

Everything else executes.

---

## Principle 5

State represents reality.

States are not visual indicators.

If an enrollment is blocked,

the student must actually be prevented from attending.

If a payment is pending,

it must actually be unpaid.

States are behavior.

Not colors.

---

# DOMAIN AREAS

The system is divided into four business areas.

People

Academic Operations

Finance

Configuration

Each area owns its own business rules.

---

# PEOPLE DOMAIN

The People domain represents everyone interacting with the academy.

Current MVP includes two entities.

Administrator

Student

Future versions may introduce:

Guardian

Lead

Guest

Judge

External Instructor

These are intentionally excluded from the MVP.

---

# ENTITY

Student

## Description

Represents a person who has attended, currently attends or will attend the academy.

Students are permanent entities.

Students are never deleted.

Even inactive students remain in the system forever.

The academy values historical information.

Deleting students destroys business history.

Therefore deletion is forbidden.

---

## Responsibilities

Store personal information.

Own academic history.

Own financial history.

Own attendance history.

Own enrollment history.

Own recovery history.

Own level assessment history.

Participate in classes.

Upload payment receipts.

---

## Student Lifecycle

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

Inactive

↓

Re-entry

↓

Level Assessment

↓

Enrollment

↓

Attendance

The application should always know where a student is in this lifecycle.

---

## Student Status

Students may exist in one of the following states.

ACTIVE

Currently participating in at least one enrollment.

INACTIVE

Not participating in any enrollment.

Historical information remains available.

Future versions may introduce additional statuses if business requires them.

Do not introduce statuses preemptively.

---

## Student Identity

The student identity never changes.

Personal information may change.

Phone number.

Email.

Profile picture.

Address.

None of these create a new student.

The identity remains the same.

---

## Student Attributes

Required

Full Name

Email

Phone Number

Enrollment Date

Optional

Birth Date

Guardian

Profile Picture

Notes

Internal observations

Administrative comments

Observations are not visible to students.

---

## Student Relationships

One Student

↓

Many Student Cycles

One Student

↓

Many Enrollments

One Student

↓

Many Receipts

One Student

↓

Many Attendances

One Student

↓

Many Recoveries

One Student

↓

Many Level Assessments

One Student

↓

Many Charges

The student is the center of the business domain.

---

## Student Invariants

A student always exists.

A student cannot be deleted.

A student may have zero active enrollments.

A student may return after years.

History must survive re-entry.

---

# ENTITY

Administrator

## Description

Represents an academy staff member.

Administrators are also teachers.

There is no Teacher entity.

The same person manages administrative operations and teaches classes.

---

## Responsibilities

Create students.

Manage classes.

Manage schedules.

Register attendance.

Approve payments.

Perform recoveries.

Perform level assessments.

Create events.

Modify academy configuration.

---

## Administrator Relationships

One Administrator

↓

Many Classes

One Administrator

↓

Many Attendance Records

One Administrator

↓

Many Payment Approvals

One Administrator

↓

Many Recoveries

One Administrator

↓

Many Audit Logs

---

# ACADEMIC DOMAIN

The Academic domain manages how students participate in academy activities.

It is the largest business area.

Entities

Class

Class Schedule

Enrollment

Attendance

Recovery

Level Assessment

Student Cycle

Promotion

Each entity represents a different stage of the student's academic journey.

---

# ENTITY

Class

## Description

Represents an academic offering.

Examples

Basic 1

Intermediate 2

Advanced 4

Ladies Styling

Men Styling

Performance Team

A class defines WHAT is taught.

Not WHEN.

Schedules belong to another entity.

---

## Class Types

Two types exist.

REGULAR

Progressive curriculum.

Students may belong to only one Regular Class simultaneously.

COMPLEMENTARY

Independent classes.

Students may belong to multiple Complementary Classes simultaneously.

Business rules differ depending on class type.

---

## Regular Classes

Represent the official academy progression.

Current progression

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

Students advance sequentially.

Promotion preserves history.

---

## Complementary Classes

Complementary classes have no progression requirements.

Examples

Ladies Styling

Men Styling

Body Movement

Performance Team

Special Technique

Students may join multiple complementary classes simultaneously.

Each enrollment is independent.

---

## Class Capacity

Classes have a configurable maximum capacity.

Current academy policy:

20 students.

Capacity is an administrative limit.

The public landing page never displays available spots.

Capacity should not affect public visibility.

---

## Professor Assignment

Each class has exactly one responsible administrator.

Multiple teachers per class are outside MVP scope.

---

## Class Status

ACTIVE

INACTIVE

ARCHIVED (future)

Inactive classes preserve history.

Historical attendance must never disappear.

---

## Class Relationships

One Class

↓

Many Class Schedules

One Class

↓

Many Enrollments

One Class

↓

Many Attendance Sessions

One Class

↓

One Responsible Administrator

---

## Class Invariants

A class always has one responsible administrator.

Regular classes require a level.

Complementary classes do not.

Capacity is configurable.

Changing schedules does not modify the class.

Changing schedules creates schedule versions.

---

# ENTITY

Class Schedule

## Description

Represents when a class takes place.

Schedules are versioned.

Classes are permanent.

Schedules evolve.

This separation preserves historical reports.

---

## Responsibilities

Store:

Weekday

Start Time

End Time

Effective Date

Expiration Date

Only one schedule may be active at a given moment.

Historical schedules remain available forever.

---

## Business Rule

Changing the schedule never edits the existing schedule.

Instead

Current Schedule

↓

Closed

↓

New Schedule Created

History remains intact.

---

## Schedule Relationships

One Schedule

↓

One Class

One Class

↓

Many Schedule Versions

---

# ENTITY

Enrollment

## Description

An Enrollment represents a student's participation in a specific class.

An enrollment is NOT the student.

An enrollment is NOT the class.

It is the relationship between both.

Every academic rule in the system applies to the Enrollment.

Attendance belongs to the Enrollment.

Recoveries belong to the Enrollment.

Payments belong to the Enrollment.

Blocking belongs to the Enrollment.

Never to the Student.

---

## Why Enrollment Exists

A student may belong to multiple classes.

Each class has its own academic history.

Each class has its own attendance.

Each class has its own recoveries.

Each class has its own payments.

Therefore every participation must have its own lifecycle.

---

## Enrollment Lifecycle

Created

↓

Pending Initial Payment

↓

Active

↓

Blocked by Recovery

↓

Recovery Completed

↓

Active

↓

Completed

or

Cancelled

or

Transferred

---

## Enrollment Status

PENDING_PAYMENT

The enrollment exists.

The required charges have not yet been approved.

The student cannot attend.

---

ACTIVE

The student may attend classes normally.

Attendance is enabled.

Payments continue monthly.

---

BLOCKED_RECOVERY

The student accumulated two consecutive absences.

Attendance is disabled.

Recovery lesson required.

Recovery payment required.

---

COMPLETED

The enrollment ended successfully.

Normally caused by promotion.

History remains available forever.

---

CANCELLED

Administrative cancellation.

History remains preserved.

---

## Enrollment Attributes

Student

Class

Status

Enrollment Date

Completion Date

Created By

Notes

---

## Enrollment Relationships

One Enrollment

↓

Many Attendances

One Enrollment

↓

Many Recoveries

One Enrollment

↓

Many Monthly Charges

One Enrollment

↓

Many Promotions

One Enrollment

↓

Many Schedule References

---

## Enrollment Business Rules

A student may have only ONE active enrollment in a Regular Class.

A student may have multiple active enrollments in Complementary Classes.

Blocking affects only one enrollment.

Recoveries belong only to one enrollment.

Attendance belongs only to one enrollment.

Promotion closes one enrollment and creates another.

Enrollment history is immutable.

---

## Enrollment Invariants

An enrollment always belongs to exactly one student.

An enrollment always belongs to exactly one class.

An enrollment is never reassigned to another student.

An enrollment is never reassigned to another class.

If either changes,

a new enrollment is created.

---

# ENTITY

Attendance Session

## Description

Represents a scheduled class occurrence.

Example

Basic 2

Monday

7:00 PM

June 3

This session exists independently of student attendance.

Students register attendance against the session.

---

## Responsibilities

Store

Date

Class

Schedule Version

Responsible Administrator

Session Status

Notes

---

## Session Status

SCHEDULED

OPEN

CLOSED

CANCELLED

---

## Business Rules

A session exists even if nobody attends.

Attendance cannot exist without a session.

A cancelled session does not count as an absence.

---

# ENTITY

Attendance

## Description

Represents the attendance of one student for one session.

Attendance belongs to the Enrollment.

Not directly to the Student.

---

## Attendance States

PRESENT

ABSENT

Only two official attendance states exist.

---

## Late Arrival

Late arrival is additional metadata.

It is NOT an attendance status.

Attributes

Late

Minutes Late

Observation

Late arrivals may be used in future disciplinary rules.

---

## Attendance Creation

When attendance is opened,

the system automatically creates one attendance record for every active enrollment.

Administrators simply choose:

Present

Absent

No student should be missing from attendance.

---

## Editing Attendance

Attendance may be edited.

Every edit creates an audit record.

The system stores:

Original Value

New Value

Administrator

Reason

Timestamp

History must always explain corrections.

---

## Attendance Relationships

One Attendance

↓

One Session

One Attendance

↓

One Enrollment

One Attendance

↓

One Administrator

---

## Attendance Business Rules

Blocked enrollments cannot be marked Present.

Cancelled sessions never generate absences.

Only active enrollments appear enabled.

Attendance cannot be duplicated.

Exactly one attendance per enrollment per session.

---

# CONSECUTIVE ABSENCE RULE

This is one of the most important business rules.

The academy operates with weekly classes.

Missing two consecutive sessions indicates that the student probably lost the class rhythm.

The software automatically generates a Recovery.

---

Rule

ABSENT

↓

ABSENT

↓

Generate Recovery

↓

Generate Recovery Charge

↓

Block Enrollment

No administrator intervention required.

---

The counter resets after:

Present attendance.

Completed recovery.

Enrollment completion.

---

The counter is independent per enrollment.

Example

Regular Class

Present

Present

Present

Men Styling

Absent

Absent

↓

Recovery generated

Regular Class remains Active.

Only Men Styling becomes Blocked.

---

# ENTITY

Recovery

## Description

A Recovery represents a personalized lesson required after consecutive absences.

Recoveries preserve the learning rhythm.

Recoveries are mandatory.

---

## Recovery Lifecycle

Generated

↓

Pending Payment

↓

Scheduled

↓

Completed

---

## Recovery Status

PENDING_PAYMENT

Payment required.

Lesson cannot be performed.

---

READY_TO_SCHEDULE

Payment approved.

Teacher and student coordinate the lesson.

---

COMPLETED

Recovery finished.

Enrollment automatically returns to ACTIVE.

---

CANCELLED

Administrative cancellation.

Requires justification.

---

## Recovery Attributes

Enrollment

Generated Date

Completion Date

Teacher

Payment Reference

Notes

Completion Notes

---

## Recovery Relationships

One Recovery

↓

One Enrollment

One Recovery

↓

One Charge

One Recovery

↓

One Administrator

---

## Recovery Business Rules

Recoveries are generated automatically.

Teachers cannot manually create recoveries.

Recoveries always generate a financial charge.

Recoveries block attendance.

Recoveries unblock only after completion.

Recoveries preserve history forever.

---

## Recovery Completion

The teacher manually records

Completion Date

Completion Time

Observations

The system automatically

Marks Recovery Completed

Changes Enrollment to ACTIVE

Resets consecutive absence counter

Creates audit record

---

# ENTITY

Promotion

## Description

Promotion represents a student's advancement through the regular curriculum.

Promotion is a business event.

It is not an edit.

---

## Example

Basic 2

↓

Basic 3

Wrong

Update Enrollment

Correct

Close Enrollment

Create Promotion

Create New Enrollment

History remains intact.

---

## Promotion Attributes

Student

Previous Enrollment

New Enrollment

Teacher

Promotion Date

Notes

---

## Promotion Business Rules

Only Regular Classes support promotions.

Complementary Classes do not.

Promotions preserve historical duration.

Weeks spent in each level become academy statistics.

---

# ENTITY

Level Assessment

## Description

Represents the evaluation required before re-entering Regular Classes.

It determines the correct academic level.

---

## When Required

Inactive student returns.

↓

Administrator clicks

Re-enter Student

↓

Level Assessment required.

For Complementary Classes

Teacher decides if required.

---

## Assessment Outcomes

Assign any Regular Level.

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

---

## Assessment Business Rules

Always generates a charge.

Always becomes historical information.

Never edits previous enrollments.

Creates new enrollment after approval.

---

# ENTITY

Student Cycle

## Description

Represents one complete participation period of a student in the academy.

Example

Student joins.

Studies for three years.

Leaves.

Returns after two years.

That student now has:

Cycle 1

Cycle 2

Each cycle contains its own:

Enrollments

Promotions

Recoveries

Payments

Attendance

Assessments

---

## Why Student Cycles Exist

Cycles simplify historical analysis.

Questions like

How many students returned?

Average inactive period?

Average promotions per cycle?

Average duration?

become easy to answer.

Cycles also prevent mixing different periods of the student's academic life.

---

# FINANCIAL DOMAIN

The Financial Domain manages every monetary obligation between the academy and its students.

The objective is not only to know whether a student has paid.

The objective is to know:

- Why a charge exists.
- What generated it.
- Which receipts paid it.
- When it was paid.
- Who approved it.
- Which business process depends on it.

The financial domain is event-driven.

Business events generate debts.

Students submit receipts.

Administrators allocate those receipts to debts.

The system never assumes how a payment should be allocated.

---

# FINANCIAL PHILOSOPHY

The academy manages obligations.

Payments satisfy obligations.

Receipts are proof that money was transferred.

Charges represent what the academy expects to receive.

These are different concepts.

Never mix them.

---

# ENTITY

Charge

## Description

A Charge represents a financial obligation.

Students do not pay "months."

Students pay Charges.

Examples.

Enrollment Fee

Monthly Fee

Recovery Lesson

Level Assessment

Future versions may introduce:

Private Lesson

Workshop

Competition Registration

Uniform

Merchandise

The system should be capable of supporting new Charge types without changing the existing architecture.

---

## Charge Lifecycle

Created

↓

Pending

↓

Partially Paid

↓

Paid

↓

Cancelled

---

## Charge Status

PENDING

No money allocated.

---

PARTIALLY_PAID

One or more receipts allocated.

Remaining balance still exists.

---

PAID

Entire balance satisfied.

---

CANCELLED

Charge no longer collectible.

Requires an audit record.

Requires justification.

---

## Charge Types

ENROLLMENT

Initial registration fee.

Generated when the student begins a new academy cycle.

---

MONTHLY

Monthly tuition.

Generated automatically every month for every active enrollment.

---

RECOVERY

Generated automatically when a Recovery is created.

---

LEVEL_ASSESSMENT

Generated automatically when a Level Assessment is scheduled.

---

## Charge Attributes

Student

Enrollment (optional)

Recovery (optional)

Assessment (optional)

Charge Type

Description

Amount

Outstanding Balance

Status

Due Date

Created Date

Paid Date

Cancelled Date

Created By

Notes

---

## Charge Relationships

One Charge

↓

Many Receipt Allocations

One Charge

↓

One Student

One Charge

↓

Zero or One Enrollment

One Charge

↓

Zero or One Recovery

One Charge

↓

Zero or One Assessment

---

## Charge Business Rules

Charges are immutable.

Never edit Amount after creation.

If the academy changes pricing,

existing Charges remain unchanged.

Future Charges use the new pricing.

History must preserve the original amount.

---

# MONTHLY PRICING RULE

Current academy pricing.

First active class

↓

$15

Every additional active class

↓

+$5

Examples.

1 class

↓

$15

2 classes

↓

$20

3 classes

↓

$25

4 classes

↓

$30

The pricing engine calculates the student's monthly tuition based on ACTIVE enrollments.

Blocked enrollments continue generating monthly tuition unless academy policy changes in the future.

Pricing rules should be configurable.

Never hardcode these values.

---

# MONTHLY BILLING

At the beginning of each month,

the system generates one Monthly Charge for every active student.

The generated amount depends on the number of active enrollments during that billing period.

Billing generation should be automatic.

Administrators should never create monthly charges manually.

---

# ENTITY

Receipt

## Description

A Receipt represents proof of payment uploaded by a student.

A Receipt does NOT mean the payment has been accepted.

Approval is a separate business action.

---

## Receipt Lifecycle

Uploaded

↓

Pending Review

↓

Approved

or

Rejected

---

## Receipt Status

PENDING

Waiting for administrator review.

---

APPROVED

Receipt accepted.

Can allocate money to Charges.

---

REJECTED

Receipt rejected.

Must contain a reason.

Students may upload another Receipt.

---

## Receipt Attributes

Student

Upload Date

Image

Reference Number (optional)

Bank

Amount

Currency

Notes

Status

Administrator

Review Date

---

## Receipt Relationships

One Receipt

↓

Many Receipt Allocations

One Receipt

↓

One Student

One Receipt

↓

One Administrator

---

## Receipt Business Rules

Students may upload multiple Receipts.

Multiple Receipts may belong to the same month.

Receipts may cover one or more Charges.

Receipts remain stored forever.

Rejected Receipts are never deleted.

---

# PAYMENT MONTH

Every uploaded Receipt belongs to one Billing Month.

Examples

January 2027

February 2027

March 2027

The Billing Month helps administrators organize approvals.

It does NOT determine how money is allocated.

Allocation remains manual.

---

# MULTI-MONTH DETECTION

If the uploaded amount appears sufficient to cover multiple Monthly Charges,

the system should display a warning.

Example

Student uploads $40.

Current monthly tuition is $20.

Display.

"This receipt may cover multiple months."

This is only a recommendation.

The administrator decides allocation.

---

# ENTITY

Receipt Allocation

## Description

A Receipt Allocation connects money from one Receipt to one Charge.

This entity is essential.

Without it,

the system cannot support partial payments.

---

## Why Receipt Allocation Exists

Example.

Receipt

↓

$40

Administrator decides

$20

↓

January Monthly Fee

$15

↓

Enrollment Fee

$5

↓

Recovery Lesson

One Receipt

Three Allocations

Without this entity,

that workflow becomes impossible.

---

## Allocation Attributes

Receipt

Charge

Allocated Amount

Allocated By

Allocated Date

Notes

---

## Allocation Business Rules

One Receipt

↓

Many Allocations

One Charge

↓

Many Allocations

Allocation amount must never exceed:

Remaining Receipt Balance

Remaining Charge Balance

---

# PAYMENT APPROVAL

Payment approval is an administrator decision.

Approval workflow.

Student uploads Receipt

↓

Administrator opens Receipt

↓

Administrator selects Charges

↓

Administrator assigns Allocation amounts

↓

Receipt Approved

↓

Charge statuses recalculated

↓

Audit record generated

The system never guesses.

The administrator always decides.

---

# PAYMENT REVERSAL

Future Feature.

If an approval is reversed,

the system should:

Remove Allocations

Recalculate Charge Statuses

Create Audit Record

Never delete Receipts.

Never delete Allocations.

Mark them reversed.

---

# CONFIGURATION DOMAIN

The Configuration Domain stores academy-wide settings.

Configuration should be editable.

Configuration should never require code changes.

Examples.

Monthly pricing.

Enrollment fee.

Recovery fee.

Assessment fee.

Maximum class capacity.

Academy information.

Landing page text.

Branding.

Business hours.

---

# ENTITY

Academy Settings

Represents global configuration.

Only one record exists.

---

## Responsibilities

Store academy identity.

Store pricing.

Store contact information.

Store public landing page information.

Store operational limits.

---

## Business Rules

Only administrators may modify Academy Settings.

Configuration changes should create Audit Logs.

Historical pricing changes should not modify existing Charges.

---

# PUBLIC DOMAIN

The Public Domain contains every feature that is accessible without authentication.

Its objective is informational.

It does not expose administrative functionality.

It does not expose private student information.

The Public Domain is the digital face of the academy.

---

# PUBLIC MODULES

The MVP includes the following public modules.

Landing Page

Regular Class Schedule

Special Events Calendar

Academy Information

Contact Information

Future versions may include:

Online registration

Lead capture

Online payments

Workshop reservations

Competition registrations

These features are intentionally outside the MVP.

---

# ENTITY

Event

## Description

Represents any special activity organized by the academy.

Events are independent from regular classes.

An event is never considered an academic class.

---

## Examples

Workshop

Social Dance Night

Competition

Guest Instructor

Holiday

Open House

Internal Meeting

Special Training

Photo Session

End-of-Year Showcase

---

## Event Attributes

Title

Description

Location

Start Date

End Date

Banner Image

Visibility

Status

Created By

Created At

Updated At

---

## Event Status

DRAFT

VISIBLE

CANCELLED

ARCHIVED

---

## Event Visibility

PUBLIC

Visible on the Landing Page.

PRIVATE

Visible only to administrators.

Useful for internal meetings.

---

## Business Rules

Events do not generate attendance.

Events do not generate payments.

Events do not affect enrollments.

Events only provide information.

Future versions may support registrations.

---

# LANDING PAGE

The Landing Page is intentionally simple.

Its objective is to answer:

Who are we?

What classes do we offer?

When do classes happen?

What events are coming?

How can someone contact us?

Nothing more.

---

## Landing Sections

Hero Section

Academy Description

Regular Schedule

Upcoming Events

Contact Information

Social Media

Location

Footer

---

## Public Schedule

The Landing Page displays the current active schedule.

Historical schedules are never displayed publicly.

If a schedule changes,

the Landing Page automatically reflects the newest active version.

---

## Public Calendar

Displays only Events with:

Visibility = PUBLIC

Status = VISIBLE

Past events remain available only if the academy decides to keep them.

Otherwise they become archived.

---

# OPERATIONAL DOMAIN

The Operational Domain contains automated business processes.

Users should not execute these processes manually.

Instead,

business events trigger them automatically.

---

# AUTOMATION

The following operations should be automatic.

Monthly Billing Generation

Recovery Generation

Recovery Charge Generation

Enrollment Blocking

Enrollment Unblocking

Charge Status Calculation

Receipt Remaining Balance Calculation

Student Monthly Tuition Calculation

Audit Record Generation

Consecutive Absence Counter Reset

These are business automations.

They are not scheduled tasks by definition.

Some may execute immediately.

Others may execute through background jobs.

---

# AUTOMATION

Generate Monthly Charges

## Trigger

Beginning of each billing month.

---

## Process

Find all active students.

↓

Calculate active enrollments.

↓

Calculate tuition.

↓

Generate Monthly Charge.

↓

Notify administrators (future).

---

## Rules

Only one Monthly Charge per student per month.

Never duplicate charges.

If rerun,

skip already generated charges.

---

# AUTOMATION

Recovery Detection

## Trigger

Attendance Registration Completed.

---

## Process

Student has:

ABSENT

↓

ABSENT

↓

Generate Recovery

↓

Generate Recovery Charge

↓

Block Enrollment

↓

Create Audit Record

---

## Rules

Runs independently for every Enrollment.

Never block unrelated enrollments.

---

# AUTOMATION

Recovery Completion

## Trigger

Teacher completes Recovery.

---

## Process

Recovery Completed

↓

Enrollment ACTIVE

↓

Reset Consecutive Absences

↓

Create Audit Record

---

# AUTOMATION

Payment Approval

## Trigger

Administrator approves Receipt.

---

## Process

Receipt Approved

↓

Allocate money

↓

Update Charges

↓

Recalculate balances

↓

Generate Audit Log

---

# STUDENT RE-ENTRY

Student re-entry is one of the most important business processes.

Inactive students remain valuable academy members.

The academy wants to preserve their history while allowing them to return.

---

## Re-entry Workflow

Administrator

↓

Search Student

↓

Click

Re-enter Student

↓

New Student Cycle

↓

Determine Classes

↓

Level Assessment (Regular Classes)

↓

Assessment Charge

↓

Assessment Completed

↓

Enrollment Created

↓

Enrollment Charge

↓

Monthly Charge

↓

Student Active

---

## Rules

Student record remains the same.

History remains untouched.

A new Student Cycle begins.

Previous Student Cycles become read-only history.

---

# PROMOTION WORKFLOW

Promotion is never an update.

Promotion is always a business event.

---

Workflow

Current Enrollment

↓

Completed

↓

Promotion Created

↓

New Enrollment

↓

Attendance continues

---

Benefits

History preserved.

Duration per level preserved.

Promotion statistics become available.

No information is overwritten.

---

# STUDENT DEACTIVATION

Students are never deleted.

If a student leaves the academy,

the administrator marks the student as Inactive.

The system:

Closes active enrollments.

Stops future monthly charges.

Preserves complete history.

Allows future re-entry.

---

# SCHEDULE CHANGE

Schedules evolve over time.

They never overwrite previous schedules.

---

Workflow

Current Schedule

↓

Closed

↓

New Schedule

↓

Landing Page Updated

↓

Historical Reports Continue Working

---

# BUSINESS REPORTS

Although reporting is outside the MVP UI,

the domain should preserve enough information to answer future questions.

Examples.

How many active students?

How many inactive students?

Average promotion time?

Most common recovery class?

Monthly income?

Pending payments?

Recovery completion rate?

Student retention?

Average inactive period?

Most popular classes?

Most promoted level?

Average attendance?

Students with most recoveries?

Teachers with most students?

Historical information exists to answer these questions.

---

# DOMAIN INVARIANTS

These rules must NEVER be violated.

Students are never deleted.

History is never overwritten.

Recoveries are generated automatically.

Recoveries belong to one Enrollment.

Blocking affects only one Enrollment.

One Regular Enrollment at a time.

Multiple Complementary Enrollments allowed.

Attendance belongs to an Enrollment.

Receipts do not automatically pay Charges.

Administrators allocate payments manually.

Promotion creates a new Enrollment.

Schedule changes create new Schedule Versions.

Inactive students remain in the system.

Re-entry starts a new Student Cycle.

Audit history is immutable.

Financial history is immutable.

Business events explain the present.

---

# UBIQUITOUS LANGUAGE

The following terms have precise meanings.

Student

A person who studies or studied at the academy.

Administrator

A staff member responsible for administration and teaching.

Class

An academic offering.

Schedule

When a class occurs.

Enrollment

A student's participation in a class.

Attendance Session

One occurrence of a class.

Attendance

A student's presence or absence for a session.

Recovery

A personalized lesson required after consecutive absences.

Promotion

Advancing from one Regular Class to another.

Level Assessment

Evaluation before entering or re-entering a Regular Class.

Charge

A financial obligation.

Receipt

Proof of payment uploaded by a student.

Receipt Allocation

Assignment of money from a Receipt to one or more Charges.

Student Cycle

One continuous participation period in the academy.

Event

A special academy activity outside the regular curriculum.

Audit Log

Immutable record of important administrative actions.

These terms should be used consistently throughout the codebase, documentation, database, APIs and UI.

Never introduce synonyms that refer to the same business concept.

---

# FINAL DOMAIN PRINCIPLE

Every entity, workflow and business rule described in this document exists because it represents how the academy operates in the real world.

If an implementation simplifies the software but changes the academy's operational behavior,

the implementation is incorrect.

The purpose of the software is to faithfully model the academy—not to force the academy to adapt to the software.