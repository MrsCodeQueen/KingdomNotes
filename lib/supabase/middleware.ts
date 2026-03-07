// Using supabase-js directly (not @supabase/ssr) for middleware compatibility
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // For middleware, we use a simpler approach with just cookie-based auth check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get the access token from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value
  
  // Also check for the combined auth cookie that Supabase uses
  const authCookieName = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const authCookie = request.cookies.get(authCookieName)?.value

  // Check if user has any auth cookies
  const hasAuthCookies = accessToken || refreshToken || authCookie

  // Protected routes check
  if (
    (request.nextUrl.pathname.startsWith('/game') ||
      request.nextUrl.pathname.startsWith('/protected')) &&
    !hasAuthCookies
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
