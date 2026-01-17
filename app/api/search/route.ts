import { NextRequest, NextResponse } from 'next/server';
import redis from '@/src/lib/redis';

// ============================================
// Type Definitions
// ============================================

export interface MediaResult {
    id: string;
    title: string;
    type: 'movie' | 'anime' | 'book' | 'tv';
    imageUrl: string | null;
    year: number | null;
}

// ============================================
// API Integration Functions
// ============================================

/**
 * Fetch movies from TMDb API
 */
async function fetchTMDbResults(query: string): Promise<MediaResult[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return [];

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) throw new Error(`TMDb API error: ${response.status}`);
        const data = await response.json();

        return (data.results || []).slice(0, 10).map((movie: any) => ({
            id: `tmdb-${movie.id}`,
            title: movie.title,
            type: 'movie' as const,
            imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        }));
    } catch (error) {
        console.error('TMDb fetch error:', error);
        return [];
    }
}

/**
 * Fetch TV Shows from TMDb API
 */
async function fetchTMDbTVResults(query: string): Promise<MediaResult[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return [];

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) throw new Error(`TMDb TV API error: ${response.status}`);
        const data = await response.json();

        return (data.results || []).slice(0, 10).map((show: any) => ({
            id: `tmdb-tv-${show.id}`,
            title: show.name, // TMDb uses 'name' for TV shows
            type: 'tv' as const,
            imageUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        }));
    } catch (error) {
        console.error('TMDb TV fetch error:', error);
        return [];
    }
}

/**
 * Fetch anime from AniList GraphQL API
 */
async function fetchAniListResults(query: string): Promise<MediaResult[]> {
    const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME) {
            id
            title { romaji english }
            coverImage { large }
            startDate { year }
        }
      }
    }
  `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: graphqlQuery, variables: { search: query } }),
            next: { revalidate: 3600 },
        });

        if (!response.ok) throw new Error('AniList API error');
        const data = await response.json();

        return (data.data?.Page?.media || []).map((anime: any) => ({
            id: `anilist-${anime.id}`,
            title: anime.title.english || anime.title.romaji,
            type: 'anime' as const,
            imageUrl: anime.coverImage?.large || null,
            year: anime.startDate?.year || null,
        }));
    } catch (error) {
        console.error('AniList fetch error:', error);
        return [];
    }
}

/**
 * Fetch books from Google Books API
 */
async function fetchGoogleBooksResults(query: string): Promise<MediaResult[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10${apiKey ? `&key=${apiKey}` : ''}`;
        const response = await fetch(url, { next: { revalidate: 3600 } });

        if (!response.ok) throw new Error('Google Books API error');
        const data = await response.json();

        return (data.items || []).map((book: any) => ({
            id: `gbooks-${book.id}`,
            title: book.volumeInfo?.title || 'Unknown Title',
            type: 'book' as const,
            imageUrl: book.volumeInfo?.imageLinks?.thumbnail || null,
            year: book.volumeInfo?.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : null,
        }));
    } catch (error) {
        console.error('Google Books fetch error:', error);
        return [];
    }
}

// ============================================
// Main Search Route Handler
// ============================================

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 });
    if (query.length > 200) return NextResponse.json({ error: 'Query too long' }, { status: 400 });

    const cacheKey = `search:${query.toLowerCase().trim()}`;

    // Cache Check
    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return NextResponse.json(cached, { headers: { 'X-Cache-Status': 'HIT' } });
        } catch (e) { console.error('Redis read error', e); }
    }

    try {
        // Parallel Fetch
        const [tmdbMovies, tmdbTV, anilist, googleBooks] = await Promise.allSettled([
            fetchTMDbResults(query),
            fetchTMDbTVResults(query),
            fetchAniListResults(query),
            fetchGoogleBooksResults(query)
        ]);

        const results = [
            ...(tmdbMovies.status === 'fulfilled' ? tmdbMovies.value : []),
            ...(tmdbTV.status === 'fulfilled' ? tmdbTV.value : []),
            ...(anilist.status === 'fulfilled' ? anilist.value : []),
            ...(googleBooks.status === 'fulfilled' ? googleBooks.value : [])
        ];

        const responseData = {
            query,
            total: results.length,
            results,
            breakdown: {
                movies: tmdbMovies.status === 'fulfilled' ? tmdbMovies.value.length : 0,
                tv: tmdbTV.status === 'fulfilled' ? tmdbTV.value.length : 0,
                anime: anilist.status === 'fulfilled' ? anilist.value.length : 0,
                books: googleBooks.status === 'fulfilled' ? googleBooks.value.length : 0,
            }
        };

        // Cache Set
        if (redis) {
            try { await redis.set(cacheKey, responseData, { ex: 86400 }); }
            catch (e) { console.error('Redis set error', e); }
        }

        return NextResponse.json(responseData, { headers: { 'X-Cache-Status': 'MISS' } });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
