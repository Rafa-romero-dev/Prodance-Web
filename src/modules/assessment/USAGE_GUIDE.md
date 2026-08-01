# Level Assessment Module Usage Guide

## Overview

The Assessment module manages the re-entry process for inactive students. When a student becomes inactive and later wants to return, they must undergo a level assessment to determine the appropriate class level.

## Key Concepts

### Assessment Lifecycle

```
Student becomes INACTIVE
    ↓
Administrator initiates re-entry
    ↓
New StudentCycle created
    ↓
Assessment created for each class
    ↓
Assessment charge generated
    ↓
Student pays charge (PENDING_PAYMENT → READY)
    ↓
Teacher completes assessment (selects target level)
    ↓
Enrollment created at target level
    ↓
Student becomes ACTIVE again
```

### Assessment States

- **PENDING_PAYMENT**: Assessment created, waiting for payment
- **READY**: Payment approved, teacher can evaluate
- **COMPLETED**: Teacher selected target level, enrollment created
- **CANCELLED**: Assessment cancelled (requires reason)

### Mandatory vs Optional

- **Regular Classes**: Assessment is MANDATORY for re-entry
- **Complementary Classes**: Assessment is OPTIONAL (teacher decides)

## Core Workflows

### 1. Create Assessment (Re-entry Initiation)

When an inactive student returns, create an assessment for their regular classes.

```typescript
import { AssessmentService } from '@/modules/assessment'

const assessmentService = new AssessmentService()

const result = await assessmentService.createAssessment(
  studentId,        // Must be INACTIVE
  studentCycleId,   // New cycle created on re-entry
  classId,          // Class returning to
  teacherId,        // Who will evaluate
  administratorId   // Who is initiating
)

if (result.success) {
  const assessment = result.data
  console.log(`Assessment created: ${assessment.id}`)
  console.log(`Charge created: ${assessment.chargeId}`)
}
```

**Business Rules Enforced**:
- Student must be INACTIVE
- StudentCycle must be ACTIVE
- Class must exist and be ACTIVE
- Charge automatically generated
- Audit log created

### 2. Mark Assessment Ready (Payment Approved)

After the student pays the assessment charge, mark it as ready for evaluation.

```typescript
const result = await assessmentService.markReady(
  assessmentId,
  administratorId
)

if (result.success) {
  const assessment = result.data
  console.log(`Assessment ready for evaluation: ${assessment.status}`)
  // Teacher can now complete the assessment
}
```

**Business Rules Enforced**:
- Assessment must be in PENDING_PAYMENT status
- Status changes to READY
- Audit log shows status change

### 3. Complete Assessment (Teacher Evaluates)

The teacher completes the assessment by selecting which level the student will enter.

```typescript
const result = await assessmentService.completeAssessment(
  assessmentId,
  targetClassId,  // Which level? (Basic 1, Basic 2, etc.)
  'Student demonstrated solid understanding. Ready for Basic 3.',
  administratorId
)

if (result.success) {
  const assessment = result.data
  console.log(`Assessment completed`)
  console.log(`Selected level: ${assessment.recommendedClassId}`)
  // Enrollment automatically created
}
```

**Business Rules Enforced**:
- Assessment must be in READY status
- Target class must be REGULAR type and ACTIVE
- Target level must be valid
- Enrollment auto-created at selected level
- Monthly charge auto-generated for enrollment
- Audit log shows level decision
- Counter resets for new enrollment

### 4. Cancel Assessment

In exceptional cases, cancel an assessment.

```typescript
const result = await assessmentService.cancelAssessment(
  assessmentId,
  'Student requested withdrawal from academy',
  administratorId
)

if (result.success) {
  const assessment = result.data
  console.log(`Assessment cancelled`)
}
```

**Business Rules Enforced**:
- Cannot cancel if already COMPLETED
- Requires cancellation reason (audit trail)
- Status changes to CANCELLED
- History preserved

## Important Business Rules

### Re-entry Requirements

1. **Student must be INACTIVE**
   - Only inactive students undergo assessment
   - Assessment validates they're ready to return

2. **New StudentCycle**
   - Each re-entry starts a new cycle
   - Previous cycles remain read-only history
   - Assessments belong to specific cycle

3. **Charges are Generated**
   - LEVEL_ASSESSMENT charge created automatically
   - Amount from academy settings ($25.00 default)
   - Must be paid before evaluation
   - Audit trail shows charge generation

4. **Teacher Evaluation**
   - Only assigned teacher can complete
   - Can select any regular level (no restrictions)
   - Student can be assigned to:
     - Same level they left
     - Lower level (demotion allowed)
     - Higher level (not typical on re-entry)

5. **Automatic Enrollment**
   - After completion, enrollment created automatically
   - Created at selected level
   - Status = PENDING_PAYMENT (needs monthly tuition charge)
   - Monthly charge generated automatically

### Independent Per Class

Example:
```
Student re-entering with:
- Regular Class: Basic 2
- Complementary: Ladies Styling

Actions:
1. Assessment created for Basic 2 (MANDATORY)
2. Charge created for Basic 2 assessment
3. Ladies Styling: Teacher decides if assessment needed (OPTIONAL)
4. Payment approved for Basic 2
5. Teacher completes Basic 2 → assigns Basic 3
6. Enrollment created in Basic 3
7. Student ACTIVE in Basic 3
8. Ladies Styling handled separately (if assessment chosen)
```

## Error Handling

All methods return ServiceResult with structure:

```typescript
interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: BusinessRuleError
}
```

Always check `success` before accessing `data`.

Common errors:

```typescript
// Student not inactive
{
  success: false,
  error: BusinessRuleError('ASSESSMENT_VALIDATION_FAILED', 
    'Student must be inactive to undergo re-entry assessment')
}

// Assessment not found
{
  success: false,
  error: BusinessRuleError('ASSESSMENT_NOT_FOUND',
    'Assessment not found')
}

// Invalid state for operation
{
  success: false,
  error: BusinessRuleError('ASSESSMENT_INVALID_STATE',
    'Assessment must be in READY status to complete')
}

// Target class not valid
{
  success: false,
  error: BusinessRuleError('INVALID_TARGET_CLASS',
    'Target class must be a regular class')
}
```

## Typical Re-entry Workflow Sequence

1. **Assessment Week 1**: Student clicks "Re-enter"
   - New StudentCycle created (ACTIVE)
   - Assessment created for Basic 2 (their previous level)
   - Assessment status: PENDING_PAYMENT
   - Charge created: $25.00

2. **Admin**: Charge approved/paid
   - Assessment marked READY
   - Teacher notified to evaluate

3. **Teacher**: Completes evaluation
   - Selects target: Basic 3 (progression) or Basic 2 (same) or Basic 1 (demotion)
   - Assessment status: COMPLETED
   - Enrollment created at target level
   - Monthly tuition charge created (depends on active enrollments)
   - Student status: still need to pay monthly tuition

4. **Admin**: Approves monthly tuition payment
   - Enrollment status: PENDING_PAYMENT → ACTIVE
   - Student can attend classes

5. **Student**: Attends classes
   - Attendance tracked
   - Consecutive absence counter starts fresh

## Integration Points

- **Students Module**: Triggers re-entry for INACTIVE students
- **StudentCycle Module**: Creates new cycle on re-entry
- **Finance Module**: Approval of charges transitions state
- **Enrollment Module**: Auto-creates enrollment after completion
- **Charge Module**: Generates assessment and monthly charges
- **Audit Module**: All actions logged with full context

## Performance Notes

- Assessment queries are indexed on studentId, studentCycleId, status
- Charge creation happens in same transaction as assessment completion
- Enrollment creation happens in transaction during assessment completion
- No N+1 queries
- Database transactions prevent race conditions

## Testing Scenarios

### Scenario 1: Student Progression
- Previous level: Basic 2
- Assessment completes → assigns Basic 3
- Student re-enters at higher level

### Scenario 2: Student Same Level
- Previous level: Intermediate 1
- Assessment completes → assigns Intermediate 1
- Student re-enters at same level

### Scenario 3: Student Demotion
- Previous level: Intermediate 2
- Assessment completes → assigns Basic 4
- Student re-enters at lower level (allowed)

### Scenario 4: Assessment Cancelled
- Assessment created, payment pending
- Student cancels with reason
- Assessment status = CANCELLED
- Charge cancelled (future: integrate with Finance)
- Student remains inactive
