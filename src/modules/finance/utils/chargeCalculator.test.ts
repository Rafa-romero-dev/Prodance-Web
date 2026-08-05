import { describe, it, expect } from 'vitest'
import { calculateMonthlyPrice, validateChargeAmount, getPricingConfig } from './chargeCalculator'

describe('calculateMonthlyPrice', () => {
  it('should_return_zero_for_zero_active_enrollments', () => {
    expect(calculateMonthlyPrice(0)).toBe(0)
  })

  it('should_return_zero_for_negative_active_enrollments', () => {
    expect(calculateMonthlyPrice(-1)).toBe(0)
  })

  it('should_charge_base_price_for_single_enrollment', () => {
    expect(calculateMonthlyPrice(1)).toBe(1500)
  })

  it('should_add_additional_price_per_extra_class', () => {
    expect(calculateMonthlyPrice(2)).toBe(2000)
    expect(calculateMonthlyPrice(3)).toBe(2500)
    expect(calculateMonthlyPrice(4)).toBe(3000)
  })
})

describe('validateChargeAmount', () => {
  it('should_accept_a_positive_integer_amount', () => {
    expect(validateChargeAmount(1500)).toEqual({ valid: true })
  })

  it('should_reject_zero_amount', () => {
    const result = validateChargeAmount(0)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/positive/i)
  })

  it('should_reject_negative_amount', () => {
    const result = validateChargeAmount(-500)
    expect(result.valid).toBe(false)
  })

  it('should_reject_non_integer_amount', () => {
    const result = validateChargeAmount(15.5)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/cents/i)
  })

  it('should_reject_amount_exceeding_maximum', () => {
    const result = validateChargeAmount(1000001)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/maximum/i)
  })

  it('should_accept_amount_at_maximum_boundary', () => {
    expect(validateChargeAmount(1000000)).toEqual({ valid: true })
  })
})

describe('getPricingConfig', () => {
  it('should_expose_the_documented_default_pricing', () => {
    const config = getPricingConfig()
    expect(config.basePrice).toBe(1500)
    expect(config.additionalPrice).toBe(500)
    expect(config.recoveryFee).toBe(1500)
    expect(config.assessmentFee).toBe(2500)
  })
})
