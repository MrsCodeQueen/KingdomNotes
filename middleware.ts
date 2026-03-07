// Minimal pass-through middleware - no external dependencies
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // Simply pass through all requests
  // Authentication is handled client-side by Supabase Auth
  // and enforced at the database level via Row Level Security (RLS)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
