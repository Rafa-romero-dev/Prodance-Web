import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { receiptId, reason, administratorId } = body

    if (!receiptId || !reason || !administratorId) {
      return NextResponse.json(
        { error: 'Missing required fields: receiptId, reason, administratorId' },
        { status: 400 }
      )
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }

    if (receipt.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending receipts can be rejected' },
        { status: 400 }
      )
    }

    const rejected = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: 'REJECTED',
        notes: reason,
        reviewedAt: new Date(),
        reviewedById: administratorId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: rejected.id,
          status: rejected.status,
          reason,
          reviewedAt: rejected.reviewedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error rejecting receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
