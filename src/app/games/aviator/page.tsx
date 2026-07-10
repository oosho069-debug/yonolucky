"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

let socket: any;

export default function Aviator() {
  const [balance, setBalance] = useState<number>(0);
  const [aviatorState, setAviatorState] = useState({
    status: "BETTING",
    timeRemaining: 5000,
    multiplier: 1.0,
    history: []
  });
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [activeBet, setActiveBet] = useState<any>(null); // null if no bet placed
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (userStr) setBalance(JSON.parse(userStr).balance || 0);

    socket = io(window.location.origin);
    
    socket.on("aviator_update", (state: any) => {
      setAviatorState(state);
      
      // If crashed, resolve bet if not cashed out
      if (state.status === "CRASHED") {
        if (activeBetRef.current && !hasCashedOutRef.current) {
           // Lost
           resolveBet(activeBetRef.current.id, "LOST", 0);
           setActiveBet(null);
           setHasCashedOut(false);
        } else if (state.status === "BETTING") {
           // Reset for new round
           setActiveBet(null);
           setHasCashedOut(false);
        }
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  // Use refs for callbacks inside socket listeners
  const activeBetRef = useRef(activeBet);
  const hasCashedOutRef = useRef(hasCashedOut);
  
  useEffect(() => { activeBetRef.current = activeBet; }, [activeBet]);
  useEffect(() => { hasCashedOutRef.current = hasCashedOut; }, [hasCashedOut]);

  const placeBet = async () => {
    if (balance < betAmount) {
      alert("Insufficient Balance");
      return;
    }
    try {
      const res = await fetch("/api/bet/place", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: betAmount,
          selection: "AVIATOR",
          gameType: "AVIATOR",
          period: Date.now().toString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.newBalance);
        setActiveBet(data.bet);
        setHasCashedOut(false);
        
        // Update local storage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.balance = data.newBalance;
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cashOut = async () => {
    if (!activeBet || hasCashedOut || aviatorState.status !== "FLYING") return;
    
    setHasCashedOut(true);
    const winAmount = activeBet.amount * aviatorState.multiplier;
    
    resolveBet(activeBet.id, "WON", winAmount);
  };

  const resolveBet = async (betId: number, status: string, winAmount: number) => {
    try {
      const res = await fetch("/api/bet/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ betId, status, winAmount })
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.newBalance);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.balance = data.newBalance;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Plane position calculation
  const planeY = aviatorState.status === "BETTING" ? 80 : Math.max(10, 80 - Math.log(aviatorState.multiplier) * 30);
  const planeX = aviatorState.status === "BETTING" ? 10 : Math.min(80, 10 + Math.log(aviatorState.multiplier) * 30);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-yono-bg)] pb-20 font-sans text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0c4333] to-[#072a20] p-4 flex justify-between items-center shadow-lg border-b border-[#166e55]">
        <Link href="/" className="text-yellow-400 font-bold text-xl">← Back</Link>
        <span className="font-extrabold text-lg text-yellow-500 tracking-widest uppercase">AVIATOR</span>
        <div className="font-bold bg-[#072a20] px-4 py-1 rounded-full border border-yellow-500 text-yellow-400 shadow-[0_0_10px_#b8860b]">
          ₹ {balance.toFixed(2)}
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 p-4 flex flex-col gap-4 max-w-lg mx-auto w-full relative">
        
        {/* Aviator Screen */}
        <div className="relative w-full h-64 bg-[#072a20] ornate-border overflow-hidden rounded-xl">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(22,110,85,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(22,110,85,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          {/* Plane SVG */}
          <svg className="absolute w-16 h-16 transition-all duration-[50ms] ease-linear drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
               style={{ left: `${planeX}%`, top: `${planeY}%` }} viewBox="0 0 100 100">
             {/* Plane body */}
             <path d="M10,50 L80,30 L90,30 C95,30 95,40 90,40 L30,60 Z" fill={aviatorState.status === "CRASHED" ? "#ef4444" : "#FBBF24"} />
             {/* Wing */}
             <path d="M40,40 L60,10 L70,10 L50,45 Z" fill={aviatorState.status === "CRASHED" ? "#b91c1c" : "#b8860b"} />
             {/* Tail */}
             <path d="M10,50 L0,30 L10,30 L20,45 Z" fill={aviatorState.status === "CRASHED" ? "#b91c1c" : "#b8860b"} />
             {/* Propeller/Fire */}
             {aviatorState.status === "FLYING" && <circle cx="5" cy="50" r="5" fill="#f97316" className="animate-ping" />}
          </svg>

          {/* Multiplier / Status Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
             {aviatorState.status === "BETTING" && (
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-300">WAITING FOR NEXT ROUND</div>
                  <div className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] mt-2">
                    {(aviatorState.timeRemaining / 1000).toFixed(1)}s
                  </div>
                </div>
             )}
             {aviatorState.status === "FLYING" && (
                <div className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  {aviatorState.multiplier.toFixed(2)}x
                </div>
             )}
             {aviatorState.status === "CRASHED" && (
                <div className="text-center">
                  <div className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Flew Away!</div>
                  <div className="text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    {aviatorState.multiplier.toFixed(2)}x
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Previous Results History */}
        <div className="flex gap-2 overflow-x-auto py-2 bg-[#0c4333] rounded-lg px-2 border border-[#166e55]">
          {aviatorState.history.map((h: number, i) => (
            <span key={i} className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${h >= 2.0 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Betting Controls */}
        <div className="bg-[#0c4333] ornate-border p-4 rounded-xl flex flex-col gap-4 shadow-xl">
          
          <div className="flex items-center gap-2">
             <div className="flex-1 bg-[#072a20] rounded-full border border-gray-600 flex overflow-hidden">
                <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="px-4 py-2 bg-gray-800 font-bold hover:bg-gray-700">-</button>
                <input type="number" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full bg-transparent text-center font-bold outline-none" />
                <button onClick={() => setBetAmount(betAmount + 10)} className="px-4 py-2 bg-gray-800 font-bold hover:bg-gray-700">+</button>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 40, 100, 150, 200].map(amt => (
              <button key={amt} onClick={() => setBetAmount(amt)} className="bg-[#166e55] hover:bg-[#0c4333] border border-gray-500 rounded-md py-2 font-bold text-sm shadow-inner transition">
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="mt-2">
            {aviatorState.status === "BETTING" ? (
              <button 
                onClick={placeBet} 
                disabled={activeBet !== null}
                className={`w-full py-4 rounded-full font-black text-xl shadow-[0_5px_0_#15803D] uppercase transition ${activeBet ? 'bg-gray-600 text-gray-400 shadow-none' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:brightness-110 active:translate-y-1 active:shadow-none'}`}
              >
                {activeBet ? "Bet Placed" : "BET"}
              </button>
            ) : aviatorState.status === "FLYING" && activeBet && !hasCashedOut ? (
              <button 
                onClick={cashOut} 
                className="w-full py-4 rounded-full font-black text-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-[0_5px_0_#b45309] uppercase transition hover:brightness-110 active:translate-y-1 active:shadow-none"
              >
                CASH OUT (₹{(activeBet.amount * aviatorState.multiplier).toFixed(2)})
              </button>
            ) : (
               <button disabled className="w-full py-4 rounded-full font-black text-xl bg-gray-700 text-gray-500 uppercase">
                 Waiting...
               </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
