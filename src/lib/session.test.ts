import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getServerSession, type Session } from 'next-auth'
import type { UserRole } from './auth'
import {
  getCurrentUser,
  requireAdministrator,
  requireUser,
  requireStudentAccess,
  isUnauthorizedError,
  UnauthorizedError,
} from './session'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

const mockGetServerSession = vi.mocked(getServerSession)

function sessionFor(role: UserRole, id = 'user-1'): Session {
  return {
    user: { id, role, email: `${id}@example.com`, name: 'Test User' },
    expires: new Date(Date.now() + 60_000).toISOString(),
  }
}

beforeEach(() => {
  mockGetServerSession.mockReset()
})

describe('getCurrentUser', () => {
  it('should_return_null_when_there_is_no_session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    expect(await getCurrentUser()).toBeNull()
  })

  it('should_map_the_session_user_into_a_current_user', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('ADMINISTRATOR', 'admin-1'))
    const user = await getCurrentUser()
    expect(user).toEqual({
      id: 'admin-1',
      email: 'admin-1@example.com',
      name: 'Test User',
      role: 'ADMINISTRATOR',
    })
  })
})

describe('requireAdministrator', () => {
  it('should_return_the_user_when_role_is_administrator', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('ADMINISTRATOR'))
    const user = await requireAdministrator()
    expect(user.role).toBe('ADMINISTRATOR')
  })

  it('should_throw_unauthorized_when_role_is_student', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('STUDENT'))
    await expect(requireAdministrator()).rejects.toThrow(UnauthorizedError)
  })

  it('should_throw_unauthorized_when_there_is_no_session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(requireAdministrator()).rejects.toThrow(UnauthorizedError)
  })
})

describe('requireUser', () => {
  it('should_return_the_user_for_any_authenticated_role', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('STUDENT'))
    const user = await requireUser()
    expect(user.role).toBe('STUDENT')
  })

  it('should_throw_unauthorized_when_there_is_no_session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(requireUser()).rejects.toThrow(UnauthorizedError)
  })
})

describe('requireStudentAccess', () => {
  it('should_allow_a_student_to_access_their_own_data', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('STUDENT', 'student-1'))
    const user = await requireStudentAccess('student-1')
    expect(user.id).toBe('student-1')
  })

  it('should_block_a_student_from_accessing_another_students_data', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('STUDENT', 'student-1'))
    await expect(requireStudentAccess('student-2')).rejects.toThrow(UnauthorizedError)
  })

  it('should_allow_an_administrator_to_access_any_students_data', async () => {
    mockGetServerSession.mockResolvedValue(sessionFor('ADMINISTRATOR', 'admin-1'))
    const user = await requireStudentAccess('some-other-student')
    expect(user.role).toBe('ADMINISTRATOR')
  })

  it('should_throw_unauthorized_when_there_is_no_session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await expect(requireStudentAccess('student-1')).rejects.toThrow(UnauthorizedError)
  })
})

describe('isUnauthorizedError', () => {
  it('should_identify_an_unauthorized_error', () => {
    expect(isUnauthorizedError(new UnauthorizedError())).toBe(true)
  })

  it('should_reject_other_error_types', () => {
    expect(isUnauthorizedError(new Error('something else'))).toBe(false)
    expect(isUnauthorizedError('not even an error')).toBe(false)
  })
})
