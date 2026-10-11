import React, { useState } from "react";
import { Bell, FileEdit, ChevronDown, FileText } from "lucide-react";

export default function Header({ 
  currentArticleTitle = "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁", 
  status = "작성 중",
  reporterName = "김동아 기자",
  department = "디지털편집국",
  onOpenAuth,
  isLoggedIn,
  setIsLoggedIn
}) {
  const [internalLoggedIn, setInternalLoggedIn] = useState(false);
  const loggedIn = isLoggedIn !== undefined ? isLoggedIn : internalLoggedIn;
  const setLoggedIn = setIsLoggedIn || setInternalLoggedIn;
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <div className="w-full pl-6 md:pl-8 pr-6 md:pr-8 pt-3.5 pb-2">
      <header className="w-full flex items-center justify-between z-10 relative gap-3">
        
        {/* 1. Left Brand */}
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

        {/* 3. Right Notifications & Login/User Profile Capsule */}
        <div className="flex items-center gap-2.5">
          {/* 알림 버튼 Capsule */}
          <button 
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-md border border-black/5 text-[#666666] hover:text-[#292929] hover:bg-white flex items-center justify-center transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer relative"
            title="알림"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-[0_0_4px_rgba(180,195,210,0.6)]" />
          </button>

          {/* 로그인하기, 회원가입하기 버튼 (처음 화면: 우측 상단) 
              누르면 '김동아 기자' 버튼으로 생성 및 전환됨 */}
          {!loggedIn ? (
            <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-black/5 rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <button
                type="button"
                onClick={() => onOpenAuth?.("login")}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-100/80 rounded-full transition cursor-pointer active:scale-95"
              >
                로그인하기
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#292929] hover:bg-black text-white rounded-full transition shadow-xs cursor-pointer active:scale-95"
              >
                회원가입하기
              </button>
            </div>
          ) : (
            /* 로그인 완료 후 생성되는 '김동아 기자' 버튼 */
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="bg-white/85 backdrop-blur-md border border-black/5 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer hover:bg-white transition active:scale-95 animate-in fade-in zoom-in-95 duration-200"
                title="기자 정보"
              >
                <div className="w-6 h-6 rounded-full bg-[#292929] text-white flex items-center justify-center text-[11px] font-bold">
                  <FileEdit className="w-3 h-3 text-slate-300" />
                </div>
                <span className="text-xs font-extrabold text-[#292929]">{reporterName}</span>
                <span className="text-xs text-[#999999]">{department}</span>
                <ChevronDown className="w-3 h-3 text-[#999999]" />
              </button>

              {/* 클릭 시 드롭다운 (로그인 화면 열기 / 로그아웃) */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-extrabold text-slate-900">{reporterName}</p>
                    <p className="text-[11px] text-slate-500">{department}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth?.("login");
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer mt-1"
                  >
                    로그인 화면 열기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setLoggedIn(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </header>
    </div>
  );
}
