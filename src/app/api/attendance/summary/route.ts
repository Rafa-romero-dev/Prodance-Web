import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudentAccess, isUnauthorizedError, unauthorizedResponse } from '@/lib/session'

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

    await requireStudentAccess(studentId)

    // Get all attendance sessions for student
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        attendances: {
          some: {
            enrollment: {
              studentId,
            },
          },
        },
      },
      include: {
        class: true,
        attendances: {
          where: {
            enrollment: {
              studentId,
            },
          },
          include: {
            enrollment: true,
          },
        },
      },
      orderBy: { sessionDate: 'desc' },
    })

    // Count attendance stats
    let totalSessions = 0
    let presentCount = 0
    let absentCount = 0
    let absenceRate = 0

    const byClass: Record<string, any> = {}

    sessions.forEach((session) => {
      session.attendances.forEach((attendance) => {
        totalSessions++
        if (attendance.status === 'PRESENT') {
          presentCount++
        } else if (attendance.status === 'ABSENT') {
          absentCount++
        }

        // Group by class
        const classId = session.classId
        if (!byClass[classId]) {
          byClass[classId] = {
            className: session.class.name,
            total: 0,
            present: 0,
            absent: 0,
          }
        }
        byClass[classId].total++
        if (attendance.status === 'PRESENT') {
          byClass[classId].present++
        } else if (attendance.status === 'ABSENT') {
          byClass[classId].absent++
        }
      })
    })

    if (totalSessions > 0) {
      absenceRate = Math.round((absentCount / totalSessions) * 100)
    }

    // Get active recoveries (triggered by consecutive absences)
    const recoveries = await prisma.recovery.findMany({
      where: {
        enrollment: {
          studentId,
        },
        status: { in: ['READY_TO_SCHEDULE', 'COMPLETED'] },
      },
      orderBy: { generatedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        presentCount,
        absentCount,
        absenceRate,
        activeRecoveries: recoveries.filter((r) => r.status === 'READY_TO_SCHEDULE').length,
        completedRecoveries: recoveries.filter((r) => r.status === 'COMPLETED').length,
        recentSessions: sessions.slice(0, 10),
        byClass: Object.values(byClass),
      },
    })
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse()
    console.error('Error fetching attendance summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
