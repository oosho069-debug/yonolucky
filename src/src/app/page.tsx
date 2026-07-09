"use client";
import Link from "next/link";
import { useEffect } from "react";
import { SoundManager } from "../utils/SoundManager";

export default function Home() {
  useEffect(() => {
    // Global click sound fallback
    const playClick = () => SoundManager.playClick();
    document.addEventListener("click", playClick);
    return () => document.removeEventListener("click", playClick);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl border-b border-green-400">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-extrabold text-green-700 text-xl shadow-lg border-2 border-yellow-400">
            Y
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-yellow-400 drop-shadow-md">Yonolucky</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-bold bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md active:scale-95 transition">
            Download App
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="p-4 mt-2">
        <div className="rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent z-10"></div>
          <img src="/yono_app_icon_1783499651695.jpg" alt="Banner" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute bottom-4 left-4 z-20">
            <h2 className="text-3xl font-black text-white drop-shadow-lg italic">PLAY & WIN</h2>
            <p className="text-sm text-yellow-400 font-bold bg-black/50 px-2 py-1 rounded inline-block">100% Trusted Platform</p>
          </div>
        </div>
      </section>

      {/* Games Categories Grid */}
      <section className="px-4 mt-2 grid grid-cols-2 gap-4">
        
        {/* Lottery (Wingo) */}
        <Link href="/games/wingo" className="bg-gradient-to-br from-red-500 to-pink-600 p-1 rounded-2xl shadow-xl active:scale-95 transition block transform hover:-translate-y-1">
          <div className="bg-[#1E293B] rounded-xl p-4 h-full flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-6xl opacity-20">🎫</div>
            <span className="text-4xl mb-2 drop-shadow-lg">🎰</span>
            <h3 className="font-black text-lg text-red-400">Lottery</h3>
            <p className="text-xs text-gray-400 font-semibold">Wingo 1M, 3M, 5M...</p>
          </div>
        </Link>

        {/* Aviator */}
        <Link href="/games/aviator" className="bg-gradient-to-br from-blue-500 to-cyan-500 p-1 rounded-2xl shadow-xl active:scale-95 transition block transform hover:-translate-y-1">
          <div className="bg-[#1E293B] rounded-xl p-4 h-full flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-4 -left-4 text-6xl opacity-20">✈️</div>
            <span className="text-4xl mb-2 drop-shadow-lg">✈️</span>
            <h3 className="font-black text-lg text-blue-400">Aviator</h3>
            <p className="text-xs text-gray-400 font-semibold">Crash & Win X100</p>
          </div>
        </Link>

        {/* Slots */}
        <Link href="/games/slots" className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1 rounded-2xl shadow-xl active:scale-95 transition block transform hover:-translate-y-1">
          <div className="bg-[#1E293B] rounded-xl p-4 h-full flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-20">🍒</div>
            <span className="text-4xl mb-2 drop-shadow-lg">🍒</span>
            <h3 className="font-black text-lg text-purple-400">Jilli Slots</h3>
            <p className="text-xs text-gray-400 font-semibold">Spin to Win Jackpot</p>
          </div>
        </Link>

        {/* Spin Wheel */}
        <Link href="/games/spin" className="bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-2xl shadow-xl active:scale-95 transition block transform hover:-translate-y-1">
          <div className="bg-[#1E293B] rounded-xl p-4 h-full flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -bottom-4 -left-4 text-6xl opacity-20">🎡</div>
            <span className="text-4xl mb-2 drop-shadow-lg animate-spin-slow">🎡</span>
            <h3 className="font-black text-lg text-yellow-400">Lucky Spin</h3>
            <p className="text-xs text-gray-400 font-semibold">Daily Rewards</p>
          </div>
        </Link>
      </section>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-[#1E293B] text-gray-400 flex justify-around p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] border-t border-gray-700 z-50 pb-5">
        <Link href="/" className="flex flex-col items-center text-yellow-400 font-bold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/history" className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">📜</span>
          <span className="text-xs mt-1">History</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">💰</span>
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">👤</span>
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
