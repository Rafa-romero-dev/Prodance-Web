import { describe, it, expect } from 'vitest'
import { isAssessmentMandatory } from './assessmentChargeGenerator'

describe('isAssessmentMandatory', () => {
  it('should_require_assessment_for_regular_classes', () => {
    expect(isAssessmentMandatory('REGULAR')).toBe(true)
  })

  it('should_not_require_assessment_for_complementary_classes', () => {
    expect(isAssessmentMandatory('COMPLEMENTARY')).toBe(false)
  })
})
