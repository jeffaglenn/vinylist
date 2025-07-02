import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          🎵 Vinyl Tracker
        </h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Start tracking your vinyl collection today
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
}

// Optional: Add metadata for better SEO
export const metadata = {
  title: 'Create Account | Vinyl Tracker',
  description: 'Create your vinyl collection tracker account',
} 