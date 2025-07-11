import { NextRequest, NextResponse } from 'next/server'

// MusicBrainz API types
interface MusicBrainzRelease {
  id: string
  title: string
  date?: string
  'artist-credit': Array<{
    name: string
    artist: {
      id: string
      name: string
    }
  }>
  'release-group'?: {
    id: string
    'primary-type'?: string
  }
  'label-info'?: Array<{
    label?: {
      name: string
    }
  }>
  barcode?: string
}

interface MusicBrainzSearchResponse {
  releases: MusicBrainzRelease[]
  count: number
}

interface SearchResult {
  id: string
  title: string
  artist: string
  year?: string
  type?: string
  label?: string
  barcode?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    // Build MusicBrainz search query
    const encodedQuery = encodeURIComponent(query.trim())
    const musicBrainzUrl = `https://musicbrainz.org/ws/2/release/?query=${encodedQuery}&fmt=json&limit=20`

    // Make request to MusicBrainz with proper headers
    const response = await fetch(musicBrainzUrl, {
      headers: {
        'User-Agent': 'VinylCollection/1.0 (jeff@example.com)', // Required by MusicBrainz
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`)
    }

    const data: MusicBrainzSearchResponse = await response.json()

    // Transform MusicBrainz data to our format
    const results: SearchResult[] = data.releases.map(release => {
      // Get primary artist name
      const artist = release['artist-credit']?.[0]?.name || 'Unknown Artist'
      
      // Extract year from date
      const year = release.date ? release.date.split('-')[0] : undefined
      
      // Get label if available
      const label = release['label-info']?.[0]?.label?.name

      return {
        id: release.id,
        title: release.title,
        artist,
        year,
        type: release['release-group']?.['primary-type'],
        label,
        barcode: release.barcode
      }
    })

    // Filter for likely vinyl releases (optional - you can remove this)
    const vinylResults = results.filter(result => 
      !result.type || 
      result.type === 'Album' || 
      result.type === 'EP' ||
      result.type === 'Single'
    )

    return NextResponse.json({ 
      results: vinylResults,
      total: data.count 
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search albums' }, 
      { status: 500 }
    )
  }
}