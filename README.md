# Vinylist

A modern web application for tracking and managing your vinyl record collection.

## 🎵 Features

- **User Authentication**: Secure signup, login, and password reset
- **Personal Collections**: Each user has their own private vinyl collection
- **Album Search**: Integration with MusicBrainz API for comprehensive music database
- **Cover Art**: Automatic album artwork retrieval
- **Condition Tracking**: Track vinyl condition and personal notes
- **Responsive Design**: Works great on desktop and mobile

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **APIs**: MusicBrainz API, Cover Art Archive API

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server**
```bash
npm run dev
   ```

4. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Status

Currently in development. Authentication system is complete, vinyl collection features coming soon.
