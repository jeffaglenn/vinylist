import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AlbumGrid from '@/components/albums/AlbumGrid'

export default async function CollectionPage() {
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
                🎵 My Collection
              </h1>
              <p className="text-sm text-gray-600">
                Your vinyl record collection
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard/add-album"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Album
              </a>
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AlbumGrid />
        </div>
      </main>
    </div>
  )
}

// Add metadata
export const metadata = {
  title: 'My Collection | Vinylist',
  description: 'View your vinyl record collection',
} 