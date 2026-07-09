"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("DASHBOARD"); // DASHBOARD, USERS, LIVE_BETS, GAME_CONTROL, WALLET
  
  const handleLogin = (e: any) => {
    e.preventDefault();
    if (passwordInput === "yono123") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Admin Password!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-700 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">👑</div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-widest">ADMIN SECURE</h1>
          <p className="text-gray-400 text-sm mb-6 font-semibold">Enter your master password</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Admin Password"
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-center focus:border-yellow-500 outline-none"
              autoFocus
            />
            <button type="submit" className="bg-yellow-500 text-gray-900 font-black py-3 rounded-lg shadow-lg hover:bg-yellow-400 active:scale-95 transition">
              UNLOCK SYSTEM
            </button>
          </form>
          <Link href="/" className="block mt-6 text-gray-500 text-sm hover:text-white transition">← Back to App</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50 border-b-2 border-[#FFB834]">
        <div className="flex items-center gap-2">
          <span className="bg-[#FFB834] text-gray-900 font-bold px-2 py-1 rounded text-xs animate-pulse">ADMIN PRO</span>
          <span className="font-bold text-lg">Control Center</span>
        </div>
        <Link href="/" className="text-sm font-semibold hover:text-[#FFB834] transition">
          Exit ➔
        </Link>
      </header>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto bg-white border-b shadow-sm sticky top-[60px] z-40 hide-scrollbar">
        {["DASHBOARD", "USERS", "LIVE_BETS", "GAME_CONTROL", "WALLET"].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-3 font-bold text-sm transition ${activeTab === tab ? 'text-[#FFB834] border-b-2 border-[#FFB834]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "DASHBOARD" && <DashboardTab />}
        {activeTab === "USERS" && <UsersTab />}
        {activeTab === "LIVE_BETS" && <LiveBetsTab />}
        {activeTab === "GAME_CONTROL" && <GameControlTab />}
        {activeTab === "WALLET" && <WalletTab />}
      </div>
    </div>
  );
}

// ==============================
// 1. DASHBOARD TAB
// ==============================
function DashboardTab() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <div className="text-3xl mb-1">👥</div>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Users</span>
        <span className="text-2xl font-bold text-gray-800 mt-1">1,204</span>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <div className="text-3xl mb-1">💰</div>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Deposits</span>
        <span className="text-2xl font-bold text-green-500 mt-1">₹ 4.5L</span>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <div className="text-3xl mb-1">🎮</div>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Live Games</span>
        <span className="text-2xl font-bold text-blue-500 mt-1">6</span>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
        <div className="text-3xl mb-1">💸</div>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Withdrawals</span>
        <span className="text-2xl font-bold text-red-500 mt-1">₹ 1.2L</span>
      </div>
    </div>
  );
}

// ==============================
// 2. USERS MANIPULATION TAB
// ==============================
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) setUsers(data.users);
  };

  const handleAction = async (userId: number, action: string) => {
    let value = "";
    if (action === "ADD_BALANCE" || action === "DEDUCT_BALANCE") {
      value = prompt(`Enter amount to ${action === 'ADD_BALANCE' ? 'ADD' : 'DEDUCT'}:`) || "";
      if (!value || isNaN(Number(value))) return;
    }
    if (action === "CHANGE_PASSWORD") {
      value = prompt("Enter new password:") || "";
      if (!value) return;
    }

    const res = await fetch("/api/admin/users/manipulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value })
    });
    
    if (res.ok) {
      fetchUsers(); // Refresh
      alert("Success!");
    } else {
      alert("Action failed.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">ID / Phone</th>
            <th className="p-3">Password</th>
            <th className="p-3">Balance</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Controls</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="p-3">
                <span className="font-bold text-gray-800">{u.phone}</span><br/>
                <span className="text-xs text-gray-400">ID: {u.id}</span>
              </td>
              <td className="p-3 text-red-500 font-mono font-bold tracking-widest">{u.password}</td>
              <td className="p-3 font-bold text-green-600">₹ {u.balance}</td>
              <td className="p-3">
                <span className={`text-xs px-2 py-1 rounded font-bold ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                </span>
              </td>
              <td className="p-3 text-center flex gap-1 justify-center">
                <button onClick={() => handleAction(u.id, "ADD_BALANCE")} className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">+ Bal</button>
                <button onClick={() => handleAction(u.id, "DEDUCT_BALANCE")} className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">- Bal</button>
                <button onClick={() => handleAction(u.id, "CHANGE_PASSWORD")} className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">Pass</button>
                <button onClick={() => handleAction(u.id, "TOGGLE_BLOCK")} className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Block</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==============================
// 3. LIVE BETS TAB
// ==============================
function LiveBetsTab() {
  const [liveBets, setLiveBets] = useState<any[]>([]);

  useEffect(() => {
    const socket = io();
    socket.on("admin_live_bet", (bet) => {
      setLiveBets(prev => [bet, ...prev].slice(0, 50)); // Keep last 50
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-red-500 text-white p-3 font-bold flex justify-between items-center animate-pulse">
        <span>🔴 Live Bets Stream</span>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">{liveBets.length} Bets</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {liveBets.length === 0 ? (
              <tr><td className="p-8 text-center text-gray-400">Waiting for bets...</td></tr>
            ) : (
              liveBets.map((bet, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="p-3">
                    <span className="font-bold text-gray-800">{bet.phone}</span>
                    <span className="text-xs text-gray-500 ml-2">({bet.gameType})</span>
                  </td>
                  <td className="p-3 font-bold text-blue-600">Period: {bet.period}</td>
                  <td className="p-3">
                    <span className="font-bold bg-gray-100 px-2 py-1 rounded border">Select: {bet.selection}</span>
                  </td>
                  <td className="p-3 font-bold text-green-600 text-right">₹ {bet.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==============================
// 4. GAME CONTROL TAB
// ==============================
function GameControlTab() {
  const [timers, setTimers] = useState<any>({});
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    newSocket.on("timers_update", (data) => setTimers(data));
    return () => { newSocket.disconnect(); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `0${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleForceResult = (gameType: string, color: string) => {
    if (socket) {
      socket.emit("force_result", { gameType, color });
      alert(`Forced Next ${gameType} Result to ${color}!`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {["WINGO_1MIN", "WINGO_3MIN", "WINGO_5MIN", "WINGO_10MIN"].map(gameType => {
        const t = timers[gameType] || { timeRemaining: 0, currentPeriod: "Loading..." };
        return (
          <div key={gameType} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-800 text-white p-3 font-bold flex justify-between items-center">
              <span>🎮 {gameType.replace("_", " ")}</span>
              <span className={`text-sm ${t.timeRemaining <= 10 ? 'text-red-400 animate-bounce' : 'text-green-400'}`}>
                Timer: {formatTime(t.timeRemaining)}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-4 text-sm font-semibold text-gray-500">
                Period: <span className="text-gray-800 text-lg">{t.currentPeriod}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleForceResult(gameType, "GREEN")} className="bg-green-100 text-green-700 border border-green-300 py-2 rounded-lg font-bold hover:bg-green-500 hover:text-white transition">Force Green</button>
                <button onClick={() => handleForceResult(gameType, "VIOLET")} className="bg-purple-100 text-purple-700 border border-purple-300 py-2 rounded-lg font-bold hover:bg-purple-500 hover:text-white transition">Force Violet</button>
                <button onClick={() => handleForceResult(gameType, "RED")} className="bg-red-100 text-red-700 border border-red-300 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition">Force Red</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==============================
// 5. WALLET TAB
// ==============================
function WalletTab() {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    fetchTxs();
  }, []);

  const fetchTxs = async () => {
    const res = await fetch("/api/admin/transactions");
    const data = await res.json();
    if (data.transactions) setTxs(data.transactions);
  };

  const handleAction = async (id: number, action: string) => {
    const res = await fetch("/api/admin/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id, action })
    });
    if (res.ok) {
      alert(`Transaction ${action}D`);
      fetchTxs();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
      {txs.length === 0 ? (
        <div className="p-6 text-center text-gray-500 font-semibold">No pending transactions 🎉</div>
      ) : (
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Details</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx: any) => (
              <tr key={tx.id} className="border-b border-gray-50">
                <td className="p-3">
                  <span className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>{tx.type}</span><br/>
                  <span className="text-xs text-gray-500">₹{tx.amount} (User {tx.userId})</span>
                </td>
                <td className="p-3 text-xs text-gray-600 max-w-[150px] overflow-hidden text-ellipsis">
                  {tx.details}
                </td>
                <td className="p-3 text-right flex gap-1 justify-end">
                  <button onClick={() => handleAction(tx.id, 'APPROVE')} className="bg-green-500 text-white px-3 py-2 rounded text-xs font-bold active:scale-95">Approve</button>
                  <button onClick={() => handleAction(tx.id, 'REJECT')} className="bg-red-500 text-white px-3 py-2 rounded text-xs font-bold active:scale-95">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
