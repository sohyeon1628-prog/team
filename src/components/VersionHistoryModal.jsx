import React, { useState } from "react";
import { History, X, RotateCcw, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

// 초기 시뮬레이션 저장 이력 목록 (최신순 내림차순 정렬)
const INITIAL_REVISIONS = [
  {
    revisionNo: 3,
    createdAt: "2026-10-12T14:30:00",
    title: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
    excerpt: `국내 주요 반도체 기업들이 차세대 온디바이스 NPU 및 PIM 반도체 성과를 발표하며 글로벌 시장 공략에 속도를 내고 있다. 생성형 AI의 급격한 확산으로 기존 클라우드 연산 방식의 전력 소모 한계가 명확해지자 디바이스 자체 연산 칩셋이 대안으로 부상했다.

특히 저전력 고효율 NPU 아키텍처는 스마트폰, 차량용 인포테인먼트, 엣지 서버 등 다양한 분야로 확산되는 추세다. 업계 전문가들은 차세대 반도체 설계 역량과 소프트웨어 최적화 생태계 구축이 향후 10년의 산업 주도권을 판가름할 핵심 분수령이 될 것이라고 진단했다.`,
    chars: 1420,
    photoCount: 2,
    sourceCount: 3,
    isLatest: true
  },
  {
    revisionNo: 2,
    createdAt: "2026-10-12T13:45:00",
    title: "국내 팹리스·파운드리 연합, '온디바이스 AI' 생태계 주도 선언",
    excerpt: `생성형 AI의 급격한 확산으로 기존 클라우드 연산 방식의 전력 소모 한계가 명확해지자 디바이스 자체 연산 칩셋이 대안으로 부상했다.

국내 팹리스 기업들과 대형 파운드리가 손을 잡고 초저전력 AI 가속기 양산에 속도를 낸다. 이번 협력은 설계부터 패키징까지 전 주기를 아우르는 공급망 구축을 목표로 한다.`,
    chars: 1180,
    photoCount: 1,
    sourceCount: 2,
    isLatest: false
  },
  {
    revisionNo: 1,
    createdAt: "2026-10-12T11:10:00",
    title: "AI 칩 전쟁 2막, 데이터센터에서 모바일로",
    excerpt: `글로벌 빅테크의 AI 가속기 경쟁 속에서 국내 연구진이 저전력 고효율 NPU 아키텍처 개발에 매진하고 있다. 클라우드 의존도를 낮추고 모바일 기기에서 직접 대규모 언어 모델을 구동하는 핵심 기술이 공개되었다.`,
    chars: 850,
    photoCount: 0,
    sourceCount: 1,
    isLatest: false
  }
];

const formatTime = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
};

const formatShortTime = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
};

/**
 * 저장 이력 및 이전 저장본 복원 모달
 * - 데스크톱 72~78% 너비, 78~84% 높이의 정사각형에 가까운 안정적인 대형 뷰포트
 * - 좌측 40% 이력 목록 (왼쪽 강조선 및 은은한 배경) + 우측 60% 원고 미리보기 2열 구조
 * - 각각 독립 스크롤 지원 및 복원 전 안전 확인 대화상자 제공
 */
export default function VersionHistoryModal({ isOpen, onClose, onRestore }) {
  const [revisions] = useState(INITIAL_REVISIONS);
  const [selectedNo, setSelectedNo] = useState(3);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState("");

  if (!isOpen) return null;

  const currentRevision = revisions.find((r) => r.revisionNo === selectedNo) || revisions[0];

  // 실제 복원 실행 핸들러
  const handleExecuteRestore = () => {
    setIsRestoring(true);
    setShowConfirmDialog(false);

    setTimeout(() => {
      setIsRestoring(false);
      setRestoreNotice(`#${selectedNo} 저장본이 성공적으로 복원되었습니다.`);
      if (onRestore) {
        onRestore(currentRevision);
      }
      setTimeout(() => {
        setRestoreNotice("");
        onClose();
      }, 1100);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-stone-950/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ──────────────────────────────────────────────────────────
          대형 모달 본체 (너비: 76vw, 높이: 82vh의 정사각형에 가까운 대형 비율)
         ────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="저장 이력 및 복원"
        data-testid="version-history"
        className="w-[94vw] md:w-[76vw] max-w-5xl h-[90vh] md:h-[82vh] max-h-[860px] min-h-[580px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 select-none relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 상단 고정 헤더 */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-stone-200/70 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200/70 shadow-2xs">
              <History className="w-4 h-4 text-stone-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-stone-950 tracking-tight">저장 이력</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                  총 {revisions.length}개 저장본
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-normal mt-0.5">
                원하는 시점을 선택하여 이전 원고를 확인하고 안전하게 복원할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 상단 복원 완료 안내 토스트 배너 */}
        {restoreNotice && (
          <div className="mx-6 md:mx-8 mt-3 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 duration-150 flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-[#8ECAE6]" />
            <span>{restoreNotice}</span>
          </div>
        )}

        {/* 2. 본문 2열 레이아웃: 좌측 목록 40% + 우측 미리보기 60% */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* ──────────────────────────────────────────────────────────
              [좌측 패널: 전체 너비의 약 40%] 저장 이력 목록 (독립 스크롤)
             ────────────────────────────────────────────────────────── */}
          <div className="w-full md:w-[40%] border-b md:border-b-0 md:border-r border-stone-200/70 flex flex-col min-h-0 bg-stone-50/20">
            {/* 좌측 서브 타이틀 바 */}
            <div className="px-5 py-3 border-b border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium shrink-0 bg-stone-50/50">
              <span className="font-bold text-stone-700">저장 시점 목록</span>
              <span className="text-[11px] font-mono text-stone-400">최신순 정렬</span>
            </div>

            {/* 독립 스크롤 저장본 목록 (얇은 구분선 및 왼쪽 강조선 적용) */}
            <ul
              data-testid="revision-list"
              className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 md:p-3"
            >
              {revisions.map((rev) => {
                const isSelected = selectedNo === rev.revisionNo;
                return (
                  <li key={rev.revisionNo}>
                    <button
                      type="button"
                      onClick={() => setSelectedNo(rev.revisionNo)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-4 transition-all duration-150 cursor-pointer rounded-xl ${
                        isSelected
                          ? "bg-stone-100/75 border-l-3 border-stone-900 shadow-2xs"
                          : "hover:bg-stone-50/80 border-l-3 border-transparent"
                      }`}
                    >
                      {/* 상단 메타: 시점 + 최신 배지 */}
                      <div className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span className={`font-semibold flex items-center gap-1.5 ${isSelected ? "text-stone-900" : "text-stone-600"}`}>
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{formatShortTime(rev.createdAt)}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {rev.isLatest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-900 text-white">
                              최신
                            </span>
                          )}
                          <span className={`text-[11px] font-bold ${isSelected ? "text-stone-800" : "text-stone-400"}`}>
                            #{rev.revisionNo}
                          </span>
                        </div>
                      </div>

                      {/* 원고 제목 */}
                      <h3 className={`text-xs mt-1.5 line-clamp-2 leading-snug tracking-tight ${isSelected ? "font-black text-stone-950" : "font-bold text-stone-700"}`}>
                        {rev.title}
                      </h3>

                      {/* 요약 발췌문 */}
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed font-normal">
                        {rev.excerpt}
                      </p>

                      {/* 하단 메타: 본문 글자 수, 사진 수, 취재자료 수 */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200/40 text-[10px] font-mono text-stone-400">
                        <span>{rev.chars}자</span>
                        <span>·</span>
                        <span>사진 {rev.photoCount}장</span>
                        <span>·</span>
                        <span>취재자료 {rev.sourceCount}건</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────────
              [우측 패널: 전체 너비의 약 60%] 원고 미리보기 & 복원 액션 (독립 스크롤)
             ────────────────────────────────────────────────────────── */}
          <div
            data-testid="revision-preview"
            className="w-full md:w-[60%] flex flex-col min-h-0 bg-white"
          >
            {/* 우측 상단: 선택된 저장본 시점 & 번호 헤더 */}
            <div className="px-6 md:px-8 py-3.5 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800">선택된 저장본</span>
                <span className="text-stone-300">|</span>
                <span className="font-mono text-stone-500">#{currentRevision.revisionNo}</span>
                {currentRevision.isLatest && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                    현재 최신본
                  </span>
                )}
              </div>
              <span className="text-stone-400 font-mono text-[11px]">
                {formatTime(currentRevision.createdAt)}
              </span>
            </div>

            {/* 본문 미리보기 영역 (넓은 공간 확보 및 내부 독립 스크롤) */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-5">
              {/* 기사 헤드라인 제목 */}
              <div className="space-y-2 pb-4 border-b border-stone-100">
                <div className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                  ARTICLE HEADLINE
                </div>
                <h1 className="text-lg md:text-xl font-black text-stone-950 leading-snug tracking-tight">
                  {currentRevision.title}
                </h1>
              </div>

              {/* 기사 본문 내용 */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                  CONTENT PREVIEW
                </div>
                <div className="text-xs md:text-sm text-stone-700 leading-relaxed font-sans whitespace-pre-wrap selection:bg-stone-200">
                  {currentRevision.excerpt}
                </div>
              </div>

              {/* 하단 저장본 주요 메타 정보 칩 바 */}
              <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs text-stone-500 font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">본문 분량:</span>
                  <span className="font-bold text-stone-800">{currentRevision.chars}자</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">첨부 사진:</span>
                  <span className="font-bold text-stone-800">{currentRevision.photoCount}장</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center gap-2">
                  <span className="text-stone-400 text-[11px]">취재자료:</span>
                  <span className="font-bold text-stone-800">{currentRevision.sourceCount}건</span>
                </div>
              </div>
            </div>

            {/* 우측 하단 고정 액션 바: [이 버전으로 복원] */}
            <div className="px-6 md:px-8 py-4 border-t border-stone-200/70 bg-stone-50/50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-stone-400 leading-tight">
                * 복원 시 현재 에디터에 작성 중인 내용이 선택 시점으로 교체됩니다.
              </span>

              <button
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isRestoring}
                className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-200" />
                <span>이 버전으로 복원</span>
              </button>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            [복원 확인 대화상자 (Confirm Modal)]: 취소와 복원 명확 구분
           ────────────────────────────────────────────────────────── */}
        {showConfirmDialog && (
          <div
            className="absolute inset-0 z-30 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setShowConfirmDialog(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-stone-700" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-stone-950 tracking-tight">
                    이전 저장본으로 복원하시겠습니까?
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-normal">
                    <strong className="text-stone-800 font-semibold font-mono">
                      #{currentRevision.revisionNo} ({formatShortTime(currentRevision.createdAt)})
                    </strong>{" "}
                    저장본으로 복원하면 현재 작성 중인 기사 내용이 해당 시점으로 교체됩니다.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-700 text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                >
                  {isRestoring ? "복원 적용 중..." : "복원 확인"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
