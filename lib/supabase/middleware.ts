import { NextResponse, type NextRequest } from 'next/server'

// Simplified middleware - authentication is handled by:
// 1. Supabase client-side auth hooks
// 2. RLS (Row Level Security) policies on the database
// 3. API route authentication checks
// This middleware just passes requests through
export async function updateSession(request: NextRequest) {
  // Simply return the request as-is
  // Auth is enforced at the database level via RLS
  return NextResponse.next()
}
