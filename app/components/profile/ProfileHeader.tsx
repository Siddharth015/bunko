'use client';
import { useState } from 'react';
import { supabase } from '../AuthProvider'; // Ensure this path is correct. If ProfileHeader is in components/profile/ProfileHeader.tsx, AuthProvider is likely in ../AuthProvider.tsx or ../../components/AuthProvider.tsx

// Better yet, update imports:
// import { supabase } from '../../components/AuthProvider';

interface ProfileHeaderProps {
    username: string;
    bio?: string;
    avatarUrl?: string;
    level: number;
    totalWatched: number;
    isOwnProfile: boolean;
}

export default function ProfileHeader({ username, bio, avatarUrl, level, totalWatched, isOwnProfile }: ProfileHeaderProps) {
    const xpProgress = (totalWatched % 5) * 20; // 5 items per level, so % 5 * 20 = percentage
    const nextLevel = level + 1;

    // Tier Logic
    const getTierName = (lvl: number) => {
        if (lvl <= 10) return 'OBSERVER';
        if (lvl <= 20) return 'TRACKER';
        if (lvl <= 30) return 'ANALYST';
        if (lvl <= 40) return 'ARCHIVIST';
        if (lvl <= 50) return 'CURATOR';
        return 'ARCHITECT';
    };

    const tierName = getTierName(level);

    // Top % Badge Logic
    let topPercent = null;
    if (level >= 20) topPercent = 'TOP 5%';
    else if (level >= 10) topPercent = 'TOP 10%';

    // Bio Editing
    const [isEditing, setIsEditing] = useState(false);
    const [currentBio, setCurrentBio] = useState(bio || "No bio data available. User is mysterious.");
    const [editBioText, setEditBioText] = useState(currentBio);

    const handleSaveBio = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ bio: editBioText })
            });
            if (res.ok) {
                setCurrentBio(editBioText);
                setIsEditing(false);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="mb-12 border-2 border-white bg-black p-6 md:p-8 relative">
            {/* ID Card Label */}
            <div className="absolute top-0 right-0 bg-white text-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span>ID_CARD_V3</span>
                <span className="bg-black text-white px-1.5 text-[10px]">{tierName}_CLASS</span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Avatar (Pixelated Border) */}
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-800 border-4 border-white overflow-hidden relative">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={username} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-900 text-white text-4xl font-mono font-bold">
                                {username[0].toUpperCase()}
                            </div>
                        )}
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                    </div>
                </div>

                {/* User Info */}
                {/* User Info */}
                <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none break-all">
                                {username}
                            </h1>
                            {topPercent && (
                                <div className="bg-yellow-400 text-black text-[10px] md:text-xs font-black px-2 py-1 uppercase transform -skew-x-12 border-2 border-white whitespace-nowrap">
                                    {topPercent}
                                </div>
                            )}
                        </div>

                        {/* Level Badge */}
                        <div className="flex items-center gap-4 self-end lg:self-auto">
                            <div className="text-right">
                                <div className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-widest">Current_Level</div>
                                <div className="text-2xl md:text-3xl font-black text-purple-500 font-mono leading-none">LVL.{String(level).padStart(2, '0')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 border-l-2 border-purple-500 pl-4 py-1 relative">
                        {isEditing ? (
                            <div className="flex gap-2 items-start">
                                <textarea
                                    value={editBioText}
                                    onChange={(e) => setEditBioText(e.target.value)}
                                    className="w-full bg-gray-900 border border-white/20 text-white font-mono text-sm p-2 focus:outline-none focus:border-purple-500"
                                    rows={3}
                                />
                                <div className="flex flex-col gap-2">
                                    <button onClick={handleSaveBio} className="bg-white text-black text-xs px-2 py-1 font-bold">SAVE</button>
                                    <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white text-xs px-2 py-1 font-bold">X</button>
                                </div>
                            </div>
                        ) : (
                            <div className="group flex items-start justify-between">
                                <p className="text-gray-400 font-mono text-sm max-w-2xl">
                                    {currentBio}
                                </p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity ml-4"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* XP Progress Bar */}
                    <div className="w-full">
                        <div className="flex justify-between text-xs font-mono text-gray-500 uppercase mb-2">
                            <span>Progress to Level {nextLevel}</span>
                            {/* Removed items remaining text */}
                        </div>
                        <div className="h-4 w-full bg-gray-900 border border-white/20 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out"
                                style={{ width: `${xpProgress}%` }}
                            >
                                {/* Striped pattern overlay */}
                                <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.1)_5px,rgba(255,255,255,0.1)_10px)]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                        <div>
                            <div className="text-xs text-gray-500 font-mono uppercase">Total_Logs</div>
                            <div className="text-2xl font-bold text-white">{totalWatched}</div>
                        </div>
                        {/* We can add more specific stats here later passed via props */}
                    </div>
                </div>
            </div>
        </div>
    );
}
