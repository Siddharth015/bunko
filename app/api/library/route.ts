import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Check Authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Request Body
        const body = await request.json();
        const { mediaId, mediaType, title, imageUrl, year } = body;

        if (!mediaId || !mediaType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Convert type to DB Enum (movie -> MOVIE)
        const dbMediaType = mediaType.toUpperCase();
        if (!['MOVIE', 'WEB_SERIES', 'TV', 'ANIME', 'BOOK'].includes(dbMediaType)) {
            // Allow TV. It matches the 'TV' enum we just added.
        }

        // 4. Perform Insert (Upsert to prevent duplicates)
        const { data, error } = await supabase
            .from('media_entries')
            .upsert(
                {
                    user_id: user.id,
                    media_id: mediaId.toString(),
                    media_type: dbMediaType as 'MOVIE' | 'BOOK' | 'ANIME' | 'TV',
                    status: 'PLAN_TO_WATCH',
                },
                {
                    onConflict: 'user_id,media_id,media_type',
                    ignoreDuplicates: true
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, entry: data });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
