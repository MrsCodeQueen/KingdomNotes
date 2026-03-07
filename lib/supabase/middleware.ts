import { NextResponse, type NextRequest } from 'next/server'

// Simplified middleware - auth is handled via Supabase client-side and RLS
export async function updateSession(request: NextRequest) {
  return NextResponse.next()
}
