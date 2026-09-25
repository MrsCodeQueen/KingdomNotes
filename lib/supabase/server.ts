import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage (Route Handlers / Server Components).
 * Uses @supabase/ssr with the Next.js cookies() adapter so it correctly decodes the
 * `base64-` encoded and chunked `sb-<ref>-auth-token` cookies written by the browser client.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies during render; safe to ignore.
            // Token refresh persistence for Server Components would need a proxy/middleware.
          }
        },
      },
    }
  )
}
