'use client';

interface ProfileHeaderProps {
    className?: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    level?: number;
    totalWatched?: number;
}

export default function ProfileHeader({ username, bio, avatarUrl, level = 1, totalWatched = 0 }: ProfileHeaderProps) {
    return (
        <div className="relative mb-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white/10 bg-black overflow-hidden shadow-2xl">
                        <img
                            src={avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random`}
                            alt={username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Level Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-600 w-12 h-12 rounded-xl flex items-center justify-center font-black text-black text-lg rotate-3 shadow-lg border-2 border-black/50" title={`Level ${level}`}>
                        {level}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{username}</h1>
                    <p className="text-gray-400 max-w-lg mx-auto md:mx-0 text-lg leading-relaxed">
                        {bio || "Just another cinephile drifting through the digital ether."}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="block text-2xl font-bold text-purple-400">{totalWatched}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Logged</span>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="block text-2xl font-bold text-pink-400">{(totalWatched * 125)}</span>
                            {/* Dummy XP calc */}
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">XP Earned</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
