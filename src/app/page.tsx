import Link from "next/link";
import { getUser } from '@/lib/supabase/server'

export default async function Home() {
  // Check if user is already logged in
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              🎵 Vinylist
            </h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-6xl">
            Track Your
            <span className="text-blue-600"> Vinyl Collection</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Organize, catalog, and manage your vinyl records with ease.
            Keep track of album conditions, purchase dates, and build your perfect collection.
          </p>

          {!user && (
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Your Collection
              </Link>
              <Link
                href="/auth/login"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search & Add Albums
            </h3>
            <p className="text-gray-600">
              Search the MusicBrainz database to find and add albums to your collection with cover art.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Condition
            </h3>
            <p className="text-gray-600">
              Monitor the condition of your vinyl records from Mint to Poor, with personal notes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Private Collection
            </h3>
            <p className="text-gray-600">
              Your collection is completely private and secure. Only you can see and manage your vinyl records.
            </p>
          </div>
        </div>

        {user && (
          <div className="mt-16 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Welcome back, {user.email}!
              </h3>
              <p className="text-gray-600 mb-6">
                Ready to manage your vinyl collection?
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
