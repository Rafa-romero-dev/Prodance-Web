import { NextRequest, NextResponse } from 'next/server'
import { ChargeService } from '@/modules/finance'
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

    const chargeService = new ChargeService()
    const result = await chargeService.getPendingChargesForStudent(studentId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse()
    console.error('Error fetching charges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
