import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import EditAlbumForm from '@/components/albums/EditAlbumForm'

interface EditAlbumPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAlbumPage({ params }: EditAlbumPageProps) {
  // Check if user is authenticated (server-side)
  const user = await getUser()

  if (!user) {
    // User not authenticated, redirect to login
    redirect('/auth/login')
  }

  // Get the album ID from params
  const { id: albumId } = await params

  // Create Supabase client for server-side data fetching
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Fetch the album data
  const { data: album, error } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .eq('user_id', user.id) // Ensure user owns this album
    .eq('is_active', true)
    .single()

  if (error || !album) {
    // Album not found or user doesn't have permission
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ✏️ Edit Album
              </h1>
              <p className="text-sm text-gray-600">
                Update "{album.album_title}" by {album.artist}
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
          <EditAlbumForm album={album} />
        </div>
      </main>
    </div>
  )
}

// Add metadata
export const metadata = {
  title: 'Edit Album | Vinylist',
  description: 'Edit your vinyl record details',
} 