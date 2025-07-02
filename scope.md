# Vinyl Collection Tracker - Project Scope & Plan (Multi-User)

## **Recommended Tech Stack**
- **Frontend**: NextJS 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth (built-in user management)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (better NextJS integration than Netlify)
- **APIs**: MusicBrainz API + Cover Art Archive API

## **Core Features (MVP)**

### **Phase 1 - Authentication & Foundation**
1. **User Authentication**
   - User signup/login with email and password
   - Password reset functionality
   - Protected routes and middleware
   - User session management

2. **User Profile Management**
   - Basic user profile with email
   - Account settings and preferences
   - User-specific navigation

### **Phase 2 - Personal Collection Management**
1. **Album Search & Add**
   - Search MusicBrainz by artist/album name
   - Display search results with cover art
   - Add selected album to user's personal collection
   - Store: artist, album title, year, cover art URL, date added

2. **Personal Collection Management**
   - View user's own albums in collection (grid/list view)
   - Remove albums from personal collection
   - Basic search/filter within user's collection
   - Collection privacy (each user sees only their own albums)

3. **Album Details (User-Specific)**
   - Artist, Album Title, Release Year
   - Condition (Mint, Near Mint, Very Good, Good, Fair, Poor)
   - Date Added, Date Removed (if sold)
   - Cover Art (multiple sizes from Cover Art Archive)
   - Personal notes (optional)

### **Phase 3 - Enhanced Features** (Future)
- Purchase price tracking
- Expanded personal notes field
- Genre/style categorization
- Personal collection statistics
- Export personal collection functionality
- Advanced filtering/sorting within user collections
- Collection sharing with friends (view-only)
- Wishlist functionality per user
- Collection value tracking per user

## **Database Schema (Supabase)**

```sql
-- User authentication is handled automatically by Supabase Auth
-- auth.users table is built-in and managed by Supabase

-- User-specific albums table with proper relationships
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  musicbrainz_release_id VARCHAR,
  artist VARCHAR NOT NULL,
  album_title VARCHAR NOT NULL,
  release_year INTEGER,
  cover_art_url VARCHAR,
  condition VARCHAR CHECK (condition IN ('Mint', 'Near Mint', 'Very Good', 'Good', 'Fair', 'Poor')),
  personal_notes TEXT,
  date_added TIMESTAMP DEFAULT NOW(),
  date_removed TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see and modify their own albums
CREATE POLICY "Users can manage their own albums" ON albums
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for better performance on user queries
CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_albums_user_active ON albums(user_id, is_active);
```

## **API Integration Strategy**

### **MusicBrainz Search API**
- **Endpoint**: `https://musicbrainz.org/ws/2/release/`
- **Search releases by artist/title**
- **Get release MBID for cover art lookup**
- **Format**: JSON
- **Rate Limiting**: Respect 1 request per second

### **Cover Art Archive API**
- **Endpoint**: `https://coverartarchive.org/release/{mbid}/`
- **Fetch cover art using release MBID**
- **Store thumbnail URLs (250px, 500px) for performance**
- **Fallback**: Handle cases where no artwork exists**

## **Project Structure**
```
/vinyl-tracker
├── app/
│   ├── api/
│   │   ├── search/
│   │   │   └── route.ts
│   │   └── albums/
│   │       └── route.ts
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── page.tsx (protected route)
│   │   ├── collection/
│   │   │   └── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── middleware.ts (auth middleware)
│   ├── layout.tsx
│   ├── page.tsx (public landing page)
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── AuthProvider.tsx
│   ├── collection/
│   │   ├── AlbumCard.tsx
│   │   ├── CollectionGrid.tsx
│   │   └── AlbumDetails.tsx
│   ├── search/
│   │   ├── SearchForm.tsx
│   │   ├── SearchResults.tsx
│   │   └── AddAlbumForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── musicbrainz.ts
│   ├── coverart.ts
│   └── types.ts
├── utils/
│   └── helpers.ts
└── types/
    └── index.ts
```

## **Development Phases**

### **Phase 1 - Authentication Foundation (Week 1)**
1. Set up NextJS project with TypeScript and Tailwind
2. Configure Supabase project and authentication
3. Create user authentication database schema with RLS
4. Build authentication UI components (login/signup forms)
5. Implement protected routes and middleware
6. Set up basic user session management

### **Phase 2 - Core Collection Features (Week 2)**
1. Implement MusicBrainz search functionality
2. Add Cover Art Archive integration
3. Create album search and display components
4. Build personal collection view with user-specific data
5. Implement add/remove album functionality with proper user association
6. Basic responsive layout with Tailwind

### **Phase 3 - Enhanced Features & Polish (Week 3)**
1. Add album condition tracking and editing
2. Implement collection filtering/search within user's albums
3. Create user profile management pages
4. Add personal notes functionality for albums
5. Polish UI/UX with improved Tailwind components
6. Implement proper error handling and loading states

### **Phase 4 - Deployment & Testing (Week 4)**
1. Set up environment variables for production
2. Deploy to Vercel with proper authentication flow
3. Test multi-user functionality and data isolation
4. Performance optimization and caching
5. User acceptance testing and bug fixes

## **Key TypeScript Interfaces**

```typescript
// User and Authentication Types
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Album and Collection Types
interface Album {
  id: string;
  user_id: string;
  musicbrainz_release_id?: string;
  artist: string;
  album_title: string;
  release_year?: number;
  cover_art_url?: string;
  condition?: AlbumCondition;
  personal_notes?: string;
  date_added: string;
  date_removed?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type AlbumCondition = 'Mint' | 'Near Mint' | 'Very Good' | 'Good' | 'Fair' | 'Poor';

// API Response Types
interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit': Array<{
    name: string;
    artist: {
      name: string;
    };
  }>;
  date?: string;
  'release-group'?: {
    id: string;
  };
}

interface CoverArtResponse {
  images: Array<{
    image: string;
    thumbnails: {
      '250': string;
      '500': string;
      '1200': string;
      small: string;
      large: string;
    };
    front: boolean;
    types: string[];
  }>;
}

// Component Props Types
interface AlbumCardProps {
  album: Album;
  onRemove: (albumId: string) => void;
  onEdit: (album: Album) => void;
}

interface SearchResultProps {
  release: MusicBrainzRelease;
  onAdd: (release: MusicBrainzRelease) => void;
}
```

## **Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## **Key Benefits of This Multi-User Approach**
- **Scalable**: Supabase can easily handle thousands of users and records
- **Secure**: Row Level Security ensures complete data isolation between users
- **Modern**: NextJS App Router with server components for performance
- **Authentication-ready**: Supabase Auth handles signup, login, password reset, etc.
- **Simple to start**: Can deploy with basic functionality quickly
- **Extensible**: Easy to add features like price tracking, wishlists, sharing, etc.
- **Free tier friendly**: Supabase and Vercel both have generous free tiers for small user bases
- **Type-safe**: Full TypeScript integration for better development experience
- **Real-time**: Supabase provides real-time updates for user collections
- **Shareable**: Built with multi-user architecture from day one
- **Production-ready**: Proper authentication and data security patterns

## **API Rate Limiting Considerations**
- **MusicBrainz**: Maximum 1 request per second, include User-Agent header
- **Cover Art Archive**: No current rate limits, but implement reasonable delays
- **Client-side caching**: Store search results temporarily to reduce API calls
- **Error handling**: Graceful degradation when APIs are unavailable

## **Authentication & Security Considerations**
- **Row Level Security (RLS)**: Database-level security ensuring users only access their own data
- **Protected Routes**: Middleware to prevent unauthorized access to user areas
- **Session Management**: Automatic token refresh and secure session handling
- **Email Verification**: Optional email confirmation for new user accounts
- **Password Reset**: Secure password reset flow via email
- **Input Validation**: Server-side validation for all user inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS Only**: Secure connections for all authentication flows

## **Future Enhancement Ideas**
- Barcode scanning for quick album addition
- Discogs integration for pricing data
- Social features (sharing collections with friends)
- Collection collaboration (shared collections)
- Mobile app version with offline sync
- Backup/export personal collection functionality
- Advanced statistics and analytics per user
- Personal wishlist functionality
- Collection value tracking per user
- User-generated album reviews and ratings
- Collection insurance and cataloging features