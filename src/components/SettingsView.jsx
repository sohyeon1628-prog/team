import React, { useState, useRef, useEffect } from "react";
import {
  Cpu,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  HardDriveDownload,
  UploadCloud,
  FileCheck2,
  X,
  Download,
  Sparkles
} from "lucide-react";

// 초기 로컬 모델 데이터 상수 (STEP 01 ~ STEP 04 워크플로우 순서)
const INITIAL_MODELS = [
  {
    id: "factcheck",
    step: "STEP 01",
    title: "팩트체크 판정",
    spec: "Qwen3-0.6B v3, ONNX",
    size: "2.23 GB",
    status: "installed",
    progress: 100,
    downloadedSize: "2.23 GB",
    files: "5/5",
    desc: "기사 내 사실 관계 검증 및 출처 신뢰도 판정을 로컬에서 수행합니다."
  },
  {
    id: "chunking",
    step: "STEP 02",
    title: "의미 청킹 경계 판정",
    spec: "KLUE-RoBERTa ONNX",
    size: "422.9 MB",
    status: "installed",
    progress: 100,
    downloadedSize: "422.9 MB",
    files: "3/3",
    desc: "문맥의 자연스러운 흐름과 단락 분절 경계를 분석합니다."
  },
  {
    id: "title",
    step: "STEP 03",
    title: "제목 초안",
    spec: "KoT5 ONNX, 번서치 내장",
    size: "369.4 MB",
    status: "installed",
    progress: 100,
    downloadedSize: "369.4 MB",
    files: "2/2",
    desc: "본문 핵심 키워드를 도출하여 제목 후보를 생성합니다."
  },
  {
    id: "subtitle",
    step: "STEP 04",
    title: "부제 초안",
    spec: "KoBART ONNX",
    size: "649.3 MB",
    status: "installed",
    progress: 100,
    downloadedSize: "649.3 MB",
    files: "5/5",
    desc: "기사의 핵심 내용을 1~2줄의 부제로 요약합니다."
  }
];

/**
 * AI Newsroom 환경 설정 전체 화면 뷰 (SettingsView)
 * - 신문 편집 스타일 좌측 소개 영역 (단색 라인 일러스트 + 부드러운 돋보기 탐색 모션)
 * - 우측 세로형 AI 모델 워크플로우 타임라인 및 활성 단계 중앙 정렬 모션 UI
 * - 다운로드 완료 (재실행) 모노톤 배지 및 마우스 휠 스크롤 인터랙션
 * - 사용자 자료 암호화 백업·복구 섹션
 */
export default function SettingsView({ onReturnToArticle: _onReturnToArticle }) {
  // 4개 로컬 AI 모델 상태
  const [models, setModels] = useState(INITIAL_MODELS);

  // 현재 활성화된 워크플로우 단계 인덱스 (기본 STEP 04 활성화 - 레퍼런스 이미지 일치)
  const [activeStep, setActiveStep] = useState(3);

  // 중앙 정렬 모션을 위한 참조 및 translateY 오프셋
  const workflowContainerRef = useRef(null);
  const stepRefs = useRef([]);
  const [translateY, setTranslateY] = useState(0);

  // 백업 암호 입력 필드 상태
  const [backupPassword, setBackupPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 3500);
  };

  // 활성 단계가 뷰포트 세로 중앙에 오도록 오프셋 계산
  useEffect(() => {
    const updateCenterOffset = () => {
      const container = workflowContainerRef.current;
      const activeEl = stepRefs.current[activeStep];
      if (container && activeEl) {
        const containerH = container.clientHeight;
        const elTop = activeEl.offsetTop;
        const elH = activeEl.offsetHeight;
        // 컨테이너 중앙(containerH / 2) - 요소의 중심(elTop + elH / 2)
        const targetOffset = containerH / 2 - (elTop + elH / 2);
        setTranslateY(targetOffset);
      }
    };

    updateCenterOffset();
    window.addEventListener("resize", updateCenterOffset);
    return () => window.removeEventListener("resize", updateCenterOffset);
  }, [activeStep, models]);

  // STEP 01 등 상태 점검 액션 핸들러 (완료 후 다음 단계 중앙 이동)
  const handleModelAction = (_id, title, stepIdx) => {
    showFeedback(`'${title}' 모델의 온디바이스 상태 점검이 완료되었습니다.`);
    if (stepIdx < models.length - 1) {
      setTimeout(() => {
        setActiveStep(stepIdx + 1);
      }, 450);
    } else {
      showFeedback("4개 온디바이스 로컬 모델의 파이프라인 검증이 모두 완료되었습니다.");
    }
  };

  // 모델 설치 시작 인터랙션
  const handleStartInstall = (id, title, stepIdx) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "downloading", progress: 20, downloadedSize: "73.8 MB" } : m
      )
    );
    showFeedback(`'${title}' 모델 다운로드를 시작했습니다.`);

    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status: "installed", progress: 100, downloadedSize: m.size, files: "2/2" }
            : m
        )
      );
      showFeedback(`'${title}' 모델 설치가 완료되었습니다.`);
      if (stepIdx < models.length - 1) {
        setActiveStep(stepIdx + 1);
      }
    }, 1200);
  };

  // 일괄 다운로드 진행 및 완료 상태
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [isBatchDone, setIsBatchDone] = useState(true); // 기본 다운로드 완료 상태

  // 구동 완료 후 휠 스크롤 가능 여부
  const isScrollable = isBatchDone || models.every((m) => m.status === "installed");

  // 타임라인 박스 마우스 휠 스크롤 핸들러 (구동 완료 후 커서 올렸을 때 스크롤 가능)
  const handleTimelineWheel = (e) => {
    if (!isScrollable) return;
    setTranslateY((prev) => {
      const container = workflowContainerRef.current;
      const containerH = container ? container.clientHeight : 500;
      const maxOffset = 60;
      const minOffset = Math.min(-100, containerH - 700);
      const next = prev - e.deltaY * 0.65;
      return Math.max(minOffset, Math.min(maxOffset, next));
    });
  };

  // 한 번에 다운로드하기: 4개 단계가 순서대로 자동으로 활성화되며 노드가 회전/이동하는 모션 인터랙션
  const handleBatchDownload = () => {
    if (isBatchDownloading) return;
    setIsBatchDownloading(true);

    // 1단계: STEP 01로 중앙 이동
    setActiveStep(0);

    // 2단계: 850ms 후 STEP 02로 중앙 이동
    setTimeout(() => {
      setActiveStep(1);
    }, 850);

    // 3단계: 1800ms 후 STEP 03으로 중앙 이동
    setTimeout(() => {
      setActiveStep(2);
    }, 1800);

    // 4단계: 2750ms 후 STEP 04로 중앙 이동 & 최종 완료
    setTimeout(() => {
      setActiveStep(3);
      setIsBatchDownloading(false);
      setIsBatchDone(true);
    }, 2750);
  };

  // 모델 설치 취소 인터랙션
  const handleCancelInstall = (id, title) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "not_installed", progress: 0, downloadedSize: "0 MB" } : m
      )
    );
    showFeedback(`'${title}' 모델 설치가 취소되었습니다.`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-float-in pb-16 font-sans text-stone-900">
      {/* ──────────────────────────────────────────────────────────
          1. 상단 타이틀 헤더
         ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-8 pt-2 pb-5 border-b border-stone-200/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            환경 설정
          </h1>
        </div>
      </div>

      {/* 피드백 알림 배너 */}
      {feedbackMessage && (
        <div className="mb-6 p-3 rounded-2xl bg-stone-900 text-white text-xs font-bold text-center shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {feedbackMessage}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          2. 메인 컨텐츠 그리드 (A. 로컬 모델 워크플로우 / B. 백업 및 복구)
         ────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {/* ==========================================================
            [섹션 A] 로컬 AI 모델 세로형 워크플로우 및 중앙 정렬 모션 영역
           ========================================================== */}
        <section className="rounded-[28px] p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* ──────────────────────────────────────────────────────────
                [좌측 신문 편집 스타일 레이아웃]: 텍스트, 타이포그래피 및 단색 라인 일러스트
               ────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pr-6 lg:border-r border-stone-200/60">
              <div className="space-y-3">
                {/* 상단 미니멀 태그 라벨 */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px] font-mono font-bold tracking-wider">
                    LOCAL AI MODELS
                  </span>
                </div>

                {/* 메인 헤드라인 타이틀 */}
                <h2 className="text-xl md:text-2xl font-black text-stone-950 tracking-tight leading-snug">
                  기사 작성과 검증을 돕는<br />로컬 AI 모델
                </h2>

                {/* 서브 설명 문구 */}
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-normal">
                  팩트체크부터 제목·부제 초안까지, 로컬 AI 모델이 기사 작성 과정을 지원합니다.
                </p>
              </div>

              {/* 신문 지면, 기사 문서, 돋보기, AI 연산 단색 라인 일러스트 (부드러운 탐색 모션) */}
              <div className="py-2 flex items-center justify-center">
                <div className="w-full max-w-[280px] aspect-[4/3] rounded-2xl bg-stone-50/70 border border-stone-200/70 p-4 flex items-center justify-center relative overflow-hidden">
                  <svg
                    viewBox="0 0 240 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-stone-700 stroke-current"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* 신문 지면 외곽 프레임 */}
                    <rect x="25" y="20" width="130" height="140" rx="4" fill="white" strokeWidth="1.5" />
                    {/* 신문 헤드라인 바 */}
                    <line x1="38" y1="36" x2="142" y2="36" strokeWidth="3" />
                    {/* 신문 텍스트 단락 라인들 */}
                    <line x1="38" y1="48" x2="142" y2="48" strokeWidth="1" strokeDasharray="2 3" />
                    <line x1="38" y1="56" x2="110" y2="56" strokeWidth="1" />
                    <line x1="38" y1="64" x2="135" y2="64" strokeWidth="1" />
                    <line x1="38" y1="72" x2="120" y2="72" strokeWidth="1" />
                    <line x1="38" y1="80" x2="95" y2="80" strokeWidth="1" />

                    {/* 신문 사진/도표 격자 영역 */}
                    <rect x="38" y="94" width="46" height="38" rx="2" strokeWidth="1" strokeDasharray="3 2" />
                    <path d="M42 122 L52 110 L64 120 L72 114 L80 122" strokeWidth="1" />
                    <circle cx="50" cy="104" r="3" strokeWidth="1" />

                    {/* 신문 우측 컬럼 텍스트 */}
                    <line x1="92" y1="96" x2="142" y2="96" strokeWidth="1" />
                    <line x1="92" y1="104" x2="138" y2="104" strokeWidth="1" />
                    <line x1="92" y1="112" x2="142" y2="112" strokeWidth="1" />
                    <line x1="92" y1="120" x2="130" y2="120" strokeWidth="1" />
                    <line x1="92" y1="128" x2="140" y2="128" strokeWidth="1" />

                    {/* AI 연산 신경망 노드 및 연결선 (우측 상단 오버레이) */}
                    <g className="text-stone-800">
                      <circle cx="175" cy="40" r="5" fill="white" strokeWidth="1.5" />
                      <circle cx="205" cy="65" r="5" fill="white" strokeWidth="1.5" />
                      <circle cx="180" cy="95" r="5" fill="white" strokeWidth="1.5" />
                      <line x1="179" y1="43" x2="201" y2="62" strokeWidth="1.2" strokeDasharray="2 2" />
                      <line x1="202" y1="69" x2="183" y2="92" strokeWidth="1.2" strokeDasharray="2 2" />
                      <line x1="155" y1="36" x2="170" y2="40" strokeWidth="1.2" />
                    </g>

                    {/* 돋보기 신문 기사 탐색 애니메이션 스타일 정의 */}
                    <style>{`
                      @keyframes inspectMotion {
                        0% {
                          transform: translate(130px, 95px) scale(1);
                        }
                        20% {
                          transform: translate(45px, 52px) scale(1.03);
                        }
                        45% {
                          transform: translate(95px, 48px) scale(1.01);
                        }
                        68% {
                          transform: translate(42px, 92px) scale(1.04);
                        }
                        85% {
                          transform: translate(110px, 95px) scale(1.02);
                        }
                        100% {
                          transform: translate(130px, 95px) scale(1);
                        }
                      }
                      @media (prefers-reduced-motion: reduce) {
                        .magnifier-inspect-motion {
                          animation: none !important;
                          transform: translate(130px, 95px) !important;
                        }
                      }
                      .magnifier-inspect-motion {
                        animation: inspectMotion 8.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                        transform-origin: 22px 22px;
                        will-change: transform;
                      }
                    `}</style>

                    {/* 돋보기 (기사 팩트체크 검증을 형상화 - 깔끔한 이전 모션 돋보기 복원) */}
                    <g className="magnifier-inspect-motion" transform="translate(130, 95)">
                      <circle cx="22" cy="22" r="18" fill="white" fillOpacity="0.85" strokeWidth="1.8" />
                      <line x1="35" y1="35" x2="52" y2="52" strokeWidth="3" />
                      {/* 돋보기 렌즈 내부 검증 체크 마크 */}
                      <path d="M15 22 L20 27 L29 17" strokeWidth="1.8" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* 하단 단색 안내 문구 */}
              <div className="pt-3 border-t border-stone-200/60 text-[11px] text-stone-500 font-medium leading-relaxed">
                온디바이스 환경에서 기밀 데이터 유출 없이 모든 분석과 생성을 로컬 프로세스로 안전하게 처리합니다.
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────
                [우측 단계별 워크플로우 영역]: 세로형 타임라인 및 활성 단계 중앙 정렬 모션
               ────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-3">
              {/* 다운로드 창 상단 컨트롤 바 */}
              <div className="relative flex items-center justify-between px-1 h-9">
                <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-extrabold text-stone-400">PIPELINE</span>
                  <span className="text-stone-300">·</span>
                  <span>온디바이스 워크플로우</span>
                </div>

                {/* 중앙 상단: 화이트 타원형 캡슐 알약 + 블루실버 테두리 회전 모션 버튼 (이모지 제외) */}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <style>{`
                    @keyframes spinBlueSilver {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                    .conic-bluesilver-spin {
                      background: conic-gradient(from 0deg, #38bdf8, #cbd5e1, #1d4ed8, #f8fafc, #0284c7, #94a3b8, #38bdf8);
                      animation: spinBlueSilver 2.2s linear infinite;
                    }
                    .static-bluesilver-border {
                      background: linear-gradient(135deg, #38bdf8, #cbd5e1, #1d4ed8, #e2e8f0);
                    }
                  `}</style>
                  <button
                    type="button"
                    onClick={handleBatchDownload}
                    disabled={isBatchDownloading}
                    className="relative p-[1.5px] rounded-full overflow-hidden shadow-sm transition active:scale-95 cursor-pointer group disabled:cursor-not-allowed"
                    title="4개 로컬 AI 모델을 순차적으로 자동 다운로드 및 연동합니다"
                  >
                    {/* 블루실버 테두리 레이어: 구동 시 회전, 평상시 정적 고정 */}
                    <div
                      className={`absolute inset-[-150%] ${
                        isBatchDownloading
                          ? "conic-bluesilver-spin"
                          : "static-bluesilver-border"
                      }`}
                    />

                    {/* 화이트 캡슐 본체 (이모지 없이 심플하고 정갈한 텍스트 배치) */}
                    <div className="relative px-4 py-1.5 rounded-full bg-white text-stone-800 flex items-center justify-center select-none transition-colors">
                      <span className="font-sans text-[11px] font-bold tracking-tight">
                        {isBatchDownloading
                          ? "파이프라인 순차 연동 중..."
                          : isBatchDone
                          ? "한 번에 다운로드하기 (재실행)"
                          : "한 번에 다운로드하기"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* 우측 안내: 구동 완료 후 휠 스크롤 가능 힌트 */}
                {isScrollable && !isBatchDownloading && (
                  <div className="text-[10px] text-stone-400 font-medium flex items-center gap-1 select-none">
                    <span>↕ 스크롤 가능</span>
                  </div>
                )}
              </div>

              {/* 타임라인 뷰포트 (고정 높이 및 상하 그라데이션 마스크, 구동 완료 후 마우스 호버 시 휠 스크롤 가능) */}
              <div
                ref={workflowContainerRef}
                onWheel={handleTimelineWheel}
                className={`relative h-[480px] md:h-[520px] overflow-hidden rounded-2xl bg-[#FAFAFA]/60 border border-stone-200/60 p-4 md:p-6 transition-colors ${
                  isScrollable ? "hover:border-stone-300" : ""
                }`}
                title={isScrollable ? "마우스 휠을 굴려 단계를 스크롤 탐색할 수 있습니다" : undefined}
              >
                {/* 상·하단 은은한 페이드아웃 그라데이션 (시각적 집중 효과) */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent z-20" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent z-20" />

                {/* 세로 타임라인 연결 레일 (배경 점선/실선) */}
                <div className="absolute left-7 md:left-9 top-10 bottom-10 w-[1.5px] bg-stone-200/90 z-0 pointer-events-none" />

                {/* 세로 이동 애니메이션 컨테이너 */}
                <div
                  style={{ transform: `translateY(${translateY}px)` }}
                  className="space-y-6 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none relative z-10 py-6"
                >
                  {models.map((model, idx) => {
                    const isActive = activeStep === idx;
                    const isCompleted = model.status === "installed";

                    return (
                      <div
                        key={model.id}
                        ref={(el) => (stepRefs.current[idx] = el)}
                        onClick={() => setActiveStep(idx)}
                        className={`group relative pl-12 md:pl-16 pr-4 py-4 transition-all duration-300 cursor-pointer select-none rounded-2xl ${
                          isActive
                            ? "opacity-100 bg-white/95 border border-stone-200/90 shadow-sm"
                            : "opacity-45 hover:opacity-75 border border-transparent"
                        }`}
                      >
                        {/* 1. 타임라인 노드 마커 */}
                        <div className="absolute left-2 md:left-4 top-4 -translate-x-1/2">
                          {isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-stone-100" />
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 rounded-full border-2 border-stone-900 bg-white flex items-center justify-center shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-stone-900 animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-stone-300 bg-stone-50 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                            </div>
                          )}
                        </div>

                        {/* 2. 단계 헤더 (스텝 번호 + 모델 타이틀 + 상태 뱃지) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-stone-400 tracking-wider">
                                {model.step}
                              </span>
                              <span className="text-stone-300">|</span>
                              <h3 className="text-sm md:text-base font-black text-stone-900 tracking-tight">
                                {model.title}
                              </h3>
                            </div>

                            {/* 상태 배지 */}
                            {model.status === "installed" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600">
                                <CheckCircle2 className="w-3 h-3 text-stone-700" />
                                설치 완료
                              </span>
                            ) : model.status === "downloading" ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-800 animate-ping" />
                                {model.progress}%
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-stone-400">
                                미설치
                              </span>
                            )}
                          </div>

                          {/* 활성 단계 설명 문구 */}
                          <p className={`text-xs leading-relaxed transition-all ${
                            isActive ? "text-stone-600 font-normal" : "text-stone-400 line-clamp-1"
                          }`}>
                            {model.desc}
                          </p>

                          {/* 하단 메타 정보 및 액션 버튼 */}
                          <div className="flex items-center justify-between gap-3 pt-1 text-xs text-stone-500 font-mono">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-stone-700 font-semibold">{model.spec}</span>
                              <span className="text-stone-300">·</span>
                              <span className="font-bold text-stone-800">{model.size}</span>
                              <span className="text-stone-300">·</span>
                              <span className="flex items-center gap-1">
                                <FileCheck2 className="w-3 h-3 text-stone-400" />
                                파일 {model.files}
                              </span>
                            </div>

                            {/* 활성 단계 액션 버튼 */}
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              {model.status === "installed" && (
                                <button
                                  type="button"
                                  onClick={() => handleModelAction(model.id, model.title, idx)}
                                  className="px-3 py-1 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200 shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                                  title="모델 상태 점검 및 다음 단계 이동"
                                >
                                  <RefreshCw className="w-3 h-3 text-stone-500" />
                                  <span>점검 완료</span>
                                </button>
                              )}

                              {model.status === "downloading" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelInstall(model.id, model.title)}
                                  className="px-2.5 py-1 text-xs font-bold text-stone-500 hover:text-stone-900 transition flex items-center gap-1 cursor-pointer active:scale-95"
                                >
                                  <X className="w-3.5 h-3.5 text-stone-500" />
                                  <span>설치 취소</span>
                                </button>
                              )}

                              {model.status === "not_installed" && (
                                <button
                                  type="button"
                                  onClick={() => handleStartInstall(model.id, model.title, idx)}
                                  className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                                >
                                  <Download className="w-3 h-3 text-stone-300" />
                                  <span>모델 설치</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================
            [섹션 B] 사용자 자료 백업·복구
           ========================================================== */}
        <section
          className="rounded-[28px] p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200/60 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                </div>
                <h2 className="text-lg font-black text-stone-950 tracking-tight">
                  사용자 자료 백업·복구
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                  AES-256 보호
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium pl-10">
                기사 데이터와 시스템 설정을 비밀번호로 안전하게 암호화하여 파일로 내려받거나 복구합니다.
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-5">
            {/* 백업 암호 입력란 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-stone-500" />
                <span>백업 암호 (12자 이상 권장)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="복구 시 사용할 암호를 12자 이상 입력해주세요"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:bg-white focus:border-stone-400 transition shadow-inner font-mono"
                />
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                * 암호를 분실하시면 백업된 암호화 파일의 복구가 불가능하므로 안전한 장소에 보관하십시오.
              </p>
            </div>

            {/* 작업 버튼 그룹 */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (backupPassword.length < 12) {
                    showFeedback("안전을 위해 백업 암호는 12자 이상 입력해주세요.");
                    return;
                  }
                  showFeedback("사용자 자료가 안전하게 암호화되어 백업 파일로 생성되었습니다 (UI 테스트).");
                }}
                className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <HardDriveDownload className="w-4 h-4 text-[#8ECAE6]" />
                <span>암호화 백업 받기</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showFeedback("백업 파일 선택 및 복구 모드가 준비되었습니다 (UI 테스트).");
                }}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200/90 transition flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
              >
                <UploadCloud className="w-4 h-4 text-stone-500" />
                <span>백업에서 복구</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
