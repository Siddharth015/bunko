'use client';

export interface MediaEntry {
    media_id: string;
    media_type: 'MOVIE' | 'TV' | 'ANIME' | 'BOOK';
    status: 'COMPLETED' | 'PLAN_TO_WATCH' | 'WATCHING' | 'DROPPED' | 'ON_HOLD';
    rating?: number;
    review?: string;
    title?: string;
    image_url?: string;
    year?: number;
    created_at?: string;
    updated_at?: string;
    watched_on?: string;
}

interface ProfileMediaGridProps {
    entries: MediaEntry[];
    viewMode: 'history' | 'library' | 'watching';
}

export default function ProfileMediaGrid({ entries, viewMode }: ProfileMediaGridProps) {

    if (entries.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-white/10 bg-white/5 rounded-lg">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">NO_DATA_FOUND</h3>
                <p className="text-gray-500 font-mono text-sm">This collection is empty.</p>
            </div>
        );
    }

    // View Mode: History (List / Detailed Cards)
    if (viewMode === 'history') {
        return (
            <div className="flex flex-col gap-4">
                {entries.map((entry) => (
                    <div key={`${entry.media_id}-${entry.media_type}`} className="flex gap-4 md:gap-6 bg-black border border-white/10 p-4 hover:border-white/30 transition-colors group">
                        {/* Poster */}
                        <div className="flex-shrink-0 w-24 md:w-32 aspect-[2/3] bg-gray-800 relative overflow-hidden border border-white/10">
                            {entry.image_url ? (
                                <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900 text-xs">NO IMG</div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-tight line-clamp-1">{entry.title || 'Unknown Title'}</h3>
                                    {entry.rating && (
                                        <div className="flex items-center gap-1 bg-white text-black px-2 py-0.5 font-mono text-sm font-bold">
                                            <span>★</span>{entry.rating}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono text-gray-500 uppercase mb-4">
                                    <span className="bg-white/10 px-2 py-0.5 text-gray-300">{entry.media_type}</span>
                                    <span>{entry.year}</span>
                                    <span>•</span>
                                    <span className={entry.watched_on ? 'text-purple-400' : ''}>
                                        {entry.watched_on ? `Watched: ${entry.watched_on}` : `Logged: ${new Date(entry.created_at || '').toLocaleDateString()}`}
                                    </span>
                                </div>

                                {entry.review && (
                                    <p className="text-gray-300 text-sm italic border-l-2 border-white/20 pl-3 line-clamp-2 md:line-clamp-3">
                                        "{entry.review}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // View Mode: Library / Grid (Simple Posters)
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {entries.map((entry) => (
                <div key={`${entry.media_id}-${entry.media_type}`} className="group relative aspect-[2/3] bg-gray-900 border border-white/10 hover:border-white transition-colors cursor-pointer">
                    {entry.image_url ? (
                        <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-xs p-2 text-center">
                            {entry.title}
                        </div>
                    )}

                    {/* Hover Info */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="text-white font-bold text-sm leading-tight mb-1">{entry.title}</div>
                        <div className="text-gray-400 text-xs font-mono">{entry.year}</div>
                        <div className="mt-2 text-xs font-mono uppercase text-purple-400">
                            {entry.media_type}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
