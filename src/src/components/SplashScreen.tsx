"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setFade(true);
          setTimeout(() => setShow(false), 400);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Global Casino Click Sound using AudioContext
    let audioCtx: AudioContext | null = null;

    const playClickSound = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
      } catch (e) {
        console.error("Audio error", e);
      }
    };

    // Attach to all clicks globally
    document.addEventListener("click", playClickSound);
    return () => document.removeEventListener("click", playClickSound);
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-green-600 to-gray-900 transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      
      <div className="relative w-48 h-48 animate-bounce drop-shadow-2xl">
        <Image 
          src="/icons/icon-512x512.png" 
          alt="App Logo" 
          width={192}
          height={192}
          className="rounded-[40px] shadow-2xl border-4 border-[#FFB834] w-full h-full object-contain"
        />
      </div>
      
      <h1 className="mt-8 text-4xl font-extrabold text-white tracking-wider drop-shadow-lg" style={{textShadow: "0px 4px 10px rgba(0,0,0,0.5)"}}>
        <span className="text-[#FFB834]">Yono</span>lucky
      </h1>
      
      {/* Progress Bar */}
      <div className="w-64 h-3 bg-gray-800 rounded-full mt-8 overflow-hidden border border-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-[#FFB834] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-white font-bold text-sm">{progress}%</p>
      
      <p className="absolute bottom-10 text-white/70 font-semibold tracking-widest text-xs uppercase animate-pulse">
        Loading Yonolucky...
      </p>
    </div>
  );
}
