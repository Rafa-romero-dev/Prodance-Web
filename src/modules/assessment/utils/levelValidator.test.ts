import { describe, it, expect } from 'vitest'
import { validateLevelSelection } from './levelValidator'

describe('validateLevelSelection', () => {
  it('should_accept_a_valid_regular_level', () => {
    expect(validateLevelSelection('Intermediate 2')).toEqual({ valid: true })
  })

  it('should_reject_an_empty_level', () => {
    const result = validateLevelSelection('')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/invalid level/i)
  })

  it('should_reject_a_level_not_in_the_progression', () => {
    const result = validateLevelSelection('Expert 1')
    expect(result.valid).toBe(false)
  })

  it('should_allow_demotion_to_a_lower_level', () => {
    // Business rule: any valid level can be selected, including a lower
    // one than the student's previous level (demotion is allowed).
    expect(validateLevelSelection('Basic 1')).toEqual({ valid: true })
  })
})
