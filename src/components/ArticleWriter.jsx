import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Check, 
  RotateCcw, 
  Bold, 
  Italic, 
  Quote, 
  Wand2,
  AlertTriangle
} from "lucide-react";

export default function ArticleWriter({ 
  article, 
  setArticle, 
  onOpenSearch, 
  onRunFactCheck,
  factCheckActive,
  factCheckIssues,
  activeFactIndex,
  onApplyFactFix,
  onSkipFactFix
}) {
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isTitleConfirmed, setIsTitleConfirmed] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [floatingToolbarPos, setFloatingToolbarPos] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  
  const [draftPrompt, setDraftPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const editorRef = useRef(null);

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setFloatingToolbarPos(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 0) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = editorRef.current.getBoundingClientRect();

      setFloatingToolbarPos({
        top: rect.top - containerRect.top - 48,
        left: Math.max(10, rect.left - containerRect.left + (rect.width / 2) - 120)
      });
    } else {
      setFloatingToolbarPos(null);
    }
  };

  const handleTitleConfirm = () => {
    setIsTitleConfirmed(true);
  };

  const handleRegenerateTitle = () => {
    const titles = [
      "AI 반도체 기술 대도약, 글로벌 시장 주도권 쟁탈전 개막",
      "국내 연구진, 초거대 AI용 고성능 NPU 자체 개발 성공",
      "GPU 한계 넘는다... 차세대 PIM·NPU 반도체 생태계 급부상"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    setArticle((prev) => ({ ...prev, suggestedTitle: randomTitle, title: randomTitle }));
    setIsTitleConfirmed(false);
  };

  const handleGenerateDraft = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setArticle((prev) => ({
        ...prev,
        title: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
        suggestedTitle: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
        subtitle: "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
        content: `인공지능(AI) 기술의 급격한 발전에 따라 고성능·고효율 AI 반도체의 수요가 폭발적으로 증가하고 있다. 기존 GPU 중심의 연산 시스템은 높은 전력 소비와 발열 문제로 한계에 부딪히고 있으며, 이에 따라 NPU(신경망 처리장치)와 PIM(지능형 반도체)이 차세대 대안으로 주목받고 있다.

국내 주요 기업과 연구진은 초거대 AI 모델 지원을 위한 고성능 AI 반도체를 자체 개발하여 글로벌 빅테크 기업들과 경쟁을 펼치고 있다. 이번 취재 결과, 국내 개발진은 데이터 병목 현상을 해결하고 전력 소비를 최대 70% 감소시키는 성과를 얻어냈다.

전문가들은 "단순한 칩 제조를 넘어 인공지능 알고리즘과의 최적화 소프트웨어가 향후 반도체 패권의 승패를 결정지을 것"이라고 조언했다. 이에 따른 정부 차원의 집중 지원과 실증 사업 확대가 시급한 시점이다.`
      }));
      setIsGenerating(false);
      setShowDraftModal(false);
      setIsTitleConfirmed(false);
    }, 1200);
  };

  const applyFormat = (formatType) => {
    if (!selectedText) return;
    alert(`선택한 문장 "${selectedText.slice(0, 15)}..." 에 [${formatType}] 서식을 적용했습니다.`);
    setFloatingToolbarPos(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 animate-float-in">
      {/* Top Glass Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDraftModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-2xl font-bold text-xs transition shadow-xs cursor-pointer"
          >
            AI 기사 초안 생성
          </button>
          
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-500" />
            취재자료 검색
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunFactCheck}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              factCheckActive
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${factCheckActive ? "text-white" : "text-emerald-600"}`} />
            {factCheckActive ? "팩트체크 진행 중..." : "기사 팩트체크 실행"}
          </button>
        </div>
      </div>

      {/* Sequential Fact Check Glass Banner (Item 13) */}
      {factCheckActive && factCheckIssues.length > 0 && (
        <div className="glass-card p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/90 to-amber-50/90 border-amber-200/80 shadow-xs space-y-3 animate-float-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>AI 팩트체크 순서형 검사 ({activeFactIndex + 1} / {factCheckIssues.length})</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-200/80 text-amber-950 rounded-lg">
              {factCheckIssues[activeFactIndex]?.type}
            </span>
          </div>

          <div className="bg-white/95 p-4 rounded-2xl border border-amber-200/80 space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              문제 문장: <span className="underline decoration-red-500 decoration-2 text-red-700 bg-red-50 px-1 rounded">{factCheckIssues[activeFactIndex]?.targetText}</span>
            </p>
            <p className="text-xs text-slate-600">
              <strong className="text-slate-900">발생 이유:</strong> {factCheckIssues[activeFactIndex]?.reason}
            </p>
            <div className="text-xs text-slate-900 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>AI 수정안 제안:</strong> "{factCheckIssues[activeFactIndex]?.suggestion}"</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onSkipFactFix}
              className="px-4 py-1.5 text-xs font-bold bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl transition cursor-pointer"
            >
              건너뛰기
            </button>
            <button
              onClick={onApplyFactFix}
              className="px-4 py-1.5 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              수정 적용
            </button>
          </div>
        </div>
      )}

      {/* Main Glass Writing Canvas (Item 10, 11, 12) */}
      <div className="glass-card p-8 md:p-12 space-y-8 relative min-h-[680px]">
        {/* Title Input Area (Item 11) */}
        <div 
          className="space-y-2 relative group"
          onMouseEnter={() => setIsTitleHovered(true)}
          onMouseLeave={() => setIsTitleHovered(false)}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>기사 제목</span>
            {!isTitleConfirmed && (
              <span className="text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md font-bold border border-slate-200/80">
                AI 제안 헤드라인 (연한 회색 노출)
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={article.title}
              onChange={(e) => {
                setArticle({ ...article, title: e.target.value });
                setIsTitleConfirmed(true);
              }}
              placeholder="기사 제목을 입력하거나 AI 추천을 확인하세요"
              className={`w-full text-2xl md:text-3xl font-bold border-b border-slate-200/80 pb-3 outline-none transition-colors bg-transparent article-editor-font ${
                !isTitleConfirmed ? "text-slate-400 font-normal" : "text-slate-900 font-bold"
              }`}
            />

            {/* Hover Floating Actions: [확정] [다시 생성하기] */}
            {(isTitleHovered || !isTitleConfirmed) && (
              <div className="absolute right-2 bottom-3 flex items-center gap-2 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 animate-float-in">
                {!isTitleConfirmed && (
                  <button
                    onClick={handleTitleConfirm}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-lg border border-slate-200 shadow-xs transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    확정
                  </button>
                )}
                <button
                  onClick={handleRegenerateTitle}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  다시 생성하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle Area */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-semibold">부제 (부제목)</label>
          <input
            type="text"
            value={article.subtitle}
            onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
            placeholder="기사 부제를 입력하세요"
            className="w-full text-lg font-bold text-slate-700 border-b border-slate-200/80 pb-2 outline-none focus:border-slate-800 bg-transparent transition-colors article-editor-font"
          />
        </div>

        {/* Content Writing Area (Item 12: High Readability Editor) */}
        <div className="relative pt-2" ref={editorRef} onMouseUp={handleSelection} keyUp={handleSelection}>
          <label className="text-xs text-slate-400 font-semibold mb-2 block">본문 작성 영역 (자유 작성)</label>

          {/* Floating Context Formatting Toolbar */}
          {floatingToolbarPos && (
            <div
              style={{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }}
              className="absolute z-30 flex items-center gap-1 bg-slate-900 text-white px-2 py-1.5 rounded-xl shadow-xl border border-slate-700 animate-float-in text-xs"
            >
              <button
                onClick={() => applyFormat("굵게")}
                className="p-1.5 hover:bg-slate-800 rounded-md transition cursor-pointer"
                title="굵게"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => applyFormat("기울임")}
                className="p-1.5 hover:bg-slate-800 rounded-md transition cursor-pointer"
                title="기울임"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => applyFormat("인용구")}
                className="p-1.5 hover:bg-slate-800 rounded-md transition cursor-pointer"
                title="인용구"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-slate-700 my-auto mx-1" />
              <button
                onClick={() => applyFormat("AI 다듬기")}
                className="p-1 px-2 hover:bg-blue-600 rounded-md transition cursor-pointer flex items-center gap-1 text-blue-300 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 문장 다듬기
              </button>
            </div>
          )}

          <textarea
            value={article.content}
            onChange={(e) => setArticle({ ...article, content: e.target.value })}
            placeholder="기사 본문을 입력하세요. 자유롭게 문단을 작성할 수 있습니다..."
            className="w-full min-h-[460px] text-slate-900 text-base leading-relaxed p-5 bg-white/80 rounded-2xl border border-white focus:bg-white focus:border-slate-800 outline-none transition-all resize-y shadow-xs article-editor-font"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1 font-semibold">
            <span>자유 본문 작성 영역 (드래그 시 포맷 툴바 노출)</span>
            <span>공백 포함 {article.content.length}자</span>
          </div>
        </div>
      </div>

      {/* AI Draft Generator Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-white space-y-5 animate-float-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">AI 기사 초안 생성</h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p className="text-slate-600">
                수집된 취재자료나 녹취 데이터를 바탕으로 AI가 종합 기사 초안을 작성합니다.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">연결할 취재자료 선택</label>
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                  {["2026 차세대 반도체 산업 동향 보고서", "김성민 박사 인터뷰 전사본", "전력망 확충 회의록"].map((src, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 text-slate-800 text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={idx < 2} 
                        className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800"
                      />
                      <span>{src}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">추가 지시사항 (선택)</label>
                <input
                  type="text"
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  placeholder="예: 핵심 기술 성과 위주로 객관적 톤으로 작성해줘"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 text-sm font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                    <span>초안 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-slate-700" />
                    <span>초안 자동 생성</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
