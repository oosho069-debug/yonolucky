"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { SoundManager } from "../../../utils/SoundManager";

export default function WingoGame() {
  const [activeTab, setActiveTab] = useState("WINGO_1MIN");
  const [timers, setTimers] = useState<any>({});
  
  useEffect(() => {
    const socket = io();
    socket.on("timers_update", (data) => setTimers(data));
    return () => { socket.disconnect(); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `0${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBet = (selection: string) => {
    SoundManager.playClick();
    alert(`Bet placed on ${selection} for ${activeTab.replace("_", " ")}`);
    // Here we would emit 'place_bet' to the socket
  };

  const currentData = timers[activeTab] || { timeRemaining: 0, currentPeriod: "Loading..." };

  // Play tick sound when time is low
  useEffect(() => {
    if (currentData.timeRemaining > 0 && currentData.timeRemaining <= 5) {
      SoundManager.playTick();
    }
  }, [currentData.timeRemaining]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="bg-red-600 p-4 flex justify-between items-center shadow-md text-white sticky top-0 z-50">
        <Link href="/" onClick={() => SoundManager.playClick()} className="font-bold">⬅ Back</Link>
        <span className="font-black text-xl">Wingo</span>
        <div className="text-white font-bold bg-black/30 px-3 py-1 rounded">₹ 1,204</div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm overflow-x-auto hide-scrollbar sticky top-[60px] z-40">
        {["WINGO_1MIN", "WINGO_3MIN", "WINGO_5MIN", "WINGO_10MIN"].map(tab => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); SoundManager.playClick(); }}
            className={`flex-1 py-3 font-bold text-sm min-w-[100px] border-b-2 transition ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400'}`}
          >
            {tab.split("_")[1]}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center border border-gray-100">
          <div>
            <p className="text-gray-500 font-semibold text-sm">Period</p>
            <p className="text-2xl font-bold text-gray-800">{currentData.currentPeriod}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 font-semibold text-sm">Time left</p>
            <p className={`text-3xl font-black ${currentData.timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
              {formatTime(currentData.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleBet("GREEN")} className="bg-green-500 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition">Green</button>
            <button onClick={() => handleBet("VIOLET")} className="bg-purple-500 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition">Violet</button>
            <button onClick={() => handleBet("RED")} className="bg-red-500 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition">Red</button>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[0,1,2,3,4,5,6,7,8,9].map(num => {
              let colorClass = "bg-green-500";
              if (num % 2 === 0) colorClass = "bg-red-500";
              if (num === 0 || num === 5) colorClass = "bg-purple-500";
              return (
                <button key={num} onClick={() => handleBet(num.toString())} className={`${colorClass} text-white font-bold py-3 rounded-xl shadow active:scale-95 transition`}>
                  {num}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
