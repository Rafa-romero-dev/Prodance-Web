import { testDb } from './db'

let counter = 0
function unique(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export async function createTestAdministrator(overrides?: { email?: string }) {
  return testDb.administrator.create({
    data: {
      firstName: 'Test',
      lastName: 'Admin',
      email: overrides?.email ?? `${unique('admin')}@example.com`,
      passwordHash: 'test-hash',
      isActive: true,
    },
  })
}

export async function createTestStudent(overrides?: { email?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
  return testDb.student.create({
    data: {
      firstName: 'Test',
      lastName: 'Student',
      email: overrides?.email ?? `${unique('student')}@example.com`,
      phone: '555-0000',
      status: overrides?.status ?? 'ACTIVE',
    },
  })
}

export async function createTestStudentCycle(studentId: string) {
  return testDb.studentCycle.create({
    data: {
      studentId,
      status: 'ACTIVE',
      startDate: new Date(),
    },
  })
}

export async function createTestClass(
  administratorId: string,
  overrides?: { type?: 'REGULAR' | 'COMPLEMENTARY'; name?: string; capacity?: number }
) {
  return testDb.class.create({
    data: {
      name: overrides?.name ?? unique('Class'),
      type: overrides?.type ?? 'REGULAR',
      level: '1',
      capacity: overrides?.capacity ?? 20,
      status: 'ACTIVE',
      administratorId,
    },
  })
}
