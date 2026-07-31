# TESTING.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the testing strategy for the Academy Management System.

Testing is a development activity, not a post-development activity.

Every business feature should be designed to be testable.

The objective is confidence.

Not test coverage.

---

# TESTING PHILOSOPHY

The application exists to protect business rules.

Therefore,

business rules receive the highest testing priority.

The UI is important.

The database is important.

But the Domain is the most valuable asset.

---

# TESTING PYRAMID

Priority

            End-to-End
          Integration Tests
             Unit Tests

Most tests should be Unit Tests.

The fewer E2E tests required,

the healthier the architecture.

---

# TESTING STACK

Unit Tests

Vitest

Component Tests

React Testing Library

End-to-End

Playwright

Mocking

Vitest Mock API

Never introduce additional testing frameworks without explicit approval.

---

# WHAT SHOULD BE TESTED

Every business rule.

Every Service.

Every critical workflow.

Every permission.

Every transaction.

Every financial calculation.

Every attendance rule.

Every recovery rule.

Every promotion rule.

Every enrollment rule.

---

# WHAT DOES NOT REQUIRE EXTENSIVE TESTING

Simple UI wrappers.

Tailwind styling.

shadcn/ui components.

Lucide icons.

Generated Prisma types.

Framework behavior.

Do not waste time testing external libraries.

---

====================================================

UNIT TESTS

====================================================

# PURPOSE

Unit Tests validate business logic.

No database.

No HTTP.

No browser.

No React.

Only business behavior.

---

# PRIMARY TARGET

Services

Every Service should have dedicated tests.

Examples

StudentService

EnrollmentService

AttendanceService

RecoveryService

FinanceService

AssessmentService

PromotionService

SettingsService

---

# UNIT TEST STRUCTURE

Arrange

↓

Act

↓

Assert

Every test follows the same structure.

Avoid mixing setup with assertions.

---

# TEST NAMING

Use descriptive names.

Good

```
should_create_recovery_after_two_consecutive_absences()
```

Good

```
should_block_second_regular_enrollment()
```

Bad

```
test1()
```

Bad

```
works()
```

---

# BUSINESS TESTS

Every important business rule receives at least one positive test

and one negative test.

Example

Positive

Student promoted successfully.

Negative

Student already has an active Regular Enrollment.

---

# EDGE CASES

Every Service should include edge cases.

Examples

Student without enrollments.

Payment already approved.

Recovery already completed.

Inactive student.

Deleted schedule version.

Maximum class capacity.

Assessment already exists.

---

# FINANCIAL TESTS

Financial calculations require extensive coverage.

Examples

Monthly tuition.

Additional classes.

Recovery fee.

Assessment fee.

Partial payments.

Multiple receipts.

Charge allocation.

Charge remaining balance.

Rejected receipt.

Never trust manual calculations.

---

====================================================

INTEGRATION TESTS

====================================================

# PURPOSE

Integration Tests verify infrastructure.

Repositories.

Prisma.

Transactions.

Database behavior.

---

# WHAT SHOULD BE TESTED

Repository queries.

Transactions.

Unique constraints.

Foreign keys.

Cascade behavior.

Database migrations.

---

# TRANSACTION TESTS

Every transactional workflow requires integration tests.

Student creation.

Promotion.

Receipt approval.

Recovery completion.

Monthly billing.

Enrollment creation.

If one step fails,

verify rollback.

---

# DATABASE FIXTURES

Use dedicated fixtures.

Never depend on production-like databases.

Every test starts from a clean state.

---

====================================================

COMPONENT TESTS

====================================================

# PURPOSE

Validate UI behavior.

Not business rules.

---

# TEST

Rendering.

Button visibility.

Form validation.

Loading states.

Error messages.

Disabled controls.

Accessibility.

---

# DO NOT TEST

Tailwind classes.

Pixel-perfect layouts.

Animation timing.

Internal React behavior.

---

====================================================

END-TO-END TESTS

====================================================

# PURPOSE

Validate complete academy workflows.

Only business-critical scenarios require E2E coverage.

---

# REQUIRED MVP FLOWS

Student Registration

Initial Enrollment

Attendance Registration

Automatic Recovery Generation

Recovery Completion

Monthly Payment Upload

Receipt Approval

Student Promotion

Student Re-entry

Public Landing Page

Administrator Login

Password Reset

---

# E2E PRINCIPLES

Use realistic data.

Avoid mocking internal APIs.

Test the application as users interact with it.

Tests should survive UI refactoring whenever possible.

Prefer semantic selectors.

---

# SELECTORS

Prefer

```
getByRole()

getByLabelText()

getByPlaceholder()

getByText()
```

Avoid

```
div > div:nth-child(4)
```

Never rely on DOM structure.

---

====================================================

TEST DATA

====================================================

# BUILDERS

Prefer builders over manual object creation.

Example

```
StudentBuilder

EnrollmentBuilder

RecoveryBuilder

ReceiptBuilder
```

Builders reduce duplication.

Builders improve readability.

---

# FIXTURES

Maintain reusable fixtures.

Examples

Active Student

Inactive Student

Student With Recovery

Teacher

Administrator

Pending Receipt

Approved Receipt

Fixtures should represent realistic academy scenarios.

---

====================================================

MOCKING

====================================================

Mock only external systems.

Allowed

Email provider.

UploadThing.

Clock.

UUID generation (when necessary).

External APIs.

Avoid mocking business Services.

Business behavior should execute for real.

---

====================================================

COVERAGE

====================================================

Coverage is an indicator,

not a goal.

Recommended minimums

Services

95%

Repositories

90%

Server Actions

80%

Components

70%

Utilities

90%

Meaningful assertions are more valuable than high percentages.

---

====================================================

PERFORMANCE TESTS

====================================================

The MVP does not require dedicated performance testing.

However,

the following operations should remain efficient.

Student search.

Attendance loading.

Payment dashboard.

Monthly billing generation.

Large student tables.

Performance testing may be expanded in future releases.

---

====================================================

ACCESSIBILITY TESTS

====================================================

Every major page should verify

Keyboard navigation.

Visible labels.

Focus management.

ARIA attributes.

Dialog accessibility.

Accessibility is part of quality.

---

====================================================

REGRESSION TESTS

====================================================

Whenever a production bug is fixed,

a test reproducing that bug must be added.

Never fix the same bug twice.

The test becomes permanent documentation.

---

====================================================

CONTINUOUS INTEGRATION

====================================================

Every Pull Request should execute

Lint

↓

Type Check

↓

Unit Tests

↓

Integration Tests

↓

Build

Pull Requests should not merge while checks are failing.

---

====================================================

DEFINITION OF DONE

====================================================

A feature is complete only if

Business rules implemented.

Documentation updated.

Tests added.

Tests passing.

No skipped tests.

No TODO tests.

No failing snapshots.

---

====================================================

FINAL TESTING PRINCIPLE

====================================================

Tests exist to protect the academy's business rules.

A passing test suite should provide confidence that students, enrollments, attendance, recoveries and payments continue behaving exactly as defined by the business.

When writing tests,

prioritize protecting business behavior over implementation details.

Refactoring should not require rewriting good tests.

Changing business rules should.