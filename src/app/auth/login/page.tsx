import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          🎵 Vinylist
        </h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Track your vinyl collection with ease
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}

// Optional: Add metadata for better SEO
export const metadata = {
  title: 'Sign In | Vinylist',
  description: 'Sign in to your Vinylist account',
} 