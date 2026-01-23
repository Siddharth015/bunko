'use client';

import { useState, useEffect } from 'react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rating: number, review: string, watchedOn: string, status: string) => void;
    title: string;
    isSaving: boolean;
    initialRating?: number;
    initialReview?: string;
    initialWatchedOn?: string;
    initialStatus?: string;
}

export default function LogModal({ isOpen, onClose, onSave, title, isSaving, initialRating = 0, initialReview = '', initialWatchedOn, initialStatus = 'COMPLETED' }: LogModalProps) {
    const [status, setStatus] = useState(initialStatus);
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState(initialReview);
    const [watchedOn, setWatchedOn] = useState(initialWatchedOn || new Date().toISOString().split('T')[0]);

    // Reset state when modal opens or initial props change
    useEffect(() => {
        if (isOpen) {
            setStatus(initialStatus);
            setRating(initialRating);
            setReview(initialReview);
            setWatchedOn(initialWatchedOn || new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialRating, initialReview, initialWatchedOn, initialStatus]);

    if (!isOpen) return null;

    const showRating = status === 'COMPLETED' || status === 'DROPPED';
    const showDate = status === 'COMPLETED' || status === 'DROPPED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Pixel Dither Effect */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
                onClick={onClose}
            ></div>

            {/* Modal Content - Journal Card Style */}
            <div className="relative w-full max-w-md bg-black border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 animate-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-white/20 pb-4">
                    <div>
                        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Entry Log_01</div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Status Selector */}
                <div className="mb-6">
                    <label className="block text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
                        Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
                            { id: 'WATCHING', label: 'Watching' },
                            { id: 'COMPLETED', label: 'Completed' },
                            { id: 'DROPPED', label: 'Dropped' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStatus(s.id)}
                                className={`py-2 px-3 text-xs font-bold font-mono uppercase border transition-all
                                    ${status === s.id
                                        ? 'bg-white text-black border-white'
                                        : 'bg-black text-gray-400 border-white/20 hover:border-white hover:text-white'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rating Input */}
                {showRating && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
                            Rating_Score
                        </label>
                        <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <svg
                                            className={`w-5 h-5 ${star <= (hoverRating || rating)
                                                ? 'text-white'
                                                : 'text-gray-700'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {rating}<span className="text-gray-500 text-sm">/10</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Date Picker */}
                {showDate && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
                            Date_Watched
                        </label>
                        <input
                            type="date"
                            value={watchedOn}
                            onChange={(e) => setWatchedOn(e.target.value)}
                            className="w-full bg-black border border-white/20 text-white font-mono p-3 focus:border-white focus:outline-none uppercase"
                        />
                    </div>
                )}

                {/* Review Input */}
                <div className="mb-8">
                    <label className="block text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
                        {status === 'PLAN_TO_WATCH' ? 'Notes' : 'Field_Notes (Optional)'}
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write your thoughts..."
                        className="w-full bg-black border border-white/20 text-white p-3 h-24 font-mono text-sm resize-none focus:border-white focus:outline-none placeholder-gray-700"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-white/20 text-gray-400 hover:text-white hover:border-white font-mono font-bold uppercase transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(rating, review, watchedOn, status)}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-white text-black font-mono font-bold uppercase hover:bg-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
                    >
                        {isSaving ? 'Processing...' : 'Confirm Log'}
                    </button>
                </div>
            </div>
        </div>
    );
}
