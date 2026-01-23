'use client';

interface ProfileTabsProps {
    activeTab: 'all' | 'movie' | 'tv' | 'anime' | 'book';
    onChange: (tab: 'all' | 'movie' | 'tv' | 'anime' | 'book') => void;
}

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    const tabs = [
        { id: 'all', label: 'All Media' },
        { id: 'movie', label: 'Movies' },
        { id: 'tv', label: 'TV Series' },
        { id: 'anime', label: 'Anime' },
        { id: 'book', label: 'Books' },
    ] as const;

    return (
        <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-white/10 pb-6">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            px-6 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-all
                            border border-transparent
                            ${isActive
                                ? 'bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] translate-x-[-2px] translate-y-[-2px]'
                                : 'bg-black text-gray-400 border-white/20 hover:border-white hover:text-white'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
