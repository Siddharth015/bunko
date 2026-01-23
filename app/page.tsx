'use client';

import Link from 'next/link';
import Navigation from './components/Navigation';
import { useState, useEffect } from 'react';
import PixelIcon from './components/PixelIcon';

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
    <div className="min-h-screen bg-[#050505] relative overflow-x-hidden font-mono">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 z-10">
        <div className="max-w-7xl w-full">
          {/* Headline */}
          <div className="text-center mb-16 relative">
            <div className="inline-block mb-6 border border-white/50 px-4 py-1 bg-black">
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                // The Media Tracker
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-8 leading-none tracking-tighter uppercase">
              <span className="block text-white outline-text">Log.</span>
              <span className="block text-purple-500">Track.</span>
              <span className="block text-white">Review.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium">
              Your personal digital journal for movies, anime, and books.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/search" className="group relative">
                <div className="absolute top-1 left-1 w-full h-full bg-white opacity-20 group-hover:opacity-100 transition-all duration-200"></div>
                <div className="relative px-8 py-4 bg-purple-600 border-2 border-transparent group-hover:border-white text-white font-bold uppercase tracking-wider transition-all duration-200 active:translate-x-1 active:translate-y-1">
                  Start Journaling
                </div>
              </Link>

              <Link href="/import" className="px-8 py-4 bg-black border border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                Import Data
              </Link>
            </div>
          </div>

          {/* Floating Movie Posters - Carousel */}
          {/* Fixed Z-Index to stay below Nav (Nav is 50) */}
          <div className="relative h-64 overflow-hidden mb-8 w-full border-y border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="flex gap-6 animate-scroll-left absolute top-4">
              {[...moviePosters, ...moviePosters].map((poster, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-40 h-56 bg-gray-800 border border-white/20 grayscale hover:grayscale-0 transition-all duration-500"
                >
                  <img src={poster} alt="Media" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Grid Layout */}
      <section className="relative py-24 px-4 border-t border-white/10 bg-black z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10">

            {/* Feature 1 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors group">
              <div className="mb-6 text-purple-500 group-hover:text-white transition-colors">
                <PixelIcon type="search" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">Unified Search</h3>
              <p className="text-gray-400 leading-relaxed">
                One search bar for everything. Movies (TMDb), Anime (AniList), and Books (Google Books).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition-colors group">
              <div className="mb-6 text-yellow-400 group-hover:text-white transition-colors">
                <PixelIcon type="lightning" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">Instant Access</h3>
              <p className="text-gray-400 leading-relaxed">
                Zero lag. Optimized for speed so you can look up and log in seconds, not minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 md:p-12 hover:bg-white/5 transition-colors group">
              <div className="mb-6 text-blue-500 group-hover:text-white transition-colors">
                <PixelIcon type="disk" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">Detailed Stats</h3>
              <p className="text-gray-400 leading-relaxed">
                Visualize your habits. Track your generic XP and level up as you consume more media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="relative py-24 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase">
                Built for <span className="text-purple-500">Trackers</span>
              </h2>
              <div className="space-y-4">
                {['Universal Database', 'Profile Sharing', 'XP & Levelling'].map((item, i) => (
                  <div key={i}
                    onClick={() => setActiveFeature(i)}
                    className={`cursor-pointer p-4 border-l-4 transition-all ${activeFeature === i ? 'border-purple-500 bg-white/5' : 'border-gray-700 hover:border-white'}`}
                  >
                    <h4 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider">{item}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimalist Preview */}
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-black border border-white/20 p-2 relative">
                {/* Fake UI Window */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-white/10 border-b border-white/10 flex items-center px-2 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>

                <div className="mt-8 p-4 text-center h-full flex items-center justify-center flex-col gap-4">
                  {activeFeature === 0 && (
                    <div className="flex gap-4">
                      <PixelIcon type="disk" size={80} className="text-white animate-pulse" />
                      <PixelIcon type="search" size={80} className="text-purple-500" />
                    </div>
                  )}
                  {activeFeature === 1 && (
                    <div className="flex gap-4">
                      <PixelIcon type="folder" size={80} className="text-white" />
                      <PixelIcon type="heart" size={80} className="text-pink-500" animated={true} />
                    </div>
                  )}
                  {activeFeature === 2 && (
                    <div className="flex flex-col items-center gap-2">
                      <PixelIcon type="star" size={80} className="text-yellow-400" animated={true} />
                      <div className="font-bold text-4xl font-mono mt-4">LEVEL <span className="text-purple-500">07</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 text-center z-10 relative">
        <h2 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest">Start Your Collection</h2>
        <Link href="/search" className="inline-block px-12 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors">
          Get Started
        </Link>
      </section>

      <style jsx>{`
        .animate-scroll-left { animation: scroll-left 40s linear infinite; }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
