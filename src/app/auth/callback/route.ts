import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Handle authentication callbacks (email confirmation, OAuth, etc.)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // Supabase sends type for password reset
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Check if this is a password reset flow
        if (type === 'recovery') {
          // Password reset - redirect to reset password page with tokens
          const accessToken = searchParams.get('access_token')
          const refreshToken = searchParams.get('refresh_token')
          const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}`
          
          const forwardedHost = request.headers.get('x-forwarded-host')
          const isLocalEnv = process.env.NODE_ENV === 'development'
          
          if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${resetUrl}`)
          } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${resetUrl}`)
          } else {
            return NextResponse.redirect(`${origin}${resetUrl}`)
          }
        }
        
        // Normal login/signup - redirect to dashboard or specified page
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          // Local development
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          // Production deployment  
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          // Fallback
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // If no code or error occurred, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}

// Optional: Handle other HTTP methods
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 