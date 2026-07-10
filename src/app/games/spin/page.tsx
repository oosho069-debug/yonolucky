"use client";
import Link from "next/link";
import { useState } from "react";
import { SoundManager } from "../../../utils/SoundManager";

export default function SpinGame() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    SoundManager.playSlotSpin();

    // Random rotation between 1080 and 3600 degrees (3 to 10 extra spins)
    const extraSpins = Math.floor(Math.random() * 5) + 5;
    const newRotation = rotation + (extraSpins * 360) + Math.floor(Math.random() * 360);
    
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      SoundManager.playWin();
      alert("You won a prize!");
    }, 4000); // Wait for CSS transition
  };

  return (
    <div className="flex flex-col min-h-screen bg-indigo-900 text-white pb-20 overflow-hidden">
      <header className="bg-indigo-950 p-4 flex justify-between items-center shadow-lg border-b border-indigo-500">
        <Link href="/" onClick={() => SoundManager.playClick()} className="font-bold text-yellow-400">⬅ Back</Link>
        <span className="font-black text-xl text-yellow-400">LUCKY SPIN</span>
        <div className="text-green-400 font-bold bg-black/50 px-3 py-1 rounded">₹ 1,204</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Wheel Container */}
        <div className="relative w-80 h-80 mb-12">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-5xl drop-shadow-xl text-yellow-400">
            🔻
          </div>
          
          {/* Wheel */}
          <div 
            className="w-full h-full rounded-full border-8 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] overflow-hidden relative transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Colorful Wheel Slices (CSS Hack) */}
            <div className="absolute inset-0 bg-[conic-gradient(#ef4444_0deg,#ef4444_60deg,#3b82f6_60deg,#3b82f6_120deg,#10b981_120deg,#10b981_180deg,#f59e0b_180deg,#f59e0b_240deg,#a855f7_240deg,#a855f7_300deg,#ec4899_300deg,#ec4899_360deg)]"></div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-yellow-500 shadow-xl z-10 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">★</span>
            </div>
          </div>
        </div>

        <button 
          onClick={spin}
          disabled={spinning}
          className={`bg-gradient-to-b from-yellow-400 to-yellow-600 text-indigo-950 font-black text-3xl px-16 py-5 rounded-full shadow-[0_8px_0_#A16207,0_15px_20px_rgba(0,0,0,0.5)] transition ${spinning ? 'opacity-50' : 'active:translate-y-2 active:shadow-[0_0_0_#A16207] hover:scale-105'}`}
        >
          {spinning ? 'SPINNING...' : 'SPIN NOW'}
        </button>
      </div>
    </div>
  );
}
