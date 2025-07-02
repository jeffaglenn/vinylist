'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Success! Show confirmation message
      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-blue-600 text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Click the link in the email to reset your password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Don't see the email? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Another Email
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Reset Your Password
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
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