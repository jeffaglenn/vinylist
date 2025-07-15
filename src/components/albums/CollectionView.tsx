'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AlbumGrid from './AlbumGrid'
import AlbumList from './AlbumList'

type ViewMode = 'grid' | 'list'

const STORAGE_KEY = 'vinyl-collection-view-mode'

export default function CollectionView() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isClient, setIsClient] = useState(false)

  // Load saved view mode from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    const savedViewMode = localStorage.getItem(STORAGE_KEY) as ViewMode
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, newViewMode)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎵 My Collection
              </h1>
              <p className="text-sm text-gray-600">
                Your vinyl record collection
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>⊞</span>
                    <span>Grid</span>
                  </span>
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <span>☰</span>
                    <span>List</span>
                  </span>
                </button>
              </div>

              <Link
                href="/dashboard/add-album"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Album
              </Link>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {viewMode === 'grid' ? <AlbumGrid /> : <AlbumList />}
        </div>
      </main>
    </div>
  )
}