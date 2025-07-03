import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'
import AlbumStats from '@/components/dashboard/AlbumStats'

export default async function DashboardPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">
              🎵 My Vinyl Collection
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to Your Collection Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                This is where you'll manage your vinyl collection. You can add new albums, 
                view your existing collection, and track the condition of your records.
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Add New Album</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Manually add albums to your collection with photo upload
                  </p>
                  <a 
                    href="/dashboard/add-album"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                  >
                    Add Album
                  </a>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">View Collection</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Browse and manage your existing vinyl records
                  </p>
                  <a 
                    href="/dashboard/collection"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors inline-block"
                  >
                    View Collection
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Collection Stats
              </h3>
              <AlbumStats />
              <p className="text-center text-gray-500 text-sm mt-4">
                Start adding albums to see your collection grow!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Add metadata
export const metadata = {
  title: 'Dashboard | Vinylist',
  description: 'Manage your vinyl collection dashboard',
} 