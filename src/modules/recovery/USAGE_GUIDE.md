# Recovery Module Usage Guide

## Overview

The Recovery module manages recovery lessons that are automatically generated after students miss consecutive classes. A recovery is a personalized lesson required to preserve the learning rhythm and prevent the student from falling behind.

## Key Concepts

### Recovery Lifecycle

```
Generated (auto)
    ↓
Pending Payment (charge exists)
    ↓
Ready to Schedule (payment approved)
    ↓
Completed (teacher confirms lesson)
    ↓
Enrollment returns to ACTIVE
Counter resets
```

### Recovery States

- **PENDING_PAYMENT**: Recovery created, waiting for payment approval
- **READY_TO_SCHEDULE**: Payment approved, teacher can schedule the lesson
- **COMPLETED**: Lesson completed by teacher
- **CANCELLED**: Recovery cancelled (requires justification)

### Automatic Generation

Recoveries are **never** created manually. They are always generated automatically when:
- Consecutive absence is detected (2+ ABSENT)
- By the Attendance module after attendance registration

## Core Workflows

### 1. Recovery Auto-Generation

This typically happens automatically when detecting consecutive absences. However, you can also trigger it manually if needed:

```typescript
import { RecoveryService } from '@/modules/recovery'

const recoveryService = new RecoveryService()

const result = await recoveryService.generateRecovery(
  enrollmentId,    // Which enrollment needs recovery
  teacherId,       // Teacher responsible
  administratorId  // Who is authorizing
)

if (result.success) {
  const { recovery, chargeCreated, enrollmentBlocked, events } = result.data
  
  console.log(`Recovery created: ${recovery.id}`)
  console.log(`Charge created: ${chargeCreated}`)
  console.log(`Enrollment blocked: ${enrollmentBlocked}`)
  console.log(`Events emitted:`, events)
}
```

**Business Rules Enforced**:
- Only one active recovery per enrollment at a time
- Enrollment must exist and not be completed/cancelled
- Always creates a RECOVERY type charge (amount from settings)
- Automatically blocks the enrollment (ACTIVE → BLOCKED_RECOVERY)
- Idempotent (won't generate duplicate if called twice)

### 2. Marking Recovery as Ready to Schedule

When the recovery charge is paid, mark it as ready to schedule.

```typescript
const result = await recoveryService.markReadyToSchedule(
  recoveryId,
  new Date('2024-08-10'), // Optional scheduled date
  administratorId
)

if (result.success) {
  const recovery = result.data
  console.log(`Recovery ready for: ${recovery.scheduledAt}`)
}
```

**Business Rules Enforced**:
- Only works if recovery is in PENDING_PAYMENT state
- Typically triggered after payment is approved (Finance module)
- Scheduled date is optional

### 3. Completing a Recovery

When the teacher completes the recovery lesson, mark it as completed.

```typescript
const result = await recoveryService.completeRecovery(
  recoveryId,
  new Date(), // When was it completed
  'Student caught up with lesson. Ready to continue.', // Notes
  administratorId
)

if (result.success) {
  const recovery = result.data
  console.log('Recovery completed!')
  console.log(`Completion notes: ${recovery.completionNotes}`)
}
```

**Business Rules Enforced**:
- Enrollment automatically returns to ACTIVE
- Consecutive absence counter automatically resets
- Cannot complete if already completed
- Cannot complete if cancelled
- Completion notes are preserved for history

### 4. Cancelling a Recovery

In exceptional cases, a recovery may need to be cancelled (e.g., student left academy).

```typescript
const result = await recoveryService.cancelRecovery(
  recoveryId,
  'Student requested withdrawal from academy',
  administratorId
)

if (result.success) {
  const recovery = result.data
  console.log('Recovery cancelled')
  console.log(`Status: ${recovery.status}`)
}
```

**Business Rules Enforced**:
- Requires a reason (audit trail)
- Enrollment automatically unblocked (returns to ACTIVE)
- Cannot cancel if already completed
- Cannot cancel if already cancelled
- History preserved (record not deleted)

### 5. Getting Recovery Information

```typescript
// Get recovery by ID
const recovery = await recoveryService.repository.getRecoveryById(recoveryId)

// Get all recoveries for an enrollment
const recoveries = await recoveryService.repository.getRecoveriesForEnrollment(enrollmentId)

// Get active (incomplete) recovery for enrollment
const activeRecovery = await recoveryService.repository.getActiveRecoveryForEnrollment(enrollmentId)

// Get recovery history for enrollment
const result = await recoveryService.getRecoveryHistory(enrollmentId)
if (result.success) {
  const history = result.data
}
```

## Important Business Rules

### Idempotency

Recovery generation is idempotent. If called twice for the same enrollment, the second call will fail with RECOVERY_ALREADY_EXISTS error. This prevents duplicate recoveries.

### Automatic Charge Creation

Every recovery automatically creates a RECOVERY type charge. The amount is configured in academy settings (currently $15.00). This charge must be paid before the recovery can be scheduled.

### Automatic Enrollment Blocking

When a recovery is generated:
- Enrollment status changes to BLOCKED_RECOVERY
- Student cannot be marked PRESENT in that class
- Student must complete the recovery to return to ACTIVE status

### Automatic Unblocking

When a recovery is completed or cancelled:
- Enrollment status returns to ACTIVE
- Student can again be marked PRESENT
- Consecutive absence counter resets

### Independent Per Enrollment

Each recovery is tied to ONE enrollment. A student with multiple active enrollments can have:
- Recovery in Regular Class (blocked)
- No recovery in Men's Styling (still active)
- Recovery in Ladies Styling (blocked)

Example:
```
Student has 3 enrollments:
1. Basic 2 (Regular) → 2 absences → BLOCKED_RECOVERY
2. Ladies Styling (Complementary) → 1 absence → Still ACTIVE
3. Men Styling (Complementary) → 0 absences → Still ACTIVE

Only Basic 2 is blocked. Other classes remain active.
```

## Charge Integration

Recovery charges are:
- Type: RECOVERY
- Amount: Set in academy settings
- Status: PENDING until payment approved
- Linked to: Recovery record (1:1)

Once payment is approved (Finance module), the charge status becomes PAID and recovery can be marked READY_TO_SCHEDULE.

## Audit Trail

All recovery actions are logged:
- Recovery generated (what triggered it)
- Marked ready to schedule (when)
- Completed (by whom, when, notes)
- Cancelled (reason, by whom)

Access audit logs through the Audit module.

## Error Handling

Common errors:

```typescript
// Recovery already exists
{
  success: false,
  error: 'An active recovery already exists for this enrollment',
  code: 'RECOVERY_ALREADY_EXISTS'
}

// Recovery not found
{
  success: false,
  error: 'Recovery not found',
  code: 'RECOVERY_NOT_FOUND'
}

// Invalid state transition
{
  success: false,
  error: 'Recovery must be in PENDING_PAYMENT state to mark as ready',
  code: 'RECOVERY_INVALID_STATE'
}

// Already completed
{
  success: false,
  error: 'This recovery has already been completed',
  code: 'RECOVERY_ALREADY_COMPLETED'
}
```

## Typical Workflow Sequence

1. **Session Week 1**: Student ABSENT
   - Enrollment: ACTIVE
   - Recovery: None

2. **Session Week 2**: Student ABSENT (2 consecutive)
   - Auto-detection triggers
   - Recovery GENERATED
   - Enrollment: BLOCKED_RECOVERY
   - Charge: PENDING (student must pay)
   - Audit: RecoveryGenerated event

3. **Admin**: Student pays recovery charge
   - Charge: PENDING → PAID
   - Admin marks recovery ready to schedule
   - Recovery: READY_TO_SCHEDULE
   - Audit: RecoveryMarkedReady event

4. **Teacher**: Conducts recovery lesson
   - Teacher records completion
   - Recovery: READY_TO_SCHEDULE → COMPLETED
   - Enrollment: BLOCKED_RECOVERY → ACTIVE
   - Counter resets
   - Audit: RecoveryCompleted event

5. **Next Session**: Student can be marked PRESENT again
   - Enrollment: ACTIVE (counter reset)
   - No absences counted from recovery period

## Performance Notes

- Recovery queries are indexed on enrollmentId and status
- Charge creation happens in same transaction as recovery creation
- No N+1 queries
- Database transactions prevent race conditions

## Integration Points

- **Attendance Module**: Triggers recovery generation
- **Finance Module**: Payment approval triggers status change
- **Enrollment Module**: Supports BLOCKED_RECOVERY status
- **Audit Module**: All actions logged
