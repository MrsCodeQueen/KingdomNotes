import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage.
 * Always creates a fresh client to ensure proper cookie handling.
 */
export async function createClient() {
  const cookieStore = await cookies()
  
  // Get auth token from cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const authCookieName = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const authCookie = cookieStore.get(authCookieName)?.value
  
  // Parse auth data from cookie if it exists
  let accessToken: string | undefined
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie)
      accessToken = parsed.access_token || parsed[0]
    } catch {
      // Cookie might be a direct token
      accessToken = authCookie
    }
  }

  const client = createSupabaseClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: accessToken ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      } : undefined,
    }
  )

  return client
}
