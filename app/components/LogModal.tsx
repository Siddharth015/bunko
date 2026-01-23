'use client';

import { useState } from 'react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rating: number, review: string, watchedOn: string) => void;
    title: string;
    isSaving: boolean;
}

export default function LogModal({ isOpen, onClose, onSave, title, isSaving }: LogModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [watchedOn, setWatchedOn] = useState(new Date().toISOString().split('T')[0]); // Default today

    if (!isOpen) return null;

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
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
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

                {/* Rating Input */}
                <div className="mb-6">
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

                {/* Date Picker */}
                <div className="mb-6">
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

                {/* Review Input */}
                <div className="mb-8">
                    <label className="block text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">
                        Field_Notes (Optional)
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
                        onClick={() => onSave(rating, review, watchedOn)}
                        disabled={rating === 0 || isSaving}
                        className="flex-1 py-3 bg-white text-black font-mono font-bold uppercase hover:bg-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-black"
                    >
                        {isSaving ? 'Processing...' : 'Confirm Log'}
                    </button>
                </div>
            </div>
        </div>
    );
}
