'use client';

import { useAuth } from '../components/AuthProvider';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';
import LetterboxdImporter from './letterboxd-importer';

export default function ImportClientWrapper() {
    const { user, loading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <div className="min-h-screen bg-black relative overflow-hidden pt-20">
                    {/* Background */}
                    <div className="fixed inset-0 opacity-40 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[128px]"></div>
                    </div>

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center mb-12">
                            {/* Icon */}
                            <div className="w-24 h-24rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-8">
                                <svg className="w-12 h-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                                Sign In Required
                            </h1>
                            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                                Create a free account to import your entire Letterboxd history and start building your media library
                            </p>

                            {/* Benefits */}
                            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 mb-10 max-w-lg mx-auto">
                                <h3 className="text-lg font-bold text-white mb-6">What you'll unlock:</h3>
                                <ul className="space-y-4 text-left">
                                    {[
                                        'Import entire Letterboxd watch history automatically',
                                        'Track movies, anime, and books in one place',
                                        'Beautiful profile with auto-generated social images',
                                        'Free forever, no credit card required'
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-300">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="group relative inline-block"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-white font-bold text-lg">
                                    Create Free Account
                                </div>
                            </button>

                            <p className="text-sm text-gray-400 mt-6">
                                Already have an account?{' '}
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    defaultTab="signup"
                />
            </>
        );
    }

    return <LetterboxdImporter />;
}
