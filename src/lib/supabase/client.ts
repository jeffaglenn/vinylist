import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client for use in React components
// This runs in the browser and has access to user sessions

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create browser client that works with SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Export the client as default for easy importing
export default supabase 