'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import { useAuth, supabase } from '../components/AuthProvider';
import AuthModal from '../components/AuthModal';

interface MediaResult {
    id: string;
    title: string;
    type: 'movie' | 'anime' | 'book';
    imageUrl: string | null;
    year: number | null;
}

function MediaCard({ media, onAdd, isAdding }: { media: MediaResult; onAdd: () => void; isAdding: boolean }) {
    const badgeColors = {
        movie: 'from-blue-500 to-cyan-500',
        anime: 'from-pink-500 to-rose-500',
        book: 'from-green-500 to-emerald-500',
    };

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                {/* Image */}
                <div className="relative w-full aspect-[2/3] bg-gray-900">
                    {media.imageUrl ? (
                        <img
                            src={media.imageUrl}
                            alt={media.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${badgeColors[media.type]} text-white text-xs font-bold uppercase shadow-lg`}>
                        {media.type}
                    </div>

                    {/* Add Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdd();
                            }}
                            disabled={isAdding}
                            className="bg-white text-black font-bold py-3 px-6 rounded-full transform scale-90 hover:scale-100 transition-transform flex items-center gap-2 hover:bg-gray-200"
                        >
                            {isAdding ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                            {isAdding ? 'Adding...' : 'Add to Library'}
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {media.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                        {media.year || 'Year Unknown'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] bg-white/5 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
}

export default function SearchClient() {
    const [searchInput, setSearchInput] = useState('');
    const [results, setResults] = useState<MediaResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [breakdown, setBreakdown] = useState({ movies: 0, anime: 0, books: 0 });

    const deferredSearch = useDeferredValue(searchInput);

    useEffect(() => {
        if (!deferredSearch || deferredSearch.trim().length < 2) {
            setResults([]);
            setBreakdown({ movies: 0, anime: 0, books: 0 });
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/search?query=${encodeURIComponent(deferredSearch)}`);
                if (!response.ok) throw new Error('Search failed');

                const data = await response.json();
                setResults(data.results || []);
                setBreakdown(data.breakdown || { movies: 0, anime: 0, books: 0 });
            } catch (err) {
                setError('Failed to search. Please try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [deferredSearch]);

    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

    const handleAddToLibrary = async (media: MediaResult) => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setAddingIds(prev => new Set(prev).add(media.id));

        try {
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    mediaId: media.id,
                    mediaType: media.type,
                    title: media.title,
                    year: media.year,
                    imageUrl: media.imageUrl
                })
            });

            if (!res.ok) throw new Error('Failed to add');

            // Show toast or success state? For now just stop loading
            // Ideally we'd have a toast library. 
            // We'll simulate a brief "Checked" state by keeping it in 'addingIds' or moving to a 'addedIds' set.
            // But for this step, just resetting loading state.
        } catch (err) {
            console.error(err);
            alert('Failed to add to library');
        } finally {
            setAddingIds(prev => {
                const next = new Set(prev);
                next.delete(media.id);
                return next;
            });
        }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pt-20">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* Background */}
            <div className="fixed inset-0 opacity-40 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
                        Universal Search
                    </h1>
                    <p className="text-xl text-gray-400">
                        Movies, anime, and books—all in one search
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-focus-within:opacity-75 transition duration-500"></div>
                        <div className="relative flex items-center">
                            <svg className="absolute left-6 w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search for anything..."
                                className="w-full pl-16 pr-6 py-5 bg-white/5 backdrop-blur-xl text-white rounded-2xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {results.length > 0 && !loading && (
                    <div className="flex gap-3 justify-center mb-12">
                        <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-blue-300 font-semibold">{breakdown.movies} Movies</span>
                        </div>
                        <div className="px-6 py-3 bg-pink-500/10 border border-pink-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-pink-300 font-semibold">{breakdown.anime} Anime</span>
                        </div>
                        <div className="px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-green-300 font-semibold">{breakdown.books} Books</span>
                        </div>
                    </div>
                )}

                {/* Results */}
                {loading && <SearchSkeleton />}

                {error && (
                    <div className="text-center bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {results.map((media) => (
                            <MediaCard
                                key={media.id}
                                media={media}
                                onAdd={() => handleAddToLibrary(media)}
                                isAdding={addingIds.has(media.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty States */}
                {!loading && !error && searchInput && results.length === 0 && deferredSearch.length >= 2 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-lg">No results found for "{deferredSearch}"</p>
                    </div>
                )}

                {!searchInput && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-lg mb-4">Start typing to discover media</p>
                        <p className="text-gray-600 text-sm">Try searching for "Inception", "Naruto", or "Harry Potter"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
