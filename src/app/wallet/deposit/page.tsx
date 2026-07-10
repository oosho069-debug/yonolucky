"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Deposit() {
  const [amount, setAmount] = useState<number | "">("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleSubmit = async () => {
    if (!amount || amount < 100) return alert("Minimum deposit is ₹100");
    if (!utr || utr.length !== 12) return alert("Please enter valid 12-digit UTR");
    
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, amount, utr })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Deposit request submitted! Admin will verify soon.");
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
        <span className="font-bold text-lg flex-1 text-center pr-8">Deposit</span>
      </header>

      <div className="p-4 flex-1 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 text-center">
          <h3 className="text-gray-500 font-semibold mb-2">Pay via UPI QR</h3>
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center border-4 border-dashed border-gray-300 mb-4">
            <span className="text-gray-400">QR CODE HERE</span>
          </div>
          <p className="font-bold text-lg text-gray-800">UPI: admin@ybl</p>
          <p className="text-sm text-red-500 mt-1">Scan or pay to this UPI ID</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-lg border-b pb-2">Deposit Details</h3>
          
          <label className="text-sm font-semibold text-gray-600 block mb-1">Amount (₹)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Min ₹100"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-red-500 transition-colors font-bold text-lg"
          />

          <div className="grid grid-cols-4 gap-2 mb-6">
            {[100, 500, 1000, 5000].map(amt => (
              <button 
                key={amt} 
                onClick={() => setAmount(amt)}
                className={`py-2 rounded-lg font-bold border transition-all active:scale-95 ${amount === amt ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <label className="text-sm font-semibold text-gray-600 block mb-1">UTR Number (12 Digits)</label>
          <input 
            type="text" 
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="Enter Ref No. after payment"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 focus:outline-none focus:border-red-500 transition-colors font-medium tracking-widest"
          />

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF1F1F] to-[#FB5755] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 text-lg"
          >
            {loading ? "Processing..." : "Submit Request"}
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
