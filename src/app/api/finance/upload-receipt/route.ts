import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudentAccess, isUnauthorizedError, unauthorizedResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, billingMonth, amount, imageUrl, bank, referenceNumber, notes } = body

    // Validate required fields
    if (!studentId || !billingMonth || !amount || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, billingMonth, amount, imageUrl' },
        { status: 400 }
      )
    }

    await requireStudentAccess(studentId)

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
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

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        studentId,
        billingMonth,
        amount: Math.round(amount * 100), // Store in cents
        imageUrl,
        status: 'PENDING',
        bank: bank || null,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        uploadedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: receipt.id,
          studentId: receipt.studentId,
          billingMonth: receipt.billingMonth,
          amount: receipt.amount / 100, // Return in dollars
          status: receipt.status,
          uploadedAt: receipt.uploadedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (isUnauthorizedError(error)) return unauthorizedResponse()
    console.error('Error uploading receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
