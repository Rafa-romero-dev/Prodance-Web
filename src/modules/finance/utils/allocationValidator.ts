import { BusinessRuleError } from '@/lib/errors'

/**
 * Validate allocation constraints
 * Business Rule: Amount must not exceed both receipt and charge remaining balances
 */
export function validateAllocationAmount(
  allocationAmount: number,
  receiptRemainingBalance: number,
  chargeRemainingBalance: number
): {
  valid: boolean
  error?: string
} {
  if (allocationAmount <= 0) {
    return {
      valid: false,
      error: 'Allocation amount must be positive',
    }
  }

  if (!Number.isInteger(allocationAmount)) {
    return {
      valid: false,
      error: 'Allocation amount must be in cents (integer)',
    }
  }

  if (allocationAmount > receiptRemainingBalance) {
    return {
      valid: false,
      error: `Allocation amount ($${(allocationAmount / 100).toFixed(2)}) exceeds receipt remaining balance ($${(receiptRemainingBalance / 100).toFixed(2)})`,
    }
  }

  if (allocationAmount > chargeRemainingBalance) {
    return {
      valid: false,
      error: `Allocation amount ($${(allocationAmount / 100).toFixed(2)}) exceeds charge remaining balance ($${(chargeRemainingBalance / 100).toFixed(2)})`,
    }
  }

  return { valid: true }
}

/**
 * Check if allocation would complete the charge
 */
export function isAllocationCompleting(
  allocationAmount: number,
  chargeRemainingBalance: number
): boolean {
  return allocationAmount >= chargeRemainingBalance
}

/**
 * Calculate new balances after allocation
 */
export function calculateBalancesAfterAllocation(
  receiptRemainingBalance: number,
  chargeRemainingBalance: number,
  allocationAmount: number
): {
  receiptNewBalance: number
  chargeNewBalance: number
  chargeWillBePaid: boolean
} {
  const receiptNewBalance = receiptRemainingBalance - allocationAmount
  const chargeNewBalance = chargeRemainingBalance - allocationAmount
  const chargeWillBePaid = chargeNewBalance <= 0

  return {
    receiptNewBalance,
    chargeNewBalance: Math.max(0, chargeNewBalance),
    chargeWillBePaid,
  }
}
