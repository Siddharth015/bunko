'use client';

import { useState, useMemo } from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import ProfileMediaGrid, { MediaEntry } from '../../components/profile/ProfileMediaGrid';

interface ProfileClientProps {
    profile: any;
    mediaEntries: MediaEntry[];
    isOwnProfile: boolean;
}

export default function ProfileClient({ profile, mediaEntries, isOwnProfile }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'anime' | 'book'>('all');
    const [viewMode, setViewMode] = useState<'history' | 'library'>('history');

    // Filter Logic
    const filteredEntries = useMemo(() => {
        let entries = mediaEntries;

        // 1. Filter by Tab (Type)
        if (activeTab !== 'all') {
            const typeMap = {
                movie: 'MOVIE',
                tv: 'TV',
                anime: 'ANIME',
                book: 'BOOK'
            };
            entries = entries.filter(e => e.media_type === typeMap[activeTab]);
        }

        // 2. Filter by View Mode (Status)
        // History = COMPLETED, Library = PLAN_TO_WATCH
        const statusTarget = viewMode === 'history' ? 'COMPLETED' : 'PLAN_TO_WATCH';
        entries = entries.filter(e => e.status === statusTarget);

        // 3. Sort
        // History -> Recently updated first
        // Library -> Generally recent adds first
        return entries.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }, [activeTab, viewMode, mediaEntries]);

    // Stats Logic
    const totalWatched = mediaEntries.filter(e => e.status === 'COMPLETED').length;
    const level = Math.floor(totalWatched / 5) + 1; // Simple level calc: 1 level per 5 items

    return (
        <div className="min-h-screen bg-black relative overflow-hidden pt-20">
            {/* Background */}
            <div className="fixed inset-0 opacity-40 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <ProfileHeader
                    username={profile.username}
                    bio={profile.bio}
                    avatarUrl={profile.avatar_url}
                    level={level}
                    totalWatched={totalWatched}
                />

                {/* Sub-Navigation (Switch View Mode) */}
                <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setViewMode('history')}
                        className={`text-xl font-bold transition-colors ${viewMode === 'history' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setViewMode('library')}
                        className={`text-xl font-bold transition-colors ${viewMode === 'library' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        Library <span className="text-xs align-top bg-white/10 px-1.5 py-0.5 rounded text-gray-400 ml-1">
                            {mediaEntries.filter(e => e.status === 'PLAN_TO_WATCH').length}
                        </span>
                    </button>
                </div>

                {/* Category Tabs */}
                <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

                {/* Content Grid */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProfileMediaGrid
                        entries={filteredEntries}
                        showRating={viewMode === 'history'}
                    />
                </div>
            </div>
        </div>
    );
}
