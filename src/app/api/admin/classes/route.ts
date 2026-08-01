import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 500,
    })

    const formatted = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      type: cls.type,
      level: cls.level,
      capacity: cls.capacity,
      enrollmentCount: cls._count.enrollments,
      availableSpots: cls.capacity - cls._count.enrollments,
      status: cls.status,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
