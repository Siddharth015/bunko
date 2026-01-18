'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import { useAuth, supabase } from '../components/AuthProvider';
import AuthModal from '../components/AuthModal';
import LogModal from '../components/LogModal';

interface MediaResult {
    id: string;
    title: string;
    type: 'movie' | 'anime' | 'book' | 'tv';
    imageUrl: string | null;
    year: number | null;
}

function MediaCard({ media, onLibraryAdd, onLogClick, isAdding }: { media: MediaResult; onLibraryAdd: () => void; onLogClick: () => void; isAdding: boolean }) {
    const badgeColors = {
        movie: 'from-blue-500 to-cyan-500',
        tv: 'from-orange-500 to-amber-500',
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
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${badgeColors[media.type] || badgeColors.movie} text-white text-xs font-bold uppercase shadow-lg`}>
                        {media.type}
                    </div>

                    {/* Action Buttons Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">

                        {/* 1. Log / Watched Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLogClick();
                            }}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-200 shadow-lg shadow-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watched
                        </button>

                        {/* 2. Library / Plan to Watch Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLibraryAdd();
                            }}
                            disabled={isAdding}
                            className="w-full bg-white/10 text-white font-semibold py-3 px-4 rounded-xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 flex items-center justify-center gap-2 hover:bg-white/20"
                        >
                            {isAdding ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )}
                            {isAdding ? 'Adding...' : 'Library'}
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
    const [breakdown, setBreakdown] = useState({ movies: 0, anime: 0, books: 0, tv: 0 });

    const deferredSearch = useDeferredValue(searchInput);

    // Search Effect
    useEffect(() => {
        if (!deferredSearch || deferredSearch.trim().length < 2) {
            setResults([]);
            setBreakdown({ movies: 0, anime: 0, books: 0, tv: 0 });
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
                setBreakdown(data.breakdown || { movies: 0, anime: 0, books: 0, tv: 0 });
            } catch (err) {
                setError('Failed to search. Please try again.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [deferredSearch]);

    // Auth & Modal State
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaResult | null>(null);
    const [isSavingLog, setIsSavingLog] = useState(false);
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

    // Helper to call API
    const saveMediaEntry = async (media: MediaResult, extraData: any) => {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error('No session');

        const res = await fetch('/api/library', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                mediaId: media.id,
                mediaType: media.type,
                title: media.title,
                year: media.year,
                imageUrl: media.imageUrl,
                ...extraData
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error: ${res.status}`);
        }
    };

    // 1. Handle "Add to Library" (Quick Add)
    const handleAddToLibrary = async (media: MediaResult) => {
        if (!user) { setShowAuthModal(true); return; }

        setAddingIds(prev => new Set(prev).add(media.id));

        try {
            await saveMediaEntry(media, { status: 'PLAN_TO_WATCH' });
            // Ideally assume success or show toast
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

    // 2. Handle "Log/Watched" Click (Opens Modal)
    const handleLogClick = (media: MediaResult) => {
        if (!user) { setShowAuthModal(true); return; }
        setSelectedMedia(media);
        setShowLogModal(true);
    };

    // 3. Handle Saving from Log Modal
    const handleLogSave = async (data: { status: 'WATCHED' | 'PLAN_TO_WATCH'; rating?: number; review?: string }) => {
        if (!selectedMedia) return;
        setIsSavingLog(true);
        try {
            await saveMediaEntry(selectedMedia, data);
            setShowLogModal(false);
            setSelectedMedia(null);
            // Ideally trigger a toast here
        } catch (err: any) {
            console.error(err);
            alert(`Failed to log entry: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSavingLog(false);
        }
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pt-20">
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <LogModal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                onSave={handleLogSave}
                mediaTitle={selectedMedia?.title || ''}
                isSaving={isSavingLog}
            />

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
                        Movies, Series, Anime, and Books—all in one place
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
                                placeholder="Search here... (e.g. Breaking Bad)"
                                className="w-full pl-16 pr-6 py-5 bg-white/5 backdrop-blur-xl text-white rounded-2xl border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {results.length > 0 && !loading && (
                    <div className="flex gap-3 justify-center mb-12 flex-wrap">
                        <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-blue-300 font-semibold">{breakdown.movies} Movies</span>
                        </div>
                        <div className="px-6 py-3 bg-orange-500/10 border border-orange-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-orange-300 font-semibold">{breakdown.tv} TV Shows</span>
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
                                onLibraryAdd={() => handleAddToLibrary(media)}
                                onLogClick={() => handleLogClick(media)}
                                isAdding={addingIds.has(media.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && searchInput && results.length === 0 && deferredSearch.length >= 2 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No results found for "{deferredSearch}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
