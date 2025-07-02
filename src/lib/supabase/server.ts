import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side Supabase client for use in API routes and server components
// This runs on the server and reads auth state from cookies

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get the current user on the server
export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      // Don't log session missing errors as they're expected when not logged in
      if (error.message !== 'Auth session missing!') {
        console.error('Error getting user:', error)
      }
      return null
    }

    return user
  } catch (error) {
    // Handle any unexpected errors gracefully
    console.error('Unexpected error getting user:', error)
    return null
  }
}