# CODING_STANDARDS.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the coding standards for the Academy Management System.

Every engineer and every AI agent must follow these rules.

Consistency is more important than personal preference.

When in doubt,

follow this document.

---

# PHILOSOPHY

Code is read far more often than it is written.

Prioritize:

Readability

Consistency

Maintainability

Explicitness

Business clarity

Never write code to impress.

Write code that another developer can understand in six months.

---

# GENERAL PRINCIPLES

Write explicit code.

Avoid magic.

Avoid clever solutions.

Prefer boring, predictable code.

A junior developer should be able to understand every file.

If an implementation requires a long explanation,

it is probably too complex.

---

# TYPESCRIPT

TypeScript is mandatory.

Never use plain JavaScript.

Strict Mode must remain enabled.

Never disable strict mode to fix errors.

Fix the types instead.

---

# TYPE SAFETY

Forbidden

```
any
```

Forbidden

```
as any
```

Forbidden

```
@ts-ignore
```

Forbidden

```
@ts-nocheck
```

If TypeScript complains,

solve the problem.

Do not silence it.

---

# PREFERRED TYPES

Good

```
type StudentDTO = {
    id: string
    fullName: string
}
```

Good

```
interface CreateStudentRequest {
    ...
}
```

Avoid giant interfaces.

Prefer smaller composable types.

---

# FILE SIZE

Recommended maximums.

Component

300 lines

Service

300 lines

Repository

250 lines

Hook

150 lines

Utility

100 lines

If a file grows beyond these limits,

consider splitting responsibilities.

---

# FUNCTION SIZE

Functions should usually remain below

50 lines.

If longer,

extract meaningful private functions.

Do not extract functions only to satisfy line limits.

Extract responsibilities.

---

# FUNCTION DESIGN

Functions should perform one job.

Bad

```
createStudentAndSendEmailsAndGeneratePayments()
```

Good

```
createStudent()

generateEnrollmentCharge()

sendInvitation()

createAuditLog()
```

The Service orchestrates them.

---

# NAMING

Variables

camelCase

Functions

camelCase

Types

PascalCase

Enums

PascalCase

Files

kebab-case

Components

PascalCase

Constants

UPPER_SNAKE_CASE

---

# BOOLEAN NAMES

Good

isActive

hasRecovery

canAttend

requiresAssessment

Bad

active

recovery

attendance

Names should read naturally.

---

# ENUMS

Prefer enums instead of strings.

Good

EnrollmentStatus.ACTIVE

Bad

"active"

Business language belongs in enums.

---

# IMPORT ORDER

Every file should follow the same order.

1

External packages

2

Internal modules

3

Shared utilities

4

Relative imports

Example

```
import { z } from "zod"

import { StudentService } from "@/modules/students"

import { formatMoney } from "@/shared/utils"

import "./styles.css"
```

---

# EXPORTS

Prefer named exports.

Avoid default exports.

Good

```
export function CreateStudentForm()
```

Bad

```
export default CreateStudentForm
```

Named exports improve refactoring.

---

# COMMENTS

Write comments only when necessary.

Good comments explain

WHY.

Bad comments explain

WHAT.

Bad

```
// increment counter
counter++
```

Good

```
// Attendance history must remain immutable.
```

Code should explain itself.

---

# VARIABLE NAMES

Avoid abbreviations.

Bad

```
stu
```

Bad

```
tmp
```

Good

```
student
```

Good

```
attendanceSession
```

Business terminology is preferred.

---

# EARLY RETURNS

Prefer early returns.

Bad

```
if (...) {

    if (...) {

        if (...) {

        }

    }

}
```

Good

```
if (!student) return ...

if (!enrollment) return ...

continue...
```

Reduce nesting.

---

# NULL HANDLING

Prefer explicit checks.

Good

```
if (!student)
```

Avoid deeply nested optional chaining.

Validate data once.

Proceed safely afterwards.

---

# ASYNC

Always use

async / await

Avoid nested Promise chains.

Bad

```
.then()

.then()

.then()
```

Good

```
await

await

await
```

---

# ERROR HANDLING

Never swallow exceptions.

Bad

```
catch {}
```

Bad

```
catch(e){}
```

Always log.

Always return meaningful business errors.

---

# MAGIC NUMBERS

Forbidden.

Bad

```
if(absences >=2)
```

Good

```
const MAX_CONSECUTIVE_ABSENCES = 2
```

Business constants belong in constants files.

---

# DATE HANDLING

Never manipulate dates manually.

Always centralize date helpers.

Always store UTC.

Always display academy timezone.

---

# MONEY

Never use floating point.

Bad

```
19.99
```

Good

```
1999
```

Store money in cents.

Format only for presentation.

---

# VALIDATION

Validation occurs before Services execute.

Use Zod.

Schemas validate input shape.

Services validate business rules.

Never mix both.

---

# REPOSITORIES

Repositories never contain business logic.

Allowed

CRUD

Queries

Transactions

Forbidden

Pricing

Recoveries

Attendance rules

Promotions

---

# SERVICES

Services own business logic.

Every important decision belongs here.

If a business rule appears twice,

move it into a Service.

---

# COMPONENTS

Components render UI.

Nothing more.

No business calculations.

No database access.

No pricing logic.

No recovery generation.

---

# HOOKS

Hooks manage UI behavior.

Examples

Dialogs

Pagination

Filters

Forms

Forbidden

Business calculations

Payment approval

Recovery detection

---

# CONSTANTS

Business constants belong in dedicated files.

Examples

Attendance

Recovery

Finance

Never duplicate constants.

---

# DTOS

Never expose Prisma models directly.

Return DTOs.

DTOs define contracts.

Repositories return entities.

Services transform entities into DTOs.

---

# PRISMA

Prisma belongs exclusively inside repositories.

Never import Prisma into:

Components

Hooks

Services

Actions

---

# TRANSACTIONS

Use Prisma transactions only in Services.

Repositories should expose transactional helpers,

not business orchestration.

---

# LOGGING

Structured logs only.

Include

Operation

Entity

Identifier

Administrator

Timestamp

Never log passwords.

Never log receipt images.

Never log authentication tokens.

---

# TESTABILITY

Every Service should be testable in isolation.

Avoid hidden dependencies.

Inject collaborators when appropriate.

Avoid singleton business logic.

---

# CODE REVIEW CHECKLIST

Before completing any feature ask:

Is the business rule implemented only once?

Are names consistent with the Domain?

Did I preserve history?

Is the code easy to read?

Can another developer understand this quickly?

Did I introduce unnecessary abstraction?

Did I duplicate logic?

Does every layer respect its responsibility?

If any answer is "No",

improve the implementation before considering the task complete.

---

# FINAL CODING PRINCIPLE

Readable code is a feature.

Consistency is a feature.

Predictability is a feature.

The best implementation is not the shortest.

It is the one that most accurately represents the academy's business while remaining easy to maintain for many years.