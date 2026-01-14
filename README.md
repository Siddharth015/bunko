# Bunko - Multi-Media Tracking App

A modern multi-media tracking application built with Next.js 15, TypeScript, and Supabase. Track your favorite movies, books, and anime all in one place.

## 🚀 Features

### Core Features
- **Multi-media tracking**: Track movies, books, and anime
- **User profiles**: Create and customize your profile with bio, avatar, and top 4 selections
- **Rating & reviews**: Rate media items (1-10) and write detailed reviews
- **Status tracking**: Mark items as plan to watch, watching, completed, on hold, or dropped
- **Type-safe**: Full TypeScript support with auto-generated database types
- **Secure**: Row Level Security (RLS) policies for data protection
- **Modern UI**: Built with Next.js 15 App Router and Tailwind CSS

### New Features ✨
- **🔍 Unified Search**: Search across TMDb (movies), AniList (anime), and Google Books in a single query
- **⚡ Redis Caching**: 24-hour search result caching with Upstash Redis for lightning-fast responses
- **🖼️ Dynamic OG Images**: Auto-generated social sharing images for user profiles (1200x630)
- **📥 Letterboxd Import**: Import your watch history from Letterboxd CSV exports with progress tracking

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account ([Sign up for free](https://supabase.com))

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd bunko
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **API** in your Supabase dashboard
3. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# External APIs (for new features)
TMDB_API_KEY=your_tmdb_api_key                    # Required for search & import
GOOGLE_BOOKS_API_KEY=your_google_books_api_key    # Optional for search
UPSTASH_REDIS_REST_URL=your_redis_url             # Optional for caching
UPSTASH_REDIS_REST_TOKEN=your_redis_token         # Optional for caching
```

**Get API Keys:**
- TMDb: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) (free)
- Google Books: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) (free, optional)
- Upstash Redis: [https://console.upstash.com](https://console.upstash.com) (free tier available)

### 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/schema.sql`
5. Paste and run the SQL script

This will create:
- `profiles` table for user profiles
- `media_entries` table for media tracking
- Custom enums for media types and status
- Indexes for performance
- RLS policies for security
- Helper functions for statistics

### 5. Run Development Server

```bash
npm run dev
```

## 🌐 Application Routes

| Route | Description |
|-------|-------------|
| `/search` | Unified search across movies, anime, and books |
| `/profile/[username]` | User profile page with dynamic OG images |
| `/import` | Import watch history from Letterboxd CSV |
| `/api/search` | Search API endpoint |
| `/api/og/[username]` | Dynamic OG image generator (1200x630 PNG) |
| `/api/migrate/letterboxd` | TMDb movie lookup for CSV import |

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bunko/
├── app/                          # Next.js 15 App Router pages
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client configuration
│   │   └── db-utils.ts          # Database utility functions
│   └── types/
│       └── database.types.ts    # TypeScript type definitions
├── supabase/
│   └── schema.sql               # Database schema
├── .env.local.example           # Environment variables template
└── README.md
```

## 🗄️ Database Schema

### Tables

#### `profiles`
- **id**: UUID (references auth.users)
- **username**: Unique username (3-30 characters)
- **bio**: User biography (max 500 characters)
- **avatar_url**: Profile picture URL
- **top_four_ids**: JSON array of favorite media IDs
- **created_at**, **updated_at**: Timestamps

#### `media_entries`
- **id**: UUID (auto-generated)
- **user_id**: References profiles.id
- **media_id**: External media identifier (e.g., from TMDB, MAL)
- **media_type**: Enum (MOVIE, BOOK, ANIME)
- **rating**: Integer 1-10 (optional)
- **review**: Text review (max 2000 characters)
- **status**: Enum (PLAN_TO_WATCH, WATCHING, COMPLETED, ON_HOLD, DROPPED)
- **created_at**, **updated_at**: Timestamps

### Enums

- **media_type**: `MOVIE`, `BOOK`, `ANIME`
- **media_status**: `PLAN_TO_WATCH`, `WATCHING`, `COMPLETED`, `ON_HOLD`, `DROPPED`

## 🔧 Database Utilities

The `db-utils.ts` file provides type-safe functions with proper error handling:

### Profile Operations
```typescript
import { getProfileById, createProfile, updateProfile } from '@/lib/db-utils';

// Get a profile
const { data, error } = await getProfileById(userId);

// Create a profile
const { data, error } = await createProfile({
  id: userId,
  username: 'johndoe',
  bio: 'Movie enthusiast',
});

// Update a profile
const { data, error } = await updateProfile(userId, {
  bio: 'Updated bio',
});
```

### Media Entry Operations
```typescript
import { 
  createMediaEntry, 
  getUserMediaByType,
  updateMediaEntry 
} from '@/lib/db-utils';
import { MediaType, MediaStatus } from '@/types/database.types';

// Create a media entry
const { data, error } = await createMediaEntry({
  user_id: userId,
  media_id: 'tt1234567',
  media_type: MediaType.MOVIE,
  rating: 9,
  review: 'Great movie!',
  status: MediaStatus.COMPLETED,
});

// Get user's movies
const { data, error } = await getUserMediaByType(userId, MediaType.MOVIE);

// Update entry
const { data, error } = await updateMediaEntry(entryId, {
  rating: 10,
  status: MediaStatus.COMPLETED,
});
```

### Advanced Queries
```typescript
import { getUserStats, getTopRatedEntries } from '@/lib/db-utils';

// Get user statistics
const { data, error } = await getUserStats(userId);
// Returns: { total_entries, movies, books, anime, completed, watching, ... }

// Get top rated entries
const { data, error } = await getTopRatedEntries(userId, 10);
```

## 🔐 Security

The database uses Row Level Security (RLS) policies:

- **Profiles**: Users can view all profiles but only edit their own
- **Media Entries**: Users can view all entries but only modify their own
- All policies are enforced at the database level

## 🚀 Building for Production

```bash
npm run build
npm start
```

## 📝 TypeScript Support

All database operations are fully typed using TypeScript interfaces that match the SQL schema:

```typescript
import { Profile, MediaEntry, MediaType } from '@/types/database.types';
```

The type definitions include:
- Table row types
- Insert types (omit auto-generated fields)
- Update types (all fields optional)
- Database response types
- Enum types

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
