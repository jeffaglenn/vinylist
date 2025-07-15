'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Album } from '@/lib/types'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'

export default function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteAlbum, setDeleteAlbum] = useState<Album | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums')
      if (response.ok) {
        const data = await response.json()
        setAlbums(data.albums || [])
      } else {
        setError('Failed to fetch albums')
      }
    } catch (err) {
      setError('An error occurred while fetching albums')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (album: Album) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setAlbums(prev => prev.filter(a => a.id !== album.id))
        setDeleteAlbum(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete album')
      }
    } catch (err) {
      setError('An error occurred while deleting the album')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (album: Album) => {
    window.location.href = `/dashboard/edit-album/${album.id}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌</div>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No albums in your collection yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start building your collection by adding your first album!
        </p>
        <a
          href="/dashboard/add-album"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
        >
          Add Your First Album
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {albums.map((album) => (
            <li key={album.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center flex-1 min-w-0">
                  {/* Album Cover */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 relative">
                      {album.cover_art_url ? (
                        <Image
                          src={album.cover_art_url}
                          alt={`${album.album_title} cover`}
                          fill
                          className="object-cover rounded-md shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {album.album_title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          by {album.artist}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          {album.release_year && (
                            <span className="text-sm text-gray-500">
                              {album.release_year}
                            </span>
                          )}
                          {album.condition && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {album.condition}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {album.personal_notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {album.personal_notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(album)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteAlbum(album)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation */}
      {deleteAlbum && (
        <ConfirmationDialog
          isOpen={true}
          title="Delete Album"
          message={`Are you sure you want to delete "${deleteAlbum.album_title}" by ${deleteAlbum.artist}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDelete(deleteAlbum)}
          onCancel={() => setDeleteAlbum(null)}
          isLoading={deleting}
          variant="danger"
        />
      )}
    </>
  )
}