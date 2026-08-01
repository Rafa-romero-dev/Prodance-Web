import { config } from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as crypto from 'crypto'

// Load environment variables from .env.local
config({ path: resolve('.env.local') })

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.receiptAllocation.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.charge.deleteMany()
  await prisma.recovery.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.scheduleVersion.deleteMany()
  await prisma.class.deleteMany()
  await prisma.studentCycle.deleteMany()
  await prisma.student.deleteMany()
  await prisma.administrator.deleteMany()

  // Create administrators
  const admin = await prisma.administrator.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@prodance.com',
      phone: '555-0001',
      passwordHash: hashPassword('admin123'),
      isActive: true,
    },
  })

  const teacher = await prisma.administrator.create({
    data: {
      firstName: 'Teacher',
      lastName: 'User',
      email: 'teacher@prodance.com',
      phone: '555-0002',
      passwordHash: hashPassword('teacher123'),
      isActive: true,
    },
  })

  console.log('✓ Created 2 administrators')

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '555-1001',
        status: 'ACTIVE',
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phone: '555-1002',
        status: 'ACTIVE',
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol@example.com',
        phone: '555-1003',
        status: 'ACTIVE',
      },
    }),
    prisma.student.create({
      data: {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david@example.com',
        phone: '555-1004',
        status: 'ACTIVE',
      },
    }),
  ])

  console.log('✓ Created 4 students')

  // Create student cycles
  const currentYear = new Date().getFullYear()
  const startDate = new Date(currentYear, 0, 1)
  const endDate = new Date(currentYear, 11, 31)

  const cycles = await Promise.all(
    students.map((student) =>
      prisma.studentCycle.create({
        data: {
          studentId: student.id,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      })
    )
  )

  console.log('✓ Created 4 student cycles')

  // Create classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Ballet Level 1',
        type: 'REGULAR',
        level: '1',
        capacity: 20,
        status: 'ACTIVE',
        administratorId: admin.id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Ballet Level 2',
        type: 'REGULAR',
        level: '2',
        capacity: 20,
        status: 'ACTIVE',
        administratorId: admin.id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Contemporary Dance',
        type: 'COMPLEMENTARY',
        level: '1',
        capacity: 25,
        status: 'ACTIVE',
        administratorId: admin.id,
      },
    }),
    prisma.class.create({
      data: {
        name: 'Jazz Dance',
        type: 'COMPLEMENTARY',
        level: '2',
        capacity: 25,
        status: 'ACTIVE',
        administratorId: admin.id,
      },
    }),
  ])

  console.log('✓ Created 4 classes')

  // Create schedule versions
  await Promise.all(
    classes.map((cls, idx) =>
      prisma.scheduleVersion.create({
        data: {
          classId: cls.id,
          weekday: ['Monday', 'Wednesday', 'Tuesday', 'Thursday'][idx],
          startTime: '10:00',
          endTime: '11:30',
          effectiveFrom: new Date(),
          isCurrent: true,
        },
      })
    )
  )

  console.log('✓ Created 4 schedule versions')

  // Create enrollments
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        studentCycleId: cycles[0].id,
        classId: classes[0].id,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        studentCycleId: cycles[0].id,
        classId: classes[2].id,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[1].id,
        studentCycleId: cycles[1].id,
        classId: classes[1].id,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[2].id,
        studentCycleId: cycles[2].id,
        classId: classes[0].id,
        status: 'ACTIVE',
        createdById: admin.id,
      },
    }),
  ])

  console.log('✓ Created 4 enrollments')

  // Create charges
  const charges = await Promise.all([
    prisma.charge.create({
      data: {
        studentId: students[0].id,
        enrollmentId: enrollments[0].id,
        type: 'ENROLLMENT',
        status: 'PENDING',
        description: 'Enrollment charge for Ballet Level 1',
        amount: 1500,
        remainingAmount: 1500,
        createdById: admin.id,
      },
    }),
    prisma.charge.create({
      data: {
        studentId: students[0].id,
        type: 'MONTHLY',
        status: 'PENDING',
        description: 'Monthly tuition for 2 active classes',
        amount: 2000,
        remainingAmount: 2000,
        createdById: admin.id,
      },
    }),
    prisma.charge.create({
      data: {
        studentId: students[1].id,
        enrollmentId: enrollments[2].id,
        type: 'ENROLLMENT',
        status: 'PARTIALLY_PAID',
        description: 'Enrollment charge for Ballet Level 2',
        amount: 1500,
        remainingAmount: 750,
        createdById: admin.id,
      },
    }),
    prisma.charge.create({
      data: {
        studentId: students[2].id,
        type: 'MONTHLY',
        status: 'PENDING',
        description: 'Monthly tuition for 1 active class',
        amount: 1500,
        remainingAmount: 1500,
        createdById: admin.id,
      },
    }),
  ])

  console.log('✓ Created 4 charges')

  // Create receipts
  const receipts = await Promise.all([
    prisma.receipt.create({
      data: {
        studentId: students[0].id,
        billingMonth: '2026-08',
        amount: 2000,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x300?text=Receipt+1',
        status: 'APPROVED',
        bank: 'Bank of America',
        referenceNumber: 'TXN-001',
        uploadedAt: new Date(),
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    }),
    prisma.receipt.create({
      data: {
        studentId: students[1].id,
        billingMonth: '2026-08',
        amount: 1000,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x300?text=Receipt+2',
        status: 'PENDING',
        bank: 'Chase Bank',
        referenceNumber: 'TXN-002',
        uploadedAt: new Date(),
      },
    }),
    prisma.receipt.create({
      data: {
        studentId: students[2].id,
        billingMonth: '2026-08',
        amount: 1500,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x300?text=Receipt+3',
        status: 'APPROVED',
        bank: 'Wells Fargo',
        referenceNumber: 'TXN-003',
        uploadedAt: new Date(),
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
    }),
  ])

  console.log('✓ Created 3 receipts')

  // Create receipt allocations
  await prisma.receiptAllocation.create({
    data: {
      receiptId: receipts[0].id,
      chargeId: charges[1].id,
      allocatedAmount: 1500,
      allocatedById: admin.id,
    },
  })

  console.log('✓ Created receipt allocations')

  // Create attendance sessions
  const today = new Date()
  const sessionDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)

  const sessions = await Promise.all([
    prisma.attendanceSession.create({
      data: {
        classId: classes[0].id,
        scheduleVersionId: (
          await prisma.scheduleVersion.findFirst({ where: { classId: classes[0].id } })
        )!.id,
        sessionDate,
        status: 'CLOSED',
        createdById: teacher.id,
      },
    }),
    prisma.attendanceSession.create({
      data: {
        classId: classes[1].id,
        scheduleVersionId: (
          await prisma.scheduleVersion.findFirst({ where: { classId: classes[1].id } })
        )!.id,
        sessionDate: new Date(sessionDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'CLOSED',
        createdById: teacher.id,
      },
    }),
  ])

  console.log('✓ Created 2 attendance sessions')

  // Create attendance records
  await Promise.all([
    prisma.attendance.create({
      data: {
        attendanceSessionId: sessions[0].id,
        enrollmentId: enrollments[0].id,
        status: 'PRESENT',
        registeredById: teacher.id,
      },
    }),
    prisma.attendance.create({
      data: {
        attendanceSessionId: sessions[0].id,
        enrollmentId: enrollments[2].id,
        status: 'ABSENT',
        registeredById: teacher.id,
      },
    }),
    prisma.attendance.create({
      data: {
        attendanceSessionId: sessions[1].id,
        enrollmentId: enrollments[2].id,
        status: 'PRESENT',
        registeredById: teacher.id,
      },
    }),
  ])

  console.log('✓ Created 3 attendance records')

  // Create recoveries
  await prisma.recovery.create({
    data: {
      enrollmentId: enrollments[2].id,
      status: 'READY_TO_SCHEDULE',
      chargeId: charges[2].id,
      teacherId: teacher.id,
    },
  })

  console.log('✓ Created 1 recovery')

  console.log('\n✅ Database seed completed successfully!')
  console.log('\nSeed data summary:')
  console.log('- Administrators: 2')
  console.log('- Students: 4')
  console.log('- Classes: 4')
  console.log('- Enrollments: 4')
  console.log('- Charges: 4 (1 PENDING, 1 PARTIALLY_PAID, 2 PENDING)')
  console.log('- Receipts: 3 (2 APPROVED, 1 PENDING)')
  console.log('- Attendance Records: 3')
  console.log('- Recoveries: 1 (READY_TO_SCHEDULE)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
