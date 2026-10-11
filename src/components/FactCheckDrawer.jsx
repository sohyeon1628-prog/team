import React, { useState, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  FileCheck, 
  Plus, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";

/**
 * 팩트체크 및 근거자료 검증 우측 패널 (Drawer) 컴포넌트
 */
export default function FactCheckDrawer({
  onClose,
  setArticle,
  isSidebarCollapsed = true,
  onHighlightText,
  highlightedText
}) {
  // 업로드된 근거/취재 파일 목록 상태 (초기 상태: 미첨부)
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 대조 및 추출된 근거자료 목록 상태
  const [evidenceList, setEvidenceList] = useState([
    {
      id: "ev-1",
      claimText: "국내 개발진은 데이터 병목 현상을 해결하고 전력 소비를 최대 70% 감소시키는 성과를 얻어냈다.",
      sourceDoc: "과기정통부_초거대AI_반도체육성_보도자료.pdf",
      page: "3페이지",
      quote: "차세대 PIM 아키텍처 적용 실증 결과, 기존 외산 GPU 가속 시스템 대비 유효 전력 소모량이 최대 71.4% 절감되는 기술적 우수성을 검증함.",
      status: "verified", // verified | conflict | unverified
      matchRate: 96,
      comment: "전력 소비 70% 절감 수치가 공식 정부 보도자료의 71.4% 결과치와 부합합니다.",
      suggestedFix: null
    },
    {
      id: "ev-2",
      claimText: "NPU(신경망 처리장치)와 PIM(지능형 반도체)이 차세대 대안으로 주목받고 있다.",
      sourceDoc: "한국반도체산업협회_기술동향보고서.pdf",
      page: "12페이지",
      quote: "글로벌 AI 가속기 시장은 NPU 기반 저지연 추론 칩과 HBM-PIM 융합 메모리로 급속히 재편되는 추세이다.",
      status: "verified",
      matchRate: 94,
      comment: "기술 트렌드 서술이 최신 산업 협회 동향과 정확히 일치합니다.",
      suggestedFix: null
    },
    {
      id: "ev-3",
      claimText: "전통적인 GPU 중심 연산의 발열 한계",
      sourceDoc: "과기정통부_초거대AI_반도체육성_보도자료.pdf",
      page: "1페이지",
      quote: "데이터센터 내 고발열·고전력 GPU 운영비 급증으로 전력 효율(TCO) 중심의 대체 칩 전환 시급.",
      status: "verified",
      matchRate: 89,
      comment: "기존 GPU 인프라의 발열 및 전력 문제 제기가 공인 자료와 일치합니다.",
      suggestedFix: null
    }
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  // 파일 업로드 처리 핸들러 (파일 선택 및 드래그 앤 드롭 공통 로직)
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);

    const newFiles = Array.from(files).map((f, idx) => ({
      id: `uploaded-${Date.now()}-${idx}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadTime: "방금 전",
      status: "분석 중...",
      type: f.name.split(".").pop() || "doc"
    }));

    setUploadedFiles((prev) => [...newFiles, ...prev]);

    // 1.2초 뒤 분석 완료 및 가상 근거자료 자동 추출 시뮬레이션
    setTimeout(() => {
      setUploadedFiles((prev) => 
        prev.map((f) => ({ ...f, status: "분석 완료" }))
      );

      // 새 파일에서 도출된 추가 근거자료 매칭
      const newEvidence = {
        id: `ev-${Date.now()}`,
        claimText: "전문가들은 '단순한 칩 제조를 넘어 최적화 소프트웨어가 향후 반도체 패권의 승패를 결정' 조언",
        sourceDoc: files[0]?.name || "새로 업로드된 취재문서.pdf",
        page: "참고 부록 2면",
        quote: "국내외 산학연 전문가 인터뷰 요약: 하드웨어 수율 이상으로 컴파일러 및 프레임워크 최적화 SW 생태계 주도권이 결정적 요인임.",
        status: "verified",
        matchRate: 98,
        comment: "업로드된 신규 파일에서 기사 본문의 전문가 인용과 직접 일치하는 팩트가 검증되었습니다.",
        suggestedFix: null
      };

      setEvidenceList((prev) => [newEvidence, ...prev]);
      setIsAnalyzing(false);
    }, 1200);
  };

  // 드래그 앤 드롭 이벤트
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // 테스트용 보도자료 샘플 원클릭 로드
  const handleLoadSample = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const sampleFile = {
        id: `sample-${Date.now()}`,
        name: "산업통상자원부_반도체_수출통계_공식발표.xlsx",
        size: "1.8 MB",
        uploadTime: "방금 전",
        status: "분석 완료",
        type: "xlsx"
      };
      setUploadedFiles((prev) => [sampleFile, ...prev]);
      setIsAnalyzing(false);
    }, 800);
  };

  // 기사 본문에 근거자료 주석 추가
  const handleInsertCitation = (ev) => {
    const citation = `\n[근거 확인: ${ev.sourceDoc} (${ev.page}) - 일치율 ${ev.matchRate}%]`;
    setArticle((prev) => ({
      ...prev,
      content: prev.content + citation
    }));
    alert(`"${ev.sourceDoc}" 근거자료 인용 주석이 본문 끝에 삽입되었습니다.`);
  };

  // 파일 삭제 (모든 파일 삭제 시 자동으로 초기 업로드 영역 복귀)
  const handleDeleteFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    /* ──────────────────────────────────────────
        우측 팩트체크 & 근거자료 검증 패널
        - 미니멀 밝은 라이트 그레이(#F8F9FA) 배경 및 부드러운 라운드 모서리
        - 인라인 나란히 배치 유지
       ────────────────────────────────────────── */
    <aside 
      className={`w-full ${!isSidebarCollapsed ? "md:w-[360px] lg:w-[380px] xl:w-[395px]" : "md:w-[370px] lg:w-[390px] xl:w-[410px]"} flex-shrink-0 bg-slate-50/80 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[calc(100vh-100px)] min-h-[760px] max-h-[920px] sticky top-4 overflow-hidden transition-all duration-300 ease-out animate-in fade-in slide-in-from-left-4 z-20`}
    >
      {/* 상단 헤더: 미니멀 화이트 카드 스타일 */}
      <div className="p-4 md:p-5 border-b border-slate-200/70 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>팩트체크 & 근거자료 검증</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              실시간 연동
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">
            취재자료와 기사 본문의 수치와 주장을 대조·검증합니다
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="검증창 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 메인 스크롤 콘텐츠 영역 (라이트 그레이 배경 + 화이트 카드 구조) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
        
        {/* ─────────────────────────────────────────
            [A] 취재자료/증빙 파일 업로드 섹션
           ───────────────────────────────────────── */}
        <div className="space-y-2">
          {/* 섹션 라벨 */}
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              취재·검증자료 파일
            </span>
          </div>

          {/* 공통 파일 선택 인풋 (다중 파일 지원) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.hwp,.docx,.txt,.csv,.xlsx,image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          {/* 
            [A] 파일이 첨부되지 않은 초기 상태:
            - 간결한 화이트 카드형 드래그 앤 드롭 영역
            - 불필요한 장식용 요소 없이 깔끔하게 배치
          */}
          {uploadedFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white rounded-2xl border border-dashed p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-300/80 hover:border-slate-400"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">
                  {isAnalyzing ? "문서를 읽고 기사와 팩트 대조 중..." : "파일을 끌어다 놓거나 클릭하여 첨부하세요"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, HWP, DOCX, TXT, Excel 등 지원
                </p>
              </div>
            </div>
          ) : (
            /* 
              [B] 파일 첨부 완료 상태:
              - 기존 대형 업로드 박스는 사라짐
              - 동일 위치에 실제 첨부 파일 정보 화이트 카드 표시
              - 파일명 truncate + 전체 파일명 title 속성 지원
              - 작은 [+] 파일 추가 버튼 및 드래그 앤 드롭 추가 지원
            */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`bg-white rounded-2xl border p-3.5 space-y-2.5 transition ${
                isDragging ? "border-blue-500 bg-blue-50/30" : "border-slate-200/70"
              }`}
            >
              <div className="flex items-center justify-between text-xs px-0.5">
                <span className="font-semibold text-slate-700">
                  첨부된 자료 ({uploadedFiles.length}건)
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                  title="새 파일 추가 (클릭하거나 파일을 드래그 앤 드롭하세요)"
                >
                  <Plus className="w-3 h-3" />
                  <span>추가</span>
                </button>
              </div>

              {/* 첨부된 파일 목록 */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 text-xs transition"
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-2" title={file.name}>
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {file.size} · {file.uploadTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        file.status === "분석 완료"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : "bg-blue-50 text-blue-700 border border-blue-200/60 animate-pulse"
                      }`}>
                        {file.status}
                      </span>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="파일 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-slate-200/60 my-1" />

        {/* ─────────────────────────────────────────
            [B] 기사 문장 ↔ 원문 근거자료 대조 결과 (미니멀 화이트 카드)
           ───────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="px-0.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              실시간 팩트체크 대조표 ({evidenceList.length}건)
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              기사 문장과 업로드된 원문 문서를 AI가 자동 대조한 결과입니다
            </p>
          </div>

          {/* 근거 대조 화이트 카드 목록 */}
          <div className="space-y-3">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                onClick={() => onHighlightText?.(item.claimText)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  highlightedText === item.claimText
                    ? "border-[#B8ED12] bg-white shadow-xs ring-2 ring-[#D6FF38]/50"
                    : "border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-xs"
                } space-y-2.5`}
              >
                {/* 카드 헤더: 상태 및 일치율 */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    팩트 일치 ({item.matchRate}%)
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[160px]" title={`${item.sourceDoc} (${item.page})`}>
                    {item.sourceDoc}
                  </span>
                </div>

                {/* 1. 기사 본문 문장 (클릭 시 형광펜 강조) */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">
                      기사 본문 대상 문장
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors ${
                      highlightedText === item.claimText
                        ? "bg-[#D6FF38] text-black shadow-xs font-black"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      형광펜 표시
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 leading-snug">
                    "{item.claimText}"
                  </p>
                </div>

                {/* 2. 업로드 파일 원문 근거 발췌 */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    원문 문서 발췌 근거
                  </span>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    "{item.quote}"
                  </p>
                </div>

                {/* 3. AI 검증 의견 */}
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  💡 <strong>검증 의견:</strong> {item.comment}
                </p>

                {/* 4. 액션 버튼 */}
                <div className="pt-1 flex items-center justify-end border-t border-slate-100">
                  <button
                    onClick={() => handleInsertCitation(item)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    본문에 근거 주석 삽입
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 하단 푸터 바: 미니멀 화이트 푸터 */}
      <div className="p-4 border-t border-slate-200/70 bg-white flex items-center justify-between text-xs flex-shrink-0">
        <span className="text-slate-500 font-medium">
          전체 {evidenceList.length}개 핵심 문장 검증 완료
        </span>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer active:scale-95"
        >
          확인 및 닫기
        </button>
      </div>
    </aside>
  );
}
