import React, { useState } from "react";
import { Bell, FileEdit, ChevronDown, FileText } from "lucide-react";

export default function Header({ 
  currentArticleTitle = "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁", 
  status = "작성 중" 
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <div className="w-full pl-6 md:pl-8 pr-6 md:pr-8 pt-3.5 pb-2">
      <header className="w-full flex items-center justify-between z-10 relative gap-3">
        
        {/* 1. Left Brand & Workspace Badge Capsule */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white/85 backdrop-blur-md border border-black/5 rounded-full px-4 py-2 flex items-center gap-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* 로고 옆 은은한 실버 breathing glow 원형 포인트 */}
            <span className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-slate-300/50 animate-ping" style={{ animationDuration: '3.5s' }} />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-[0_0_8px_rgba(180,195,210,0.8)]" />
            </span>
            <h1 
              className="text-base font-extrabold text-[#292929] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Pretendard', sans-serif" }}
            >
              AI Newsroom
            </h1>
          </div>
        </div>

        {/* 2. Center Active Article Capsule */}
        <div className="bg-white/85 backdrop-blur-md border border-black/5 rounded-full px-4 py-1.5 hidden lg:flex items-center gap-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] max-w-xl">
          <div className="flex items-center gap-1.5 text-xs text-[#999999] flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-[#666666]" />
            <span>현재 작업:</span>
          </div>

          <span className="text-xs font-extrabold text-[#292929] truncate max-w-[220px]">
            {currentArticleTitle}
          </span>

          <div className="h-3 w-[1px] bg-[#E7E4DE] flex-shrink-0" />

          {/* 상태 배지 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-bold rounded-full border ${
              status === "검증 완료" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === "검증 완료" ? "bg-emerald-500" : "bg-slate-400"}`} />
              {status}
            </span>
          </div>

          <span className="text-[11px] text-[#999999] flex-shrink-0">
            방금 저장됨
          </span>
        </div>

        {/* 3. Right Notifications & User Profile Capsule */}
        <div className="flex items-center gap-2.5">
          {/* 알림 버튼 Capsule */}
          <button 
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-black/5 text-[#666666] hover:text-[#292929] hover:bg-white flex items-center justify-center transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer relative"
            title="알림"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-[0_0_4px_rgba(180,195,210,0.6)]" />
          </button>

          {/* 사용자 정보 Capsule */}
          {isLoggedIn ? (
            <div className="bg-white/85 backdrop-blur-md border border-black/5 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer hover:bg-white transition">
              <div className="w-6 h-6 rounded-full bg-[#292929] text-white flex items-center justify-center text-[11px] font-bold">
                <FileEdit className="w-3 h-3 text-slate-300" />
              </div>
              <span className="text-xs font-extrabold text-[#292929]">김동아 기자</span>
              <span className="text-xs text-[#999999]">편집부</span>
              <ChevronDown className="w-3 h-3 text-[#999999]" />
            </div>
          ) : (
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="px-4 py-1.5 bg-[#292929] text-white text-xs font-bold rounded-full transition shadow-xs cursor-pointer hover:bg-black"
            >
              로그인
            </button>
          )}
        </div>

      </header>
    </div>
  );
}
