"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SoundManager } from "../../../utils/SoundManager";

export default function AviatorGame() {
  const [multiplier, setMultiplier] = useState(1.00);
  const [flying, setFlying] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [bet, setBet] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (flying && !crashed) {
      interval = setInterval(() => {
        setMultiplier(prev => {
          const next = prev + (prev * 0.05); // Exponential growth
          // Random crash
          if (Math.random() < 0.02 && next > 1.2) {
            setCrashed(true);
            setFlying(false);
            setPlaying(false);
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [flying, crashed]);

  const placeBet = () => {
    if (flying || crashed) {
      // Reset game
      setMultiplier(1.0);
      setCrashed(false);
    }
    SoundManager.playClick();
    setBet(100); // Mock bet 100
    setPlaying(true);
    setFlying(true);
  };

  const cashOut = () => {
    if (playing && flying && !crashed) {
      SoundManager.playWin();
      setPlaying(false);
      alert(`Cashed out! You won ₹${(bet * multiplier).toFixed(2)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white pb-20">
      <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md border-b-2 border-red-500">
        <Link href="/" onClick={() => SoundManager.playClick()} className="font-bold text-red-500">⬅ Back</Link>
        <span className="font-black text-xl text-red-500 italic">AVIATOR</span>
        <div className="text-green-400 font-bold bg-black/50 px-3 py-1 rounded">₹ 1,204</div>
      </header>

      <div className="flex-1 p-4 flex flex-col">
        {/* Game Screen */}
        <div className="bg-black rounded-3xl h-64 border-4 border-gray-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
          {crashed ? (
            <div className="text-center z-10">
              <h2 className="text-5xl font-black text-red-500">FLEW AWAY!</h2>
              <p className="text-2xl text-red-400 font-bold mt-2">{multiplier.toFixed(2)}x</p>
            </div>
          ) : (
            <div className="text-center z-10">
              <h2 className={`text-6xl font-black ${flying ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
                {multiplier.toFixed(2)}x
              </h2>
            </div>
          )}
          
          {/* Animated plane (CSS based) */}
          <div className={`absolute text-6xl transition-all duration-1000 ${flying && !crashed ? 'bottom-[40%] left-[40%] rotate-[-20deg]' : 'bottom-0 left-0'} ${crashed ? 'opacity-0' : 'opacity-100'}`}>
            ✈️
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 bg-gray-800 p-6 rounded-3xl border-2 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <button className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow active:scale-95">- 100</button>
            <span className="text-2xl font-black text-white">₹ {bet || 100}</span>
            <button className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow active:scale-95">+ 100</button>
          </div>
          
          {playing ? (
            <button 
              onClick={cashOut}
              className="w-full bg-orange-500 text-white font-black text-2xl py-4 rounded-xl shadow-[0_5px_0_#C2410C] active:translate-y-1 active:shadow-none"
            >
              CASH OUT <br/> <span className="text-sm">Win ₹{(bet * multiplier).toFixed(2)}</span>
            </button>
          ) : (
            <button 
              onClick={placeBet}
              className="w-full bg-green-500 text-white font-black text-2xl py-4 rounded-xl shadow-[0_5px_0_#15803D] active:translate-y-1 active:shadow-none"
            >
              BET
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
