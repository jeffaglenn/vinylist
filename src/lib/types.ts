// Database Types
export interface Database {
  public: {
    Tables: {
      albums: {
        Row: Album
        Insert: Omit<Album, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Album, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}

// User and Authentication Types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Album and Collection Types
export interface Album {
  id: string
  user_id: string
  musicbrainz_release_id?: string
  artist: string
  album_title: string
  release_year?: number
  cover_art_url?: string
  condition?: AlbumCondition
  personal_notes?: string
  date_added: string
  date_removed?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Updated to match database CHECK constraint values
export type AlbumCondition = 'Mint' | 'Near Mint' | 'Very Good' | 'Good' | 'Fair' | 'Poor'

// API Response Types
export interface MusicBrainzRelease {
  id: string
  title: string
  'artist-credit': Array<{
    name: string
    artist: {
      name: string
    }
  }>
  date?: string
  'release-group'?: {
    id: string
  }
}

export interface CoverArtResponse {
  images: Array<{
    image: string
    thumbnails: {
      '250': string
      '500': string
      '1200': string
      small: string
      large: string
    }
    front: boolean
    types: string[]
  }>
}

// Component Props Types
export interface AlbumCardProps {
  album: Album
  onRemove: (albumId: string) => void
  onEdit: (album: Album) => void
}

export interface SearchResultProps {
  release: MusicBrainzRelease
  onAdd: (release: MusicBrainzRelease) => void
} 