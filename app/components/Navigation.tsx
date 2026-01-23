'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function Navigation() {
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Search', href: '/search' },
        { name: 'Import', href: '/import' },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
                ? 'bg-[#050505] border-white/20'
                : 'bg-transparent border-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo - Text Only, Bold Monospace */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <span className="text-2xl font-black text-white tracking-widest font-mono border-2 border-white px-2 py-1 group-hover:bg-white group-hover:text-black transition-colors">BUNKO</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-4 py-2 text-sm font-bold font-mono tracking-wide uppercase transition-all duration-200 border border-transparent hover:border-white/50 ${isActive
                                            ? 'text-black bg-white border-white'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <span className="relative">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth Section */}
                        <div className="flex items-center gap-3">
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin"></div>
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-3 bg-black border border-white/20 px-4 py-2 transition-all hover:bg-white/10"
                                    >
                                        <div className="w-6 h-6 bg-purple-600 flex items-center justify-center text-white font-bold font-mono text-xs">
                                            {(user.user_metadata?.username || user.email)?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-white font-bold font-mono text-sm hidden lg:block uppercase">{user.user_metadata?.username || user.email?.split('@')[0]}</span>
                                    </button>

                                    {/* User Menu Dropdown */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-black border border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] py-1">
                                            <div className="px-4 py-3 border-b border-white/10">
                                                <p className="text-xs text-gray-500 font-mono uppercase">Signed in as</p>
                                                <p className="text-white font-bold font-mono truncate">{user.user_metadata?.username || user.email}</p>
                                            </div>
                                            <Link
                                                href={`/profile/${user.user_metadata?.username || user.email?.split('@')[0]}`}
                                                className="block px-4 py-3 text-gray-300 hover:bg-white hover:text-black font-mono text-sm transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                PROFILE
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setShowUserMenu(false);
                                                }}
                                                className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-900/20 font-mono text-sm transition-colors"
                                            >
                                                SIGN OUT
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold font-mono uppercase text-sm px-6 py-2 border border-purple-500 hover:border-white transition-all shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
