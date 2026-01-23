'use client';

import { useState, useEffect, useDeferredValue } from 'react';
import { useAuth, supabase } from '../components/AuthProvider';
import AuthModal from '../components/AuthModal';
import LogModal from '../components/LogModal';
import PixelIcon from '../components/PixelIcon';

interface MediaResult {
    id: string;
    title: string;
    type: 'movie' | 'anime' | 'book' | 'tv';
    imageUrl: string | null;
    year: number | null;
}

function MediaCard({ media, onLibraryAdd, onLogClick, isAdding }: { media: MediaResult; onLibraryAdd: () => void; onLogClick: () => void; isAdding: boolean }) {

    // Pixel/Journal Card Style - UPDATED: Color by default, glow on hover
    return (
        <div className="group relative bg-black border border-white/20 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
            {/* Image Area */}
            <div className="relative w-full aspect-[2/3] bg-gray-900 border-b border-white/10 group-hover:border-white/30 overflow-hidden">
                {media.imageUrl ? (
                    <img
                        src={media.imageUrl}
                        alt={media.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:8px_8px]">
                        <PixelIcon type="disk" size={32} className="opacity-20 mb-2" />
                        <span className="text-xs font-mono uppercase">No Image</span>
                    </div>
                )}

                {/* Type Badge - Top Right */}
                <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold font-mono px-2 py-1 uppercase z-10">
                    {media.type}
                </div>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onLogClick(); }}
                        className="w-full bg-white text-black font-bold font-mono text-xs uppercase py-3 border-2 border-transparent hover:border-black hover:bg-gray-200 transition-all"
                    >
                        Log Entry
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onLibraryAdd(); }}
                        disabled={isAdding}
                        className="w-full bg-black text-white font-bold font-mono text-xs uppercase py-3 border border-white hover:bg-white hover:text-black transition-all"
                    >
                        {isAdding ? 'Processing...' : '+ Add to List'}
                    </button>
                </div>
            </div>

            {/* Info Area */}
            <div className="p-4 bg-black">
                <h3 className="text-white font-bold font-mono text-sm uppercase truncate mb-1">
                    {media.title}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>{media.year || 'UNKNOWN'}</span>
                    <span className="tracking-widest">#{media.id.slice(0, 4)}</span>
                </div>
            </div>
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-black border border-white/10 p-4 animate-pulse">
                    <div className="w-full aspect-[2/3] bg-gray-900 mb-4 opacity-50"></div>
                    <div className="h-4 bg-gray-800 w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-900 w-1/4"></div>
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');

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
            setActiveFilter('all');

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
    const saveMediaEntry = async (mediaInfo: any, extraData: any) => {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) throw new Error('No session');

        const res = await fetch('/api/library', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                mediaId: mediaInfo.mediaId,
                mediaType: mediaInfo.mediaType,
                title: mediaInfo.title,
                year: mediaInfo.year,
                imageUrl: mediaInfo.imageUrl,
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
            const { id, title, type, year, imageUrl } = media;

            await saveMediaEntry({
                mediaId: id,
                mediaType: type,
                title,
                year,
                imageUrl
            }, { status: 'PLAN_TO_WATCH' });

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
    const handleLogSave = async (rating: number, review: string, watchedOn: string) => {
        if (!selectedMedia) return;
        setIsSavingLog(true);
        try {
            const { id, title, type, imageUrl, year } = selectedMedia;

            await saveMediaEntry({
                mediaId: id,
                mediaType: type,
                title,
                imageUrl,
                year,
            }, {
                status: 'WATCHED',
                rating,
                review,
                watchedOn
            });

            setShowLogModal(false);
            setSelectedMedia(null);
        } catch (err: any) {
            console.error(err);
            alert(`Failed to log entry: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSavingLog(false);
        }
    };

    // Request Listing Logic
    const [requestSent, setRequestSent] = useState(false);
    const handleRequestListing = async () => {
        if (!user) { setShowAuthModal(true); return; }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/request-listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ title: searchInput, type: activeFilter === 'all' ? 'UNKNOWN' : activeFilter })
            });
            if (res.ok) {
                setRequestSent(true);
                setTimeout(() => setRequestSent(false), 3000);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter Logic
    const filteredResults = activeFilter === 'all'
        ? results
        : results.filter(r => r.type === activeFilter);

    // Interactive Empty State Categories
    const emptyCategories = [
        { label: 'TOP_MOVIES', icon: 'disk', query: 'Top Rated Movies' },
        { label: 'ANIME_HITS', icon: 'star', query: 'Popular Anime' },
        { label: 'SCI_FI_BOOKS', icon: 'lightning', query: 'Sci-Fi Books' },
        { label: 'DISCOVER', icon: 'search', query: '2024 Hidden Gems' },
    ] as const;

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden pt-20 font-mono">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            <LogModal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                onSave={handleLogSave}
                title={selectedMedia?.title || ''}
                isSaving={isSavingLog}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block border border-white/20 px-3 py-1 mb-4">
                        <span className="text-xs text-purple-500 font-bold uppercase tracking-widest animate-pulse">
                            System_Online
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
                        Media_Discovery<span className="text-purple-500">_Uplink</span>
                    </h1>
                </div>

                {/* Search Bar - Terminal Style */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-white/10 blur opacity-25 group-focus-within:opacity-75 transition duration-500"></div>
                        <div className="relative flex items-center bg-black border-2 border-white/20 group-focus-within:border-white transition-colors">
                            <div className="px-4 text-gray-500 group-focus-within:text-white transition-colors">
                                <PixelIcon type="search" size={24} />
                            </div>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="ENTER_KEYWORDS..."
                                className="w-full py-4 bg-transparent text-white font-mono uppercase text-lg placeholder-gray-700 focus:outline-none"
                                spellCheck={false}
                            />
                            {loading && (
                                <div className="px-4">
                                    <div className="w-4 h-4 bg-purple-500 animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Chips (Clickable Filters) */}
                {results.length > 0 && !loading && (
                    <div className="flex gap-4 justify-center mb-12 flex-wrap">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`flex items-center gap-2 px-4 py-2 border transition-all ${activeFilter === 'all' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 hover:border-white/50'}`}
                        >
                            <span className="text-white font-bold text-xs uppercase">All Results ({results.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter('movie')}
                            className={`flex items-center gap-2 px-4 py-2 border transition-all ${activeFilter === 'movie' ? 'border-blue-500 bg-blue-500/20' : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'}`}
                        >
                            <PixelIcon type="disk" size={16} className="text-blue-500" />
                            <span className="text-blue-400 font-bold text-xs uppercase">{breakdown.movies} Movies</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter('tv')}
                            className={`flex items-center gap-2 px-4 py-2 border transition-all ${activeFilter === 'tv' ? 'border-orange-500 bg-orange-500/20' : 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10'}`}
                        >
                            <PixelIcon type="folder" size={16} className="text-orange-500" />
                            <span className="text-orange-400 font-bold text-xs uppercase">{breakdown.tv} TV Series</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter('anime')}
                            className={`flex items-center gap-2 px-4 py-2 border transition-all ${activeFilter === 'anime' ? 'border-pink-500 bg-pink-500/20' : 'border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10'}`}
                        >
                            <PixelIcon type="star" size={16} className="text-pink-500" />
                            <span className="text-pink-400 font-bold text-xs uppercase">{breakdown.anime} Anime</span>
                        </button>

                        <button
                            onClick={() => setActiveFilter('book')}
                            className={`flex items-center gap-2 px-4 py-2 border transition-all ${activeFilter === 'book' ? 'border-green-500 bg-green-500/20' : 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'}`}
                        >
                            <PixelIcon type="lightning" size={16} className="text-green-500" />
                            <span className="text-green-400 font-bold text-xs uppercase">{breakdown.books} Books</span>
                        </button>
                    </div>
                )}

                {/* Results Grid - Filtered */}
                {loading && <SearchSkeleton />}

                {error && (
                    <div className="text-center border border-red-500/50 bg-red-500/10 p-6">
                        <p className="text-red-500 font-mono font-bold uppercase">Error: {error}</p>
                    </div>
                )}

                {!loading && filteredResults.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
                        {filteredResults.map((media) => (
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

                {!loading && results.length > 0 && filteredResults.length === 0 && (
                    <div className="text-center py-20 text-gray-500 font-mono">
                        No results in this category.
                    </div>
                )}

                {/* No Results found on Search */}
                {!loading && !error && searchInput.length >= 2 && results.length === 0 && (
                    <div className="text-center py-20 border border-white/10 bg-white/5">
                        <p className="text-gray-400 font-mono mb-6 uppercase">
                            No data found for "{searchInput}"
                        </p>
                        <button
                            onClick={handleRequestListing}
                            disabled={requestSent}
                            className={`px-8 py-3 font-bold font-mono uppercase tracking-wider transition-all
                                ${requestSent
                                    ? 'bg-green-500 text-black border-green-500'
                                    : 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black'
                                }
                            `}
                        >
                            {requestSent ? 'Request Sent ✓' : 'Request Listing +'}
                        </button>
                        <p className="text-gray-600 text-xs mt-4 font-mono">
                            Our archivists will review your request manually.
                        </p>
                    </div>
                )}

                {/* Empty State / Quick Browse (Visual Only) */}
                {!loading && !error && searchInput.length < 2 && (
                    <div className="text-center py-12">
                        {/* Removed Text Label */}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {emptyCategories.map((cat, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col items-center justify-center p-8 border border-white/10 bg-white/5 cursor-default transition-all duration-300"
                                >
                                    <div className="mb-4 text-gray-500 group-hover:text-purple-500 transition-colors">
                                        <PixelIcon type={cat.icon as any} size={48} animated={false} />
                                    </div>
                                    <span className="text-white font-bold font-mono text-sm uppercase tracking-wider group-hover:text-purple-400">
                                        {cat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
