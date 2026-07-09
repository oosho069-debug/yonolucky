"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HistoryPage() {
  const [tab, setTab] = useState<"BETS" | "TRANSACTIONS">("TRANSACTIONS");
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      fetchHistory(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/history?userId=${id}`);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
        setBets(data.bets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="bg-gradient-to-r from-red-600 to-[#FB5755] text-white p-4 flex items-center sticky top-0 z-50 shadow-md">
        <Link href="/wallet" className="mr-4 active:scale-90 transition-transform">
          <span className="text-2xl">←</span>
        </Link>
        <span className="font-bold text-lg flex-1 text-center pr-8">History</span>
      </header>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm sticky top-[60px] z-40 border-b border-gray-200">
        <button 
          onClick={() => setTab("TRANSACTIONS")}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${tab === "TRANSACTIONS" ? "text-red-500 border-b-2 border-red-500" : "text-gray-500"}`}
        >
          Transactions
        </button>
        <button 
          onClick={() => setTab("BETS")}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${tab === "BETS" ? "text-red-500 border-b-2 border-red-500" : "text-gray-500"}`}
        >
          Game Bets
        </button>
      </div>

      <div className="p-4 flex-1 animate-fade-in">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {tab === "TRANSACTIONS" && (
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10 font-medium">No transactions found</p>
                ) : (
                  transactions.map((tx, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${tx.type === "DEPOSIT" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {tx.type === "DEPOSIT" ? "↓" : "↑"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{tx.type}</h4>
                          <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()} • {tx.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className={`font-bold text-lg ${tx.type === "DEPOSIT" ? "text-green-500" : "text-red-500"}`}>
                          {tx.type === "DEPOSIT" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tx.status === "APPROVED" ? "bg-green-100 text-green-700" : tx.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "BETS" && (
              <div className="space-y-3">
                {bets.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10 font-medium">No bets found</p>
                ) : (
                  bets.map((bet, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-bold text-gray-800">Period: {bet.period}</h4>
                        <p className="text-xs text-gray-500 font-semibold mt-1">
                          Select: <span className="text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{bet.selection}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-gray-700">₹{bet.amount.toFixed(2)}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${bet.status === "WON" ? "bg-green-100 text-green-700" : bet.status === "LOST" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {bet.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
