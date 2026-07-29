# SECURITY.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the security standards of the Academy Management System.

Security is not an optional feature.

Every module, service and workflow must follow these rules.

If implementation conflicts with this document,

this document is correct.

---

# SECURITY PHILOSOPHY

The system manages:

- Student personal information
- Parent/guardian information
- Attendance history
- Financial records
- Payment receipts
- Administrative accounts

Protecting this information is a business requirement.

Security should be implemented by design, not added later.

---

# CORE PRINCIPLES

Every request must be:

Authenticated

Authorized

Validated

Audited

If any of these steps fail,

the request must stop immediately.

---

# AUTHENTICATION

Authentication is handled exclusively by Auth.js.

Responsibilities

- User login
- Password reset
- Session management
- Session expiration
- Account verification

The application never implements custom authentication.

---

# PASSWORDS

Passwords are never stored.

Only password hashes are persisted.

Requirements

Minimum length

12 characters

Encourage passphrases instead of complex-but-short passwords.

Passwords are never:

Logged

Returned

Displayed

Stored in plaintext

Included in Audit Logs

---

# SESSIONS

Only authenticated users may access the administrative application.

Sessions must:

Expire automatically

Be invalidated after logout

Be protected against tampering

Protected pages must always verify authentication on the server.

Never trust client-side state.

---

# AUTHORIZATION

Authentication identifies the user.

Authorization determines what the user may do.

Every Server Action must verify authorization before executing business logic.

Services should assume authorization has already been enforced.

---

# ROLES

Current MVP

Administrator

Student

Future roles may include:

Receptionist

Accounting

Super Administrator

Guest Instructor

Never hardcode role names throughout the application.

Centralize authorization logic.

---

# PERMISSIONS

Administrators may:

Create students

Modify students

Approve payments

Register attendance

Manage classes

Create events

Run reports

Configure academy settings

Students may:

View their information

Upload receipts

View payment history

View schedules

View events

Students cannot modify academic records.

---

# ROUTE PROTECTION

Public routes

Landing page

Public schedule

Public events

Login

Password reset

Protected routes

Dashboard

Students

Attendance

Finance

Recoveries

Reports

Settings

Every protected route verifies the session on the server.

---

# SERVER ACTION SECURITY

Every Server Action follows this sequence.

Authenticate

↓

Authorize

↓

Validate input

↓

Execute Service

↓

Audit

↓

Return response

No business logic executes before authentication.

---

# INPUT VALIDATION

Every external input is validated with Zod.

Validation includes:

Required fields

Data types

Length

Format

Allowed values

Unexpected fields

Invalid requests fail before reaching Services.

---

# FILE UPLOAD SECURITY

Uploads are restricted to approved file types.

Allowed

JPEG

PNG

WEBP

PDF (future)

Rejected

Executable files

Scripts

Archives

Unknown MIME types

SVG (unless explicitly sanitized)

---

# FILE SIZE LIMITS

Student profile photo

Maximum 5 MB

Receipt screenshot

Maximum 10 MB

Event banner

Maximum 10 MB

Limits should be enforced both client-side and server-side.

---

# FILE NAMING

Uploaded files never keep their original names.

Generate UUID-based filenames.

Do not expose student names in object storage paths.

Example

uploads/student-profile/<uuid>

uploads/receipts/<uuid>

---

# FILE ACCESS

Receipt images are private.

Only:

The owning student

Authorized administrators

may access them.

Public URLs must never expose sensitive documents.

---

# DATABASE SECURITY

Every query uses Prisma.

Never concatenate SQL strings.

Never build raw SQL unless absolutely necessary.

If raw SQL is required,

use parameterized queries.

---

# SQL INJECTION

Never trust user input.

Never interpolate SQL.

Prisma should be used for all standard queries.

---

# XSS PROTECTION

Never render unsanitized HTML.

Render user-generated text as plain text.

If rich text is introduced in the future,

it must be sanitized before rendering.

---

# CSRF

Server Actions and Auth.js protections should be preserved.

Never disable CSRF protection.

Never implement custom workarounds that bypass framework security.

---

# RATE LIMITING

Sensitive operations should be rate limited.

Examples

Login

Password reset

Receipt uploads

Future public forms

Rate limiting strategy may evolve, but protections must exist.

---

# ERROR MESSAGES

Never expose internal implementation details.

Bad

"Database connection failed"

Good

"An unexpected error occurred. Please try again."

Detailed errors belong in logs, not in the UI.

---

# AUDIT LOGGING

Generate AuditLog entries for:

Student creation

Student updates

Enrollment changes

Attendance changes

Recovery creation

Recovery completion

Receipt approval

Receipt rejection

Settings changes

Administrator actions

Audit logs are immutable.

---

# SENSITIVE DATA

Sensitive information includes:

Email addresses

Phone numbers

Birth dates

Guardian information

Receipt images

Payment history

Authentication data

Treat all of it as confidential.

---

# LOGGING

Never log:

Passwords

Session tokens

Cookies

Receipt images

Authentication secrets

Environment variables

Logs should contain identifiers, never secrets.

---

# ENVIRONMENT VARIABLES

Secrets belong exclusively in environment variables.

Never hardcode:

Database credentials

API keys

Email keys

UploadThing tokens

Auth secrets

Rotate secrets immediately if exposure is suspected.

---

# HTTPS

All production traffic must use HTTPS.

Do not support insecure HTTP access in production.

Secure cookies should be enabled.

---

# DEPENDENCY SECURITY

Dependencies should be kept current.

Avoid abandoned packages.

Remove unused dependencies promptly.

Review security advisories regularly.

---

# PRINCIPLE OF LEAST PRIVILEGE

Every user receives the minimum permissions required.

Every service receives the minimum data required.

Every query returns only the fields required.

Do not expose unnecessary information.

---

# BACKUPS

Database backups are mandatory.

Backups should be encrypted.

Backups should be tested periodically.

A backup that cannot be restored is not a backup.

---

# INCIDENT RESPONSE

If a security incident occurs:

Contain the issue.

Protect user data.

Preserve audit information.

Identify the root cause.

Deploy a verified fix.

Document the incident.

---

# FINAL SECURITY PRINCIPLE

Security is part of every feature.

A feature is not complete until it is secure.

When security and convenience conflict,

protecting student and academy data always takes priority.