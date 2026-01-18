'use client';

interface TabProps {
    activeTab: 'all' | 'movie' | 'tv' | 'anime' | 'book';
    onChange: (tab: any) => void;
}

export default function ProfileTabs({ activeTab, onChange }: TabProps) {
    const tabs = [
        { id: 'all', label: 'All', icon: null },
        { id: 'movie', label: 'Movies', icon: '🎬' },
        { id: 'tv', label: 'TV', icon: '📺' },
        { id: 'anime', label: 'Anime', icon: '🎌' },
        { id: 'book', label: 'Books', icon: '📚' },
    ];

    return (
        <div className="flex justify-center md:justify-start gap-2 mb-8 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                            ${isActive
                                ? 'bg-white text-black shadow-lg shadow-white/20 scale-105'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }
                        `}
                    >
                        {tab.icon && <span className="text-lg">{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
