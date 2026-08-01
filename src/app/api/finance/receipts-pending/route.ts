import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { status: 'PENDING' },
      include: {
        student: true,
      },
      orderBy: { uploadedAt: 'desc' },
      take: 100,
    })

    const formatted = receipts.map((receipt) => ({
      id: receipt.id,
      studentName: `${receipt.student.firstName} ${receipt.student.lastName}`,
      studentId: receipt.studentId,
      billingMonth: receipt.billingMonth,
      amount: receipt.amount,
      uploadedAt: receipt.uploadedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching pending receipts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
