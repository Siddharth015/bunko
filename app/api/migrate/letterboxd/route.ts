import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { title, year } = await request.json();

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.TMDB_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'TMDb API key not configured' },
                { status: 500 }
            );
        }

        // Build search query with year if provided
        let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;

        if (year) {
            searchUrl += `&year=${year}`;
        }

        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`TMDb API error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results || [];

        if (results.length === 0) {
            return NextResponse.json({
                found: false,
                title,
                year,
            });
        }

        // Return the first (most relevant) match
        const movie = results[0];

        return NextResponse.json({
            found: true,
            movie: {
                id: `tmdb-${movie.id}`,
                tmdbId: movie.id,
                title: movie.title,
                year: movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : null,
                posterPath: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null,
            },
        });
    } catch (error) {
        console.error('TMDb lookup error:', error);
        return NextResponse.json(
            { error: 'Failed to lookup movie' },
            { status: 500 }
        );
    }
}
