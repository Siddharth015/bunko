import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Check Authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Supabase with the user's token so RLS works
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Request Body
        const body = await request.json();
        const { mediaId, mediaType, title, imageUrl, year, status, rating, review, watchedOn } = body;

        if (!mediaId || !mediaType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Convert type to DB Enum
        const dbMediaType = mediaType.toUpperCase();

        // 4. Perform Insert (Upsert)
        let finalStatus = status || 'PLAN_TO_WATCH';
        if (finalStatus === 'WATCHED') finalStatus = 'COMPLETED';

        const upsertData: any = {
            user_id: user.id,
            media_id: mediaId.toString(),
            media_type: dbMediaType as 'MOVIE' | 'BOOK' | 'ANIME' | 'TV',
            status: finalStatus,
            updated_at: new Date().toISOString(),
            // New Columns (Saved for faster profile loading)
            title: title || null,
            image_url: imageUrl || null,
            year: year || null,
            watched_on: watchedOn || null,
        };

        // Only add optional fields if they exist to avoid overwriting with null
        if (rating !== undefined) upsertData.rating = rating;
        if (review !== undefined) upsertData.review = review;

        const { data, error } = await supabase
            .from('media_entries')
            .upsert(
                upsertData,
                {
                    onConflict: 'user_id,media_id,media_type',
                    ignoreDuplicates: false
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
