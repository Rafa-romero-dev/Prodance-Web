import type { ServiceResult } from '@/types'
import { BusinessRuleError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { prisma } from '@/lib/prisma'
import {
  validateAllocationAmount,
  calculateBalancesAfterAllocation,
} from '../utils/allocationValidator'
import type { ReceiptAllocationDTO } from '../types'

export class AllocationService {
  private db = prisma
  private auditService = getAuditService()

  /**
   * Allocate payment from receipt to charge
   * Business Rule: Payments are allocated after receipt approval
   * Creates allocation record and updates both receipt and charge balances
   */
  async allocatePayment(
    receiptId: string,
    chargeId: string,
    allocationAmount: number,
    administratorId: string
  ): Promise<ServiceResult<ReceiptAllocationDTO>> {
    try {
      // Get receipt and charge to validate
      const receipt = await this.db.receipt.findUnique({
        where: { id: receiptId },
      })

      if (!receipt) {
        throw new BusinessRuleError('RECEIPT_NOT_FOUND', 'Receipt not found', { receiptId })
      }

      if (receipt.status !== 'APPROVED') {
        throw new BusinessRuleError(
          'RECEIPT_NOT_APPROVED',
          'Receipt must be approved before allocation',
          { receiptId, currentStatus: receipt.status }
        )
      }

      const charge = await this.db.charge.findUnique({
        where: { id: chargeId },
      })

      if (!charge) {
        throw new BusinessRuleError('CHARGE_NOT_FOUND', 'Charge not found', { chargeId })
      }

      if (charge.status === 'CANCELLED') {
        throw new BusinessRuleError(
          'CHARGE_CANCELLED',
          'Cannot allocate to cancelled charge',
          { chargeId }
        )
      }

      // Calculate current receipt balance
      const existingAllocations = await this.db.receiptAllocation.aggregate({
        where: { receiptId },
        _sum: { allocatedAmount: true },
      })

      const receiptBalance = receipt.amount - (existingAllocations._sum.allocatedAmount || 0)

      // Validate allocation
      const validation = validateAllocationAmount(
        allocationAmount,
        receiptBalance,
        charge.remainingAmount
      )

      if (!validation.valid) {
        throw new BusinessRuleError(
          'INVALID_ALLOCATION_AMOUNT',
          validation.error || 'Invalid allocation amount'
        )
      }

      // Calculate new balances
      const balances = calculateBalancesAfterAllocation(
        allocationAmount,
        receiptBalance,
        charge.remainingAmount
      )

      // Create allocation record and update charge
      const allocation = await this.db.$transaction(async (tx) => {
        // Create allocation record
        const newAllocation = await tx.receiptAllocation.create({
          data: {
            receiptId,
            chargeId,
            allocatedAmount: allocationAmount,
            allocatedById: administratorId,
            notes: null,
          },
        })

        // Update charge remaining amount and status
        let chargeNewStatus = charge.status as string
        if (balances.chargeWillBePaid) {
          chargeNewStatus = 'PAID'
        } else if (balances.chargeNewBalance < charge.amount) {
          chargeNewStatus = 'PARTIALLY_PAID'
        }

        await tx.charge.update({
          where: { id: chargeId },
          data: {
            remainingAmount: balances.chargeNewBalance,
            status: chargeNewStatus as any,
            paidAt: balances.chargeWillBePaid ? new Date() : null,
            updatedAt: new Date(),
          },
        })

        return newAllocation
      })

      // Log the action
      await this.auditService.log(administratorId, 'ReceiptAllocation', allocation.id, 'ReceiptAllocationCreated', {
        metadata: {
          receiptId,
          chargeId,
          allocationAmount,
          chargeNowPaid: balances.chargeWillBePaid,
        },
      })

      const dto: ReceiptAllocationDTO = {
        id: allocation.id,
        receiptId: allocation.receiptId,
        chargeId: allocation.chargeId,
        allocatedAmount: allocation.allocatedAmount,
        allocatedById: allocation.allocatedById,
        notes: allocation.notes,
        createdAt: allocation.createdAt,
      }

      return {
        success: true,
        data: dto,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'ALLOCATION_ERROR',
        error instanceof Error ? error.message : 'Failed to allocate payment'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get allocation by ID
   */
  async getAllocationById(allocationId: string): Promise<ServiceResult<ReceiptAllocationDTO>> {
    try {
      const allocation = await this.db.receiptAllocation.findUnique({
        where: { id: allocationId },
      })

      if (!allocation) {
        throw new BusinessRuleError(
          'ALLOCATION_NOT_FOUND',
          'Allocation not found',
          { allocationId }
        )
      }

      const dto: ReceiptAllocationDTO = {
        id: allocation.id,
        receiptId: allocation.receiptId,
        chargeId: allocation.chargeId,
        allocatedAmount: allocation.allocatedAmount,
        allocatedById: allocation.allocatedById,
        notes: allocation.notes,
        createdAt: allocation.createdAt,
      }

      return {
        success: true,
        data: dto,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'ALLOCATION_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch allocation'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get allocations for a receipt
   */
  async getAllocationsForReceipt(receiptId: string): Promise<ServiceResult<ReceiptAllocationDTO[]>> {
    try {
      const allocations = await this.db.receiptAllocation.findMany({
        where: { receiptId },
        orderBy: { createdAt: 'desc' },
      })

      const dtos: ReceiptAllocationDTO[] = allocations.map((a) => ({
        id: a.id,
        receiptId: a.receiptId,
        chargeId: a.chargeId,
        allocatedAmount: a.allocatedAmount,
        allocatedById: a.allocatedById,
        notes: a.notes,
        createdAt: a.createdAt,
      }))

      return {
        success: true,
        data: dtos,
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'ALLOCATION_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch allocations'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get allocations for a charge
   */
  async getAllocationsForCharge(chargeId: string): Promise<ServiceResult<ReceiptAllocationDTO[]>> {
    try {
      const allocations = await this.db.receiptAllocation.findMany({
        where: { chargeId },
        orderBy: { createdAt: 'desc' },
      })

      const dtos: ReceiptAllocationDTO[] = allocations.map((a) => ({
        id: a.id,
        receiptId: a.receiptId,
        chargeId: a.chargeId,
        allocatedAmount: a.allocatedAmount,
        allocatedById: a.allocatedById,
        notes: a.notes,
        createdAt: a.createdAt,
      }))

      return {
        success: true,
        data: dtos,
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'ALLOCATION_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch allocations'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }
}

export function getAllocationService(): AllocationService {
  return new AllocationService()
}
