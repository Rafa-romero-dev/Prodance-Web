import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const charges = await prisma.charge.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      include: {
        student: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const formatted = charges.map((charge) => ({
      id: charge.id,
      studentId: charge.studentId,
      studentName: `${charge.student.firstName} ${charge.student.lastName}`,
      type: charge.type,
      description: charge.description,
      amount: charge.amount,
      remainingAmount: charge.remainingAmount,
      status: charge.status,
      createdAt: charge.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching charges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
