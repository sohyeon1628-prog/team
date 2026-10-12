import React from "react";
import { Check, MoreHorizontal } from "lucide-react";

/**
 * 기사 검증률 (ARTICLE CHECK) 사전 팝업 모달
 * - 팩트체크 실행 전 검증률(86%) 및 4대 항목 상태를 직관적으로 요약 표시
 * - [전체 검증 실행 →] 클릭 시 기존 FactCheckDrawer 사이드박스 오픈
 */
export default function ArticleCheckModal({ isOpen, onClose, onStartCheck, isSideBySide = false }) {
  if (!isOpen) return null;

  // 원형 프로그레스 계산 (86%)
  const percentage = 86;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const contentCard = (
    <div
      className={`w-full ${
        isSideBySide
          ? "w-[330px] lg:w-[340px] xl:w-[350px] flex-shrink-0 h-[calc(100vh-100px)] min-h-[760px] max-h-[920px] sticky top-4 rounded-3xl overflow-y-auto no-scrollbar border border-slate-200/90 shadow-xs"
          : "max-w-[340px] sm:max-w-[360px] rounded-[36px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.18)] border border-stone-100/80"
      } bg-white p-6 sm:p-7 flex flex-col justify-between animate-in zoom-in-95 duration-200 select-none`}
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        {/* 1. 상단 소제목 & 더보기/닫기 */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase">
            ARTICLE CHECK
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition cursor-pointer p-0.5 -mr-1 rounded-full hover:bg-stone-100"
            title="닫기"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 메인 타이틀 */}
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mb-5">
          기사 검증률
        </h2>

        {/* 3. 원형 도넛 게이지 (86%) & 안내 문구 */}
        <div className="flex items-center gap-4.5 mb-5 pb-2">
          {/* 라임/연두색 원형 도넛 차트 */}
          <div className="relative w-22 h-22 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              {/* 배경 링 */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-stone-100"
                strokeWidth="7"
                fill="transparent"
              />
              {/* 진행 링 (형광 연두/라임색) */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#A3E635"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-stone-900 tracking-tight">
              <span className="text-2xl font-black leading-none">86</span>
              <span className="text-xs font-bold self-start mt-4 ml-0.5">%</span>
            </div>
          </div>

          {/* 우측 설명 */}
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
              검토가 필요합니다
            </h3>
            <p className="text-xs text-stone-400 font-medium">
              3개의 항목을 확인해주세요.
            </p>
          </div>
        </div>

        {/* 4. 4대 체크리스트 항목 */}
        <div className="divide-y divide-stone-100/90 border-t border-stone-100/90 mb-6">
          {/* 1) 맞춤법 및 문장 (정상) */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-5.5 h-5.5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 tracking-tight">
                맞춤법 및 문장
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 font-normal">
                문제가 발견되지 않았습니다.
              </p>
            </div>
          </div>

          {/* 2) 기사 구조 (정상) */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-5.5 h-5.5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 tracking-tight">
                기사 구조
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 font-normal">
                제목과 본문 구조가 적절합니다.
              </p>
            </div>
          </div>

          {/* 3) 출처 확인 (확인 필요) */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-5.5 h-5.5 rounded-full bg-[#fef9c3] text-[#ca8a04] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs leading-none">
              !
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 tracking-tight">
                출처 확인
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 font-normal">
                출처가 필요한 문장이 2개 있습니다.
              </p>
            </div>
          </div>

          {/* 4) 사실관계 검증 (확인 필요) */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-5.5 h-5.5 rounded-full bg-[#fef9c3] text-[#ca8a04] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs leading-none">
              !
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 tracking-tight">
                사실관계 검증
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 font-normal">
                확인이 필요한 내용이 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 5. 하단 액션 버튼: 전체 검증 실행 → */}
        <button
          type="button"
          onClick={() => {
            if (onStartCheck) onStartCheck();
          }}
          className="w-full py-3.5 rounded-2xl bg-stone-950 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm cursor-pointer mt-4"
        >
          <span>전체 검증 실행</span>
          <span className="text-sm font-light">→</span>
        </button>
      </div>
    </div>
  );

  if (isSideBySide) {
    return contentCard;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {contentCard}
    </div>
  );
}
