import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/Navigation';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({
    params,
}: {
    params: { username: string };
}): Promise<Metadata> {
    const { username } = params;

    // Fetch user profile for metadata
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
            images: [`/api/og/${username}`],
            type: 'profile',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`/api/og/${username}`],
        },
    };
}

export default async function ProfilePage({
    params,
}: {
    params: { username: string };
}) {
    const { username } = params;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (!profile) {
        return (
            <>
                <Navigation />
                <div className="min-h-screen bg-black relative overflow-hidden pt-20 flex items-center justify-center">
                    <div className="fixed inset-0 opacity-40 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
                    </div>
                    <div className="relative text-center">
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">User Not Found</h1>
                        <p className="text-gray-400 text-lg">@{username} doesn't exist on Bunko</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-black relative overflow-hidden pt-20">
                {/* Background */}
                <div className="fixed inset-0 opacity-40 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Profile Header */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-12 mb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={`@${username}`}
                                    className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-2xl"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                                    {username[0].toUpperCase()}
                                </div>
                            )}

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                                    @{username}
                                </h1>
                                {profile.bio && (
                                    <p className="text-gray-300 text-lg mb-4 max-w-2xl">{profile.bio}</p>
                                )}
                                <div className="text-sm text-gray-400">
                                    Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top 4 Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white mb-6">Top 4 Favorites</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {(profile.top_four_ids || []).length > 0 ? (
                                (profile.top_four_ids as string[]).slice(0, 4).map((id, index) => (
                                    <div
                                        key={id}
                                        className="group relative aspect-[2/3] rounded-2xl overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-black">
                                            #{index + 1}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-sm">Coming Soon</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="aspect-[2/3] bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-purple-500/50 transition-colors"
                                    >
                                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-sm">Empty Slot</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Media Library */}
                    <div>
                        <h2 className="text-3xl font-black text-white mb-6">Media Library</h2>
                        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-lg">
                                Library feature coming soon
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
