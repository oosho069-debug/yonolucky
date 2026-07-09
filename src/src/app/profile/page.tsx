"use client";
import Link from "next/link";
import { SoundManager } from "../../utils/SoundManager";

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white pb-20">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <span className="font-black text-xl text-white tracking-wider">Profile</span>
        <button onClick={() => { SoundManager.playClick(); alert("Logged out!"); }} className="text-sm font-bold bg-white/20 px-4 py-1 rounded border border-white/30">
          Logout
        </button>
      </header>

      <div className="p-4 flex-1">
        {/* User Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-9xl opacity-20">👤</div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-400">
              😎
            </div>
            <div>
              <h2 className="text-2xl font-black">User_9988</h2>
              <p className="text-blue-200 font-semibold">+91 9876543210</p>
            </div>
          </div>
          <div className="mt-6 bg-black/20 rounded-xl p-4 flex justify-between items-center border border-white/10">
            <div>
              <p className="text-sm text-indigo-200 font-semibold">Total Balance</p>
              <p className="text-3xl font-black text-yellow-400">₹ 1,204.00</p>
            </div>
            <Link href="/wallet" onClick={() => SoundManager.playClick()} className="bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-lg shadow hover:scale-105 transition">
              Deposit
            </Link>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-[#1E293B] rounded-2xl p-2 shadow-lg border border-gray-700">
          {[
            { icon: "📜", label: "Bet History", link: "/history" },
            { icon: "💰", label: "Transaction History", link: "/history" },
            { icon: "🎁", label: "Gift Code", link: "#" },
            { icon: "🔒", label: "Change Password", link: "#" },
            { icon: "🎧", label: "Customer Support", link: "#" }
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.link}
              onClick={() => SoundManager.playClick()}
              className="flex items-center justify-between p-4 border-b border-gray-700/50 last:border-0 hover:bg-gray-800/50 transition active:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold text-gray-200">{item.label}</span>
              </div>
              <span className="text-gray-500">➔</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-[#1E293B] text-gray-400 flex justify-around p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] border-t border-gray-700 z-50 pb-5">
        <Link href="/" onClick={() => SoundManager.playClick()} className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/history" onClick={() => SoundManager.playClick()} className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">📜</span>
          <span className="text-xs mt-1">History</span>
        </Link>
        <Link href="/wallet" onClick={() => SoundManager.playClick()} className="flex flex-col items-center hover:text-white font-semibold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">💰</span>
          <span className="text-xs mt-1">Wallet</span>
        </Link>
        <div className="flex flex-col items-center text-yellow-400 font-bold active:scale-90 transition">
          <span className="text-2xl drop-shadow-md">👤</span>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </nav>
    </div>
  );
}
