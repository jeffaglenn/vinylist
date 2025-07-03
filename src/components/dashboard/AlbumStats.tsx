'use client'

import { useState, useEffect } from 'react'

export default function AlbumStats() {
  const [stats, setStats] = useState({
    totalAlbums: 0,
    thisMonth: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/albums')
      const data = await response.json()

      if (response.ok) {
        const albums = data.albums || []
        const thisMonth = albums.filter((album: any) => {
          const albumDate = new Date(album.created_at)
          const now = new Date()
          return albumDate.getMonth() === now.getMonth() && 
                 albumDate.getFullYear() === now.getFullYear()
        }).length

        setStats({
          totalAlbums: albums.length,
          thisMonth,
          loading: false
        })
      }
    } catch (error) {
      console.error('Failed to fetch album stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-bold text-gray-300 animate-pulse">--</div>
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.totalAlbums}</div>
        <div className="text-sm text-gray-500">Total Albums</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
        <div className="text-sm text-gray-500">This Month</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">$0</div>
        <div className="text-sm text-gray-500">Est. Value</div>
      </div>
    </div>
  )
} 