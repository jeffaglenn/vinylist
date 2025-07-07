import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
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

    // Get the album
    const { data: album, error: fetchError } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .eq('user_id', user.id) // Ensure user owns this album
      .eq('is_active', true)
      .single()

    if (fetchError || !album) {
      return NextResponse.json(
        { error: 'Album not found or you do not have permission to view it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ album })

  } catch (error) {
    console.error('Get album error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
        // Extract file path from URL using the same logic as the edit functionality
        const url = new URL(album.cover_art_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(part => part === 'album-art')
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/')
          
          console.log('Attempting to delete cover art file:', filePath)

          // Create service role client for deletion (same as edit functionality)
          const serviceSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              cookies: {
                getAll() { return [] },
                setAll() {},
              },
            }
          )

          const { error: storageDeleteError } = await serviceSupabase.storage
            .from('album-art')
            .remove([filePath])

          if (storageDeleteError) {
            console.error('Storage deletion error:', storageDeleteError)
          } else {
            console.log('Cover art deleted successfully from storage')
          }
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

export async function PUT(
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

    // First, get the current album to check if it exists and belongs to the user
    const { data: currentAlbum, error: fetchError } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .eq('user_id', user.id) // Ensure user owns this album
      .eq('is_active', true)
      .single()

    if (fetchError || !currentAlbum) {
      return NextResponse.json(
        { error: 'Album not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()

    const artist = formData.get('artist') as string
    const album_title = formData.get('album_title') as string
    const release_year = formData.get('release_year') as string
    const condition = formData.get('condition') as string
    const personal_notes = formData.get('personal_notes') as string
    const cover_image = formData.get('cover_image') as File
    const remove_image = formData.get('remove_image') as string // "true" if user wants to remove current image

    // Validate required fields
    if (!artist?.trim() || !album_title?.trim()) {
      return NextResponse.json(
        { error: 'Artist and Album Title are required' },
        { status: 400 }
      )
    }

    let cover_art_url: string | null = currentAlbum.cover_art_url

    // Handle image removal
    if (remove_image === 'true') {
      // Delete the current image from storage if it exists
      if (currentAlbum.cover_art_url) {
        try {
          // Extract file path from URL for deletion
          const url = new URL(currentAlbum.cover_art_url)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.findIndex(part => part === 'album-art')
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            
            // Create service role client for deletion
            const serviceSupabase = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              {
                cookies: {
                  getAll() { return [] },
                  setAll() {},
                },
              }
            )

            await serviceSupabase.storage
              .from('album-art')
              .remove([filePath])
          }
        } catch (error) {
          console.error('Error removing old image:', error)
          // Continue with update even if image deletion fails
        }
      }
      cover_art_url = null
    }

    // Handle new image upload if present
    if (cover_image && cover_image.size > 0) {
      try {
        // Delete the current image first if it exists
        if (currentAlbum.cover_art_url && !remove_image) {
          try {
            const url = new URL(currentAlbum.cover_art_url)
            const pathParts = url.pathname.split('/')
            const bucketIndex = pathParts.findIndex(part => part === 'album-art')
            
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/')
              
              const serviceSupabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                  cookies: {
                    getAll() { return [] },
                    setAll() {},
                  },
                }
              )

              await serviceSupabase.storage
                .from('album-art')
                .remove([filePath])
            }
          } catch (error) {
            console.error('Error removing old image during replacement:', error)
          }
        }

        // Upload new image
        const fileExt = cover_image.name.split('.').pop()
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`

        const arrayBuffer = await cover_image.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('album-art')
          .upload(fileName, uint8Array, {
            contentType: cover_image.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          return NextResponse.json(
            { error: 'Failed to upload new cover art: ' + uploadError.message },
            { status: 500 }
          )
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('album-art')
            .getPublicUrl(uploadData.path)

          cover_art_url = urlData.publicUrl
        }

      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to process cover art upload' },
          { status: 500 }
        )
      }
    }

    // Update album in database
    const albumData = {
      artist: artist.trim(),
      album_title: album_title.trim(),
      release_year: release_year ? parseInt(release_year) : null,
      condition: condition || null,
      personal_notes: personal_notes?.trim() || null,
      cover_art_url,
      updated_at: new Date().toISOString()
    }

    const { data: updatedAlbum, error: updateError } = await supabase
      .from('albums')
      .update(albumData)
      .eq('id', albumId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update album: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      album: updatedAlbum,
      message: 'Album updated successfully'
    })

  } catch (error) {
    console.error('Update album error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 