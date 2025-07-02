'use client'

import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        // Force a hard refresh to clear all client state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Unexpected logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  )
} 