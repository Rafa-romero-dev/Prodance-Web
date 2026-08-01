import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, administratorId } = body

    // Validate required fields
    if (!studentId || !classId || !administratorId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, classId, administratorId' },
        { status: 400 }
      )
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Verify class exists and is active
    const classData = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    if (classData.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Class is not active' },
        { status: 400 }
      )
    }

    // Get or create current student cycle
    const currentYear = new Date().getFullYear()
    let studentCycle = await prisma.studentCycle.findFirst({
      where: {
        studentId,
        year: currentYear,
      },
    })

    if (!studentCycle) {
      studentCycle = await prisma.studentCycle.create({
        data: {
          studentId,
          year: currentYear,
          status: 'ACTIVE',
        },
      })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        studentCycleId: studentCycle.id,
        classId,
        status: 'ACTIVE',
        startDate: new Date(),
        createdById: administratorId,
      },
      include: {
        class: true,
      },
    })

    // Generate MONTHLY charge for the enrollment
    const activeEnrollmentCount = await prisma.enrollment.count({
      where: {
        studentId,
        status: 'ACTIVE',
      },
    })

    // Calculate price: $15 base + $5 per additional class
    const chargeAmount = 1500 + (Math.max(0, activeEnrollmentCount - 1) * 500)

    const charge = await prisma.charge.create({
      data: {
        studentId,
        enrollmentId: enrollment.id,
        type: 'ENROLLMENT',
        status: 'PENDING',
        description: `Enrollment charge for ${enrollment.class.name}`,
        amount: chargeAmount,
        remainingAmount: chargeAmount,
        createdById: administratorId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          enrollmentId: enrollment.id,
          studentId: enrollment.studentId,
          className: enrollment.class.name,
          status: enrollment.status,
          chargeId: charge.id,
          chargeAmount: charge.amount / 100,
          createdAt: enrollment.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
