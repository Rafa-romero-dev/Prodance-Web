import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {

    // Get all charges
    const charges = await prisma.charge.findMany({
      include: { student: true },
    })

    // Get all receipts
    const receipts = await prisma.receipt.findMany({
      include: {
        allocations: true,
      },
    })

    // Calculate aggregate stats
    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0)
    const totalPaid = charges.reduce((sum, c) => sum + (c.amount - c.remainingAmount), 0)
    const totalOutstanding = charges.reduce((sum, c) => {
      if (c.status === 'PENDING' || c.status === 'PARTIALLY_PAID') {
        return sum + c.remainingAmount
      }
      return sum
    }, 0)

    const totalReceiptAmount = receipts.reduce((sum, r) => sum + r.amount, 0)
    const approvedReceiptAmount = receipts
      .filter((r) => r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.amount, 0)

    // Breakdown by charge type
    const chargesByType = charges.reduce(
      (acc, charge) => {
        if (!acc[charge.type]) {
          acc[charge.type] = {
            count: 0,
            total: 0,
            paid: 0,
          }
        }
        acc[charge.type].count++
        acc[charge.type].total += charge.amount
        acc[charge.type].paid += charge.amount - charge.remainingAmount
        return acc
      },
      {} as Record<string, any>
    )

    // Breakdown by charge status
    const chargesByStatus = charges.reduce(
      (acc, charge) => {
        if (!acc[charge.status]) {
          acc[charge.status] = 0
        }
        acc[charge.status]++
        return acc
      },
      {} as Record<string, number>
    )

    // Breakdown by receipt status
    const receiptsByStatus = receipts.reduce(
      (acc, receipt) => {
        if (!acc[receipt.status]) {
          acc[receipt.status] = 0
        }
        acc[receipt.status]++
        return acc
      },
      {} as Record<string, number>
    )

    // Students with outstanding balance
    const studentBalances = await prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: {
        charges: {
          where: {
            status: { in: ['PENDING', 'PARTIALLY_PAID'] },
          },
        },
      },
    })

    const studentsWithBalance = studentBalances
      .map((student) => ({
        id: student.id,
        name: student.firstName + ' ' + student.lastName,
        email: student.email,
        outstanding: student.charges.reduce((sum, c) => sum + c.remainingAmount, 0),
        chargeCount: student.charges.length,
      }))
      .filter((s) => s.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCharges,
          totalPaid,
          totalOutstanding,
          totalReceiptAmount,
          approvedReceiptAmount,
          chargeCount: charges.length,
          receiptCount: receipts.length,
        },
        chargesByType,
        chargesByStatus,
        receiptsByStatus,
        topOutstandingStudents: studentsWithBalance,
      },
    })
  } catch (error) {
    console.error('Error fetching admin billing overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
