import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const { username } = params;

        // Fetch user profile and top 4 media
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (!profile) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            width: '1200px',
                            height: '630px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '48px',
                            fontWeight: 'bold',
                        }}
                    >
                        User not found
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        // Get top 4 media IDs from profile
        const topFourIds = (profile.top_four_ids || []) as string[];

        // Placeholder images for now (you can replace with actual media queries)
        const mediaPosters = topFourIds.slice(0, 4);

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '1200px',
                        height: '630px',
                        display: 'flex',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        padding: '40px',
                    }}
                >
                    {/* Left side - User info */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '40%',
                            paddingRight: '40px',
                        }}
                    >
                        {/* App Logo/Name */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '72px',
                                fontWeight: 'bold',
                                color: '#a855f7',
                                marginBottom: '20px',
                                letterSpacing: '-2px',
                            }}
                        >
                            BUNKO
                        </div>

                        {/* User Avatar */}
                        {profile.avatar_url && (
                            <div
                                style={{
                                    display: 'flex',
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '60px',
                                    overflow: 'hidden',
                                    marginBottom: '24px',
                                    border: '4px solid #a855f7',
                                }}
                            >
                                <img
                                    src={profile.avatar_url}
                                    alt="Avatar"
                                    width={120}
                                    height={120}
                                    style={{
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        )}

                        {/* Username */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '48px',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '12px',
                            }}
                        >
                            @{username}
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: '20px',
                                    color: '#cbd5e1',
                                    lineHeight: '1.5',
                                }}
                            >
                                {profile.bio.substring(0, 100)}
                                {profile.bio.length > 100 ? '...' : ''}
                            </div>
                        )}

                        {/* Top 4 label */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: '24px',
                                color: '#a855f7',
                                marginTop: '24px',
                                fontWeight: '600',
                            }}
                        >
                            Top 4 Favorites
                        </div>
                    </div>

                    {/* Right side - Media grid */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            width: '60%',
                            gap: '16px',
                            alignContent: 'center',
                        }}
                    >
                        {mediaPosters.length > 0 ? (
                            mediaPosters.map((posterId, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        width: 'calc(50% - 8px)',
                                        height: '220px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        border: '3px solid #a855f7',
                                    }}
                                >
                                    #{index + 1}
                                </div>
                            ))
                        ) : (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        width: 'calc(50% - 8px)',
                                        height: '220px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#64748b',
                                        fontSize: '18px',
                                        border: '2px dashed #334155',
                                    }}
                                >
                                    Empty
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('OG image generation error:', error);

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '1200px',
                        height: '630px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                    }}
                >
                    Error generating image
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    }
}
