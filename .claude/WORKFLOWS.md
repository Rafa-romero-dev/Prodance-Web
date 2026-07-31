# WORKFLOWS.md
Version: 1.0
Project: Academy Management System

---

# PURPOSE

This document defines every business workflow implemented by the application.

A workflow represents a real business process.

It is not a UI flow.

It is not an API endpoint.

It is the sequence of business decisions that occur from the beginning of an operation until its completion.

If implementation differs from these workflows,

this document is correct.

---

# WORKFLOW DESIGN PRINCIPLES

Every workflow must satisfy the following principles.

• Atomic

Either everything succeeds or nothing changes.

• Deterministic

The same input always produces the same result.

• Auditable

Every important action generates an Audit Log.

• Historical

No workflow destroys historical information.

• Observable

Failures should be easy to diagnose.

---

=========================================================
WORKFLOW 1
CREATE STUDENT
=========================================================

Business Goal

Register a new student in the academy.

---

Actor

Administrator

---

Preconditions

Administrator authenticated.

Email does not already exist.

---

Flow

Administrator opens

New Student

↓

Fills required information

↓

System validates

↓

Student created

↓

Student Cycle #1 created

↓

Enrollment Charge generated

↓

Student account created

↓

Password invitation email sent

↓

Audit Log generated

↓

Success

---

Result

Student exists.

Account exists.

Student can activate password.

Student is not enrolled yet.

---

=========================================================
WORKFLOW 2
INITIAL ENROLLMENT
=========================================================

Goal

Enroll a student into one or more classes.

---

Preconditions

Student exists.

Student active.

Required payments approved.

---

Flow

Administrator

↓

Choose student

↓

Choose classes

↓

Validate Regular Class rule

↓

Create Enrollment(s)

↓

Generate Monthly Charge

↓

Audit Log

↓

Success

---

Business Rules

Only one active Regular Class.

Unlimited Complementary Classes.

History preserved.

---

=========================================================
WORKFLOW 3
MONTHLY BILLING
=========================================================

Trigger

Automatic

First day of every month.

---

Flow

Load active students

↓

Calculate active enrollments

↓

Calculate tuition

↓

Generate Monthly Charge

↓

Audit Log

↓

Finish

---

Rule

One Monthly Charge per month.

Never duplicate.

---

=========================================================
WORKFLOW 4
UPLOAD RECEIPT
=========================================================

Actor

Student

---

Flow

Upload screenshot

↓

Choose billing month

↓

Optional notes

↓

Save receipt

↓

Pending Review

↓

Notify administrators (future)

---

Rules

Receipt immutable.

Multiple receipts allowed.

Same month allowed.

---

=========================================================
WORKFLOW 5
APPROVE RECEIPT
=========================================================

Actor

Administrator

---

Flow

Open receipt

↓

Inspect image

↓

Choose charges

↓

Allocate payment

↓

Validate balances

↓

Approve receipt

↓

Recalculate charges

↓

Audit Log

↓

Success

---

Rules

Approval is manual.

No automatic allocations.

---

=========================================================
WORKFLOW 6
REGISTER ATTENDANCE
=========================================================

Actor

Administrator

---

Flow

Choose class

↓

Choose session

↓

Open attendance

↓

Generate attendance rows

↓

Mark Present / Absent

↓

Save

↓

Check consecutive absences

↓

Generate recoveries if necessary

↓

Audit Log

↓

Finish

---

Rule

One attendance per enrollment.

Blocked students appear disabled.

---

=========================================================
WORKFLOW 7
RECOVERY GENERATION
=========================================================

Trigger

Automatic

---

Flow

Attendance registered

↓

Two consecutive absences

↓

Recovery created

↓

Recovery Charge created

↓

Enrollment blocked

↓

Audit Log

↓

Teacher notified (future)

---

Result

Student cannot attend this enrollment.

---

=========================================================
WORKFLOW 8
RECOVERY COMPLETION
=========================================================

Actor

Teacher

---

Flow

Open recovery

↓

Confirm payment

↓

Complete lesson

↓

Record date

↓

Record time

↓

Add notes

↓

Enrollment Active

↓

Reset absence counter

↓

Audit Log

↓

Success

---

=========================================================
WORKFLOW 9
PROMOTION
=========================================================

Actor

Teacher

---

Flow

Choose student

↓

Choose next Regular Class

↓

Close current enrollment

↓

Create Promotion

↓

Create new enrollment

↓

Audit Log

↓

Success

---

Rule

Never update previous enrollment.

Always create a new one.

---

=========================================================
WORKFLOW 10
STUDENT RE-ENTRY
=========================================================

Actor

Administrator

---

Flow

Search inactive student

↓

Re-enter Student

↓

Create Student Cycle

↓

Determine requested classes

↓

If Regular Class

↓

Create Level Assessment

↓

Generate Assessment Charge

↓

Payment Approved

↓

Assessment Completed

↓

Recommended Class

↓

Enrollment Created

↓

Monthly Charge Generated

↓

Student Active

↓

Audit Log

---

Rule

Previous history remains untouched.

---

=========================================================
WORKFLOW 11
LEVEL ASSESSMENT
=========================================================

Actor

Teacher

---

Flow

Assessment scheduled

↓

Payment verified

↓

Evaluate student

↓

Choose level

↓

Save recommendation

↓

Create Enrollment

↓

Audit Log

---

=========================================================
WORKFLOW 12
CLASS SCHEDULE CHANGE
=========================================================

Actor

Administrator

---

Flow

Edit schedule

↓

Close Schedule Version

↓

Create Schedule Version

↓

Landing page updates

↓

Audit Log

---

Rule

Schedules are versioned.

Never overwritten.

---

=========================================================
WORKFLOW 13
STUDENT DEACTIVATION
=========================================================

Actor

Administrator

---

Flow

Select student

↓

Deactivate

↓

Close active enrollments

↓

Stop future billing

↓

Audit Log

↓

Student becomes Inactive

---

Rule

History remains available forever.

---

=========================================================
WORKFLOW 14
EVENT MANAGEMENT
=========================================================

Actor

Administrator

---

Flow

Create event

↓

Upload banner

↓

Configure visibility

↓

Publish

↓

Landing Page updates

↓

Audit Log

---

=========================================================
FINAL WORKFLOW PRINCIPLE
=========================================================

Every workflow described in this document represents a business process of the academy.

Implementation must follow these workflows exactly.

If a future feature requires changing a workflow, update this document before changing the code.

The documentation is the contract.

The code is the implementation.