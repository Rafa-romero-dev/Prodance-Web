import { describe, it, expect, beforeEach } from 'vitest'
import { ReceiptService } from './receiptService'
import { ReceiptRepository } from '../repositories/receiptRepository'
import { AllocationService } from './allocationService'
import { resetDb, testDb } from '@/test/db'
import { createTestAdministrator, createTestStudent } from '@/test/fixtures'

describe('ReceiptService.approveReceipt / rejectReceipt', () => {
  let receiptService: ReceiptService
  let administratorId: string
  let studentId: string

  beforeEach(async () => {
    await resetDb()
    receiptService = new ReceiptService(new ReceiptRepository())
    administratorId = (await createTestAdministrator()).id
    studentId = (await createTestStudent()).id
  })

  async function createPendingReceipt(amount = 2000) {
    return testDb.receipt.create({
      data: {
        studentId,
        billingMonth: '2026-08',
        amount,
        currency: 'USD',
        imageUrl: 'https://example.com/receipt.png',
        status: 'PENDING',
      },
    })
  }

  it('should_approve_a_pending_receipt', async () => {
    const receipt = await createPendingReceipt()
    const result = await receiptService.approveReceipt(receipt.id, administratorId)

    expect(result.success).toBe(true)
    expect(result.data!.status).toBe('APPROVED')
  })

  it('should_reject_approving_a_receipt_twice', async () => {
    const receipt = await createPendingReceipt()
    await receiptService.approveReceipt(receipt.id, administratorId)
    const second = await receiptService.approveReceipt(receipt.id, administratorId)

    expect(second.success).toBe(false)
    if (second.success) return
    expect((second.error as { code?: string }).code).toBe('RECEIPT_INVALID_STATE')
  })

  it('should_reject_a_pending_receipt_with_a_reason', async () => {
    const receipt = await createPendingReceipt()
    const result = await receiptService.rejectReceipt(receipt.id, 'Illegible image', administratorId)

    expect(result.success).toBe(true)
    expect(result.data!.status).toBe('REJECTED')
  })
})

describe('AllocationService.allocatePayment', () => {
  let allocationService: AllocationService
  let receiptService: ReceiptService
  let administratorId: string
  let studentId: string

  beforeEach(async () => {
    await resetDb()
    allocationService = new AllocationService()
    receiptService = new ReceiptService(new ReceiptRepository())
    administratorId = (await createTestAdministrator()).id
    studentId = (await createTestStudent()).id
  })

  async function createApprovedReceipt(amount: number) {
    const receipt = await testDb.receipt.create({
      data: {
        studentId,
        billingMonth: '2026-08',
        amount,
        currency: 'USD',
        imageUrl: 'https://example.com/receipt.png',
        status: 'PENDING',
      },
    })
    await receiptService.approveReceipt(receipt.id, administratorId)
    return receipt
  }

  async function createCharge(amount: number) {
    return testDb.charge.create({
      data: {
        studentId,
        type: 'MONTHLY',
        status: 'PENDING',
        description: 'Monthly tuition',
        amount,
        remainingAmount: amount,
        createdById: administratorId,
      },
    })
  }

  it('should_partially_pay_a_charge_and_leave_it_partially_paid', async () => {
    const receipt = await createApprovedReceipt(2000)
    const charge = await createCharge(3000)

    const result = await allocationService.allocatePayment(receipt.id, charge.id, 1000, administratorId)

    expect(result.success).toBe(true)

    const updatedCharge = await testDb.charge.findUniqueOrThrow({ where: { id: charge.id } })
    expect(updatedCharge.status).toBe('PARTIALLY_PAID')
    expect(updatedCharge.remainingAmount).toBe(2000)
  })

  it('should_mark_the_charge_paid_when_allocation_covers_the_full_remaining_balance', async () => {
    const receipt = await createApprovedReceipt(1500)
    const charge = await createCharge(1500)

    const result = await allocationService.allocatePayment(receipt.id, charge.id, 1500, administratorId)

    expect(result.success).toBe(true)
    const updatedCharge = await testDb.charge.findUniqueOrThrow({ where: { id: charge.id } })
    expect(updatedCharge.status).toBe('PAID')
    expect(updatedCharge.remainingAmount).toBe(0)
    expect(updatedCharge.paidAt).not.toBeNull()
  })

  it('should_reject_allocating_from_a_receipt_that_is_not_approved', async () => {
    const pendingReceipt = await testDb.receipt.create({
      data: {
        studentId,
        billingMonth: '2026-08',
        amount: 2000,
        currency: 'USD',
        imageUrl: 'https://example.com/receipt.png',
        status: 'PENDING',
      },
    })
    const charge = await createCharge(2000)

    const result = await allocationService.allocatePayment(
      pendingReceipt.id,
      charge.id,
      1000,
      administratorId
    )

    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('RECEIPT_NOT_APPROVED')
  })

  it('should_reject_an_allocation_exceeding_the_charge_remaining_balance', async () => {
    const receipt = await createApprovedReceipt(5000)
    const charge = await createCharge(1000)

    const result = await allocationService.allocatePayment(receipt.id, charge.id, 2000, administratorId)

    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('INVALID_ALLOCATION_AMOUNT')
  })

  it('should_reject_an_allocation_exceeding_the_receipt_balance', async () => {
    const receipt = await createApprovedReceipt(500)
    const charge = await createCharge(5000)

    const result = await allocationService.allocatePayment(receipt.id, charge.id, 1000, administratorId)

    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('INVALID_ALLOCATION_AMOUNT')
  })

  it('should_account_for_prior_allocations_against_the_same_receipt', async () => {
    const receipt = await createApprovedReceipt(2000)
    const chargeA = await createCharge(1200)
    const chargeB = await createCharge(1200)

    const first = await allocationService.allocatePayment(receipt.id, chargeA.id, 1200, administratorId)
    expect(first.success).toBe(true)

    // Only 800 left on the receipt; asking for 1200 against chargeB should fail.
    const second = await allocationService.allocatePayment(receipt.id, chargeB.id, 1200, administratorId)
    expect(second.success).toBe(false)

    // But 800 should succeed.
    const third = await allocationService.allocatePayment(receipt.id, chargeB.id, 800, administratorId)
    expect(third.success).toBe(true)
  })
})
