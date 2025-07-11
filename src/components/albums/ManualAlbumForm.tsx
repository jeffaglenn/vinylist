'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlbumCondition } from '@/lib/types'

export default function ManualAlbumForm() {
  const [formData, setFormData] = useState({
    artist: '',
    album_title: '',
    release_year: '',
    condition: '' as AlbumCondition | '',
    personal_notes: ''
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingArtists, setExistingArtists] = useState<string[]>([])
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false)
  const [filteredArtists, setFilteredArtists] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [coverArtLoading, setCoverArtLoading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const conditions: AlbumCondition[] = ['Mint', 'Near Mint', 'Very Good', 'Good', 'Fair', 'Poor']

  // Fetch existing artists on component mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/artists')
        if (response.ok) {
          const data = await response.json()
          setExistingArtists(data.artists || [])
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      }
    }
    
    fetchArtists()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle artist field autocomplete
    if (name === 'artist') {
      if (value.trim()) {
        const filtered = existingArtists.filter(artist =>
          artist.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredArtists(filtered)
        setShowArtistSuggestions(filtered.length > 0)
      } else {
        setShowArtistSuggestions(false)
        setFilteredArtists([])
      }
    }
  }

  const handleArtistSelect = (artist: string) => {
    setFormData(prev => ({
      ...prev,
      artist
    }))
    setShowArtistSuggestions(false)
    setFilteredArtists([])
  }

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/search-albums?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setShowSearchResults(true)
      } else {
        console.error('Search failed:', response.statusText)
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setShowSearchResults(false)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query)
    }, 500)
  }

  const handleAlbumSelect = async (album: any) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      artist: album.artist,
      album_title: album.title,
      release_year: album.year || ''
    }))
    
    // Clear search
    setSearchQuery('')
    setShowSearchResults(false)
    setSearchResults([])
    
    // Try to fetch cover art
    if (album.id) {
      await fetchCoverArt(album.id)
    }
  }

  const fetchCoverArt = async (mbid: string) => {
    setCoverArtLoading(true)
    try {
      const response = await fetch(`/api/cover-art?mbid=${mbid}`)
      if (response.ok) {
        const data = await response.json()
        if (data.available && data.coverArtUrl) {
          // Convert the cover art URL to a blob and create a File object
          const imageResponse = await fetch(data.coverArtUrl)
          if (imageResponse.ok) {
            const blob = await imageResponse.blob()
            
            // Create a File object from the blob
            const file = new File([blob], 'cover-art.jpg', { type: blob.type })
            
            // Set the cover image and preview
            setCoverImage(file)
            setImagePreview(data.coverArtUrl)
            
            console.log('Cover art loaded successfully')
          }
        } else {
          console.log('No cover art available for this release')
        }
      }
    } catch (error) {
      console.error('Failed to fetch cover art:', error)
    } finally {
      setCoverArtLoading(false)
    }
  }


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

          // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB')
        return
      }

      setCoverImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeImage = () => {
    setCoverImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic validation
    if (!formData.artist.trim() || !formData.album_title.trim()) {
      setError('Artist and Album Title are required')
      setLoading(false)
      return
    }

    try {
      const submitData = new FormData()
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value.toString())
      })
      
      // Add image if present
      if (coverImage) {
        submitData.append('cover_image', coverImage)
      }

      const response = await fetch('/api/albums', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add album')
      }

      // Success! Show confirmation and redirect
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/collection')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Album Added Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            {formData.artist} - {formData.album_title} has been added to your collection.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your collection...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Add Album
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Album Search */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🔍 Search for Album
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Search MusicBrainz database to automatically fill album details
          </p>
          
          <div className="space-y-3">
            {/* Text Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for artist, album, or both (e.g., 'Beatles Abbey Road')"
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {searchLoading && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

          </div>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto border border-blue-300 rounded-md bg-white">
              {searchResults.map((album, index) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => handleAlbumSelect(album)}
                  className="w-full text-left p-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-blue-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{album.title}</div>
                  <div className="text-sm text-gray-600">
                    by {album.artist}
                    {album.year && ` (${album.year})`}
                    {album.label && ` • ${album.label}`}
                  </div>
                  {album.type && (
                    <div className="text-xs text-blue-600 mt-1">{album.type}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && !searchLoading && searchQuery.length >= 2 && (
            <div className="mt-3 p-3 text-center text-gray-500 border border-blue-300 rounded-md bg-white">
              No albums found. You can still add manually below.
            </div>
          )}
        </div>

        {/* Album Photo Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Album Cover Photo
            {coverArtLoading && (
              <span className="ml-2 text-blue-600 text-sm">Loading cover art...</span>
            )}
          </label>
          
          {imagePreview ? (
            <div className="relative">
              <div className="w-48 h-48 mx-auto relative">
                <Image
                  src={imagePreview}
                  alt="Album cover preview"
                  fill
                  className="object-cover rounded-lg shadow-md"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                ×
              </button>
              {coverImage?.name === 'cover-art.jpg' && (
                <p className="text-center text-green-600 text-sm mt-2">
                  ✓ Cover art automatically fetched from MusicBrainz
                </p>
              )}
            </div>
          ) : coverArtLoading ? (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-blue-600 mb-4">
                Fetching album cover art...
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-4xl mb-4">📸</div>
              <p className="text-gray-600 mb-4">
                Add a photo of your album cover
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📷</span>
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📁</span>
                  <span>Choose File</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Artist */}
        <div className="relative">
          <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
            Artist *
          </label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleInputChange}
            onFocus={() => {
              if (formData.artist.trim() && filteredArtists.length > 0) {
                setShowArtistSuggestions(true)
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking on them
              setTimeout(() => setShowArtistSuggestions(false), 200)
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., The Beatles"
            autoComplete="off"
          />
          
          {/* Artist Suggestions Dropdown */}
          {showArtistSuggestions && filteredArtists.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredArtists.map((artist, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleArtistSelect(artist)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                >
                  {artist}
                </button>
              ))}
            </div>
          )}
          
          {/* Show existing artists count */}
          {existingArtists.length > 0 && !showArtistSuggestions && (
            <p className="text-xs text-gray-500 mt-1">
              Start typing to see suggestions from your {existingArtists.length} existing artist{existingArtists.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Album Title */}
        <div>
          <label htmlFor="album_title" className="block text-sm font-medium text-gray-700 mb-1">
            Album Title *
          </label>
          <input
            type="text"
            id="album_title"
            name="album_title"
            value={formData.album_title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Abbey Road"
          />
        </div>

        {/* Release Year */}
        <div>
          <label htmlFor="release_year" className="block text-sm font-medium text-gray-700 mb-1">
            Release Year
          </label>
          <input
            type="number"
            id="release_year"
            name="release_year"
            value={formData.release_year}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1969"
          />
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select condition...</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {/* Personal Notes */}
        <div>
          <label htmlFor="personal_notes" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Notes
          </label>
          <textarea
            id="personal_notes"
            name="personal_notes"
            value={formData.personal_notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any notes about this album, where you got it, memories, etc..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/collection')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.artist.trim() || !formData.album_title.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Album...' : 'Add Album'}
          </button>
        </div>
      </form>
    </div>
  )
} 