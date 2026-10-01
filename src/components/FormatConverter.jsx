import React, { useState } from "react";
import { Sparkles, Video, LayoutGrid, RotateCcw, Wand2 } from "lucide-react";
import { initialArticles } from "../data/mockData";

export default function FormatConverter() {
  const [selectedArticle, setSelectedArticle] = useState(initialArticles[0]);
  const [formatType, setFormatType] = useState("card"); // card | video
  const [options, setOptions] = useState({
    length: "중간 (4~6장 / 1분 내외)",
    aspectRatio: "1:1 (인스타그램/카드뉴스)",
    tone: "전문적이면서 친근함"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (formatType === "card") {
        setGeneratedResult([
          { id: 1, title: "1. AI 반도체 쇄신", body: "기존 GPU 한계를 극복하는 고성능·저전력 NPU 등장" },
          { id: 2, title: "2. 전력 70% 감축 성과", body: "데이터 병목현상을 완벽 해결하여 운영 비용 대폭 절감" },
          { id: 3, title: "3. 글로벌 경쟁 본격화", body: "독자 기술력 확보로 글로벌 빅테크 기업들과 어깨를 나란히 함" }
        ]);
      } else {
        setGeneratedResult({
          title: "유튜브 쇼츠 / 숏폼 뉴스 스크립트",
          script: `[앵커 멘트]
인공지능의 시대, 핵심은 바로 반도체입니다!
국내 연구진이 기존 GPU 대비 전력 소비를 최대 70%나 낮춘 차세대 AI 칩 개발에 성공했습니다.

[현장 화면 설명]
PIM 기술로 데이터 이동 병목을 극복한 웨이퍼 시제품 공개.

[마무리 멘트]
세계 최고 수준의 인공지능 주도권 쟁탈전, 대한민국 기술이 앞서갑니다.`
        });
      }
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 animate-float-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-800" />
            콘텐츠 멀티 포맷 변환
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            작성된 기사를 클릭하여 모바일 카드뉴스 또는 숏폼/영상 스크립트로 신속하게 재구성합니다.
          </p>
        </div>
      </div>

      {/* Step 1: Article Selection Cards */}
      <div className="space-y-3">
        <label className="text-xs font-extrabold text-slate-800 block">1단계: 변환할 기사 선택</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => {
                setSelectedArticle(art);
                setGeneratedResult(null);
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                selectedArticle.id === art.id
                  ? "bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm"
                  : "bg-white/60 border-white/80 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-semibold">
                <span className="font-extrabold text-slate-800">{art.status}</span>
                <span>{art.updatedAt}</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{art.title}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{art.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Format & Options */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Step 2 & 3 Selection */}
        <div className="md:col-span-5 glass-card p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 block">2단계: 콘텐츠 형식 선택</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFormatType("card");
                  setGeneratedResult(null);
                }}
                className={`p-3.5 rounded-xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center gap-2 ${
                  formatType === "card"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white/70 border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                <LayoutGrid className={`w-5 h-5 ${formatType === "card" ? "text-slate-200" : "text-slate-500"}`} />
                <span>카드뉴스 만들기</span>
              </button>

              <button
                onClick={() => {
                  setFormatType("video");
                  setGeneratedResult(null);
                }}
                className={`p-3.5 rounded-xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center gap-2 ${
                  formatType === "video"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white/70 border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                <Video className={`w-5 h-5 ${formatType === "video" ? "text-slate-200" : "text-slate-500"}`} />
                <span>영상 스크립트 만들기</span>
              </button>
            </div>
          </div>

          {/* Step 3 Options */}
          <div className="space-y-3 pt-2 text-xs">
            <label className="font-extrabold text-slate-800 block">3단계: 최소 옵션 설정</label>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">길이 / 분량</label>
              <select
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: e.target.value })}
                className="w-full p-2.5 bg-white/70 border border-slate-200 rounded-xl outline-none font-semibold"
              >
                <option>짧음 (3장 / 30초 숏폼)</option>
                <option>중간 (4~6장 / 1분 내외)</option>
                <option>상세 (8장 이상 / 심층 영상)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">화면 비율</label>
              <select
                value={options.aspectRatio}
                onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value })}
                className="w-full p-2.5 bg-white/70 border border-slate-200 rounded-xl outline-none font-semibold"
              >
                <option>1:1 (인스타그램/정사각형)</option>
                <option>9:16 (유튜브 쇼츠/릴스/세로형)</option>
                <option>16:9 (유튜브 메인/가로형)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-slate-900/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isGenerating ? (
                <span>AI 콘텐츠 생성 중...</span>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-slate-200" />
                  <span>AI 콘텐츠 생성하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 4 Result */}
        <div className="md:col-span-7 glass-card p-6 space-y-4 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-900">4단계: AI 생성 결과 확인 및 직접 편집</span>
              {generatedResult && (
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1 text-xs text-slate-900 font-bold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  다시 만들기
                </button>
              )}
            </div>

            {!generatedResult ? (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <Wand2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>옵션을 선택하고 'AI 콘텐츠 생성하기' 버튼을 누르면 이 영역에 결과가 표시됩니다.</p>
              </div>
            ) : formatType === "card" ? (
              <div className="space-y-3">
                {generatedResult.map((card) => (
                  <div key={card.id} className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-1">
                    <h5 className="text-xs font-bold text-slate-900">{card.title}</h5>
                    <p className="text-xs text-slate-700 leading-relaxed">{card.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 text-sm">{generatedResult.title}</h5>
                <textarea
                  value={generatedResult.script}
                  onChange={(e) => setGeneratedResult({ ...generatedResult, script: e.target.value })}
                  className="w-full h-56 p-3 bg-white border border-slate-200 rounded-xl outline-none leading-relaxed text-slate-800 font-mono"
                />
              </div>
            )}
          </div>

          {generatedResult && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">최종 결과는 보관함에 통합 저장됩니다.</span>
              <button 
                onClick={() => alert("생성된 변환 콘텐츠가 완료 저장되었습니다.")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
              >
                수정 완료 및 저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
