import { BaseRepository } from '@/lib/baseRepository'
import type { ChargeDTO } from '../types'

export class ChargeRepository extends BaseRepository {
  /**
   * Create a new charge
   * Business Rule: Charges are immutable after creation
   */
  async createCharge(
    studentId: string,
    type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT',
    description: string,
    amount: number,
    createdById: string,
    enrollmentId?: string,
    recoveryId?: string,
    assessmentId?: string,
    dueDate?: Date
  ): Promise<ChargeDTO> {
    try {
      const charge = await this.db.charge.create({
        data: {
          studentId,
          type,
          description,
          amount,
          remainingAmount: amount,
          status: 'PENDING',
          enrollmentId: enrollmentId || null,
          recoveryId: recoveryId || null,
          assessmentId: assessmentId || null,
          dueDate: dueDate || null,
          createdById,
        },
      })

      return this.mapToDTO(charge)
    } catch (error) {
      this.handlePrismaError(error, 'createCharge')
    }
  }

  /**
   * Get charge by ID
   */
  async getChargeById(chargeId: string): Promise<ChargeDTO | null> {
    try {
      const charge = await this.db.charge.findUnique({
        where: { id: chargeId },
      })

      return charge ? this.mapToDTO(charge) : null
    } catch (error) {
      this.handlePrismaError(error, 'getChargeById')
    }
  }

  /**
   * Get charges for a student
   */
  async getChargesForStudent(studentId: string): Promise<ChargeDTO[]> {
    try {
      const charges = await this.db.charge.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      })

      return charges.map((c) => this.mapToDTO(c))
    } catch (error) {
      this.handlePrismaError(error, 'getChargesForStudent')
    }
  }

  /**
   * Get pending charges for a student
   */
  async getPendingChargesForStudent(studentId: string): Promise<ChargeDTO[]> {
    try {
      const charges = await this.db.charge.findMany({
        where: {
          studentId,
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
        orderBy: { createdAt: 'desc' },
      })

      return charges.map((c) => this.mapToDTO(c))
    } catch (error) {
      this.handlePrismaError(error, 'getPendingChargesForStudent')
    }
  }

  /**
   * Get monthly charges already created for a month
   */
  async getMonthlyChargeForMonth(
    studentId: string,
    month: string
  ): Promise<ChargeDTO | null> {
    try {
      const charge = await this.db.charge.findFirst({
        where: {
          studentId,
          type: 'MONTHLY',
          createdAt: {
            gte: new Date(`${month} 1`),
            lt: new Date(`${month} 28`), // Simple month check
          },
        },
      })

      return charge ? this.mapToDTO(charge) : null
    } catch (error) {
      this.handlePrismaError(error, 'getMonthlyChargeForMonth')
    }
  }

  /**
   * Update charge remaining amount
   */
  async updateRemainingAmount(
    chargeId: string,
    newRemainingAmount: number
  ): Promise<ChargeDTO> {
    try {
      const existingCharge = await this.db.charge.findUnique({
        where: { id: chargeId },
      })

      if (!existingCharge) {
        throw new Error('Charge not found')
      }

      let newStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' = 'PENDING'
      if (newRemainingAmount === 0) {
        newStatus = 'PAID'
      } else if (newRemainingAmount < existingCharge.amount) {
        newStatus = 'PARTIALLY_PAID'
      }

      const charge = await this.db.charge.update({
        where: { id: chargeId },
        data: {
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paidAt: newRemainingAmount === 0 ? new Date() : null,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(charge)
    } catch (error) {
      this.handlePrismaError(error, 'updateRemainingAmount')
    }
  }

  /**
   * Cancel charge
   */
  async cancelCharge(chargeId: string): Promise<ChargeDTO> {
    try {
      const charge = await this.db.charge.update({
        where: { id: chargeId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(charge)
    } catch (error) {
      this.handlePrismaError(error, 'cancelCharge')
    }
  }

  /**
   * Get charges by type
   */
  async getChargesByType(
    type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT'
  ): Promise<ChargeDTO[]> {
    try {
      const charges = await this.db.charge.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })

      return charges.map((c) => this.mapToDTO(c))
    } catch (error) {
      this.handlePrismaError(error, 'getChargesByType')
    }
  }

  /**
   * Check if charge is linked to enrollment
   */
  async getChargeForEnrollment(enrollmentId: string): Promise<ChargeDTO | null> {
    try {
      const charge = await this.db.charge.findFirst({
        where: {
          enrollmentId,
          type: 'ENROLLMENT',
        },
      })

      return charge ? this.mapToDTO(charge) : null
    } catch (error) {
      this.handlePrismaError(error, 'getChargeForEnrollment')
    }
  }

  /**
   * Private helper: Map charge record to DTO
   */
  private mapToDTO(record: any): ChargeDTO {
    return {
      id: record.id,
      studentId: record.studentId,
      enrollmentId: record.enrollmentId,
      recoveryId: record.recoveryId,
      assessmentId: record.assessmentId,
      type: record.type,
      status: record.status,
      description: record.description,
      amount: record.amount,
      remainingAmount: record.remainingAmount,
      dueDate: record.dueDate,
      paidAt: record.paidAt,
      cancelledAt: record.cancelledAt,
      createdById: record.createdById,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
