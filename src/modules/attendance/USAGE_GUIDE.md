# Attendance Module Usage Guide

## Overview

The Attendance module manages class attendance registration, editing, and automatic consecutive absence detection. It integrates with the Recovery module to automatically trigger recovery generation when students miss consecutive classes.

## Key Concepts

### Attendance States
- **PRESENT**: Student attended the class
- **ABSENT**: Student did not attend

### Late Arrival
Late arrival is tracked as metadata (isLate, minutesLate, observation), not as a separate attendance state.

### Session Status
Attendance sessions can have the following statuses:
- **SCHEDULED**: Session created but attendance not yet opened
- **OPEN**: Attendance registration is open
- **CLOSED**: Attendance has been finalized
- **CANCELLED**: Session was cancelled (no absences recorded)

## Core Workflows

### 1. Opening an Attendance Session

When a class session occurs, an administrator opens attendance. This automatically creates attendance records for all active enrollments.

```typescript
import { AttendanceService } from '@/modules/attendance'

const attendanceService = new AttendanceService()

const result = await attendanceService.openAttendanceSession(
  classId,        // The class ID
  scheduleVersionId, // Current schedule version
  sessionDate,    // Date of the session
  administratorId, // Who is opening attendance
  notes           // Optional notes
)

if (result.success) {
  const { session, attendanceCount } = result.data
  console.log(`Session created with ${attendanceCount} attendance records`)
}
```

**Business Rules Enforced**:
- All active enrollments (ACTIVE, PENDING_PAYMENT) automatically get attendance records
- Initial status is ABSENT (must be explicitly marked PRESENT)
- Session created once, cannot be duplicated for same date/class

### 2. Registering Attendance

For each student in the session, mark them as PRESENT or ABSENT.

```typescript
const result = await attendanceService.registerAttendance(
  sessionId,
  enrollmentId,
  'PRESENT', // or 'ABSENT'
  administratorId,
  false,     // isLate
  null,      // minutesLate (only if isLate is true)
  null       // observation
)

if (result.success) {
  const attendance = result.data
  // Attendance registered
}
```

**Business Rules Enforced**:
- Cannot mark BLOCKED_RECOVERY enrollment as PRESENT (recovery required)
- Attendance can only be registered once per enrollment per session
- Late arrival tracking is optional

### 3. Editing Attendance

Correct a previously registered attendance.

```typescript
const result = await attendanceService.editAttendance(
  attendanceId,
  'PRESENT',  // New status
  administratorId,
  false,      // isLate
  null,       // minutesLate
  'Class was full', // observation
  'Admin correction - student was present' // reason
)

if (result.success) {
  const updated = result.data
  // Attendance updated with full audit trail
}
```

**Business Rules Enforced**:
- Original attendance record is preserved (audit trail)
- Edit creates an audit log with before/after values
- Reason is optional but recommended
- Cannot edit attendance for blocked enrollments to PRESENT

### 4. Consecutive Absence Detection

After registering attendance, check if recovery should be generated.

```typescript
import { detectAndHandleConsecutiveAbsences } from '@/modules/attendance/utils/consecutiveAbsenceDetector'

const result = await detectAndHandleConsecutiveAbsences(
  enrollmentId,
  teacherId,     // Teacher for the recovery
  administratorId
)

if (result.detected) {
  console.log(`Recovery generated: ${result.recoveryId}`)
} else if (result.error) {
  console.error(`Error: ${result.error}`)
}
```

**Business Rules Enforced**:
- Only triggers on 2+ consecutive ABSENT
- Cancelled sessions don't count as absences
- Counter resets on PRESENT attendance
- Independent per enrollment (not per student)

## Important Business Rules

### Enrollment Blocking
When an enrollment is blocked (BLOCKED_RECOVERY), students cannot be marked PRESENT until the recovery is completed. This is enforced at the service layer.

### Cancelled Sessions
If a session is cancelled, the absences don't count toward the consecutive absence counter. The detectAndHandleConsecutiveAbsences function automatically filters these out.

### History Preservation
Attendance edits never delete records. They always create audit trails showing:
- Original value
- New value
- Who made the change
- When the change was made
- Reason for the change

## Error Handling

All methods return a ServiceResult with the following structure:

```typescript
interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
```

Always check `success` before accessing `data`.

## Integration with Recovery Module

The Attendance module automatically integrates with the Recovery module:

1. After registering attendance, call `detectAndHandleConsecutiveAbsences()`
2. If consecutive absences detected, Recovery is automatically generated
3. Enrollment is automatically blocked
4. Recovery charge is created
5. All actions are audited

See Recovery module documentation for next steps.

## Testing Scenarios

### Scenario 1: Normal Attendance
1. Open session → 5 students, all marked ABSENT initially
2. Register 4 students as PRESENT
3. 1 student remains ABSENT (no recovery yet)
4. Next week: That student ABSENT again
5. Consecutive absence detected → Recovery generated

### Scenario 2: Cancelled Session Recovery
1. Student has 1 ABSENT
2. Next session CANCELLED
3. Session after that: ABSENT (but cancelled doesn't count)
4. No consecutive absence (cancelled is filtered out)

### Scenario 3: Blocked Enrollment
1. Student has recovery (enrollment BLOCKED_RECOVERY)
2. Try to mark as PRESENT → Error: "Enrollment is blocked"
3. Teacher completes recovery
4. Enrollment returns to ACTIVE
5. Can now mark as PRESENT again

## Performance Notes

- Attendance records for large classes (20+) are created in a transaction
- Consecutive absence checking queries only recent 5 records
- Indices on enrollmentId, sessionDate optimize queries
- No N+1 queries in the service layer
