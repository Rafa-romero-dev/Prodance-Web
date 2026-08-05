import { describe, it, expect } from 'vitest'
import {
  calculateMonthlyPrice,
  formatCurrency,
  centsToString,
  stringToCents,
} from './pricing'

describe('calculateMonthlyPrice', () => {
  it('should_return_zero_for_no_active_enrollments', () => {
    expect(calculateMonthlyPrice(0)).toBe(0)
  })

  it('should_charge_base_price_for_a_single_class', () => {
    expect(calculateMonthlyPrice(1)).toBe(1500)
  })

  it('should_add_additional_price_per_extra_class_with_default_config', () => {
    expect(calculateMonthlyPrice(2)).toBe(2000)
    expect(calculateMonthlyPrice(3)).toBe(2500)
  })

  it('should_honor_a_custom_pricing_config', () => {
    const price = calculateMonthlyPrice(3, { monthlyBasePrice: 2000, additionalClassPrice: 1000 })
    expect(price).toBe(2000 + 2 * 1000)
  })
})

describe('formatCurrency', () => {
  it('should_format_cents_as_usd_by_default', () => {
    expect(formatCurrency(1500)).toBe('$15.00')
  })

  it('should_format_zero_cents', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('centsToString / stringToCents', () => {
  it('should_round_trip_a_dollar_value', () => {
    expect(centsToString(2050)).toBe('20.50')
    expect(stringToCents('20.50')).toBe(2050)
  })

  it('should_round_fractional_cents_from_string_input', () => {
    expect(stringToCents('19.999')).toBe(2000)
  })
})
