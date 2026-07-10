"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SoundManager } from "@/lib/SoundManager";

// Define 20 Slot Themes
const SLOT_THEMES: Record<string, any> = {
  "power-of-kraken": { name: "Power of Kraken", bg: "from-blue-900 to-cyan-900", accent: "border-blue-400", symbols: ["🦑", "🔱", "💎", "⚓", "🐙"] },
  "lucky-gems": { name: "Lucky Gems", bg: "from-emerald-900 to-green-900", accent: "border-emerald-400", symbols: ["💎", "🟢", "🔴", "🔵", "⭐"] },
  "sugar-rush": { name: "Sugar Rush", bg: "from-pink-900 to-purple-900", accent: "border-pink-400", symbols: ["🍭", "🍬", "🍫", "🍩", "🧁"] },
  "fortune-lakshmi": { name: "Fortune Lakshmi", bg: "from-yellow-900 to-orange-900", accent: "border-yellow-400", symbols: ["🕉️", "🏵️", "🪙", "🪔", "🐘"] },
  "big-stack": { name: "Big Stack Lumberjack", bg: "from-amber-900 to-red-900", accent: "border-amber-400", symbols: ["🪓", "🌲", "💰", "🏕️", "🐻"] },
  "golden-dragon": { name: "Golden Dragon", bg: "from-red-900 to-red-950", accent: "border-yellow-500", symbols: ["🐉", "🧧", "🔥", "🪙", "🏯"] },
  "mystic-wolf": { name: "Mystic Wolf", bg: "from-slate-900 to-indigo-900", accent: "border-indigo-400", symbols: ["🐺", "🌕", "🐾", "🌲", "❄️"] },
  "cleopatra-gold": { name: "Cleopatra Gold", bg: "from-yellow-800 to-stone-900", accent: "border-yellow-300", symbols: ["👁️", "🐫", "🏺", "🐍", "🛕"] },
  "neon-777": { name: "Neon 777", bg: "from-purple-900 to-fuchsia-900", accent: "border-fuchsia-400", symbols: ["7️⃣", "🍒", "🔔", "BAR", "🍋"] },
  "pirate-bounty": { name: "Pirate Bounty", bg: "from-stone-900 to-neutral-900", accent: "border-yellow-600", symbols: ["🏴‍☠️", "⚔️", "🧭", "🗺️", "💰"] },
  "zeus-lightning": { name: "Zeus Lightning", bg: "from-sky-900 to-blue-950", accent: "border-sky-300", symbols: ["⚡", "🏛️", "🦅", "🏺", "☁️"] },
  "leprechaun-loot": { name: "Leprechaun Loot", bg: "from-green-800 to-green-950", accent: "border-green-400", symbols: ["☘️", "🌈", "🍺", "🎩", "🪙"] },
  "vampire-night": { name: "Vampire Night", bg: "from-rose-950 to-black", accent: "border-rose-600", symbols: ["🦇", "🩸", "🧛", "🏰", "🍷"] },
  "safari-king": { name: "Safari King", bg: "from-orange-800 to-yellow-900", accent: "border-orange-400", symbols: ["🦁", "🦓", "🐘", "🦒", "☀️"] },
  "aztec-treasure": { name: "Aztec Treasure", bg: "from-emerald-950 to-teal-900", accent: "border-teal-400", symbols: ["🗿", "🐅", "🪙", "🐍", "🌞"] },
  "cyber-spin": { name: "Cyber Spin", bg: "from-cyan-950 to-blue-950", accent: "border-cyan-400", symbols: ["🤖", "🔌", "💻", "🔋", "💾"] },
  "wild-west": { name: "Wild West", bg: "from-orange-950 to-stone-900", accent: "border-orange-500", symbols: ["🤠", "🐎", "🌵", "🔫", "💰"] },
  "ocean-pearl": { name: "Ocean Pearl", bg: "from-cyan-900 to-blue-900", accent: "border-cyan-200", symbols: ["🦪", "🐬", "🐢", "🐠", "🌊"] },
  "magic-forest": { name: "Magic Forest", bg: "from-green-950 to-emerald-900", accent: "border-green-300", symbols: ["🧚", "🍄", "🦄", "🌲", "✨"] },
  "royal-crown": { name: "Royal Crown", bg: "from-purple-950 to-indigo-950", accent: "border-purple-400", symbols: ["👑", "💎", "🏰", "🛡️", "⚔️"] }
};

const BET_OPTIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 2500];

export default function SlotGame({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;
  const theme = SLOT_THEMES[gameId] || SLOT_THEMES["neon-777"]; // fallback
  
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>([theme.symbols[0], theme.symbols[1], theme.symbols[2]]);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (userStr) setBalance(JSON.parse(userStr).balance || 0);
  }, [token]);

  const setBet = (amt: number) => {
    SoundManager.click();
    setBetAmount(amt);
  };

  const spinReels = async () => {
    if (balance < betAmount || spinning) {
      if (balance < betAmount) alert("Insufficient Balance");
      return;
    }
    
    setWinMessage(null);
    setSpinning(true);
    SoundManager.spin();

    // 1. Place Bet API
    try {
      const placeRes = await fetch("/api/bet/place", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: betAmount,
          selection: "SPIN",
          gameType: "SLOTS",
          period: Date.now().toString()
        })
      });
      const placeData = await placeRes.json();
      
      if (!placeData.success) {
        alert(placeData.error);
        setSpinning(false);
        return;
      }
      
      setBalance(placeData.newBalance);
      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.balance = placeData.newBalance;
      localStorage.setItem("user", JSON.stringify(user));

      const betId = placeData.bet.id;

      let spinInterval = setInterval(() => {
        setReels([
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
          theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
        ]);
      }, 100);

      setTimeout(async () => {
        clearInterval(spinInterval);
        
        const isWin = Math.random() > 0.7; // 30% win rate
        let finalReels = [];
        
        if (isWin) {
          const winSymbol = theme.symbols[Math.floor(Math.random() * theme.symbols.length)];
          finalReels = [winSymbol, winSymbol, winSymbol];
        } else {
          finalReels = [
            theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
            theme.symbols[Math.floor(Math.random() * theme.symbols.length)],
            theme.symbols[Math.floor(Math.random() * theme.symbols.length)]
          ];
          if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            finalReels[2] = theme.symbols[(theme.symbols.indexOf(finalReels[2]) + 1) % theme.symbols.length];
          }
        }
        
        setReels(finalReels);

        const status = isWin ? "WON" : "LOST";
        const winAmount = isWin ? betAmount * 5 : 0; 

        const resolveRes = await fetch("/api/bet/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ betId, status, winAmount })
        });
        
        const resolveData = await resolveRes.json();
        if (resolveData.success) {
          setBalance(resolveData.newBalance);
          user.balance = resolveData.newBalance;
          localStorage.setItem("user", JSON.stringify(user));
          
          if (isWin) {
            SoundManager.megaWin();
            setWinMessage(`MEGA WIN! ₹${winAmount}`);
          }
        }
        
        setSpinning(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      setSpinning(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-b ${theme.bg} pb-20 font-sans text-white`}>
      <header className="bg-black/50 backdrop-blur-md p-4 flex justify-between items-center shadow-lg border-b border-white/10">
        <Link href="/" className="text-yellow-400 font-bold text-xl">← Back</Link>
        <span className="font-extrabold text-lg text-yellow-500 tracking-widest uppercase truncate px-2">{theme.name}</span>
        <div className="font-bold bg-black/50 px-4 py-1 rounded-full border border-yellow-500 text-yellow-400 shadow-[0_0_10px_#b8860b]">
          ₹ {balance.toFixed(2)}
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 max-w-lg mx-auto w-full justify-center">
        {winMessage && (
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
              <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,1)] text-center whitespace-nowrap bg-black/80 px-8 py-4 rounded-full border-4 border-yellow-500">
                {winMessage}
              </div>
           </div>
        )}

        <div className={`relative bg-black/80 p-8 rounded-3xl border-4 ${theme.accent} shadow-[0_0_30px_rgba(0,0,0,0.8)]`}>
           <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-700 h-40 overflow-hidden shadow-inner relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-500/50 -translate-y-1/2 shadow-[0_0_10px_#eab308]"></div>
              {reels.map((symbol, idx) => (
                <div key={idx} className="flex-1 flex justify-center items-center">
                   <div className={`text-6xl ${spinning ? 'animate-pulse blur-[1px]' : 'transition-all drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'}`}>
                     {symbol}
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl flex flex-col gap-4 border border-white/10">
          <div className="text-center text-sm font-bold text-gray-300">TOTAL BET: ₹{betAmount}</div>

          <div className="grid grid-cols-4 gap-2">
            {BET_OPTIONS.map(amt => (
              <button key={amt} onClick={() => setBet(amt)} disabled={spinning} className={`py-2 rounded-md font-bold text-sm shadow-md transition ${betAmount === amt ? 'bg-yellow-500 text-black shadow-[0_0_10px_#eab308]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                ₹{amt}
              </button>
            ))}
          </div>

          <button 
            onClick={spinReels} 
            disabled={spinning}
            className={`w-full py-5 rounded-full font-black text-3xl uppercase tracking-widest transition-all ${spinning ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black shadow-[0_5px_0_#a16207] hover:brightness-110 active:translate-y-1 active:shadow-none'}`}
          >
            {spinning ? "Spinning..." : "SPIN"}
          </button>
        </div>
      </main>
    </div>
  );
}
