import { describe, it, expect } from 'vitest'
import {
  validateAllocationAmount,
  isAllocationCompleting,
  calculateBalancesAfterAllocation,
} from './allocationValidator'

describe('validateAllocationAmount', () => {
  it('should_accept_an_amount_within_both_balances', () => {
    expect(validateAllocationAmount(1000, 2000, 1500)).toEqual({ valid: true })
  })

  it('should_reject_zero_amount', () => {
    const result = validateAllocationAmount(0, 2000, 1500)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/positive/i)
  })

  it('should_reject_negative_amount', () => {
    const result = validateAllocationAmount(-100, 2000, 1500)
    expect(result.valid).toBe(false)
  })

  it('should_reject_non_integer_amount', () => {
    const result = validateAllocationAmount(10.5, 2000, 1500)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/cents/i)
  })

  it('should_reject_amount_exceeding_receipt_balance', () => {
    const result = validateAllocationAmount(2500, 2000, 3000)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/receipt/i)
  })

  it('should_reject_amount_exceeding_charge_balance', () => {
    const result = validateAllocationAmount(1800, 2000, 1500)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/charge/i)
  })

  it('should_accept_amount_exactly_matching_the_tighter_balance', () => {
    expect(validateAllocationAmount(1500, 2000, 1500)).toEqual({ valid: true })
  })
})

describe('isAllocationCompleting', () => {
  it('should_be_false_when_allocation_leaves_a_remaining_balance', () => {
    expect(isAllocationCompleting(500, 1500)).toBe(false)
  })

  it('should_be_true_when_allocation_exactly_matches_remaining_balance', () => {
    expect(isAllocationCompleting(1500, 1500)).toBe(true)
  })

  it('should_be_true_when_allocation_exceeds_remaining_balance', () => {
    expect(isAllocationCompleting(2000, 1500)).toBe(true)
  })
})

describe('calculateBalancesAfterAllocation', () => {
  it('should_subtract_allocation_from_both_balances_on_partial_payment', () => {
    const result = calculateBalancesAfterAllocation(2000, 1500, 500)
    expect(result).toEqual({
      receiptNewBalance: 1500,
      chargeNewBalance: 1000,
      chargeWillBePaid: false,
    })
  })

  it('should_mark_charge_as_paid_when_allocation_exactly_completes_it', () => {
    const result = calculateBalancesAfterAllocation(1500, 1500, 1500)
    expect(result.chargeNewBalance).toBe(0)
    expect(result.chargeWillBePaid).toBe(true)
  })

  it('should_never_return_a_negative_charge_balance', () => {
    // Receipt has more than enough to overpay the charge (allocation logic
    // elsewhere is expected to prevent this, but the calculator itself
    // must not produce a negative remaining balance).
    const result = calculateBalancesAfterAllocation(3000, 1000, 2000)
    expect(result.chargeNewBalance).toBe(0)
    expect(result.chargeWillBePaid).toBe(true)
    expect(result.receiptNewBalance).toBe(1000)
  })
})
