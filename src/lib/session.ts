import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, type UserRole } from './auth'

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: session.user.role,
  }
}

export async function requireAdministrator(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMINISTRATOR') {
    throw new UnauthorizedError()
  }
  return user
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

// Administrators may view/act on any student's data. Students may only
// access their own — this is the ownership check for self-service routes
// (charges, billing summary, enrollments, attendance, receipt upload).
export async function requireStudentAccess(requestedStudentId: string): Promise<CurrentUser> {
  const user = await requireUser()
  if (user.role === 'STUDENT' && user.id !== requestedStudentId) {
    throw new UnauthorizedError()
  }
  return user
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
