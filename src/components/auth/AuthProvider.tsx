'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import supabase from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Starting auth initialization')
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('AuthProvider: Calling supabase.auth.getSession()')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('AuthProvider: getSession response:', { session, error })
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error)
        } else {
          console.log('AuthProvider: Setting user:', session?.user ?? null)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('AuthProvider: Unexpected auth error:', error)
      } finally {
        console.log('AuthProvider: Setting loading to false')
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    console.log('AuthProvider: Setting up auth state listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth event:', event, 'Session:', session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('AuthProvider: Timeout reached, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 seconds

    return () => {
      console.log('AuthProvider: Cleaning up subscription and timeout')
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const value = {
    user,
    loading,
  }

  console.log('AuthProvider: Rendering with state:', { user: !!user, loading })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 