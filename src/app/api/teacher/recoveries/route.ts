import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const recoveries = await prisma.recovery.findMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'READY_TO_SCHEDULE'] },
      },
      include: {
        enrollment: {
          include: {
            student: true,
          },
        },
        charge: true,
      },
      orderBy: { generatedAt: 'desc' },
      take: 100,
    })

    const formatted = recoveries.map((recovery) => ({
      id: recovery.id,
      studentName: `${recovery.enrollment.student.firstName} ${recovery.enrollment.student.lastName}`,
      studentId: recovery.enrollment.studentId,
      enrollmentId: recovery.enrollmentId,
      status: recovery.status,
      generatedAt: recovery.generatedAt,
      charge: {
        amount: recovery.charge.amount,
        remainingAmount: recovery.charge.remainingAmount,
      },
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching recoveries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
