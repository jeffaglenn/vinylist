import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()

    const artist = formData.get('artist') as string
    const album_title = formData.get('album_title') as string
    const release_year = formData.get('release_year') as string
    const condition = formData.get('condition') as string
    const personal_notes = formData.get('personal_notes') as string
    const cover_image = formData.get('cover_image') as File

    // Validate required fields
    if (!artist?.trim() || !album_title?.trim()) {
      return NextResponse.json(
        { error: 'Artist and Album Title are required' },
        { status: 400 }
      )
    }

    let cover_art_url: string | null = null

    // Handle image upload if present
    if (cover_image && cover_image.size > 0) {
      try {
        // Generate unique filename
        const fileExt = cover_image.name.split('.').pop()
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`

        // Convert File to ArrayBuffer
        const arrayBuffer = await cover_image.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        console.log('Attempting to upload file:', fileName, 'Size:', uint8Array.length, 'bytes')
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('album-art')
          .upload(fileName, uint8Array, {
            contentType: cover_image.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          console.error('Upload error details:', JSON.stringify(uploadError, null, 2))
          
          // For now, continue without the image to test database insert
          console.log('Continuing without image upload...')
          cover_art_url = null
        } else if (uploadData) {
          // Get public URL for the uploaded image
          const { data: urlData } = supabase.storage
            .from('album-art')
            .getPublicUrl(uploadData.path)

          cover_art_url = urlData.publicUrl
          console.log('Upload successful, URL:', cover_art_url)
        }

      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        console.log('Continuing without image due to upload error...')
        cover_art_url = null
      }
    }

    // Insert album into database
    const albumData = {
      user_id: user.id,
      artist: artist.trim(),
      album_title: album_title.trim(),
      release_year: release_year ? parseInt(release_year) : null,
      condition: condition || null,
      personal_notes: personal_notes?.trim() || null,
      cover_art_url,
      is_active: true
    }

    console.log('Attempting to insert album:', albumData)
    console.log('User ID from auth:', user.id)

    // Test database insert without storage first
    const { data: album, error: dbError } = await supabase
      .from('albums')
      .insert([albumData])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save album: ' + dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      album,
      message: 'Album added successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's albums (RLS will automatically filter by user_id)
    const { data: albums, error: dbError } = await supabase
      .from('albums')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch albums' },
        { status: 500 }
      )
    }

    return NextResponse.json({ albums })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}