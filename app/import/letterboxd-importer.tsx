'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface LetterboxdRow {
    Name: string;
    Year?: string;
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
}

export default function LetterboxdImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [summary, setSummary] = useState<{ imported: number; failed: number } | null>(null);

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
                        const title = row.Name || row.Title;
                        const year = row.Year;

                        if (!title) {
                            failCount++;
                            continue;
                        }

                        try {
                            // Call TMDb lookup API
                            const response = await fetch('/api/migrate/letterboxd', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title, year }),
                            });

                            const data = await response.json();

                            if (data.found) {
                                matchResults.push({
                                    originalTitle: title,
                                    originalYear: year || null,
                                    matched: true,
                                    tmdbId: data.movie.tmdbId,
                                    matchedTitle: data.movie.title,
                                    matchedYear: data.movie.year,
                                    posterPath: data.movie.posterPath,
                                });
                                successCount++;
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

                            // Rate limiting: wait 250ms between requests
                            await new Promise((resolve) => setTimeout(resolve, 250));
                        } catch (error) {
                            console.error('Error processing row:', error);
                            matchResults.push({
                                originalTitle: title,
                                originalYear: year || null,
                                matched: false,
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Import from Letterboxd
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Upload your Letterboxd export CSV to automatically import your watched movies
                    </p>
                </div>

                {/* File Upload Zone */}
                {!file ? (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-4 border-dashed border-purple-500 rounded-2xl p-12 text-center bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <svg
                                className="w-20 h-20 mx-auto mb-4 text-purple-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="text-white text-xl font-semibold mb-2">
                                Drop your CSV file here
                            </p>
                            <p className="text-gray-400">or click to browse</p>
                        </label>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-white text-lg font-semibold">{file.name}</p>
                                <p className="text-gray-400 text-sm">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            {!importing && !summary && (
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {importing && (
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-white text-sm">Processing...</span>
                                    <span className="text-purple-400 text-sm font-semibold">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Start Import Button */}
                        {!importing && !summary && (
                            <button
                                onClick={processImport}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
                            >
                                Start Import
                            </button>
                        )}

                        {/* Summary */}
                        {summary && (
                            <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                                <h3 className="text-white text-xl font-semibold mb-4">
                                    Import Complete!
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                                        <p className="text-green-300 text-sm mb-1">Successfully Matched</p>
                                        <p className="text-white text-3xl font-bold">{summary.imported}</p>
                                    </div>
                                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                                        <p className="text-red-300 text-sm mb-1">Not Found</p>
                                        <p className="text-white text-3xl font-bold">{summary.failed}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Table */}
                        {results.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-white text-xl font-semibold mb-4">
                                    Import Results ({results.length} entries)
                                </h3>
                                <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-gray-800">
                                            <tr className="text-left">
                                                <th className="p-3 text-gray-300 font-semibold">Original</th>
                                                <th className="p-3 text-gray-300 font-semibold">Matched</th>
                                                <th className="p-3 text-gray-300 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t border-gray-700 hover:bg-gray-800/50"
                                                >
                                                    <td className="p-3">
                                                        <p className="text-white font-medium">
                                                            {result.originalTitle}
                                                        </p>
                                                        {result.originalYear && (
                                                            <p className="text-gray-400 text-sm">
                                                                {result.originalYear}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {result.matched ? (
                                                            <>
                                                                <p className="text-white font-medium">
                                                                    {result.matchedTitle}
                                                                </p>
                                                                <p className="text-gray-400 text-sm">
                                                                    {result.matchedYear}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Not found</p>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {result.matched ? (
                                                            <span className="inline-block bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                                ✓ Matched
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                                ✗ Not Found
                                                            </span>
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

                {/* Instructions */}
                <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
                    <h3 className="text-white text-2xl font-semibold mb-4">
                        How to export from Letterboxd:
                    </h3>
                    <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                        <li>Go to your Letterboxd profile settings</li>
                        <li>Click on "Import & Export"</li>
                        <li>Click "Export Your Data"</li>
                        <li>Download the ZIP file and extract it</li>
                        <li>Upload the "watched.csv" file here</li>
                    </ol>
                    <p className="text-purple-400 text-sm mt-4">
                        Note: The import process may take a few minutes for large libraries due to rate limiting.
                    </p>
                </div>
            </div>
        </div>
    );
}
