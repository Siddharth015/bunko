'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth, supabase } from '../../components/AuthProvider';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import ProfileMediaGrid, { MediaEntry } from '../../components/profile/ProfileMediaGrid';
import LogModal from '../../components/LogModal';

interface ProfileClientProps {
    profile: any;
    mediaEntries: MediaEntry[];
}

export default function ProfileClient({ profile, mediaEntries: initialEntries }: ProfileClientProps) {
    const { user } = useAuth();
    const isOwnProfile = user?.id === profile.id;

    // Local state for entries to allow updates without full page reload
    const [entries, setEntries] = useState<MediaEntry[]>(initialEntries);
    const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');
    const [viewMode, setViewMode] = useState<'history' | 'library' | 'watching'>('history');

    // Edit/Log State
    const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredEntries = useMemo(() => {
        let currentEntries = entries;

        // 1. Filter by Tab (Type)
        if (activeTab !== 'all') {
            const typeMap = {
                movie: 'MOVIE',
                tv: 'TV',
                anime: 'ANIME',
                book: 'BOOK'
            };
            currentEntries = currentEntries.filter(e => e.media_type === typeMap[activeTab]);
        }

        // 2. Filter by View Mode (Status)
        if (viewMode === 'history') {
            currentEntries = currentEntries.filter(e => e.status === 'COMPLETED');
            // Sort by watched_on or created_at (most recent first)
            return currentEntries.sort((a, b) => {
                const dateA = a.watched_on ? new Date(a.watched_on).getTime() : new Date(a.created_at || 0).getTime();
                const dateB = b.watched_on ? new Date(b.watched_on).getTime() : new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
        } else if (viewMode === 'library') {
            currentEntries = currentEntries.filter(e => e.status === 'PLAN_TO_WATCH');
            return currentEntries.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        } else if (viewMode === 'watching') {
            currentEntries = currentEntries.filter(e => e.status === 'WATCHING');
            return currentEntries.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
        }

        return currentEntries;
    }, [activeTab, viewMode, entries]);

    // Stats Logic
    const totalWatched = entries.filter(e => e.status === 'COMPLETED').length;
    const totalWatching = entries.filter(e => e.status === 'WATCHING').length;
    const totalLibrary = entries.filter(e => e.status === 'PLAN_TO_WATCH').length;

    const level = Math.floor(totalWatched / 5) + 1;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${profile.username}'s Bunko Profile`,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            // Could add toast here
            alert('Profile link copied to clipboard!');
        }
    };

    const handleEdit = (entry: MediaEntry) => {
        setEditingEntry(entry);
        setIsLogModalOpen(true);
    };

    const handleDelete = async (entry: MediaEntry) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`/api/library?mediaId=${entry.media_id}&mediaType=${entry.media_type}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                // Remove from local state
                setEntries(prev => prev.filter(e => !(e.media_id === entry.media_id && e.media_type === entry.media_type)));
            } else {
                alert('Failed to delete entry');
            }
        } catch (e) {
            console.error('Delete error', e);
            alert('An error occurred');
        }
    };

    const handleSaveLog = async (rating: number, review: string, watchedOn: string, status: string) => {
        if (!editingEntry) return;
        setIsSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    mediaId: editingEntry.media_id,
                    mediaType: editingEntry.media_type,
                    status: status, // Use selected status
                    rating: (status === 'COMPLETED' || status === 'DROPPED') ? rating : null,
                    review,
                    watchedOn: (status === 'COMPLETED' || status === 'DROPPED') ? watchedOn : null,
                    title: editingEntry.title,
                    imageUrl: editingEntry.image_url,
                    year: editingEntry.year
                })
            });

            if (res.ok) {
                const { entry: newEntry } = await res.json();
                // Update local state and remove/add to correct lists if status changed
                // Actually, just updating proper entry in array is sufficient if we filter dynamically.
                setEntries(prev => prev.map(e =>
                    (e.media_id === newEntry.media_id && e.media_type === newEntry.media_type) ? newEntry : e
                ));
                setIsLogModalOpen(false);
                setEditingEntry(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden pt-20 font-mono">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">

                {/* Header */}
                <ProfileHeader
                    username={profile.username}
                    bio={profile.bio}
                    avatarUrl={profile.avatar_url}
                    level={level}
                    totalWatched={totalWatched}
                    isOwnProfile={isOwnProfile}
                />

                {/* Main Navigation (View Modes) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/20 pb-6">
                    <div className="flex items-center gap-1 bg-black p-1 border border-white/20 rounded-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                        {[
                            { id: 'history', label: 'History', count: totalWatched },
                            { id: 'watching', label: 'Watching', count: totalWatching },
                            { id: 'library', label: 'Library', count: totalLibrary },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id as any)}
                                className={`
                                    flex-1 md:flex-none px-3 md:px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                    ${viewMode === mode.id
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-400 hover:text-white hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {mode.label}
                                <span className={`ml-2 text-xs ${viewMode === mode.id ? 'text-gray-500' : 'text-gray-600'}`}>
                                    [{mode.count}]
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all uppercase font-bold text-sm tracking-wider"
                    >
                        Share Profile
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>

                {/* Sub-Filters (Tabs) */}
                <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

                {/* Content Label */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-white font-black text-xl uppercase tracking-tighter">
                        {viewMode === 'history' && 'Log_Entries'}
                        {viewMode === 'watching' && 'Active_Sessions'}
                        {viewMode === 'library' && 'Backlog_Grid'}
                    </h3>
                    <div className="text-gray-500 text-xs font-mono">
                        Showing {filteredEntries.length} items
                    </div>
                </div>

                {/* Content Grid */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProfileMediaGrid
                        entries={filteredEntries}
                        viewMode={viewMode}
                        isOwnProfile={isOwnProfile}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* Log Modal for Editing */}
            <LogModal
                isOpen={isLogModalOpen}
                onClose={() => { setIsLogModalOpen(false); setEditingEntry(null); }}
                onSave={handleSaveLog}
                title={editingEntry?.title || 'Edit Entry'}
                isSaving={isSaving}
                initialRating={editingEntry?.rating}
                initialReview={editingEntry?.review}
                initialWatchedOn={editingEntry?.watched_on}
                initialStatus={editingEntry?.status}
            />
        </div>
    );
}
