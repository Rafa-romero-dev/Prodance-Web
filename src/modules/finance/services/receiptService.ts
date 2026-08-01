import type { ServiceResult } from '@/types'
import { BusinessRuleError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { ReceiptRepository } from '../repositories/receiptRepository'
import type { ReceiptDTO } from '../types'

export class ReceiptService {
  private repository: ReceiptRepository
  private auditService = getAuditService()

  constructor(repository?: ReceiptRepository) {
    this.repository = repository || new ReceiptRepository()
  }

  /**
   * Upload a receipt
   * Business Rule: Students upload proof of payment
   */
  async uploadReceipt(
    studentId: string,
    billingMonth: string,
    amount: number,
    imageUrl: string,
    bank?: string,
    referenceNumber?: string,
    notes?: string
  ): Promise<ServiceResult<ReceiptDTO>> {
    try {
      if (amount <= 0) {
        throw new BusinessRuleError('INVALID_RECEIPT_AMOUNT', 'Receipt amount must be positive')
      }

      const receipt = await this.repository.uploadReceipt(
        studentId,
        billingMonth,
        amount,
        imageUrl,
        bank,
        referenceNumber,
        'USD',
        notes
      )

      // Log the action
      await this.auditService.log(studentId, 'Receipt', receipt.id, 'ReceiptUploaded', {
        metadata: {
          billingMonth,
          amount,
          bank,
        },
      })

      return {
        success: true,
        data: receipt,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'RECEIPT_ERROR',
        error instanceof Error ? error.message : 'Failed to upload receipt'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Approve receipt
   * Business Rule: Admin approves, then money can be allocated
   */
  async approveReceipt(
    receiptId: string,
    administratorId: string
  ): Promise<ServiceResult<ReceiptDTO>> {
    try {
      const receipt = await this.repository.getReceiptById(receiptId)

      if (!receipt) {
        throw new BusinessRuleError('RECEIPT_NOT_FOUND', 'Receipt not found', { receiptId })
      }

      if (receipt.status !== 'PENDING') {
        throw new BusinessRuleError(
          'RECEIPT_INVALID_STATE',
          'Receipt must be pending to approve',
          { receiptId, currentStatus: receipt.status }
        )
      }

      const approved = await this.repository.approveReceipt(receiptId, administratorId)

      // Log the action
      await this.auditService.log(administratorId, 'Receipt', receiptId, 'ReceiptApproved', {
        metadata: {
          amount: receipt.amount,
        },
      })

      return {
        success: true,
        data: approved,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'RECEIPT_ERROR',
        error instanceof Error ? error.message : 'Failed to approve receipt'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Reject receipt
   * Business Rule: Admin rejects, student must resubmit
   */
  async rejectReceipt(
    receiptId: string,
    reason: string,
    administratorId: string
  ): Promise<ServiceResult<ReceiptDTO>> {
    try {
      const receipt = await this.repository.getReceiptById(receiptId)

      if (!receipt) {
        throw new BusinessRuleError('RECEIPT_NOT_FOUND', 'Receipt not found', { receiptId })
      }

      if (receipt.status !== 'PENDING') {
        throw new BusinessRuleError(
          'RECEIPT_INVALID_STATE',
          'Receipt must be pending to reject',
          { receiptId }
        )
      }

      const rejected = await this.repository.rejectReceipt(receiptId, administratorId)

      // Log the action
      await this.auditService.log(administratorId, 'Receipt', receiptId, 'ReceiptRejected', {
        metadata: {
          reason,
        },
      })

      return {
        success: true,
        data: rejected,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'RECEIPT_ERROR',
        error instanceof Error ? error.message : 'Failed to reject receipt'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get pending receipts waiting for admin review
   */
  async getPendingReceipts(): Promise<ServiceResult<ReceiptDTO[]>> {
    try {
      const receipts = await this.repository.getPendingReceipts()

      return {
        success: true,
        data: receipts,
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'RECEIPT_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch pending receipts'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }
}
