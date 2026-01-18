'use client';

// Define MediaEntry type strictly
export interface MediaEntry {
    media_id: string;
    media_type: 'MOVIE' | 'TV' | 'ANIME' | 'BOOK';
    status: 'COMPLETED' | 'PLAN_TO_WATCH';
    rating?: number;
    review?: string;
    title?: string;
    image_url?: string;
    year?: number;
    created_at?: string;
}

interface MediaGridProps {
    entries: MediaEntry[];
    showRating?: boolean;
}

export default function ProfileMediaGrid({ entries, showRating = false }: MediaGridProps) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <p className="text-gray-400 text-lg">Nothing here yet.</p>
                <p className="text-gray-600 text-sm mt-1">Go to Search to add some items!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {entries.map((entry) => (
                <div key={`${entry.media_id}-${entry.status}`} className="group relative">
                    {/* Hover Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>

                    <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 transform group-hover:-translate-y-1">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] bg-gray-900">
                            {entry.image_url ? (
                                <img
                                    src={entry.image_url}
                                    alt={entry.title || 'Media'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}

                            {/* Rating Badge (Only for watched) */}
                            {showRating && entry.rating && (
                                <div className="absolute top-2 right-2 bg-yellow-500 text-black font-black text-xs px-2 py-1 rounded shadow-lg">
                                    ★ {entry.rating}
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        </div>

                        {/* Details */}
                        <div className="p-4">
                            <h3 className="text-white text-sm font-semibold truncate" title={entry.title}>
                                {entry.title || 'Untitled'}
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-500 text-xs">
                                    {entry.year || '----'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${entry.media_type === 'MOVIE' ? 'border-blue-500/50 text-blue-400' :
                                    entry.media_type === 'TV' ? 'border-orange-500/50 text-orange-400' :
                                        entry.media_type === 'ANIME' ? 'border-pink-500/50 text-pink-400' :
                                            'border-green-500/50 text-green-400'
                                    }`}>
                                    {entry.media_type}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
