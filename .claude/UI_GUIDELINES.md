# UI_GUIDELINES.md
Version: 1.0
Project: Academy Management System
Status: Mandatory

---

# PURPOSE

This document defines the visual and interaction standards for the Academy Management System.

It does not define branding.

It defines consistency.

Every screen should feel like part of the same application.

If a UI decision is not covered by this document,

prefer consistency over creativity.

---

# DESIGN PHILOSOPHY

The application is an administrative system.

The UI should prioritize:

Clarity

Speed

Readability

Consistency

Accessibility

The interface is a productivity tool.

Avoid decorative elements that do not improve usability.

---

# DESIGN PRINCIPLES

The user should immediately understand:

Where they are.

What they are looking at.

What they can do next.

What just happened.

Every page should answer those four questions.

---

# LAYOUT

Every authenticated page uses the same structure.

```
------------------------------------------------------

Sidebar

|

|

|

|

|

------------------------------------------------------

Top Navigation

------------------------------------------------------

Page Header

------------------------------------------------------

Toolbar

------------------------------------------------------

Main Content

------------------------------------------------------
```

Users should never feel that different pages belong to different applications.

---

# SIDEBAR

Contains primary navigation.

Students

Classes

Attendance

Recoveries

Finance

Events

Reports

Settings

Sidebar remains visible on desktop.

Collapsible on tablet.

Drawer on mobile.

---

# TOP BAR

Contains

Current user

Notifications (future)

Theme toggle (future)

Logout

Never duplicate navigation already present in the sidebar.

---

# PAGE HEADER

Every page begins with

Title

Description

Primary Action

Example

Students

Manage student records, enrollments and history.

[ New Student ]

---

# TOOLBAR

Optional.

Contains

Search

Filters

Sorting

Export

Bulk actions

Toolbar appears only when necessary.

---

# PAGE WIDTH

Content should be centered.

Avoid extremely wide layouts.

Tables may use the full available width.

Forms should remain reasonably narrow for readability.

---

# SPACING

Use consistent spacing throughout the application.

Recommended spacing scale

4

8

12

16

24

32

48

Avoid arbitrary values.

---

# TYPOGRAPHY

Each page has only one primary heading.

Hierarchy

H1

Page title

H2

Section title

H3

Card title

Body

Normal content

Caption

Secondary information

Do not skip heading levels.

---

# COLOR USAGE

Color communicates meaning.

Primary

Main actions

Success

Completed

Approved

Paid

Present

Warning

Attention required

Pending

Error

Rejected

Blocked

Failed

Info

Neutral information

Never use color as the only indicator.

Always accompany color with text or icons.

---

# BUTTONS

Only one Primary Button should exist per section.

Primary

Create

Save

Approve

Secondary

Cancel

Back

View

Outline

Less important actions

Destructive

Delete

Deactivate

Reject

Dangerous actions require confirmation.

---

# FORMS

Every form should follow the same structure.

Header

↓

Fields

↓

Validation Messages

↓

Primary Button

↓

Secondary Button

Labels are always visible.

Never rely solely on placeholders.

---

# FORM VALIDATION

Validation occurs immediately after interaction.

Errors appear below the field.

Validation messages should explain how to fix the problem.

Bad

Invalid value.

Good

Email address is required.

---

# REQUIRED FIELDS

Required fields display an indicator.

Optional fields should be explicitly marked when appropriate.

Users should never guess.

---

# TABLES

TanStack Table is the standard.

Every table should support

Sorting

Filtering

Pagination

Responsive layout

Column visibility (future)

Avoid horizontal scrolling whenever possible.

---

# TABLE ACTIONS

Actions should remain consistent.

View

Edit

Deactivate

History

Avoid placing destructive actions next to common actions.

---

# EMPTY STATES

Every empty state should explain

Why nothing is displayed.

What the user can do next.

Example

"No students have been registered yet."

[ Create Student ]

Empty states should encourage action.

---

# LOADING STATES

Never leave blank screens.

Use Skeleton components.

Loading indicators should resemble the final layout.

Avoid generic spinners unless the operation is extremely short.

---

# ERROR STATES

Errors should explain

What happened.

What the user can do.

Example

"We couldn't load the attendance records."

[ Retry ]

Never expose technical details.

---

# DIALOGS

Dialogs are reserved for

Confirmation

Editing

Critical actions

Simple information should not require dialogs.

---

# CONFIRMATION DIALOGS

Required for

Delete

Deactivate

Reject payment

Cancel enrollment

Complete recovery

Changing academy settings

The dialog should clearly explain the consequences.

---

# TOASTS

Use toast notifications for successful operations.

Examples

Student created.

Attendance saved.

Payment approved.

Avoid showing toasts for validation errors.

Validation belongs near the affected field.

---

# BADGES

Use badges to communicate status.

Student

Active

Inactive

Enrollment

Active

Completed

Blocked

Attendance

Present

Absent

Recovery

Pending

Completed

Payment

Pending

Approved

Rejected

Badges should remain consistent across the application.

---

# SEARCH

Search should begin after a short debounce.

Searching should never require pressing Enter.

Highlight matching results when appropriate.

---

# FILTERS

Filters should remain visible.

Selected filters should be removable individually.

Always provide a "Clear Filters" action.

---

# PAGINATION

Administrative tables use server-side pagination.

Remember page size preference when practical.

---

# RESPONSIVE DESIGN

Desktop

Primary experience.

Tablet

Fully supported.

Mobile

Supported for essential administrative tasks.

Public landing page should be fully responsive.

---

# ACCESSIBILITY

Every interactive element must be keyboard accessible.

Buttons require accessible labels.

Forms require associated labels.

Dialogs must trap keyboard focus.

Contrast ratios should meet WCAG AA standards.

Never rely solely on hover interactions.

---

# ICONS

Use Lucide React exclusively.

Icons should reinforce meaning.

Never replace text with icons alone.

---

# DATE FORMAT

Display dates according to academy locale.

Maintain consistency throughout the application.

Never mix formats.

---

# CURRENCY

Display monetary values consistently.

Always include the currency symbol.

Align monetary values to improve readability in tables.

---

# DASHBOARDS

Dashboard cards should communicate:

Students

Today's Classes

Pending Payments

Pending Recoveries

Upcoming Events

Avoid clutter.

Every card should provide actionable information.

---

# LANDING PAGE

The public landing page should contain:

Hero section

About the academy

Regular class schedule

Special events calendar

Contact information

Social media links

Call-to-action for new students

The landing page should not expose administrative information.

---

# FINAL UI PRINCIPLE

Users should spend their time managing the academy, not learning how to use the application.

Every interface decision should reduce cognitive load.

If two UI solutions are equally functional, prefer the one that is simpler, more predictable and more consistent with the rest of the application.