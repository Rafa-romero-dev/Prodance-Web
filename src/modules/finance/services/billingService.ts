import type { ServiceResult } from '@/types'
import { BusinessRuleError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { PrismaClient } from '@prisma/client'
import { calculateMonthlyPrice } from '../utils/chargeCalculator'
import type { BillingResult } from '../types'

export class BillingService {
  private db = new PrismaClient()
  private auditService = getAuditService()
  private billingSystemAdminId = 'SYSTEM_BILLING_ADMIN' // System-generated charges

  /**
   * Generate monthly charges for all active students
   * Business Rule: Monthly charges are generated automatically based on active enrollments
   * One charge per student per month, amount determined by number of active classes
   */
  async generateMonthlyCharges(month: string): Promise<ServiceResult<BillingResult>> {
    try {
      const result: BillingResult = {
        chargesGenerated: 0,
        studentsProcessed: 0,
        errors: [],
      }

      // Parse month (format: YYYY-MM)
      const [year, monthNum] = month.split('-')
      if (!year || !monthNum || monthNum.length !== 2) {
        throw new BusinessRuleError(
          'INVALID_MONTH_FORMAT',
          'Month must be in YYYY-MM format'
        )
      }

      const monthDate = new Date(`${month}-01`)
      const nextMonth = new Date(monthDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      // Get all active students (have at least one active enrollment)
      const activeStudents = await this.db.student.findMany({
        where: {
          status: 'ACTIVE',
          enrollments: {
            some: {
              status: 'ACTIVE',
              class: {
                status: 'ACTIVE',
              },
            },
          },
        },
        include: {
          enrollments: {
            where: {
              status: 'ACTIVE',
              class: {
                status: 'ACTIVE',
              },
            },
          },
        },
      })

      result.studentsProcessed = activeStudents.length

      // Generate charges for each student
      for (const student of activeStudents) {
        try {
          // Check if monthly charge already exists for this month
          const existingCharge = await this.db.charge.findFirst({
            where: {
              studentId: student.id,
              type: 'MONTHLY',
              createdAt: {
                gte: monthDate,
                lt: nextMonth,
              },
            },
          })

          if (existingCharge) {
            // Charge already generated this month
            continue
          }

          // Calculate charge amount based on active enrollments
          const activeEnrollmentCount = student.enrollments.length
          const chargeAmount = calculateMonthlyPrice(activeEnrollmentCount)

          // Create monthly charge
          const charge = await this.db.charge.create({
            data: {
              studentId: student.id,
              type: 'MONTHLY',
              description: `Monthly tuition for ${month} (${activeEnrollmentCount} active class${activeEnrollmentCount > 1 ? 'es' : ''})`,
              amount: chargeAmount,
              remainingAmount: chargeAmount,
              status: 'PENDING',
              dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
              createdById: this.billingSystemAdminId,
            },
          })

          // Log the auto-generated charge
          await this.auditService.log(
            this.billingSystemAdminId,
            'Charge',
            charge.id,
            'ChargeCreated',
            {
              metadata: {
                month,
                studentId: student.id,
                activeEnrollments: activeEnrollmentCount,
                amount: chargeAmount,
                type: 'MONTHLY',
              },
            }
          )

          result.chargesGenerated++
        } catch (studentError) {
          result.errors.push({
            studentId: student.id,
            error: studentError instanceof Error ? studentError.message : 'Unknown error',
          })
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'BILLING_ERROR',
        error instanceof Error ? error.message : 'Failed to generate monthly charges'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get monthly charges for a student in a specific month
   */
  async getMonthlyChargeForMonth(
    studentId: string,
    month: string
  ): Promise<ServiceResult<any>> {
    try {
      const [year, monthNum] = month.split('-')
      if (!year || !monthNum) {
        throw new BusinessRuleError(
          'INVALID_MONTH_FORMAT',
          'Month must be in YYYY-MM format'
        )
      }

      const monthDate = new Date(`${month}-01`)
      const nextMonth = new Date(monthDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const charge = await this.db.charge.findFirst({
        where: {
          studentId,
          type: 'MONTHLY',
          createdAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
      })

      if (!charge) {
        throw new BusinessRuleError(
          'CHARGE_NOT_FOUND',
          'No monthly charge found for this student in the specified month'
        )
      }

      return {
        success: true,
        data: charge,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'BILLING_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch monthly charge'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get all charges for a student in a date range
   */
  async getChargesForPeriod(
    studentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResult<any[]>> {
    try {
      const charges = await this.db.charge.findMany({
        where: {
          studentId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return {
        success: true,
        data: charges,
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'BILLING_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch charges'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get billing summary for a student
   */
  async getBillingSummary(studentId: string): Promise<
    ServiceResult<{
      totalCharges: number
      totalPaid: number
      totalPending: number
      chargeCount: number
      lastChargeDate: Date | null
    }>
  > {
    try {
      const charges = await this.db.charge.findMany({
        where: { studentId },
      })

      const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0)
      const totalPaid = charges.reduce((sum, c) => {
        return sum + (c.amount - c.remainingAmount)
      }, 0)
      const totalPending = charges.reduce((sum, c) => {
        if (c.status === 'PENDING' || c.status === 'PARTIALLY_PAID') {
          return sum + c.remainingAmount
        }
        return sum
      }, 0)

      const lastCharge = charges.length > 0 ? charges.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] : null

      return {
        success: true,
        data: {
          totalCharges,
          totalPaid,
          totalPending,
          chargeCount: charges.length,
          lastChargeDate: lastCharge?.createdAt || null,
        },
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'BILLING_ERROR',
        error instanceof Error ? error.message : 'Failed to get billing summary'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }
}

export function getBillingService(): BillingService {
  return new BillingService()
}
