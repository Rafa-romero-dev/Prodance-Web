import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdministrator, isUnauthorizedError, unauthorizedResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const administrator = await requireAdministrator()

    const body = await request.json()
    const { receiptId, chargeId, allocationAmount } = body

    // Validate required fields
    if (!receiptId || !chargeId || !allocationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: receiptId, chargeId, allocationAmount' },
        { status: 400 }
      )
    }

    if (allocationAmount <= 0) {
      return NextResponse.json(
        { error: 'Allocation amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get receipt
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }

    if (receipt.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Receipt must be approved before allocation' },
        { status: 400 }
      )
    }

    // Get charge
    const charge = await prisma.charge.findUnique({
      where: { id: chargeId },
    })

    if (!charge) {
      return NextResponse.json(
        { error: 'Charge not found' },
        { status: 404 }
      )
    }

    if (charge.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot allocate to cancelled charge' },
        { status: 400 }
      )
    }

    // Calculate receipt balance
    const existingAllocations = await prisma.receiptAllocation.aggregate({
      where: { receiptId },
      _sum: { allocatedAmount: true },
    })

    const receiptBalance = receipt.amount - (existingAllocations._sum.allocatedAmount || 0)
    const allocationAmountCents = Math.round(allocationAmount * 100)

    // Validate allocation amount
    if (allocationAmountCents > receiptBalance) {
      return NextResponse.json(
        { error: `Allocation amount exceeds receipt balance. Available: $${receiptBalance / 100}` },
        { status: 400 }
      )
    }

    if (allocationAmountCents > charge.remainingAmount) {
      return NextResponse.json(
        { error: `Allocation amount exceeds charge remaining balance. Available: $${charge.remainingAmount / 100}` },
        { status: 400 }
      )
    }

    // Create allocation and update charge
    const result = await prisma.$transaction(async (tx) => {
      // Create allocation
      const allocation = await tx.receiptAllocation.create({
        data: {
          receiptId,
          chargeId,
          allocatedAmount: allocationAmountCents,
          allocatedById: administrator.id,
          notes: null,
        },
      })

      // Update charge
      const newChargeBalance = charge.remainingAmount - allocationAmountCents
      let newChargeStatus = charge.status

      if (newChargeBalance === 0) {
        newChargeStatus = 'PAID'
      } else if (newChargeBalance < charge.amount) {
        newChargeStatus = 'PARTIALLY_PAID'
      }

      const updatedCharge = await tx.charge.update({
        where: { id: chargeId },
        data: {
          remainingAmount: newChargeBalance,
          status: newChargeStatus as any,
          paidAt: newChargeBalance === 0 ? new Date() : null,
          updatedAt: new Date(),
        },
      })

      return { allocation, updatedCharge }
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          allocationId: result.allocation.id,
          chargeId: result.updatedCharge.id,
          allocatedAmount: result.allocation.allocatedAmount / 100,
          chargeStatus: result.updatedCharge.status,
          chargeRemaining: result.updatedCharge.remainingAmount / 100,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse()
    console.error('Error allocating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
