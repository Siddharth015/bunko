import { NextRequest, NextResponse } from 'next/server';
import redis from '@/src/lib/redis';

// ============================================
// Type Definitions
// ============================================

export interface MediaResult {
    id: string;
    title: string;
    type: 'movie' | 'anime' | 'book';
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

    if (!apiKey) {
        console.warn('TMDb API key not configured');
        return [];
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`TMDb API error: ${response.status}`);
        }

        const data = await response.json();

        return (data.results || []).slice(0, 10).map((movie: any) => ({
            id: `tmdb-${movie.id}`,
            title: movie.title,
            type: 'movie' as const,
            imageUrl: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            year: movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : null,
        }));
    } catch (error) {
        console.error('TMDb fetch error:', error);
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
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          startDate {
            year
          }
        }
      }
    }
  `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: { search: query },
            }),
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`AniList API error: ${response.status}`);
        }

        const data = await response.json();
        const media = data.data?.Page?.media || [];

        return media.map((anime: any) => ({
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
        const url = apiKey
            ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`
            : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

        const response = await fetch(url, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.status}`);
        }

        const data = await response.json();
        const items = data.items || [];

        return items.map((book: any) => ({
            id: `gbooks-${book.id}`,
            title: book.volumeInfo?.title || 'Unknown Title',
            type: 'book' as const,
            imageUrl: book.volumeInfo?.imageLinks?.thumbnail || null,
            year: book.volumeInfo?.publishedDate
                ? new Date(book.volumeInfo.publishedDate).getFullYear()
                : null,
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
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
        return NextResponse.json(
            { error: 'Query parameter is required' },
            { status: 400 }
        );
    }

    if (query.length > 200) {
        return NextResponse.json(
            { error: 'Query too long (max 200 characters)' },
            { status: 400 }
        );
    }

    // Create cache key
    const cacheKey = `search:${query.toLowerCase().trim()}`;

    // Try to get cached results from Redis
    try {
        if (redis) {
            const cachedResults = await redis.get(cacheKey);

            if (cachedResults) {
                console.log('Cache HIT for query:', query);
                return NextResponse.json(cachedResults, {
                    headers: { 'X-Cache-Status': 'HIT' },
                });
            }

            console.log('Cache MISS for query:', query);
        }
    } catch (error) {
        console.error('Redis cache check failed:', error);
        // Continue without cache on Redis error
    }

    try {
        // Fetch from all APIs concurrently using Promise.allSettled
        const results = await Promise.allSettled([
            fetchTMDbResults(query),
            fetchAniListResults(query),
            fetchGoogleBooksResults(query),
        ]);

        // Extract successful results
        const tmdbResults = results[0].status === 'fulfilled' ? results[0].value : [];
        const anilistResults = results[1].status === 'fulfilled' ? results[1].value : [];
        const booksResults = results[2].status === 'fulfilled' ? results[2].value : [];

        // Combine all results
        const combinedResults: MediaResult[] = [
            ...tmdbResults,
            ...anilistResults,
            ...booksResults,
        ];

        const responseData = {
            query,
            total: combinedResults.length,
            results: combinedResults,
            breakdown: {
                movies: tmdbResults.length,
                anime: anilistResults.length,
                books: booksResults.length,
            },
        };

        // Store in Redis cache with 24-hour expiration (86400 seconds)
        try {
            if (redis) {
                await redis.set(cacheKey, responseData, { ex: 86400 });
                console.log('Cached results for query:', query);
            }
        } catch (error) {
            console.error('Failed to cache results:', error);
            // Continue even if caching fails
        }

        return NextResponse.json(responseData, {
            headers: { 'X-Cache-Status': 'MISS' },
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'An error occurred while searching' },
            { status: 500 }
        );
    }
}
