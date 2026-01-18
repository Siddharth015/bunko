'use client';

import { useState } from 'react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { status: 'WATCHED' | 'PLAN_TO_WATCH'; rating?: number; review?: string }) => void;
    mediaTitle: string;
    isSaving: boolean;
}

export default function LogModal({ isOpen, onClose, onSave, mediaTitle, isSaving }: LogModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [review, setReview] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({
            status: 'WATCHED', // This modal is specifically for logging as watched
            rating: rating > 0 ? rating : undefined,
            review: review.trim() || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Log & Rate</h2>
                        <p className="text-gray-400 text-sm">{mediaTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Rating */}
                <div className="mb-8 text-center">
                    <p className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Your Rating</p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="group relative focus:outline-none"
                            >
                                <svg
                                    className={`w-6 h-6 transition-all duration-200 ${(hoverRating || rating) >= star
                                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transform scale-110'
                                            : 'text-gray-700'
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <div className="mt-2 text-2xl font-black text-yellow-400">
                            {rating}<span className="text-gray-600 text-lg">/10</span>
                        </div>
                    )}
                </div>

                {/* Review */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-2">One-Line Review (Optional)</label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="What did you think?"
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="py-3 px-4 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="py-3 px-4 rounded-xl font-bold text-black bg-white hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Log Entry</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
