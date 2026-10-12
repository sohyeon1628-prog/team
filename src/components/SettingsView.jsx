import React, { useState } from "react";
import {
  Cpu,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  HardDriveDownload,
  UploadCloud,
  FileCheck2,
  Sparkles
} from "lucide-react";

// 초기 로컬 모델 데이터 상수
const INITIAL_MODELS = [
  {
    id: "factcheck",
    title: "팩트체크 판정",
    spec: "Qwen3-0.6B v3, ONNX",
    size: "2.23 GB",
    status: "installed",
    files: "5/5",
    desc: "기사 내 사실 관계 검증 및 출처 신뢰도 판정을 로컬에서 직접 수행합니다."
  },
  {
    id: "chunking",
    title: "의미 청킹 경계 판정",
    spec: "KLUE-RoBERTa ONNX",
    size: "422.9 MB",
    status: "installed",
    files: "3/3",
    desc: "문맥의 자연스러운 흐름과 단락 분절 경계를 분석합니다."
  },
  {
    id: "title",
    title: "제목 초안",
    spec: "KoT5 ONNX, 번서치 내장",
    size: "369.4 MB",
    status: "installed",
    files: "2/2",
    desc: "본문 핵심 어젠다를 도출하여 임팩트 있는 제목 후보를 생성합니다."
  },
  {
    id: "subtitle",
    title: "부제 초안",
    spec: "KoBART ONNX",
    size: "649.3 MB",
    status: "installed",
    files: "5/5",
    desc: "기사의 핵심 내용을 1~2줄의 부제로 압축 요약합니다."
  }
];

/**
 * AI Newsroom 환경 설정 전체 화면 뷰 (SettingsView)
 * - 로컬 AI 모델 관리 섹션 (2x2 그리드 카드)
 * - 사용자 자료 백업·복구 섹션
 * - 메인 워크스페이스 스타일에 맞춘 프리미엄 소프트 UI
 */
export default function SettingsView({ onReturnToArticle }) {
  // 4개 로컬 AI 모델 상태 (UI 표시용)
  const [models] = useState(INITIAL_MODELS);

  // 백업 암호 입력 필드 상태
  const [backupPassword, setBackupPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 3500);
  };

  const handleModelAction = (_id, title) => {
    showFeedback(`'${title}' 모델의 온디바이스 상태 점검이 완료되었습니다.`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-float-in pb-16 font-sans text-stone-900">
      {/* ──────────────────────────────────────────────────────────
          1. 상단 타이틀 & 내비게이션 헤더
         ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-2 pb-5 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-stone-900 text-stone-100 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#8ECAE6]" />
              System Preferences
            </span>
            <span className="text-xs text-stone-400 font-medium">환경 설정</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            환경 설정
          </h1>
          <p className="text-xs md:text-sm text-stone-500 font-normal mt-1">
            AI Newsroom의 온디바이스 로컬 실행 모델과 데이터 암호화 백업 및 복구를 안전하게 관리합니다.
          </p>
        </div>

        {/* 기사 작성 화면으로 복귀 버튼 */}
        {onReturnToArticle && (
          <button
            type="button"
            onClick={onReturnToArticle}
            className="self-start md:self-center px-4 py-2 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 hover:text-stone-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>기사 작성으로 돌아가기</span>
          </button>
        )}
      </div>

      {/* 피드백 알림 배너 */}
      {feedbackMessage && (
        <div className="mb-6 p-3 rounded-2xl bg-stone-900 text-white text-xs font-bold text-center shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {feedbackMessage}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          2. 메인 컨텐츠 그리드 (A. 로컬 모델 / B. 백업 및 복구)
         ────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {/* ==========================================================
            [섹션 A] 로컬 AI 모델 관리
           ========================================================== */}
        <section
          className="rounded-[28px] p-6 md:p-8 bg-white/80 backdrop-blur-xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200/60 shadow-2xs">
                  <Cpu className="w-4 h-4 text-stone-700" />
                </div>
                <h2 className="text-lg font-black text-stone-950 tracking-tight">
                  로컬 AI 모델
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  4개 모델 로드됨
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium pl-10">
                로컬 기능에 필요한 모델을 관리합니다. 모델을 선택하면 설치 상태와 관련 정보를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 4개 모델 카드 (2x2 반응형 그리드) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="group relative rounded-2xl p-5 bg-[#FAFAFA] hover:bg-white border border-stone-200/70 hover:border-stone-300 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-sm font-black text-stone-900 tracking-tight">
                          {model.title}
                        </h3>
                      </div>
                      <div className="text-xs font-mono text-stone-500 font-medium">
                        {model.spec}
                      </div>
                    </div>

                    {/* 설치됨 상태 뱃지 */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      설치됨
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {model.desc}
                  </p>
                </div>

                {/* 카드 하단 정보 및 액션 버튼 */}
                <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                    <span className="font-bold text-stone-800">{model.size}</span>
                    <span className="text-stone-300">|</span>
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-stone-400" />
                      파일 {model.files}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleModelAction(model.id, model.title)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-950 text-xs font-bold border border-stone-200 shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-stone-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span>확인</span>
                  </button>
                </div>
              </div>
            ))}
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
