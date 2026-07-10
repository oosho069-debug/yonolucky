"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Wingo() {
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [period, setPeriod] = useState("Loading...");
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState([
    { period: '...00', num: 8, bs: 'Big', color: 'bg-red-500' },
    { period: '...99', num: 3, bs: 'Small', color: 'bg-green-500' },
    { period: '...98', num: 0, bs: 'Small', color: 'bg-purple-500' },
  ]);
  const [socket, setSocket] = useState<any>(null);

  // Betting Modal State
  const [showModal, setShowModal] = useState(false);
  const [betSelection, setBetSelection] = useState("");
  const [betAmount, setBetAmount] = useState(10);
  const [betLoading, setBetLoading] = useState(false);

  useEffect(() => {
    // Load user data
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setBalance(parsedUser.balance);
    }

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("timer_update", (data) => {
      setTimeRemaining(data.timeRemaining);
      setPeriod(data.currentPeriod);
      // Close modal forcefully if locked out (5s or less)
      if (data.timeRemaining <= 5) {
        setShowModal(false);
      }
    });

    newSocket.on("game_result", (data) => {
      let colorClass = "bg-green-500";
      if (data.resultColor === "RED") colorClass = "bg-red-500";
      if (data.resultColor === "VIOLET") colorClass = "bg-gradient-to-br from-purple-500 to-red-500";
      
      const bs = data.resultNumber > 4 ? "Big" : "Small";

      setHistory(prev => {
        const newHist = [{
          period: data.period.slice(-4),
          num: data.resultNumber,
          bs: bs,
          color: colorClass
        }, ...prev];
        if (newHist.length > 10) newHist.pop();
        return newHist;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const openBetModal = (selection: string) => {
    if (timeRemaining <= 5) {
      alert("Wait for next round. Betting is locked!");
      return;
    }
    if (!user) {
      alert("Please login first to place a bet.");
      return;
    }
    setBetSelection(selection);
    setBetAmount(10);
    setShowModal(true);
  };

  const handlePlaceBet = async () => {
    if (balance < betAmount) {
      alert("Insufficient balance. Please deposit.");
      return;
    }

    setBetLoading(true);
    try {
      const res = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: betAmount,
          selection: betSelection,
          period: period
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBalance(data.newBalance);
      // Update local storage balance
      const updatedUser = { ...user, balance: data.newBalance };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert(`Successfully placed ₹${betAmount} on ${betSelection}`);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to place bet");
    } finally {
      setBetLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `0${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timeStr = formatTime(timeRemaining);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="bg-[#FB5755] text-white p-4 flex items-center sticky top-0 z-50 shadow-md">
        <Link href="/" className="mr-4">
          <span className="text-2xl">←</span>
        </Link>
        <span className="font-bold text-lg flex-1 text-center pr-8">Wingo</span>
      </header>

      {/* Wallet Balance Card */}
      <section className="p-4 bg-red-500 rounded-b-3xl text-white shadow-md">
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90">Available Balance</p>
          <h2 className="text-3xl font-bold my-2">₹ {balance.toFixed(2)}</h2>
          <div className="flex gap-4 mt-4">
            <Link href="/wallet" className="flex-1">
              <button className="w-full bg-green-500 text-white font-bold py-2 rounded-full shadow hover:bg-green-600 transition active:scale-95">
                Deposit
              </button>
            </Link>
            <button className="flex-1 bg-white text-red-500 font-bold py-2 rounded-full shadow hover:bg-gray-100 transition active:scale-95">
              Withdraw
            </button>
          </div>
        </div>
      </section>

      {/* Timer Sections */}
      <section className="p-4 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {["Wingo 1Min", "Wingo 3Min", "Wingo 5Min", "Wingo 10Min"].map((timer, idx) => (
          <div key={idx} className={`p-2 rounded-lg cursor-pointer ${idx === 0 ? 'bg-gradient-to-b from-[#FB5755] to-red-400 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <div className="text-2xl mb-1">⏱️</div>
            {timer}
          </div>
        ))}
      </section>

      {/* Game Area */}
      <section className="px-4 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div className="text-sm text-gray-500 flex flex-col">
              <span>Period</span>
              <span className="font-bold text-gray-800 text-lg">{period}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500">Time remaining</span>
              <div className="flex gap-1 text-red-500 font-bold text-xl mt-1">
                <div className="bg-gray-100 px-2 py-1 rounded">{timeStr[0]}</div>
                <div className="bg-gray-100 px-2 py-1 rounded">{timeStr[1]}</div>
                <span>:</span>
                <div className="bg-gray-100 px-2 py-1 rounded">{timeStr[3]}</div>
                <div className="bg-gray-100 px-2 py-1 rounded">{timeStr[4]}</div>
              </div>
            </div>
          </div>

          {/* Locked overlay (5s limit) */}
          {timeRemaining <= 5 && (
            <div className="absolute inset-0 top-16 bg-black/60 z-10 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white font-bold text-6xl drop-shadow-lg text-red-500 animate-pulse">0{timeRemaining}</span>
            </div>
          )}

          {/* Color Betting Buttons */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => openBetModal("GREEN")} className="flex-1 bg-green-500 text-white py-3 rounded-lg shadow-sm font-bold hover:bg-green-600 active:scale-95 transition-all">
              Join Green
            </button>
            <button onClick={() => openBetModal("VIOLET")} className="flex-1 bg-purple-500 text-white py-3 rounded-lg shadow-sm font-bold hover:bg-purple-600 active:scale-95 transition-all">
              Join Violet
            </button>
            <button onClick={() => openBetModal("RED")} className="flex-1 bg-red-500 text-white py-3 rounded-lg shadow-sm font-bold hover:bg-red-600 active:scale-95 transition-all">
              Join Red
            </button>
          </div>

          {/* Number Betting Area */}
          <div className="grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-lg">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              let color = "bg-green-500 hover:bg-green-600";
              if (num % 2 === 0) color = "bg-red-500 hover:bg-red-600";
              if (num === 0 || num === 5) color = "bg-gradient-to-br from-purple-500 to-red-500 hover:opacity-90";
              
              return (
                <button onClick={() => openBetModal(`NUMBER_${num}`)} key={num} className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm active:scale-90 transition-transform ${color}`}>
                  {num}
                </button>
              )
            })}
          </div>

          {/* Big / Small Betting */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => openBetModal("BIG")} className="flex-1 bg-blue-500 text-white py-2 rounded-lg shadow-sm font-bold border-2 border-blue-600 hover:bg-blue-600 active:scale-95 transition-transform">
              Big
            </button>
            <button onClick={() => openBetModal("SMALL")} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg shadow-sm font-bold border-2 border-yellow-600 hover:bg-yellow-600 active:scale-95 transition-transform">
              Small
            </button>
          </div>
        </div>
      </section>

      {/* Betting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up">
            <div className={`p-4 font-bold text-white text-center ${
              betSelection.includes("RED") ? "bg-red-500" : 
              betSelection.includes("GREEN") ? "bg-green-500" :
              betSelection.includes("VIOLET") ? "bg-purple-500" :
              betSelection.includes("BIG") ? "bg-blue-500" :
              betSelection.includes("SMALL") ? "bg-yellow-500" : "bg-gray-800"
            }`}>
              Select Amount for {betSelection.replace("NUMBER_", "Number ")}
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10, 50, 100, 500, 1000, 5000].map((amt) => (
                  <button 
                    key={amt} 
                    onClick={() => setBetAmount(amt)}
                    className={`py-2 rounded font-bold border-2 transition-colors ${betAmount === amt ? 'border-[#FB5755] text-[#FB5755] bg-red-50' : 'border-gray-200 text-gray-600 hover:border-[#FB5755]'} active:scale-95`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between mb-6 font-bold text-lg">
                <span className="text-gray-600">Total Contract</span>
                <span className="text-[#FB5755]">₹{betAmount}</span>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePlaceBet}
                  disabled={betLoading}
                  className="flex-1 py-3 bg-[#FB5755] text-white font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {betLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <section className="px-4 mt-4 flex-1">
        <h3 className="font-bold text-gray-700 mb-2">Game History</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Period</th>
                <th className="p-3">Number</th>
                <th className="p-3">Big/Small</th>
                <th className="p-3">Color</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors animate-fade-in">
                  <td className="p-3 text-gray-700">{row.period}</td>
                  <td className={`p-3 font-bold`}>
                    <span className={`inline-block w-6 h-6 flex items-center justify-center text-white rounded-full ${row.color}`}>{row.num}</span>
                  </td>
                  <td className="p-3 text-gray-600 font-medium">{row.bs}</td>
                  <td className="p-3">
                    <div className={`w-3 h-3 rounded-full mx-auto ${row.color}`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}
