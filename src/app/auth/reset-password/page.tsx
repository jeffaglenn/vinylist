import { Suspense } from 'react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
} 