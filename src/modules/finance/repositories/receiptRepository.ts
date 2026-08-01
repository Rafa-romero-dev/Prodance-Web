import { BaseRepository } from '@/lib/baseRepository'
import type { ReceiptDTO } from '../types'

export class ReceiptRepository extends BaseRepository {
  /**
   * Upload a new receipt
   */
  async uploadReceipt(
    studentId: string,
    billingMonth: string,
    amount: number,
    imageUrl: string,
    bank?: string,
    referenceNumber?: string,
    currency?: string,
    notes?: string
  ): Promise<ReceiptDTO> {
    try {
      const receipt = await this.db.receipt.create({
        data: {
          studentId,
          billingMonth,
          amount,
          imageUrl,
          currency: currency || 'USD',
          bank: bank || null,
          referenceNumber: referenceNumber || null,
          status: 'PENDING',
          notes: notes || null,
        },
      })

      return this.mapToDTO(receipt)
    } catch (error) {
      this.handlePrismaError(error, 'uploadReceipt')
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(receiptId: string): Promise<ReceiptDTO | null> {
    try {
      const receipt = await this.db.receipt.findUnique({
        where: { id: receiptId },
      })

      return receipt ? this.mapToDTO(receipt) : null
    } catch (error) {
      this.handlePrismaError(error, 'getReceiptById')
    }
  }

  /**
   * Get receipts for a student
   */
  async getReceiptsForStudent(studentId: string): Promise<ReceiptDTO[]> {
    try {
      const receipts = await this.db.receipt.findMany({
        where: { studentId },
        orderBy: { uploadedAt: 'desc' },
      })

      return receipts.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getReceiptsForStudent')
    }
  }

  /**
   * Get pending receipts (waiting for admin review)
   */
  async getPendingReceipts(): Promise<ReceiptDTO[]> {
    try {
      const receipts = await this.db.receipt.findMany({
        where: { status: 'PENDING' },
        orderBy: { uploadedAt: 'asc' },
      })

      return receipts.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getPendingReceipts')
    }
  }

  /**
   * Approve receipt
   */
  async approveReceipt(receiptId: string, administratorId: string): Promise<ReceiptDTO> {
    try {
      const receipt = await this.db.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedById: administratorId,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(receipt)
    } catch (error) {
      this.handlePrismaError(error, 'approveReceipt')
    }
  }

  /**
   * Reject receipt
   */
  async rejectReceipt(receiptId: string, administratorId: string): Promise<ReceiptDTO> {
    try {
      const receipt = await this.db.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedById: administratorId,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(receipt)
    } catch (error) {
      this.handlePrismaError(error, 'rejectReceipt')
    }
  }

  /**
   * Get receipts by billing month
   */
  async getReceiptsByMonth(billingMonth: string): Promise<ReceiptDTO[]> {
    try {
      const receipts = await this.db.receipt.findMany({
        where: { billingMonth },
        orderBy: { uploadedAt: 'desc' },
      })

      return receipts.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getReceiptsByMonth')
    }
  }

  /**
   * Get approved receipts with remaining balance (for allocation)
   */
  async getApprovedReceiptsWithBalance(studentId: string): Promise<
    Array<
      ReceiptDTO & {
        allocatedAmount: number
        remainingBalance: number
      }
    >
  > {
    try {
      const receipts = await this.db.receipt.findMany({
        where: {
          studentId,
          status: 'APPROVED',
        },
        include: {
          allocations: {
            select: {
              allocatedAmount: true,
            },
          },
        },
        orderBy: { uploadedAt: 'asc' },
      })

      return receipts.map((r) => {
        const allocatedAmount = r.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
        return {
          ...this.mapToDTO(r),
          allocatedAmount,
          remainingBalance: r.amount - allocatedAmount,
        }
      })
    } catch (error) {
      this.handlePrismaError(error, 'getApprovedReceiptsWithBalance')
    }
  }

  /**
   * Private helper: Map receipt record to DTO
   */
  private mapToDTO(record: any): ReceiptDTO {
    return {
      id: record.id,
      studentId: record.studentId,
      billingMonth: record.billingMonth,
      amount: record.amount,
      currency: record.currency,
      status: record.status,
      bank: record.bank,
      referenceNumber: record.referenceNumber,
      imageUrl: record.imageUrl,
      notes: record.notes,
      uploadedAt: record.uploadedAt,
      reviewedAt: record.reviewedAt,
      reviewedById: record.reviewedById,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
