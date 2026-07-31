# API_CONTRACTS.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the application contracts.

Although this project primarily uses Next.js Server Actions instead of a traditional REST API, every interaction between the UI and the Business Layer must follow consistent contracts.

Consistency is more important than flexibility.

---

# PHILOSOPHY

Every action should:

Receive typed input.

Validate input.

Execute business logic.

Return typed output.

Never return inconsistent structures.

---

# STANDARD ACTION FLOW

```
React Form

↓

React Hook Form

↓

Zod Validation

↓

Server Action

↓

Service

↓

Repository

↓

Database

↓

DTO

↓

UI
```

Only DTOs leave the Service Layer.

---

# STANDARD RESPONSE

Every successful Server Action returns:

```ts
type ActionResult<T> = {
    success: true
    data: T
}
```

---

Every failed Server Action returns:

```ts
type ActionError = {
    success: false
    error: {
        code: string
        message: string
        details?: unknown
    }
}
```

---

Never mix successful and failed payloads.

Never throw business exceptions to the UI.

Return structured errors instead.

---

# ACTION SIGNATURE

Preferred structure

```ts
export async function createStudent(
    input: CreateStudentInput
): Promise<ActionResult<StudentDTO> | ActionError>
```

Every Action returns the same envelope.

---

# DTO PRINCIPLES

DTOs exist to expose only the data required by the UI.

Never expose Prisma models directly.

Never expose internal IDs that are not needed.

Never expose sensitive information.

---

Example

```ts
type StudentDTO = {

    id: string

    fullName: string

    email: string

    phone: string

    status: StudentStatus

}
```

---

# PAGINATION CONTRACT

Administrative lists use server-side pagination.

Request

```ts
type PaginationInput = {

    page: number

    pageSize: number

}
```

Response

```ts
type PaginatedResponse<T> = {

    items: T[]

    page: number

    pageSize: number

    totalItems: number

    totalPages: number

}
```

Every paginated module uses the same structure.

---

# SORTING

Sorting is explicit.

```ts
type SortDirection =

"asc"

|

"desc"
```

```ts
type SortInput = {

    field: string

    direction: SortDirection

}
```

Never send arbitrary SQL ordering.

Services validate sortable fields.

---

# FILTERING

Filters are typed.

Bad

```
filter:any
```

Good

```ts
type StudentFilters = {

    search?: string

    status?: StudentStatus

    classId?: string

}
```

Each module owns its own filter contract.

---

# SEARCH

Search always performs partial matching.

Search fields are module-specific.

Student

First Name

Last Name

Email

Phone

Do not search every column by default.

---

# FORM SUBMISSION

Every form follows the same lifecycle.

Validate

↓

Submit

↓

Disable Submit Button

↓

Show Loading State

↓

Receive Result

↓

Refresh UI

↓

Display Toast

---

# FILE UPLOAD CONTRACT

UploadThing uploads the binary file.

The Server Action receives only metadata.

Example

```ts
type UploadedFile = {

    url: string

    name: string

    size: number

    mimeType: string

}
```

Business entities never receive raw files.

---

# RECEIPT UPLOAD

Input

```ts
type UploadReceiptInput = {

    billingMonth: string

    amount: number

    bank?: string

    referenceNumber?: string

    image: UploadedFile

    notes?: string

}
```

Response

```ts
ActionResult<ReceiptDTO>
```

---

# VALIDATION ERRORS

Validation errors belong to fields.

Example

```ts
{

success:false,

error:{

code:"VALIDATION_ERROR",

message:"Validation failed",

details:{

email:"Email is required",

phone:"Phone number is invalid"

}

}

}
```

The UI maps field errors automatically.

---

# BUSINESS ERRORS

Business rules return standardized codes.

Examples

```
STUDENT_ALREADY_EXISTS

ACTIVE_REGULAR_ENROLLMENT_EXISTS

CLASS_CAPACITY_REACHED

RECOVERY_ALREADY_EXISTS

RECEIPT_ALREADY_APPROVED

CHARGE_ALREADY_PAID

ASSESSMENT_REQUIRED

ASSESSMENT_ALREADY_COMPLETED
```

Codes never change without updating this document.

---

# AUTHORIZATION ERRORS

Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions."
  }
}
```

Keep authentication and authorization separate.

---

# NOT FOUND

Missing resources use a standard contract.

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Student not found."
  }
}
```

Never return null for missing business entities.

---

# BULK OPERATIONS

Bulk actions return individual results.

```ts
type BulkResult<T> = {

    successful: T[]

    failed: ActionError[]

}
```

Do not stop processing after the first failure unless atomicity is required.

---

# EXPORTS

Exports should return generated files plus metadata.

Example

```ts
type ExportResult = {

    fileUrl: string

    expiresAt: Date

}
```

The UI should not build export files.

---

# DATE CONTRACTS

Dates are transferred using ISO 8601.

Example

```
2026-08-15T18:30:00Z
```

Formatting is handled exclusively by the UI.

---

# MONEY CONTRACTS

Money is represented as integer cents.

Example

```
1500
```

The UI formats values for display.

Never send formatted currency strings between layers.

---

# IDENTIFIERS

All entity identifiers are UUID strings.

Do not expose sequential identifiers.

---

# ENUMS

Enums are shared between Client and Server.

Do not duplicate string literals.

Every module imports enums from shared types.

---

# VERSIONING

The MVP does not require API versioning.

If external APIs are introduced in the future,

versioning should be added at the integration boundary,

not inside the internal application contracts.

---

# FINAL CONTRACT PRINCIPLE

Every Server Action is a contract.

Contracts should be:

Predictable.

Typed.

Stable.

Explicit.

If a contract changes,

all affected consumers must be updated in the same change.

Breaking silent contracts is considered a defect.