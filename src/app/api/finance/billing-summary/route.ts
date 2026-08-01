import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      )
    }

    const charges = await prisma.charge.findMany({
      where: { studentId },
    })

    const receipts = await prisma.receipt.findMany({
      where: { studentId, status: 'APPROVED' },
    })

    // Calculate totals
    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0)
    const totalPaid = charges.reduce((sum, c) => sum + (c.amount - c.remainingAmount), 0)
    const totalPending = charges.reduce((sum, c) => {
      if (c.status === 'PENDING' || c.status === 'PARTIALLY_PAID') {
        return sum + c.remainingAmount
      }
      return sum
    }, 0)

    // Breakdown by type
    const chargesByType = charges.reduce(
      (acc, charge) => {
        if (!acc[charge.type]) {
          acc[charge.type] = {
            count: 0,
            total: 0,
            paid: 0,
            pending: 0,
          }
        }
        acc[charge.type].count++
        acc[charge.type].total += charge.amount
        acc[charge.type].paid += charge.amount - charge.remainingAmount
        acc[charge.type].pending += charge.remainingAmount
        return acc
      },
      {} as Record<string, any>
    )

    return NextResponse.json({
      success: true,
      data: {
        totalCharges,
        totalPaid,
        totalPending,
        chargeCount: charges.length,
        receiptCount: receipts.length,
        chargesByType,
        lastChargeDate: charges.length > 0
          ? new Date(Math.max(...charges.map(c => c.createdAt.getTime())))
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching billing summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
