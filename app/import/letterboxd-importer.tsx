'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { useAuth, supabase } from '../components/AuthProvider';
import PixelIcon from '../components/PixelIcon'; // Import PixelIcon

interface LetterboxdRow {
    Name: string;
    Year?: string;
    Rating?: string; // "3.5"
    [key: string]: any;
}

interface MatchResult {
    originalTitle: string;
    originalYear: string | null;
    matched: boolean;
    tmdbId?: number;
    matchedTitle?: string;
    matchedYear?: number | null;
    posterPath?: string | null;
    saved?: boolean;
    error?: string;
}

export default function LetterboxdImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [summary, setSummary] = useState<{ imported: number; failed: number } | null>(null);

    const { user } = useAuth();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile && uploadedFile.name.endsWith('.csv')) {
            setFile(uploadedFile);
            setResults([]);
            setSummary(null);
            setProgress(0);
        } else {
            alert('Please upload a valid CSV file');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setResults([]);
            setSummary(null);
            setProgress(0);
        } else {
            alert('Please upload a valid CSV file');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const saveToLibrary = async (movie: any, ratingStr?: string) => {
        try {
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) throw new Error('No session');

            // Map Rating: Letterboxd 5 stars -> 10 scale
            let rating: number | undefined;
            if (ratingStr) {
                const r = parseFloat(ratingStr);
                if (!isNaN(r)) rating = Math.min(10, Math.round(r * 2));
            }

            const res = await fetch('/api/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    mediaId: `tmdb-${movie.tmdbId}`,
                    mediaType: 'movie',
                    title: movie.title,
                    year: movie.year,
                    imageUrl: movie.posterPath,
                    status: 'COMPLETED',
                    rating: rating
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save');
            }
            return true;
        } catch (e) {
            console.error('Save error', e);
            throw e;
        }
    };

    const processImport = async () => {
        if (!file) return;

        setImporting(true);
        setProgress(0);
        setResults([]);

        try {
            // Parse CSV file
            Papa.parse<LetterboxdRow>(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (parseResult) => {
                    const rows = parseResult.data;
                    const matchResults: MatchResult[] = [];
                    let successCount = 0;
                    let failCount = 0;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const title = row.Name || row.Title; // Fallback for diff CSV formats
                        const year = row.Year;

                        if (!title) {
                            continue;
                        }

                        try {
                            // 1. Lookup
                            const response = await fetch('/api/migrate/letterboxd', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title, year }),
                            });

                            const data = await response.json();

                            if (data.found) {
                                // 2. Save
                                try {
                                    await saveToLibrary(data.movie, row.Rating);

                                    matchResults.push({
                                        originalTitle: title,
                                        originalYear: year || null,
                                        matched: true,
                                        tmdbId: data.movie.tmdbId,
                                        matchedTitle: data.movie.title,
                                        matchedYear: data.movie.year,
                                        posterPath: data.movie.posterPath,
                                        saved: true
                                    });
                                    successCount++;
                                } catch (saveErr) {
                                    matchResults.push({
                                        originalTitle: title,
                                        originalYear: year || null,
                                        matched: true,
                                        saved: false,
                                        error: 'Failed to save to library'
                                    });
                                    failCount++;
                                }
                            } else {
                                matchResults.push({
                                    originalTitle: title,
                                    originalYear: year || null,
                                    matched: false,
                                });
                                failCount++;
                            }

                            // Update progress
                            setProgress(Math.round(((i + 1) / rows.length) * 100));

                            // Rate limiting
                            await new Promise((resolve) => setTimeout(resolve, 250));
                        } catch (error) {
                            console.error('Error processing row:', error);
                            matchResults.push({
                                originalTitle: title,
                                originalYear: year || null,
                                matched: false,
                                error: 'Processing Error'
                            });
                            failCount++;
                        }
                    }

                    setResults(matchResults);
                    setSummary({ imported: successCount, failed: failCount });
                    setImporting(false);
                },
                error: (error) => {
                    console.error('CSV parsing error:', error);
                    alert('Failed to parse CSV file');
                    setImporting(false);
                },
            });
        } catch (error) {
            console.error('Import error:', error);
            alert('An error occurred during import');
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden font-mono text-white">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
                        Import <span className="text-purple-500">Data</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">
                        Migrate your legacy database from Letterboxd
                    </p>
                </div>

                {/* File Upload Zone */}
                {!file ? (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-white/20 hover:border-purple-500 rounded-none p-12 text-center bg-black hover:bg-white/5 transition-all cursor-pointer group"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-6">
                            <PixelIcon type="folder" size={64} className="text-gray-500 group-hover:text-purple-500 transition-colors" />
                            <div>
                                <p className="text-white text-xl font-bold uppercase mb-2">
                                    Drop CSV File
                                </p>
                                <p className="text-gray-500 text-xs font-mono">
                                    Must be valid 'watched.csv' export
                                </p>
                            </div>
                        </label>
                    </div>
                ) : (
                    <div className="bg-black border border-white/20 p-8 mb-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                            <div>
                                <p className="text-white font-bold font-mono text-lg">{file.name}</p>
                                <p className="text-gray-500 text-xs font-mono uppercase">
                                    {(file.size / 1024).toFixed(2)} KB • READY_TO_PROCESS
                                </p>
                            </div>
                            {!importing && !summary && (
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-red-500 hover:text-red-400 font-mono text-xs uppercase underline"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {importing && (
                            <div className="mb-8">
                                <div className="flex justify-between mb-2 font-mono text-xs uppercase">
                                    <span className="text-white animate-pulse">Processing_Data...</span>
                                    <span className="text-purple-500 font-bold">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-900 h-4 border border-white/20 p-0.5">
                                    <div
                                        className="bg-purple-600 h-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Start Import Button */}
                        {!importing && !summary && (
                            <button
                                onClick={processImport}
                                disabled={!user}
                                className="w-full bg-white text-black font-black font-mono uppercase py-4 hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-white"
                            >
                                {user ? 'Initialize Import Sequence' : 'Login Required'}
                            </button>
                        )}

                        {/* Summary */}
                        {summary && (
                            <div className="bg-white/5 border border-white/10 p-6 mb-6">
                                <h3 className="text-white font-bold font-mono uppercase mb-4 text-center">
                                    Operation Complete
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/50 p-4 text-center">
                                        <div className="text-3xl font-black text-white">{summary.imported}</div>
                                        <div className="text-green-500 text-xs font-mono uppercase">Success</div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/50 p-4 text-center">
                                        <div className="text-3xl font-black text-white">{summary.failed}</div>
                                        <div className="text-red-500 text-xs font-mono uppercase">Errors</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Table */}
                        {results.length > 0 && (
                            <div className="mt-8 border-t border-white/10 pt-6">
                                <h3 className="text-gray-500 font-mono text-xs uppercase mb-4">
                                    Log Output_
                                </h3>
                                <div className="max-h-96 overflow-y-auto bg-black border border-white/10 font-mono text-xs">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                                            <tr>
                                                <th className="p-3 uppercase">Original</th>
                                                <th className="p-3 uppercase">Match</th>
                                                <th className="p-3 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.map((result, index) => (
                                                <tr key={index} className="hover:bg-white/5">
                                                    <td className="p-3 text-gray-300">
                                                        {result.originalTitle} ({result.originalYear || '?'})
                                                    </td>
                                                    <td className="p-3 text-gray-400">
                                                        {result.matched ? result.matchedTitle : '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        {result.saved ? (
                                                            <span className="text-green-500">SAVED</span>
                                                        ) : result.matched ? (
                                                            <span className="text-yellow-500">ERR_SAVE</span>
                                                        ) : (
                                                            <span className="text-red-500">NOT_FOUND</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
