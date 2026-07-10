"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function WalletOverview() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-[#FB5755] text-white p-4 flex items-center sticky top-0 z-50 shadow-md">
        <Link href="/" className="mr-4 active:scale-90 transition-transform">
          <span className="text-2xl">←</span>
        </Link>
        <span className="font-bold text-lg flex-1 text-center pr-8">My Wallet</span>
      </header>

      {/* Balance Card */}
      <section className="p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-gray-700">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💳</div>
          <p className="text-gray-400 text-sm font-semibold mb-2">Total Balance</p>
          <h2 className="text-5xl font-extrabold text-[#FFB834] tracking-tight">₹ {user?.balance?.toFixed(2) || "0.00"}</h2>
        </div>
      </section>

      {/* Actions */}
      <section className="px-4 mt-2 grid grid-cols-2 gap-4 animate-fade-in" style={{animationDelay: "0.1s"}}>
        <Link href="/wallet/deposit" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md active:scale-95 transition-all">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm">
            ↓
          </div>
          <span className="font-bold text-gray-800">Deposit</span>
        </Link>
        
        <Link href="/wallet/withdraw" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md active:scale-95 transition-all">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm">
            ↑
          </div>
          <span className="font-bold text-gray-800">Withdraw</span>
        </Link>
      </section>

      {/* Utilities */}
      <section className="px-4 mt-6 animate-fade-in" style={{animationDelay: "0.2s"}}>
        <Link href="/history">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Transaction History</h4>
                <p className="text-xs text-gray-500">View your deposits & withdrawals</p>
              </div>
            </div>
            <span className="text-gray-400">➔</span>
          </div>
        </Link>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; opacity: 0; }
      `}} />
    </div>
  );
}
