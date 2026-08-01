import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { status: 'APPROVED' },
      include: {
        allocations: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Calculate remaining balance for each receipt
    const receiptsWithBalance = receipts.map((receipt) => {
      const allocatedAmount = receipt.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
      const remainingBalance = receipt.amount - allocatedAmount
      return {
        id: receipt.id,
        studentId: receipt.studentId,
        billingMonth: receipt.billingMonth,
        amount: receipt.amount,
        remainingBalance,
        status: receipt.status,
        uploadedAt: receipt.uploadedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: receiptsWithBalance,
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
