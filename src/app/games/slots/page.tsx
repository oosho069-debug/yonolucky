"use client";
import Link from "next/link";
import { useState } from "react";
import { SoundManager } from "../../../utils/SoundManager";

export default function SlotsGame() {
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(["🍒", "🔔", "💎"]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    SoundManager.playSlotSpin();
    
    // Simulate spin
    let spins = 0;
    const interval = setInterval(() => {
      setSlots([
        ["🍒", "🔔", "💎", "7️⃣", "🍀"][Math.floor(Math.random() * 5)],
        ["🍒", "🔔", "💎", "7️⃣", "🍀"][Math.floor(Math.random() * 5)],
        ["🍒", "🔔", "💎", "7️⃣", "🍀"][Math.floor(Math.random() * 5)]
      ]);
      spins++;
      if (spins > 10) {
        clearInterval(interval);
        setSpinning(false);
        // Randomly win
        if (Math.random() > 0.5) {
          SoundManager.playWin();
          alert("Jackpot! You won!");
        }
      }
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white pb-20">
      <header className="bg-purple-900 p-4 flex justify-between items-center shadow-lg border-b-2 border-purple-500">
        <Link href="/" onClick={() => SoundManager.playClick()} className="font-bold text-yellow-400 text-lg">
          ⬅ Back
        </Link>
        <span className="font-black text-xl tracking-wider text-purple-300">Jilli Slots</span>
        <div className="text-green-400 font-bold bg-black/50 px-3 py-1 rounded">₹ 1,204</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-purple-800 p-6 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.5)] border-4 border-yellow-500">
          <div className="bg-gray-900 rounded-xl p-6 flex gap-4 border-4 border-purple-900 shadow-inner">
            {slots.map((s, i) => (
              <div key={i} className={`w-20 h-24 bg-white rounded-lg flex items-center justify-center text-6xl shadow-inner ${spinning ? 'animate-pulse' : ''}`}>
                {s}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={spin}
          disabled={spinning}
          className={`mt-12 bg-gradient-to-b from-yellow-400 to-yellow-600 text-purple-900 font-black text-3xl px-16 py-6 rounded-full shadow-[0_10px_0_#A16207,0_15px_20px_rgba(0,0,0,0.5)] border-4 border-white transition active:translate-y-2 active:shadow-[0_0_0_#A16207,0_5px_10px_rgba(0,0,0,0.5)] ${spinning ? 'opacity-50' : 'hover:scale-105'}`}
        >
          SPIN
        </button>
      </div>
    </div>
  );
}
