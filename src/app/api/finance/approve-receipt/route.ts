import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdministrator, isUnauthorizedError, unauthorizedResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const administrator = await requireAdministrator()

    const body = await request.json()
    const { receiptId } = body

    if (!receiptId) {
      return NextResponse.json(
        { error: 'Missing required field: receiptId' },
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
        { error: 'Only pending receipts can be approved' },
        { status: 400 }
      )
    }

    const approved = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedById: administrator.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: approved.id,
          status: approved.status,
          reviewedAt: approved.reviewedAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse()
    console.error('Error approving receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
