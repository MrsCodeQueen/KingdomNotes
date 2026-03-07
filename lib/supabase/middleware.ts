import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    // Check for Supabase auth cookies
    const cookies = request.cookies
    const hasAuthToken = cookies.has('sb-access-token') || 
                         cookies.has('sb-auth-token') ||
                         cookies.has('sb-refresh-token')
    
    // Also check for combined auth cookie that Supabase may use
    const authCookie = Array.from(cookies.entries()).find(
      ([name]) => name.startsWith('sb-') && name.includes('auth')
    )
    
    const isAuthenticated = hasAuthToken || !!authCookie

    // If not authenticated and trying to access protected routes, redirect to home
    if (!isAuthenticated && request.nextUrl.pathname.startsWith('/game')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  } catch (error) {
    // On error, allow the request to proceed
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
