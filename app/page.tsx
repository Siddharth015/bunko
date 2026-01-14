'use client';

import Link from 'next/link';
import Navigation from './components/Navigation';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const moviePosters = [
    'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
    'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', // Dune
    'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', // Inception
    'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg', // Your Name
    'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  ];

  const animePosters = [
    'https://image.tmdb.org/t/p/w500/2c18CV9sDlhVONgd4vNm5wlLwGe.jpg',
    'https://image.tmdb.org/t/p/w500/bJ3xHW4wiqGVMLQEBPyJqiOW4AX.jpg',
    'https://image.tmdb.org/t/p/w500/wdrCwmRnLFJhEoH8GSfymY85KHT.jpg',
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 animate-gradient-shift"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[128px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-[128px] animate-blob animation-delay-4000"></div>
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-7xl w-full">
          {/* Headline */}
          <div className="text-center mb-16" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium backdrop-blur-sm">
                ✨ Your Personal Media Universe
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
              <span className="block text-white">Track.</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                Discover.
              </span>
              <span className="block text-white">Share.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light">
              The most beautiful way to track movies, anime, and books.
              <br />
              All your media, one stunning platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/search" className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white transition-transform group-hover:scale-105">
                  Start Tracking Free
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>

              <Link href="/import" className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all backdrop-blur-sm">
                Import from Letterboxd
              </Link>
            </div>
          </div>

          {/* Floating Movie Posters - Infinite Scroll */}
          <div className="relative h-64 overflow-hidden mb-8">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>

            <div className="flex gap-4 animate-scroll-left absolute">
              {[...moviePosters, ...moviePosters].map((poster, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-40 h-60 rounded-2xl overflow-hidden hover:scale-110 transition-transform duration-300 cursor-pointer shadow-2xl"
                  style={{ transform: `translateY(${Math.sin(index * 0.5) * 20}px)` }}
                >
                  <img src={poster} alt="Movie" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Everything you need.
              <br />
              <span className="text-gray-500">Nothing you don't.</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Large Feature - Unified Search */}
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 p-8 md:p-12 hover:border-blue-500/50 transition-all duration-500">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="inline-block p-4 bg-blue-500/20 rounded-2xl mb-6">
                  <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <h3 className="text-4xl font-bold text-white mb-4">Lightning-Fast Search</h3>
                <p className="text-gray-400 text-lg mb-8 max-w-lg">
                  Search across TMDb, AniList, and Google Books simultaneously.
                  Find anything in milliseconds with intelligent caching.
                </p>

                {/* Mini Search Preview */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="text-gray-400">Search: "Inception"</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded animate-pulse"></div>
                    <div className="w-12 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded animate-pulse animation-delay-150"></div>
                    <div className="w-12 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded animate-pulse animation-delay-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Feature */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-white/10 p-8 hover:border-orange-500/50 transition-all duration-500">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="inline-block p-3 bg-orange-500/20 rounded-xl mb-4">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Easy Import</h3>
                <p className="text-gray-400">
                  Migrate your entire Letterboxd history instantly.
                </p>
              </div>
            </div>

            {/* Share Feature */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 p-8 hover:border-purple-500/50 transition-all duration-500">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="inline-block p-3 bg-purple-500/20 rounded-xl mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Share & Connect</h3>
                <p className="text-gray-400">
                  Beautiful profiles with auto-generated social images.
                </p>
              </div>
            </div>

            {/* Stats Feature */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-white/10 p-8 hover:border-pink-500/50 transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3">Cached for Speed</h3>
                  <p className="text-gray-400 text-lg">
                    24-hour Redis caching makes repeat searches instant. No API limits, no waiting.
                  </p>
                </div>

                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                      24h
                    </div>
                    <div className="text-gray-400 text-sm">Cache Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                      &lt;100ms
                    </div>
                    <div className="text-gray-400 text-sm">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
                      ∞
                    </div>
                    <div className="text-gray-400 text-sm">Media Items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left - Feature List */}
            <div>
              <h2 className="text-5xl font-black text-white mb-12">
                Built for
                <br />
                <span className="text-gray-500">enthusiasts</span>
              </h2>

              <div className="space-y-6">
                {[
                  { title: 'Multi-Platform Search', desc: 'Movies, anime, books—all in one search', icon: '🎬' },
                  { title: 'Smart Caching', desc: 'Lightning-fast repeat searches', icon: '⚡' },
                  { title: 'Social Profiles', desc: 'Showcase your top 4 favorites', icon: '✨' },
                ].map((feature, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${activeFeature === index
                        ? 'bg-white/10 border-2 border-purple-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{feature.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                        <p className="text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Visual Preview */}
            <div className="relative h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-xl border border-white/10 overflow-hidden">
                {activeFeature === 0 && (
                  <div className="p-8 animate-fade-in">
                    <div className="bg-black/30 rounded-xl p-4 mb-4">
                      <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {animePosters.slice(0, 6).map((poster, i) => (
                        <div key={i} className="aspect-[2/3] rounded-lg overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                          <img src={poster} alt="Result" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeFeature === 1 && (
                  <div className="p-8 flex items-center justify-center h-full animate-fade-in">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="text-5xl font-black text-white mb-2">&lt;100ms</div>
                      <div className="text-gray-400">Average response time</div>
                    </div>
                  </div>
                )}
                {activeFeature === 2 && (
                  <div className="p-8 animate-fade-in">
                    <div className="bg-black/30 rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                        <div>
                          <div className="text-white font-bold text-lg">@cinephile</div>
                          <div className="text-gray-400 text-sm">Movie Enthusiast</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {moviePosters.slice(0, 4).map((poster, i) => (
                          <div key={i} className="aspect-[2/3] rounded-lg overflow-hidden">
                            <img src={poster} alt="Top 4" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Start tracking today
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of media enthusiasts organizing their collections
            </p>
            <Link
              href="/search"
              className="inline-block px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, 50px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient-shift { animation: gradient-shift 10s ease-in-out infinite; }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animate-scroll-left { animation: scroll-left 30s linear infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
