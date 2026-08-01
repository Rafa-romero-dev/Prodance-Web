import type { ServiceResult } from '@/types'
import { BusinessRuleError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { ChargeRepository } from '../repositories/chargeRepository'
import { validateChargeAmount } from '../utils/chargeCalculator'
import type { ChargeDTO } from '../types'

export class ChargeService {
  private repository: ChargeRepository
  private auditService = getAuditService()

  constructor(repository?: ChargeRepository) {
    this.repository = repository || new ChargeRepository()
  }

  /**
   * Create a new charge
   * Business Rule: Charges are immutable - amount cannot be changed
   */
  async createCharge(
    studentId: string,
    type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT',
    description: string,
    amount: number,
    administratorId: string,
    enrollmentId?: string,
    recoveryId?: string,
    assessmentId?: string,
    dueDate?: Date
  ): Promise<ServiceResult<ChargeDTO>> {
    try {
      // Validate amount
      const validation = validateChargeAmount(amount)
      if (!validation.valid) {
        throw new BusinessRuleError('INVALID_CHARGE_AMOUNT', validation.error || 'Invalid amount')
      }

      const charge = await this.repository.createCharge(
        studentId,
        type,
        description,
        amount,
        administratorId,
        enrollmentId,
        recoveryId,
        assessmentId,
        dueDate || undefined
      )

      // Log the action
      await this.auditService.log(
        administratorId,
        'Charge',
        charge.id,
        'ChargeCreated',
        {
          metadata: {
            studentId,
            type,
            amount,
            enrollmentId,
            recoveryId,
            assessmentId,
          },
        }
      )

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

      const message = error instanceof Error ? error.message : 'Failed to create charge'
      const businessError = new BusinessRuleError('CHARGE_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get charge by ID
   */
  async getChargeById(chargeId: string): Promise<ServiceResult<ChargeDTO>> {
    try {
      const charge = await this.repository.getChargeById(chargeId)

      if (!charge) {
        throw new BusinessRuleError('CHARGE_NOT_FOUND', 'Charge not found', { chargeId })
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
        'CHARGE_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch charge'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get pending charges for a student
   */
  async getPendingChargesForStudent(studentId: string): Promise<ServiceResult<ChargeDTO[]>> {
    try {
      const charges = await this.repository.getPendingChargesForStudent(studentId)

      return {
        success: true,
        data: charges,
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'CHARGE_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch charges'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Cancel charge
   */
  async cancelCharge(
    chargeId: string,
    reason: string,
    administratorId: string
  ): Promise<ServiceResult<ChargeDTO>> {
    try {
      const charge = await this.repository.getChargeById(chargeId)

      if (!charge) {
        throw new BusinessRuleError('CHARGE_NOT_FOUND', 'Charge not found', { chargeId })
      }

      if (charge.status === 'PAID') {
        throw new BusinessRuleError(
          'CANNOT_CANCEL_PAID_CHARGE',
          'Cannot cancel a charge that has been paid',
          { chargeId }
        )
      }

      const cancelled = await this.repository.cancelCharge(chargeId)

      // Log the action
      await this.auditService.log(
        administratorId,
        'Charge',
        chargeId,
        'ChargeCancelled',
        {
          metadata: {
            studentId: charge.studentId,
            reason,
          },
        }
      )

      return {
        success: true,
        data: cancelled,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'CHARGE_ERROR',
        error instanceof Error ? error.message : 'Failed to cancel charge'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    const className = this.constructor.name

    if (level === 'info') {
      console.log(`[${timestamp}] [${className}] ${message}`, data)
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] [${className}] ${message}`, data)
    } else {
      console.error(`[${timestamp}] [${className}] ${message}`, data)
    }
  }
}
