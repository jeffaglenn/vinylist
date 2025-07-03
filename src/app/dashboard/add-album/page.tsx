import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ManualAlbumForm from '@/components/albums/ManualAlbumForm'

export default async function AddAlbumPage() {
  // Check if user is authenticated (server-side)
  const user = await getUser()

  if (!user) {
    // User not authenticated, redirect to login
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📀 Add Album
              </h1>
              <p className="text-sm text-gray-600">
                Add a new vinyl record to your collection
              </p>
            </div>
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ManualAlbumForm />
        </div>
      </main>
    </div>
  )
}

// Add metadata
export const metadata = {
  title: 'Add Album | Vinylist',
  description: 'Add a new vinyl record to your collection',
}