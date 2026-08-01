import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recoveryId, administratorId } = body

    // Validate required fields
    if (!recoveryId || !administratorId) {
      return NextResponse.json(
        { error: 'Missing required fields: recoveryId, administratorId' },
        { status: 400 }
      )
    }

    // Get recovery
    const recovery = await prisma.recovery.findUnique({
      where: { id: recoveryId },
      include: {
        enrollment: true,
        charge: true,
      },
    })

    if (!recovery) {
      return NextResponse.json(
        { error: 'Recovery not found' },
        { status: 404 }
      )
    }

    if (recovery.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Recovery is already completed' },
        { status: 400 }
      )
    }

    if (recovery.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Recovery has been cancelled' },
        { status: 400 }
      )
    }

    // Update recovery to completed
    const completedRecovery = await prisma.recovery.update({
      where: { id: recoveryId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Unblock the enrollment
    await prisma.enrollment.update({
      where: { id: recovery.enrollmentId },
      data: {
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          recoveryId: completedRecovery.id,
          status: completedRecovery.status,
          completedAt: completedRecovery.completedAt,
          enrollmentUnblocked: true,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error completing recovery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
