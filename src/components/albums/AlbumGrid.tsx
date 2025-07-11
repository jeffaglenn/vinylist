'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Album } from '@/lib/types'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function AlbumGrid() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    albumId: string | null
    albumTitle: string
    artist: string
  }>({
    isOpen: false,
    albumId: null,
    albumTitle: '',
    artist: ''
  })

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch albums')
      }

      setAlbums(data.albums)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (album: Album) => {
    setDeleteConfirm({
      isOpen: true,
      albumId: album.id,
      albumTitle: album.album_title,
      artist: album.artist
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.albumId) return

    try {
      const response = await fetch(`/api/albums/${deleteConfirm.albumId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete album')
      }

      // Remove the album from the state
      setAlbums(prevAlbums => 
        prevAlbums.filter(album => album.id !== deleteConfirm.albumId)
      )

      // Close the confirmation dialog
      setDeleteConfirm({
        isOpen: false,
        albumId: null,
        albumTitle: '',
        artist: ''
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete album')
      // Close the dialog even on error so user can see the error message
      setDeleteConfirm({
        isOpen: false,
        albumId: null,
        albumTitle: '',
        artist: ''
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      isOpen: false,
      albumId: null,
      albumTitle: '',
      artist: ''
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Collection
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAlbums}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📀</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Albums Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start building your collection by adding your first album!
        </p>
        <Link
          href="/dashboard/add-album"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
        >
          Add Your First Album
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {albums.length} Album{albums.length !== 1 ? 's' : ''} in Your Collection
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <AlbumCard 
            key={album.id} 
            album={album} 
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Album"
        message={`Are you sure you want to delete "${deleteConfirm.albumTitle}" by ${deleteConfirm.artist}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDestructive={true}
      />
    </div>
  )
}

function AlbumCard({ album, onDelete }: { album: Album; onDelete: (album: Album) => void }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleEditClick = () => {
    window.location.href = `/dashboard/edit-album/${album.id}`
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit and Delete Buttons */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={handleEditClick}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Edit album"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(album)}
            className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Delete album"
          >
            ×
          </button>
        </div>
      )}

      {/* Album Cover */}
      <div className="aspect-square relative bg-gray-100">
        {album.cover_art_url && !imageError ? (
          <Image
            src={album.cover_art_url}
            alt={`${album.artist} - ${album.album_title}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📀</div>
              <p className="text-xs">No Cover</p>
            </div>
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {album.album_title}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
          {album.artist}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {album.release_year || 'Unknown Year'}
          </span>
          {album.condition && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {album.condition}
            </span>
          )}
        </div>

        {album.personal_notes && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            "{album.personal_notes}"
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          Added {new Date(album.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 