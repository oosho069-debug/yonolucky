"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mode, setMode] = useState("LOGIN"); // LOGIN, REGISTER, FORGOT
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generate random OTP to simulate SMS (for fake Yono aesthetic)
  const generateOTP = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(randomOtp);
    alert(`Your OTP is: ${randomOtp}`);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let endpoint = "";
    if (mode === "LOGIN") endpoint = "/api/auth/login";
    else if (mode === "REGISTER") endpoint = "/api/auth/register";
    else endpoint = "/api/auth/reset";

    try {
      // For register, we just skip OTP backend validation for this demo
      const payload = mode === "REGISTER" ? { phone, password, otp } : { phone, password };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (mode === "LOGIN") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
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
    <div className="flex flex-col min-h-screen bg-[var(--color-yono-bg)] relative pb-20 overflow-hidden font-sans">
      
      {/* Background Curtain Effect */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:40px_100%] pointer-events-none"></div>

      {/* Yono Logo Header Background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-0 opacity-20">
        <h1 className="text-8xl font-black text-yellow-500 tracking-tighter drop-shadow-2xl">YONO</h1>
        <h2 className="text-4xl font-bold text-gray-400 tracking-[0.5em] text-center -mt-2">GAMES</h2>
      </div>

      {/* Main Login Area */}
      <section className="relative z-10 flex flex-col items-center p-4 mt-32 w-full max-w-md mx-auto">
        
        {/* Modal Container */}
        <div className="w-full relative">
          
          {/* Top Golden Tab */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#fde047] text-yellow-900 px-8 py-2 font-bold rounded-t-lg shadow-lg border-2 border-b-0 border-yellow-300 z-20">
            {mode === "LOGIN" ? "लॉग इन करें" : mode === "REGISTER" ? "रजिस्टर करें" : "पासवर्ड भूल गए"}
          </div>

          {/* Ornate Modal */}
          <div className="bg-[#0c4333] ornate-border p-6 pt-10 rounded-xl relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Close Button X */}
            <Link href="/" className="absolute top-2 right-3 text-yellow-400 font-bold text-xl hover:text-white transition">
              ✖
            </Link>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Phone Input Row */}
              <div className="flex items-center gap-4 border-b border-[#166e55] pb-2">
                <label className="text-white font-bold w-1/3 text-sm">
                  मोबाइल नंबर
                </label>
                <div className="flex-1 flex bg-[#072a20] rounded-md overflow-hidden border border-[#166e55]">
                  <span className="px-2 py-2 text-gray-400 text-sm border-r border-[#166e55]">+91</span>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="अपना मोबाइल संख्या दर्ज करें" 
                    className="w-full px-2 py-2 bg-transparent outline-none text-white text-sm placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input Row */}
              <div className="flex items-center gap-4 border-b border-[#166e55] pb-2">
                <label className="text-white font-bold w-1/3 text-sm">
                  लॉगिन पासवर्ड
                </label>
                <div className="flex-1 flex bg-[#072a20] rounded-md overflow-hidden border border-[#166e55]">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="अपना लॉगिन पासवर्ड दर्ज करें"
                    className="w-full px-3 py-2 bg-transparent outline-none text-white text-sm placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Register specific fields */}
              {mode === "REGISTER" && (
                <div className="flex items-center gap-4 border-b border-[#166e55] pb-2">
                  <label className="text-white font-bold w-1/3 text-sm">
                    OTP कोड
                  </label>
                  <div className="flex-1 flex bg-[#072a20] rounded-md overflow-hidden border border-[#166e55]">
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="OTP दर्ज करें"
                      className="w-full px-3 py-2 bg-transparent outline-none text-white text-sm placeholder-gray-500"
                      required
                    />
                    <button type="button" onClick={generateOTP} className="bg-yellow-600 text-white text-xs px-2 whitespace-nowrap">
                      OTP भेजें
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              {/* Login Button Row */}
              <div className="flex items-center justify-between mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[linear-gradient(to_bottom,#d1d5db,#9ca3af)] border-2 border-gray-400 text-gray-900 font-bold px-8 py-2 rounded-full shadow-lg hover:brightness-110 active:translate-y-1"
                >
                  {loading ? "लोड हो रहा है..." : mode === "LOGIN" ? "लॉग इन करें" : "रजिस्टर करें"}
                </button>

                {mode === "LOGIN" ? (
                  <button type="button" onClick={() => setMode("FORGOT")} className="text-cyan-400 text-sm font-semibold underline">
                    पासवर्ड भूल गए
                  </button>
                ) : (
                  <button type="button" onClick={() => setMode("LOGIN")} className="text-cyan-400 text-sm font-semibold underline">
                    वापस लॉग इन करें
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>

        {/* Bottom Buttons (Login/Guest/Register) */}
        <div className="mt-16 flex flex-col gap-4 w-full px-8">
          {mode !== "LOGIN" && (
            <button onClick={() => setMode("LOGIN")} className="bg-[#0c4333] border border-[#166e55] text-teal-200 font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2">
              📱 लॉग इन करें
            </button>
          )}
          {mode !== "REGISTER" && (
            <button onClick={() => setMode("REGISTER")} className="bg-[#0c4333] border border-[#166e55] text-yellow-400 font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2">
              ✨ नया अकाउंट बनाएँ
            </button>
          )}
          <button className="bg-[#1e3a8a] border border-blue-500 text-blue-200 font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2">
            ⚡ अतिथि के रूप में खेलो
          </button>
        </div>

      </section>

      <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-500 uppercase tracking-widest z-10">
        © YONO CORPORATION ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}
