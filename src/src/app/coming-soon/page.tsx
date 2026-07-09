import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-gradient-to-r from-[#FF1F1F] to-[#FB5755] rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
        <span className="text-4xl">🚀</span>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Coming Soon!</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        This game mode is currently under development and will be available in the next update. Stay tuned!
      </p>

      <Link href="/">
        <button className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full shadow hover:bg-gray-700 active:scale-95 transition-transform">
          Back to Home
        </button>
      </Link>
    </div>
  );
}
