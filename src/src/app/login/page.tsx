"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mode, setMode] = useState("LOGIN"); // LOGIN, REGISTER, FORGOT
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let endpoint = "";
    if (mode === "LOGIN") endpoint = "/api/auth/login";
    else if (mode === "REGISTER") endpoint = "/api/auth/register";
    else endpoint = "/api/auth/reset"; // Forgot Password

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (mode === "LOGIN") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        router.push("/");
      } else if (mode === "REGISTER") {
        alert("Registration successful! Please login.");
        setMode("LOGIN");
      } else if (mode === "FORGOT") {
        alert("Password Reset Successful! You can now login.");
        setMode("LOGIN");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex items-center shadow-lg border-b border-green-400">
        <Link href="/" className="mr-4 text-white hover:text-yellow-400 transition">
          <span className="text-2xl font-bold">←</span>
        </Link>
        <span className="font-extrabold text-lg flex-1 text-center pr-8 text-white tracking-widest uppercase">
          {mode === "LOGIN" ? "Log In" : mode === "REGISTER" ? "Register" : "Reset Password"}
        </span>
      </header>

      {/* Main Login Area */}
      <section className="flex flex-col items-center p-8 mt-4 bg-white/5 mx-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-md">
        
        {/* Yono Style Logo */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-black text-green-700 text-4xl shadow-[0_0_20px_rgba(34,197,94,0.5)] border-4 border-yellow-400 mb-6">
          Y
        </div>
        
        <h2 className="text-3xl font-black text-yellow-400 mb-8 tracking-wider">
          {mode === "LOGIN" ? "WELCOME BACK" : mode === "REGISTER" ? "JOIN YONOLUCKY" : "RECOVER ACCOUNT"}
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-5">
          {/* Phone Input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              📱 Mobile Number
            </label>
            <div className="flex bg-[#1E293B] rounded-xl overflow-hidden border-2 border-gray-700 focus-within:border-yellow-400 transition-colors shadow-inner">
              <span className="bg-gray-800 px-4 py-3 text-gray-400 font-bold border-r border-gray-700">
                +91
              </span>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number" 
                className="w-full px-4 py-3 bg-transparent outline-none text-white font-semibold placeholder-gray-500"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
              🔒 {mode === "FORGOT" ? "New Password" : "Password"}
            </label>
            <div className="flex bg-[#1E293B] rounded-xl overflow-hidden border-2 border-gray-700 focus-within:border-yellow-400 transition-colors shadow-inner">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "FORGOT" ? "Enter new password" : "Enter your password"}
                className="w-full px-4 py-3 bg-transparent outline-none text-white font-semibold placeholder-gray-500"
                required
              />
            </div>
          </div>

          {mode === "LOGIN" && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => { setMode("FORGOT"); setError(""); }}
                className="text-sm font-bold text-green-400 hover:text-green-300 transition"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center font-bold animate-pulse bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-xl py-4 rounded-full shadow-[0_5px_0_#15803D] mt-4 hover:brightness-110 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : (mode === "LOGIN" ? "LOG IN" : mode === "REGISTER" ? "REGISTER" : "RESET PASSWORD")}
          </button>
          
          <div className="flex gap-2 mt-4">
            {mode !== "LOGIN" && (
              <button 
                type="button" 
                onClick={() => { setMode("LOGIN"); setError(""); }}
                className="flex-1 bg-[#1E293B] text-gray-300 font-bold py-3 rounded-full shadow-md hover:bg-gray-800 transition border border-gray-700"
              >
                Back to Login
              </button>
            )}
            {mode !== "REGISTER" && (
              <button 
                type="button" 
                onClick={() => { setMode("REGISTER"); setError(""); }}
                className="flex-1 bg-[#1E293B] text-yellow-400 font-bold py-3 rounded-full shadow-md hover:bg-gray-800 transition border border-yellow-400/30"
              >
                Create Account
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
