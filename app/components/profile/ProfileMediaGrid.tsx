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
    isOwnProfile?: boolean;
    onEdit?: (entry: MediaEntry) => void;
    onDelete?: (entry: MediaEntry) => void;
}

export default function ProfileMediaGrid({ entries, viewMode, isOwnProfile, onEdit, onDelete }: ProfileMediaGridProps) {

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
                    <div key={`${entry.media_id}-${entry.media_type}`} className="flex gap-4 md:gap-6 bg-black border border-white/10 p-4 hover:border-white/30 transition-colors group relative">
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

                        {/* Actions (Only if Own Profile) */}
                        {isOwnProfile && (
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit?.(entry)}
                                    className="p-1 bg-white text-black hover:bg-purple-400 transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDelete?.(entry)}
                                    className="p-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
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

                        {/* Actions */}
                        {isOwnProfile && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(entry); }}
                                    className="flex-1 py-1 bg-white text-black text-xs font-bold hover:bg-purple-400"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete?.(entry); }}
                                    className="flex-1 py-1 bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                                >
                                    DEL
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
