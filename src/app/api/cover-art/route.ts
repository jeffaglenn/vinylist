import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mbid = searchParams.get('mbid')
    
    if (!mbid) {
      return NextResponse.json({ error: 'Missing MusicBrainz ID' }, { status: 400 })
    }

    // Try to get cover art from Cover Art Archive
    const coverArtUrl = `https://coverartarchive.org/release/${mbid}/front`
    
    try {
      // Check if cover art exists by making a HEAD request
      const headResponse = await fetch(coverArtUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'VinylCollection/1.0 (jeff@example.com)'
        }
      })

      if (headResponse.ok) {
        return NextResponse.json({ 
          coverArtUrl,
          available: true 
        })
      } else {
        return NextResponse.json({ 
          coverArtUrl: null,
          available: false 
        })
      }
    } catch (coverError) {
      console.log('Cover art not available for:', mbid)
      return NextResponse.json({ 
        coverArtUrl: null,
        available: false 
      })
    }

  } catch (error) {
    console.error('Cover art API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cover art' }, 
      { status: 500 }
    )
  }
}