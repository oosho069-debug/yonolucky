"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState<number | "">("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleSubmit = async () => {
    if (!amount || amount < 200) return alert("Minimum withdrawal is ₹200");
    if (user?.balance < amount) return alert("Insufficient balance!");
    if (!bankAccount || !bankIfsc) return alert("Please fill all bank details");
    
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, amount, bankAccount, bankIfsc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // update local balance
      const newUser = { ...user, balance: user.balance - Number(amount) };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      alert("Withdrawal request submitted! Admin will verify soon.");
      window.location.href = "/history";
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="bg-gradient-to-r from-red-600 to-[#FB5755] text-white p-4 flex items-center sticky top-0 z-50 shadow-md">
        <Link href="/wallet" className="mr-4 active:scale-90 transition-transform"><span className="text-2xl">←</span></Link>
        <span className="font-bold text-lg flex-1 text-center pr-8">Withdraw</span>
      </header>

      <div className="p-4 flex-1 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-5 mb-6 text-white border border-gray-700">
          <p className="text-gray-400 font-semibold mb-1 text-sm">Available Balance</p>
          <h2 className="text-4xl font-extrabold text-[#FFB834] mb-2 tracking-tight">₹ {user?.balance?.toFixed(2) || "0.00"}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-lg border-b pb-2">Withdrawal Details</h3>
          
          <label className="text-sm font-semibold text-gray-600 block mb-1">Amount (₹)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Min ₹200"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 focus:outline-none focus:border-red-500 transition-colors font-bold text-lg"
          />

          <h3 className="font-bold text-gray-800 mb-4 text-lg border-b pb-2">Bank Information</h3>
          
          <label className="text-sm font-semibold text-gray-600 block mb-1">Account Number</label>
          <input 
            type="text" 
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter Bank A/C No."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-red-500 transition-colors font-medium tracking-widest"
          />

          <label className="text-sm font-semibold text-gray-600 block mb-1">IFSC Code</label>
          <input 
            type="text" 
            value={bankIfsc}
            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
            placeholder="SBIN000XXXX"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-8 focus:outline-none focus:border-red-500 transition-colors font-medium uppercase tracking-widest"
          />

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF1F1F] to-[#FB5755] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 text-lg"
          >
            {loading ? "Processing..." : "Withdraw Funds"}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
