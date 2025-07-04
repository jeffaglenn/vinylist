import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let supabaseResponse = NextResponse.next()

  try {
    // Create Supabase client for API route with proper auth context
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before accessing properties
    const { id: albumId } = await params

    if (!albumId) {
      return NextResponse.json(
        { error: 'Album ID is required' },
        { status: 400 }
      )
    }

    // First, get the album to check if it exists and belongs to the user
    // Also get the cover_art_url so we can delete the image from storage
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('id, cover_art_url, user_id')
      .eq('id', albumId)
      .eq('user_id', user.id) // Ensure user owns this album
      .eq('is_active', true)
      .single()

    if (fetchError || !album) {
      return NextResponse.json(
        { error: 'Album not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // If album has cover art, delete it from storage first
    if (album.cover_art_url) {
      try {
        // Extract file path from URL
        let filePath: string
        
        console.log('Original cover_art_url:', album.cover_art_url)
        
        if (album.cover_art_url.startsWith('http')) {
          // Full URL - extract the path after '/public/album-art/'
          const url = new URL(album.cover_art_url)
          console.log('URL pathname:', url.pathname)
          
          // Supabase storage URLs look like: /storage/v1/object/public/bucket-name/path
          const pathParts = url.pathname.split('/')
          console.log('Path parts:', pathParts)
          
          // Find 'album-art' and get everything after it
          const bucketIndex = pathParts.findIndex(part => part === 'album-art')
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            // Get everything after the bucket name
            filePath = pathParts.slice(bucketIndex + 1).join('/')
          } else {
            // Fallback: try to match pattern and extract user_id/filename.ext
            const pathMatch = url.pathname.match(/\/album-art\/(.+)$/)
            if (pathMatch) {
              filePath = pathMatch[1]
            } else {
              throw new Error('Could not extract file path from URL')
            }
          }
        } else {
          // Already a relative path
          filePath = album.cover_art_url
        }

        console.log('Extracted file path for deletion:', filePath)

        // Create a service role client for storage operations
        const serviceSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  supabaseResponse.cookies.set(name, value, options)
                })
              },
            },
          }
        )

        // Verify service role key is available
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.error('SUPABASE_SERVICE_ROLE_KEY is not set!')
          throw new Error('Storage service key not configured')
        }

        console.log('Service role key is available')

        // Delete the file from storage using the service role client
        console.log('Attempting to delete file from storage:', filePath)
        const { data: removeData, error: removeError } = await serviceSupabase.storage
          .from('album-art')
          .remove([filePath])

        if (removeError) {
          console.error('Storage deletion error:', removeError)
          // Don't fail the entire deletion if storage deletion fails
          console.log('Storage deletion failed but continuing with database deletion')
        } else {
          console.log('Storage deletion successful:', removeData)
        }

        // Verify deletion worked by trying to access the file
        const { data: testData, error: testError } = await serviceSupabase.storage
          .from('album-art')
          .download(filePath)

        if (testError) {
          console.log('File successfully deleted - no longer accessible:', testError.message)
        } else {
          console.log('Warning: File may still be accessible after deletion')
        }

      } catch (storageError) {
        console.error('Error during storage deletion:', storageError)
        // Continue with album deletion even if storage deletion fails
      }
    }

    // Hard delete the album record from the database
    const { error: deleteError } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete album: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Album deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete album error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 