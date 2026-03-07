// Simple pass-through middleware - NO @supabase/ssr dependency
// Authentication is handled client-side via Supabase Auth and RLS policies
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simply pass the request through
  // Auth is enforced by Supabase RLS policies at the database level
  return NextResponse.next()
}
