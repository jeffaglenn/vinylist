'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/lib/supabase/client'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we have the proper tokens in the URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        return
      }

      // Success! Password updated
      setSuccess(true)
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Password update error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-green-600 text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Password Updated!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You'll be redirected to the login page shortly.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Set New Password
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your new password below.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters long
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm new password"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        <button
          onClick={() => router.push('/auth/login')}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Back to Login
        </button>
      </p>
    </div>
  )
} 