import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/Navigation';
import ProfileClient from './profile-client';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(
    props: {
        params: Promise<{ username: string }>;
    }
): Promise<Metadata> {
    const params = await props.params;
    const { username } = params;

    const { data: profile } = await supabase
        .from('profiles')
        .select('bio, username')
        .eq('username', username)
        .single();

    const title = profile ? `@${username} | Bunko` : 'Profile | Bunko';
    const description = profile?.bio || `Check out @${username}'s media collection on Bunko`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [`/api/og/${username}`], // Dynamic OG Image
            type: 'profile',
        },
    };
}

export default async function ProfilePage(
    props: {
        params: Promise<{ username: string }>;
    }
) {
    const params = await props.params;
    const { username } = params;

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (!profile) {
        return (
            <>
                <Navigation />
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-2">User Not Found</h1>
                        <p className="text-gray-500">@{username} does not exist.</p>
                    </div>
                </div>
            </>
        );
    }

    // 2. Fetch Media Entries (With new columns)
    const { data: entries } = await supabase
        .from('media_entries')
        .select('*')
        .eq('user_id', profile.id);
    // Supabase returns null if error, or empty array.
    // The type for entries needs to match MediaEntry interface if possible, 
    // but for now passing 'any' is safe as we formatted the client to handle it.

    // 3. Determine if viewing own profile 
    // (Ideally would check server session here, but for now passing false 
    // or we can do a client-side check if needed for edit buttons)

    return (
        <>
            <Navigation />
            <ProfileClient
                profile={profile}
                mediaEntries={entries || []}
            />
        </>
    );
}
