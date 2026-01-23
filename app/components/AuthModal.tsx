'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import PixelIcon from './PixelIcon';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
    const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (tab === 'signin') {
                const { error } = await signIn(email, password);
                if (error) throw error;
                onClose();
            } else {
                // Validate username
                if (!username) {
                    setError('Username is required');
                    setLoading(false);
                    return;
                }

                if (/\s/.test(username)) {
                    setError('Username cannot contain spaces');
                    setLoading(false);
                    return;
                }

                if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                    setError('Username can only contain letters, numbers, and underscores');
                    setLoading(false);
                    return;

                }

                const { error } = await signUp(email, password, username);
                if (error) throw error;
                onClose();
            }
        } catch (err: any) {
            console.error('Sign up/in error:', err);
            // Don't expose server errors to the user
            if (tab === 'signup' && err.message?.includes('violates row-level security')) {
                // This specific error might still happen if the trigger fails or something is wrong on the backend
                // but we shouldn't show "row-level security" to the user
                setError('Unable to create account. Please try again later.');
            } else if (err.message) {
                // For now, we still show the message if it's likely safe (e.g. "User already registered")
                // But ideally we map codes to messages. For general safety:
                setError(err.message === 'User already registered' ? err.message : 'Authentication failed. Please check your credentials.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50"></div>

            <div className="bg-black border-2 border-white p-8 max-w-md w-full relative shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <div className="w-6 h-6 border border-transparent hover:border-white flex items-center justify-center font-mono">X</div>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block border border-white/20 p-4 mb-4 bg-white/5">
                        <PixelIcon type="search" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter font-mono">
                        {tab === 'signin' ? 'System_Login' : 'User_Registration'}
                    </h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        {tab === 'signin'
                            ? 'Authenticate to access logs'
                            : 'Initialize new user protocol'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex mb-8 border border-white/20">
                    <button
                        onClick={() => setTab('signin')}
                        className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all ${tab === 'signin'
                            ? 'bg-white text-black'
                            : 'bg-black text-gray-500 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setTab('signup')}
                        className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all ${tab === 'signup'
                            ? 'bg-purple-500 text-white'
                            : 'bg-black text-gray-500 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {tab === 'signup' && (
                        <div>
                            <label className="block text-xs font-bold font-mono text-gray-500 mb-2 uppercase">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono placeholder-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="CODENAME"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold font-mono text-gray-500 mb-2 uppercase">
                            Email_Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono placeholder-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="USER@DOMAIN.COM"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold font-mono text-gray-500 mb-2 uppercase">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono placeholder-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="********"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-500 px-4 py-3 font-mono text-xs">
                            ERROR: {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold font-mono py-4 uppercase tracking-widest transition-all
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]'}
                            ${tab === 'signin' ? 'bg-white text-black' : 'bg-purple-600 text-white'}
                        `}
                    >
                        {loading ? 'PROCESSING...' : tab === 'signin' ? 'AUTHENTICATE >' : 'INITIALIZE >'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-xs font-mono text-gray-600">
                    {tab === 'signin' ? (
                        <>
                            NO ACCESS CARD?{' '}
                            <button
                                onClick={() => setTab('signup')}
                                className="text-purple-500 hover:text-white underline decoration-dotted underline-offset-4"
                            >
                                REQUEST_ENTRY
                            </button>
                        </>
                    ) : (
                        <>
                            ALREADY REGISTERED?{' '}
                            <button
                                onClick={() => setTab('signin')}
                                className="text-white hover:text-purple-400 underline decoration-dotted underline-offset-4"
                            >
                                LOGIN
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
