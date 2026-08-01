/**
 * Pricing Configuration
 * Should be fetched from academy settings in production
 * For now, hardcoded with defaults
 */
export const DEFAULT_PRICING = {
  basePrice: 1500, // $15.00 in cents
  additionalPrice: 500, // $5.00 per additional class
  recoveryFee: 1500, // $15.00
  assessmentFee: 2500, // $25.00
  enrollmentFee: 0, // No enrollment fee for now
}

/**
 * Calculate monthly tuition based on active enrollment count
 * Business Rule: $15 base + $5 for each additional class
 */
export function calculateMonthlyPrice(activeEnrollmentCount: number): number {
  if (activeEnrollmentCount <= 0) {
    return 0
  }

  const basePrice = DEFAULT_PRICING.basePrice
  const additionalPrice = DEFAULT_PRICING.additionalPrice

  return basePrice + (activeEnrollmentCount - 1) * additionalPrice
}

/**
 * Get pricing configuration
 * In production, this should fetch from academy settings
 */
export function getPricingConfig() {
  return DEFAULT_PRICING
}

/**
 * Validate that amount is reasonable (not negative, not excessive)
 */
export function validateChargeAmount(amount: number): {
  valid: boolean
  error?: string
} {
  if (amount <= 0) {
    return { valid: false, error: 'Charge amount must be positive' }
  }

  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'Charge amount must be in cents (integer)' }
  }

  // Sanity check: no single charge should exceed $10,000
  if (amount > 1000000) {
    return { valid: false, error: 'Charge amount exceeds maximum' }
  }

  return { valid: true }
}

/**
 * Examples:
 * 1 enrollment → $1500 (15.00)
 * 2 enrollments → $2000 (20.00)
 * 3 enrollments → $2500 (25.00)
 * 4 enrollments → $3000 (30.00)
 */
