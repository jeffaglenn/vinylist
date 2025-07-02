import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
    
    // Successfully logged out, redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// Also handle GET requests (in case someone visits the URL directly)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
} 