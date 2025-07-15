import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CollectionView from '@/components/albums/CollectionView'

export default async function CollectionPage() {
  // Check if user is authenticated (server-side)
  const user = await getUser()
  
  if (!user) {
    // User not authenticated, redirect to login
    redirect('/auth/login')
  }

  return <CollectionView />
}

// Add metadata
export const metadata = {
  title: 'My Collection | Vinylist',
  description: 'View your vinyl record collection',
}