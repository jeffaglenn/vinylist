"use client"

import React, { useEffect, useState, useRef } from 'react'
import supabase from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string | null
}

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('authLoading:', authLoading)
    console.log('user:', user)
    console.log('profileLoading:', profileLoading)
    console.log('profile:', profile)
  }, [authLoading, user, profileLoading, profile])

  // Fetch profile data
  useEffect(() => {
    if (!authLoading && user) {
      setProfileLoading(true)
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data)
          setDisplayName(data.display_name || '')
          setAvatarUrl(data.avatar_url || null)
          setProfileLoading(false)
        })
        .catch(() => setProfileLoading(false))
    }
  }, [user, authLoading])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!avatarUrl && !avatarPreview) return
    
    setSaving(true)
    setSaveMsg(null)

    try {
      // If there's an existing avatar URL, delete it from storage
      if (avatarUrl && user) {
        try {
          // Extract file path from URL
          const url = new URL(avatarUrl)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.findIndex(part => part === 'profile-photos')
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            
            console.log('Attempting to delete profile photo:', filePath)
            
            const { error: storageError } = await supabase.storage
              .from('profile-photos')
              .remove([filePath])

            if (storageError) {
              console.error('Storage deletion error:', storageError)
            } else {
              console.log('Profile photo deleted successfully from storage')
            }
          }
        } catch (storageError) {
          console.error('Error during storage deletion:', storageError)
        }
      }

      // Update profile to remove avatar_url
      console.log('Updating profile to remove avatar_url...')
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: null,
        }),
      })

      console.log('Profile update response status:', res.status)
      const responseData = await res.json()
      console.log('Profile update response data:', responseData)

      if (res.ok) {
        // Update local state
        setAvatarFile(null)
        setAvatarPreview(null)
        setAvatarUrl(null)
        setSaveMsg('Profile photo removed!')
        
        // Refresh profile
        setProfile(responseData)
        console.log('Profile updated successfully:', responseData)
      } else {
        setSaveMsg('Failed to remove profile photo')
        console.error('Profile update failed:', responseData)
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      setSaveMsg('Failed to remove profile photo')
    } finally {
      setSaving(false)
    }
  }

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    let newAvatarUrl = avatarUrl

    // If a new avatar file is selected, upload it
    if (avatarFile && user) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        })
      if (error) {
        setSaveMsg('Failed to upload profile photo')
        setSaving(false)
        return
      }
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)
      newAvatarUrl = urlData.publicUrl
    }

    // PATCH profile
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        avatar_url: newAvatarUrl,
      }),
    })
    if (res.ok) {
      setSaveMsg('Profile updated!')
      setAvatarFile(null)
      setAvatarPreview(null)
      // Refresh profile
      const updated = await res.json()
      setProfile(updated)
      setAvatarUrl(updated.avatar_url)
    } else {
      setSaveMsg('Failed to update profile')
    }
    setSaving(false)
  }

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👤 Account Settings
              </h1>
              <p className="text-sm text-gray-600">
                Manage your profile and account information
              </p>
            </div>
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-10">
          {/* Profile Photo */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h2>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>🧑</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleRemoveAvatar}
                  disabled={(!avatarUrl && !avatarPreview) || saving}
                >
                  {saving ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </section>

          {/* Profile Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h2>
            <form className="space-y-6" onSubmit={handleSave}>
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={user?.email || ''}
                  disabled
                />
                <div className="flex items-center mt-2 space-x-2">
                  {user?.email_confirmed_at ? (
                    <span className="text-xs text-green-600">Verified</span>
                  ) : (
                    <span className="text-xs text-yellow-600">Unverified</span>
                  )}
                  {/* TODO: Resend verification logic */}
                  <button type="button" className="text-xs text-blue-600 hover:underline" disabled>
                    Resend Verification
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <div className="text-gray-500 text-sm">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveMsg && <span className="ml-4 text-sm text-gray-600">{saveMsg}</span>}
              </div>
            </form>
          </section>

          {/* Change Password */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" id="newPassword" name="newPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Change Password</button>
              </div>
            </form>
          </section>

          {/* Wishlist Button */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Wishlist</h2>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">Go to Wishlist (Coming Soon)</button>
          </section>

          {/* Delete Account */}
          <section>
            <h2 className="text-lg font-semibold text-red-700 mb-2">Delete Account</h2>
            <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete Account</button>
          </section>
        </div>
      </main>
    </div>
  )
}