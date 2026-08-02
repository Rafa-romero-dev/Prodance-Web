import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Administrators cover teacher/finance-officer responsibilities too (single
// authentication model, see .claude/PRODUCT_DECISIONS.md Decision 002).
const ADMIN_ONLY_PREFIXES = [
  '/dashboards/admin',
  '/dashboards/teacher',
  '/dashboards/finance-officer',
  '/api/admin',
  '/api/enrollment',
  '/api/recovery',
  '/api/teacher',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith('/api/')
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isAdminOnly && token.role !== 'ADMINISTRATOR') {
    if (isApi) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboards', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboards/:path*', '/api/:path*'],
}
