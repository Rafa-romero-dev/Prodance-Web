// Pricing calculations
// All amounts are in cents

export interface PricingConfig {
  monthlyBasePrice: number // First class
  additionalClassPrice: number // Additional classes
  enrollmentFee: number
  recoveryFee: number
  assessmentFee: number
}

const DEFAULT_PRICING: PricingConfig = {
  monthlyBasePrice: 1500, // $15.00
  additionalClassPrice: 500, // $5.00
  enrollmentFee: 0,
  recoveryFee: 0,
  assessmentFee: 0,
}

export function calculateMonthlyPrice(
  activeEnrollmentCount: number,
  config: Partial<PricingConfig> = {}
): number {
  const pricing = { ...DEFAULT_PRICING, ...config }

  if (activeEnrollmentCount <= 0) {
    return 0
  }

  if (activeEnrollmentCount === 1) {
    return pricing.monthlyBasePrice
  }

  const additionalClasses = activeEnrollmentCount - 1
  return pricing.monthlyBasePrice + additionalClasses * pricing.additionalClassPrice
}

export function getEnrollmentFee(config: Partial<PricingConfig> = {}): number {
  const pricing = { ...DEFAULT_PRICING, ...config }
  return pricing.enrollmentFee
}

export function getRecoveryFee(config: Partial<PricingConfig> = {}): number {
  const pricing = { ...DEFAULT_PRICING, ...config }
  return pricing.recoveryFee
}

export function getAssessmentFee(config: Partial<PricingConfig> = {}): number {
  const pricing = { ...DEFAULT_PRICING, ...config }
  return pricing.assessmentFee
}

export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars)
}

export function centsToString(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function stringToCents(value: string): number {
  return Math.round(parseFloat(value) * 100)
}
