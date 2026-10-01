import React, { useState } from "react";
import { User } from "lucide-react";

export default function Header({ currentArticleTitle, status = "작성 중" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="w-full px-3 md:px-6 pt-3 pb-1">
      {/* Light Glass Header Bar - Light Translucent Glass Floating over Light Gray Background */}
      <header className="relative w-full floating-light-glass-header px-6 md:px-8 py-3.5 transition-all overflow-hidden">
        {/* Full Width Container - All internal content 100% preserved */}
        <div className="w-full flex items-center justify-between z-10 relative">
          {/* Left Top Brand: AI Newsroom Title */}
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              AI Newsroom
            </h1>
          </div>

          {/* Right Top Action: Login / Pill Buttons */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/10 border border-slate-900/15 rounded-2xl text-xs font-bold text-slate-800 shadow-xs">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>김동아 기자</span>
              </div>
            ) : (
              <div className="flex items-center bg-slate-200/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-xs">
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="px-3.5 py-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-950 transition cursor-pointer font-sans"
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition cursor-pointer font-sans"
                >
                  Try for free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
