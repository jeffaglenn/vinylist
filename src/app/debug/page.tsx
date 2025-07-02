'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export default function DebugPage() {
  const [clientSession, setClientSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check client-side session
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Client session check:', { session, error })
        setClientSession(session)
      } catch (error) {
        console.error('Client session error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🐛 Authentication Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Client-Side Session</h2>
          {clientSession ? (
            <div>
              <p className="text-green-600 font-medium">✅ Session found</p>
              <p><strong>Email:</strong> {clientSession.user?.email}</p>
              <p><strong>User ID:</strong> {clientSession.user?.id}</p>
              <p><strong>Session expires:</strong> {new Date(clientSession.expires_at * 1000).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ No session found</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Actions</h2>
          <div className="space-x-4 space-y-2">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                // Clear old localStorage auth data
                Object.keys(localStorage).forEach(key => {
                  if (key.includes('supabase') || key.includes('auth')) {
                    localStorage.removeItem(key)
                  }
                })
                // Clear all cookies
                document.cookie.split(';').forEach(cookie => {
                  const eqPos = cookie.indexOf('=')
                  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                })
                alert('Cleared all auth data! Please refresh the page.')
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear All Auth Data
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Browser Storage</h2>
          <p><strong>localStorage keys:</strong></p>
          <ul className="list-disc list-inside text-sm">
            {typeof window !== 'undefined' && Object.keys(localStorage).map(key => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 