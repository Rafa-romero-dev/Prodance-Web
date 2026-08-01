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

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            scheduleVersions: {
              where: { isCurrent: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = enrollments.map((enrollment) => ({
      id: enrollment.id,
      className: enrollment.class.name,
      classId: enrollment.class.id,
      level: enrollment.class.level,
      classType: enrollment.class.type,
      status: enrollment.status,
      startDate: enrollment.startDate,
      endDate: enrollment.endDate,
      schedule: enrollment.class.scheduleVersions[0]
        ? {
            day: enrollment.class.scheduleVersions[0].weekday,
            startTime: enrollment.class.scheduleVersions[0].startTime,
            endTime: enrollment.class.scheduleVersions[0].endTime,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
