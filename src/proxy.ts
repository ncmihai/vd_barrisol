import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.startsWith('/en') ? 'en' : 'ro'
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-vd-locale', locale)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next|api|admin|favicon.ico).*)'],
}
