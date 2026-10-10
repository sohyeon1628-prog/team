import React, { useState, useRef, useEffect } from "react";
import FactCheckDrawer from "./FactCheckDrawer";
import { 
  Sparkles, 
  Search, 
  Check, 
  RotateCcw, 
  Bold, 
  Italic, 
  Quote, 
  Wand2, 
  AlertTriangle,
  Eye,
  Edit3,
  Columns,
  Image as ImageIcon,
  Upload,
  Send,
  Share2,
  Bookmark,
  ShieldCheck,
  Bot,
  Lock,
  Unlock,
  Plus,
  X,
  GripVertical,
  Copy,
  Printer,
  ImagePlus,
  Underline,
  Type,
  CircleDot,
  ArrowLeft,
  MessageSquare,
  Heart,
  Volume2
} from "lucide-react";

export default function ArticleWriter({ 
  locationRequest,
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
  // 1. 화면 뷰 모드: 'editor' (에디터만) | 'split' (에디터+미리보기 나란히) | 'preview' (미리보기 전체)
  const [viewMode, setViewMode] = useState("editor");

  // 팩트체크 & 근거자료 우측 슬라이더(Drawer) 열림 상태
  const [isFactCheckDrawerOpen, setIsFactCheckDrawerOpen] = useState(false);

  // 2. 미리보기 플랫폼 탭: 'donga' (동아일보 공식 웹) | 'naver' (네이버 뉴스 포털)
  const [previewPlatform, setPreviewPlatform] = useState("donga");

  // 3. 사진/미디어 관리 상태
  const [photos, setPhotos] = useState(article.photos || [
    {
      id: "photo-1",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      caption: "국내 연구진이 개발한 차세대 AI 반도체 NPU 웨이퍼 시제품",
      source: "동아일보 DB",
      provider: "김동아 기자",
      ratio: "16:9 (동아일보 대표)"
    }
  ]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newSource, setNewSource] = useState("동아일보 DB");
  const [newProvider, setNewProvider] = useState("김동아 기자");
  const [newRatio, setNewRatio] = useState("16:9");

  // 4. CMS 발행 이관 상태
  const [isCmsExporting, setIsCmsExporting] = useState(false);
  const [isCmsSuccessModal, setIsCmsSuccessModal] = useState(false);

  // 에디터 서식 및 제목 관련 상태
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isTitleConfirmed, setIsTitleConfirmed] = useState(false);
  const [isTitleLocked, setIsTitleLocked] = useState(false);
  const [showTitleAiMenu, setShowTitleAiMenu] = useState(false);
  const titleAiSuggestions = [
    "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
    "국내 팹리스·파운드리 연합, '온디바이스 AI' 생태계 주도 선언",
    "AI 칩 전쟁 2막, 데이터센터에서 모바일로... K-반도체 승부수",
    "GPU 품귀 뚫을 차세대 대안... 국산 NPU 기술력 글로벌 호평"
  ];

  // 부제목 잠금, 다중 슬롯 및 AI 추천 상태
  const [showSubtitleAiMenu, setShowSubtitleAiMenu] = useState(false);
  const [subtitles, setSubtitles] = useState(() => [
    { id: "sub-1", text: "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장", locked: false },
    { id: "sub-2", text: "전력 소비 70% 절감·데이터 병목 해소 기술 개발 집중", locked: false }
  ]);
  const [draggedSubtitleIndex, setDraggedSubtitleIndex] = useState(null);
  const [selectedAiSubtitles, setSelectedAiSubtitles] = useState([
    "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
    "전력 소비 70% 절감·데이터 병목 해소 기술 개발 집중"
  ]);

  const subtitleAiSuggestions = [
    "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
    "전력 소비 70% 절감·데이터 병목 해소 기술 개발 집중",
    "글로벌 빅테크 납품 테스트 돌입... 2026년 상용화 목표",
    "정부 차원의 대규모 실증 사업 및 제조 생태계 지원 확대"
  ];

  const handleSubtitleChange = (index, value) => {
    const next = [...subtitles];
    next[index] = { ...next[index], text: value };
    setSubtitles(next);
    setArticle((prev) => ({ ...prev, subtitle: next.map((s) => s.text).filter(Boolean).join("\n") }));
  };

  const handleToggleSubtitleLock = (index) => {
    const next = [...subtitles];
    next[index] = { ...next[index], locked: !next[index].locked };
    setSubtitles(next);
  };

  const handleAddSubtitle = () => {
    if (subtitles.length < 4) {
      const next = [...subtitles, { id: `sub-${Date.now()}`, text: "", locked: false }];
      setSubtitles(next);
    }
  };

  const handleRemoveSubtitle = (index) => {
    if (subtitles.length > 1) {
      const next = subtitles.filter((_, i) => i !== index);
      setSubtitles(next);
      setArticle((prev) => ({ ...prev, subtitle: next.map((s) => s.text).filter(Boolean).join("\n") }));
    }
  };

  const handleDragStart = (e, index) => {
    if (subtitles[index].locked) {
      e.preventDefault();
      return;
    }
    setDraggedSubtitleIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSubtitleIndex === null || draggedSubtitleIndex === targetIndex) return;
    if (subtitles[targetIndex].locked || subtitles[draggedSubtitleIndex].locked) {
      setDraggedSubtitleIndex(null);
      return;
    }
    const next = [...subtitles];
    const [draggedItem] = next.splice(draggedSubtitleIndex, 1);
    next.splice(targetIndex, 0, draggedItem);
    setSubtitles(next);
    setDraggedSubtitleIndex(null);
    setArticle((prev) => ({ ...prev, subtitle: next.map((s) => s.text).filter(Boolean).join("\n") }));
  };

  const handleToggleAiSubtitle = (text) => {
    setSelectedAiSubtitles((prev) =>
      prev.includes(text) ? prev.filter((item) => item !== text) : (prev.length < 4 ? [...prev, text] : prev)
    );
  };

  const handleApplyAiSubtitles = () => {
    if (selectedAiSubtitles.length > 0) {
      const next = selectedAiSubtitles.map((text, i) => ({
        id: `sub-${i}-${Date.now()}`,
        text,
        locked: false
      }));
      setSubtitles(next);
      setArticle((prev) => ({ ...prev, subtitle: selectedAiSubtitles.join("\n") }));
    }
    setShowSubtitleAiMenu(false);
  };

  const [selectedText, setSelectedText] = useState("");
  const [floatingToolbarPos, setFloatingToolbarPos] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const editorRef = useRef(null);
  const bodyInputRef = useRef(null);
  const handledLocation = useRef(null);
  const locationText = locationRequest?.claimText || "";
  const locationIndex = locationText ? article.content.indexOf(locationText) : -1;
  const uniqueLocation = locationIndex >= 0 && article.content.indexOf(locationText, locationIndex + 1) < 0;
  const locationNotice = locationRequest?.articleId === article.id
    ? uniqueLocation ? "데이터맵에서 선택한 문장을 현재 원고에서 강조했습니다." : "현재 원고에서 해당 문장을 하나로 특정할 수 없습니다. 검증 시점의 원고와 현재 내용을 확인해 주세요."
    : "";
  useEffect(() => {
    if (!locationRequest || locationRequest.articleId !== article.id) return;
    if (handledLocation.current === locationRequest || !uniqueLocation) return;
    handledLocation.current = locationRequest;
    const input = bodyInputRef.current;
    input?.focus();
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [locationRequest, article.id, uniqueLocation, locationIndex, locationText]);
  const photoInputRef = useRef(null);
  const toolbarImageInputRef = useRef(null);

  // 외부에서 article.content 변경 시 contentEditable 동기화 (초안 생성 등)
  useEffect(() => {
    if (bodyInputRef.current && bodyInputRef.current.innerHTML !== (article.content || "")) {
      if (document.activeElement !== bodyInputRef.current) {
        bodyInputRef.current.innerHTML = article.content || "";
      }
    }
  }, [article.content]);

  // 텍스트 드래그 선택 서식 툴바 감지 (contentEditable Selection 감지)
  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !bodyInputRef.current || !editorRef.current) {
      setFloatingToolbarPos(null);
      setSelectedText("");
      return;
    }

    // 선택 영역이 본문 에디터 내부인지 확인
    if (!bodyInputRef.current.contains(sel.anchorNode) || !bodyInputRef.current.contains(sel.focusNode)) {
      setFloatingToolbarPos(null);
      setSelectedText("");
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      setFloatingToolbarPos(null);
      setSelectedText("");
      return;
    }

    setSelectedText(text);

    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = editorRef.current.getBoundingClientRect();

      setFloatingToolbarPos({
        top: Math.max(10, rect.top - containerRect.top - 46),
        left: Math.max(10, Math.min(containerRect.width - 220, rect.left - containerRect.left + (rect.width / 2) - 100))
      });
    } catch (e) {
      setFloatingToolbarPos(null);
    }
  };

  // 기사 내용 복사 및 출력 핸들러
  const handleCopyArticle = () => {
    const fullText = [article.title, article.subtitle, article.content].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(fullText).then(() => {
      alert("기사 내용 전체가 클립보드에 복사되었습니다.");
    });
  };

  const handlePrintArticle = () => {
    window.print();
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

  // 기본 텍스트 서식 적용 (굵게, 기울임, 밑줄, 글자 크기, 동그라미)
  const applyFormat = (formatType) => {
    if (!bodyInputRef.current) return;
    bodyInputRef.current.focus();

    if (formatType === "bold") {
      document.execCommand("bold", false, null);
    } else if (formatType === "italic") {
      document.execCommand("italic", false, null);
    } else if (formatType === "underline") {
      document.execCommand("underline", false, null);
    } else if (formatType === "size") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const parentSpan = range.commonAncestorContainer?.parentElement;
        if (parentSpan && (parentSpan.style.fontSize === "1.25em" || parentSpan.style.fontSize === "20px")) {
          parentSpan.style.fontSize = "";
        } else {
          const span = document.createElement("span");
          span.style.fontSize = "1.25em";
          span.style.fontWeight = "600";
          try {
            range.surroundContents(span);
          } catch (err) {
            document.execCommand("fontSize", false, "5");
          }
        }
      }
    } else if (formatType === "bullet") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const text = range.toString();
        if (text) {
          const lines = text.split("\n");
          const bulleted = lines.map((l) => (l.startsWith("● ") ? l.replace(/^●\s*/, "") : `● ${l}`)).join("\n");
          range.deleteContents();
          range.insertNode(document.createTextNode(bulleted));
        } else {
          range.insertNode(document.createTextNode("● "));
        }
      }
    }

    // 변경된 HTML 상태 저장
    if (bodyInputRef.current) {
      setArticle((prev) => ({ ...prev, content: bodyInputRef.current.innerHTML }));
    }
  };

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          const newPhoto = {
            id: `photo-${Date.now()}`,
            url: uploadEvt.target.result,
            caption: newCaption || file.name,
            source: newSource || "동아일보 DB",
            provider: newProvider || "기자",
            ratio: newRatio
          };
          const updated = [newPhoto, ...photos];
          setPhotos(updated);
          setArticle((prev) => ({ ...prev, photos: updated }));
          setNewCaption("");
          setShowPhotoModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 텍스트 편집 바(플로팅 툴바) 전용 이미지 파일 첨부 핸들러
  const handleToolbarImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return; // 파일 선택 취소 시 기존 작성 내용 유지

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      if (uploadEvt.target?.result) {
        const newPhoto = {
          id: `photo-${Date.now()}`,
          url: uploadEvt.target.result,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          source: "직접 첨부",
          provider: "김동아 기자",
          ratio: "16:9"
        };
        const updatedPhotos = [newPhoto, ...photos];
        setPhotos(updatedPhotos);

        // 본문 에디터에 사진 렌더링 블록 삽입
        const photoHtml = `<figure style="margin: 20px 0; text-align: center;" contenteditable="false"><img src="${uploadEvt.target.result}" alt="${file.name}" style="max-width: 100%; border-radius: 12px; margin: 0 auto; display: block; border: 1px solid rgba(0,0,0,0.08);" /><figcaption style="font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 500;">▲ ${newPhoto.caption} (출처: 직접 첨부)</figcaption></figure><p><br></p>`;

        if (bodyInputRef.current) {
          bodyInputRef.current.focus();
          document.execCommand("insertHTML", false, photoHtml);
          setArticle((prev) => ({
            ...prev,
            photos: updatedPhotos,
            content: bodyInputRef.current.innerHTML
          }));
        } else {
          setArticle((prev) => ({
            ...prev,
            photos: updatedPhotos
          }));
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // 동일 파일 재선택 가능하도록 리셋
  };

  // 본문에 사진 태그 삽입
  const handleInsertPhotoToContent = (photo) => {
    const photoTag = `\n\n[사진 삽입: ${photo.caption} (출처: ${photo.source}, 제공: ${photo.provider})]\n\n`;
    setArticle((prev) => ({
      ...prev,
      content: prev.content + photoTag
    }));
    alert(`"${photo.caption}" 사진이 기사 본문에 삽입되었습니다.`);
  };

  // CMS 발행/이관 실행
  const handleCmsExport = () => {
    setIsCmsExporting(true);
    setTimeout(() => {
      setIsCmsExporting(false);
      setIsCmsSuccessModal(true);
      setArticle((prev) => ({ ...prev, status: "발행 완료" }));
    }, 1200);
  };

  return (
    <div className="w-full relative min-w-0 animate-float-in">
      {locationNotice && (
        <div role="status" className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-xs text-blue-900 mb-4">
          {locationNotice}
        </div>
      )}

      {/* 메인 좌우 레이아웃: [메인 에디터 박스] 바로 옆에 [우측 사이드바] 밀착 배치 */}
      <div className={`w-full flex items-start gap-3.5 md:gap-5 min-w-0 ${!isFactCheckDrawerOpen ? "justify-center" : ""}`}>
        {/* 1. 중앙/좌측 메인 작업 영역: [에디터] / [나란히 보기] / [미리보기] */}
        <div className={`min-w-0 space-y-5 ${!isFactCheckDrawerOpen && (viewMode === "editor" || viewMode === "preview") ? "w-full max-w-4xl" : "flex-1"}`}>

          {/* 팩트체크 진행 배너 */}
          {factCheckActive && factCheckIssues.length > 0 && (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 shadow-xs space-y-3 animate-float-in w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm md:text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>AI 팩트체크 순서형 검사 ({activeFactIndex + 1} / {factCheckIssues.length})</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-200/80 text-amber-950 rounded-lg">
              {factCheckIssues[activeFactIndex]?.type}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 space-y-2 text-xs md:text-sm">
            <p className="font-semibold text-slate-800">
              문제 문장: <span className="underline decoration-red-500 decoration-2 text-red-700 bg-red-50 px-1 rounded">{factCheckIssues[activeFactIndex]?.targetText}</span>
            </p>
            <p className="text-slate-600">
              <strong className="text-slate-900">발생 이유:</strong> {factCheckIssues[activeFactIndex]?.reason}
            </p>
            <div className="text-slate-900 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span><strong>AI 수정안 제안:</strong> "{factCheckIssues[activeFactIndex]?.suggestion}"</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onSkipFactFix}
              className="px-4 py-1.5 text-xs font-bold bg-[#EFECE6] hover:bg-[#E4DFD7] text-[#23211F] rounded-full border border-[#DDD6CB] transition cursor-pointer"
            >
              건너뛰기
            </button>
            <button
              onClick={onApplyFactFix}
              className="px-4 py-1.5 text-xs font-extrabold bg-[#23211F] hover:bg-[#38332E] text-[#FAF8F5] rounded-full transition shadow-xs cursor-pointer flex items-center gap-1 border border-[#23211F]"
            >
              <Check className="w-3.5 h-3.5" />
              수정 적용
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          2. 메인 작업 영역: [에디터] / [나란히 보기] / [미리보기]
         ────────────────────────────────────────── */}
      <div className={`grid gap-6 items-start ${
        viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      }`}>

        {/* ──────────────────
            [A] 기사 작성 에디터 캔버스 (viewMode가 'editor' 또는 'split'일 때 표시)
            - Editorial Minimalist 레이아웃 (rounded-[16px], low-contrast border, soft shadow)
           ────────────────── */}
        {(viewMode === "editor" || viewMode === "split") && (
          <div className="bg-white/90 backdrop-blur-xs rounded-[16px] border border-black/[0.05] p-6 md:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative min-h-[640px] w-full">
            
            {/* 기사 헤드라인 영역 */}
            <div className="space-y-2 relative group">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold h-7">
                <span>기사 제목</span>
                <div className="flex items-center gap-1.5">
                  {/* AI 버튼 */}
                  <button
                    type="button"
                    onClick={() => setShowTitleAiMenu(!showTitleAiMenu)}
                    className="px-2 py-1 rounded-md hover:bg-black/5 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="AI 추천 제목"
                  >
                    <Bot className="w-4 h-4 text-slate-700" />
                    <span className="text-[11px] font-extrabold text-slate-800">AI</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  placeholder="기사 제목을 입력하세요"
                  className="w-full text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight leading-snug border-b border-slate-200 pb-3 outline-none transition-colors bg-transparent text-slate-950 font-black"
                />
              </div>

              {/* 제목 하단 글래스모피즘 세로형 AI 추천 패널 (단일 큰 박스) */}
              {showTitleAiMenu && (
                <div className="mt-3 p-3.5 bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] animate-float-in space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-slate-700" />
                      AI 추천 제목
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTitleAiMenu(false)}
                      className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {titleAiSuggestions.map((st, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setArticle((prev) => ({ ...prev, title: st, suggestedTitle: st }));
                          setShowTitleAiMenu(false);
                        }}
                        className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-slate-100/80 text-xs md:text-sm font-bold text-slate-900 transition cursor-pointer flex items-center gap-2.5 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-900 transition flex-shrink-0" />
                        <span className="flex-1 leading-snug">{st}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 부제 (부제목) 영역 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold h-7">
                <span>부제 (부제목)</span>
                <div className="flex items-center gap-1.5">
                  {/* AI 버튼 */}
                  <button
                    type="button"
                    onClick={() => setShowSubtitleAiMenu(!showSubtitleAiMenu)}
                    className="px-2 py-1 rounded-md hover:bg-black/5 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="AI 추천 부제목"
                  >
                    <Bot className="w-4 h-4 text-slate-700" />
                    <span className="text-[11px] font-extrabold text-slate-800">AI</span>
                  </button>
                </div>
              </div>

              {/* 첨부 이미지 스타일의 통 부제목 영역 (좌측 굵은 검정 바 & 통 부제목 텍스트 블록) */}
              <div className="border-l-[3.5px] border-slate-950 pl-3.5 py-0.5 space-y-1.5 my-2">
                {subtitles.map((sub, idx) => (
                  <div key={sub.id || idx}>
                    <input
                      type="text"
                      value={sub.text}
                      onChange={(e) => handleSubtitleChange(idx, e.target.value)}
                      placeholder={`부제목 ${idx + 1}`}
                      className="w-full text-base md:text-lg font-bold text-slate-950 tracking-tight leading-snug bg-transparent outline-none border-none p-0 focus:ring-0 placeholder:text-slate-300"
                    />
                  </div>
                ))}
              </div>

              {/* 부제목 하단 글래스모피즘 세로형 AI 추천 패널 (단일 큰 박스) */}
              {showSubtitleAiMenu && (
                <div className="mt-3 p-3.5 bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] animate-float-in space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 border-b border-slate-200/60 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-slate-700" />
                      AI 추천 통 부제목
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSubtitleAiMenu(false)}
                      className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 2~4줄 완성형 통 부제목 세트(묶음) 영역 */}
                  {(() => {
                    const raw = (typeof subtitleSuggest !== "undefined" && subtitleSuggest?.data?.length ? subtitleSuggest.data : subtitleAiSuggestions);
                    const bundle = raw.length >= 2 ? raw.slice(0, 4) : subtitleAiSuggestions.slice(0, 2);
                    const applyBundle = () => {
                      const next = bundle.map((text, i) => ({
                        id: `sub-${i}-${Date.now()}`,
                        text,
                        locked: false
                      }));
                      setSubtitles(next);
                      setSelectedAiSubtitles(bundle);
                      setArticle((prev) => ({ ...prev, subtitle: bundle.join("\n") }));
                      setShowSubtitleAiMenu(false);
                    };

                    return (
                      <div className="space-y-2">
                        <div
                          onClick={applyBundle}
                          className="p-2.5 rounded-xl hover:bg-slate-100/70 transition cursor-pointer group"
                          title="클릭하여 적용"
                        >
                          <div className="border-l-[3.5px] border-slate-950 pl-3.5 space-y-1.5">
                            {bundle.map((text, idx) => (
                              <div key={idx} className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                                {text}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 하단 적용 버튼 */}
                        <div className="flex items-center justify-end pt-1 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={applyBundle}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>적용하기</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>


            {/* 본문 텍스트 에디터 */}
            <div className="relative pt-1" ref={editorRef} onMouseUp={handleSelection}>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span>본문 작성 영역 (자유 작성 및 서식 적용)</span>
                <span>공백 포함 {(article.content || "").replace(/<[^>]*>/g, "").length.toLocaleString()}자</span>
              </div>

              {/* 레퍼런스 스타일: 둥근 캡슐형 밝은 톤 플로팅 텍스트 편집 바 */}
              {floatingToolbarPos && (
                <div
                  style={{ top: `${floatingToolbarPos.top}px`, left: `${floatingToolbarPos.left}px` }}
                  className="absolute z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.06)] border border-slate-200/90 animate-float-in text-xs"
                >
                  {/* 숨겨진 이미지 파일 입력 창 (취소 시 기존 본문 유지) */}
                  <input
                    ref={toolbarImageInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    className="hidden"
                    onChange={handleToolbarImageSelect}
                  />

                  {/* 1. 굵게 (B) */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="굵게"
                  >
                    <Bold className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      굵게
                    </span>
                  </button>

                  {/* 2. 기울임 (I) */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="기울임"
                  >
                    <Italic className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      기울임
                    </span>
                  </button>

                  {/* 3. 밑줄 (U) */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat("underline"); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="밑줄"
                  >
                    <Underline className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      밑줄
                    </span>
                  </button>

                  {/* 미니 구분선 */}
                  <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                  {/* 4. 글자 크기 */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat("size"); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="글자 크기"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      글자 크기
                    </span>
                  </button>

                  {/* 5. 동그라미 불릿 */}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat("bullet"); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="동그라미 목록"
                  >
                    <CircleDot className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      동그라미
                    </span>
                  </button>

                  {/* 미니 구분선 */}
                  <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                  {/* 6. 이미지 첨부 버튼 (단색 라인 아이콘) */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toolbarImageInputRef.current?.click();
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-xs hover:border hover:border-slate-200/70 transition-all cursor-pointer group relative active:scale-95"
                    title="이미지 첨부"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-700" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md z-40">
                      이미지 첨부
                    </span>
                  </button>
                </div>
              )}

              <div
                ref={bodyInputRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setArticle((prev) => ({ ...prev, content: e.currentTarget.innerHTML }))}
                onMouseUp={handleSelection}
                onKeyUp={handleSelection}
                data-placeholder="기사 본문을 입력하세요. 자유롭게 문단을 작성할 수 있습니다..."
                className="w-full min-h-[460px] text-slate-900 text-xs md:text-sm leading-relaxed p-5 bg-slate-50/50 rounded-xl border border-black/[0.06] focus:bg-white focus:border-[#8ECAE6] focus:ring-2 focus:ring-[#8ECAE6]/20 outline-none transition-all shadow-2xs font-sans empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 cursor-text overflow-y-auto"
              />
            </div>

          </div>
        )}

        {/* ──────────────────
            [B] 실시간 포털/신문 미리보기 캔버스 (viewMode가 'preview' 또는 'split'일 때 표시)
            - Editorial Minimalist 레이아웃 (rounded-[16px], low-contrast border, soft shadow)
           ────────────────── */}
        {/* ──────────────────
            [B] 동아일보 실제 뉴스 사이트 미리보기 (순수 흰색 배경, 네이버 및 불필요한 프레임 박스 제거)
           ────────────────── */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 md:p-10 shadow-xs space-y-6">
            {/* 상단: 기사작성으로 돌아가기 버튼 */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode("editor")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>기사작성으로 돌아가기</span>
              </button>
              <span className="text-xs text-slate-400 font-medium">동아일보 공식 웹 뉴스 뷰</span>
            </div>

            {/* 동아일보 실제 뉴스 웹사이트 레이아웃 (첨부 레퍼런스 스타일 100% 반영) */}
            <div className="max-w-2xl mx-auto space-y-6 animate-float-in">
              {/* 카테고리 네비게이션 */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
                <span>정치</span>
                <span className="text-slate-300 font-normal">&gt;</span>
                <span>2026 국정감사</span>
              </div>

              {/* 기사 헤드라인 제목 (동아일보 정통 명조) */}
              <h1 
                style={{ fontFamily: "'Nanum Myeongjo', Batang, serif", wordBreak: "keep-all", letterSpacing: "-0.02em" }}
                className="text-2xl md:text-3xl lg:text-[32px] font-bold text-slate-950 leading-snug tracking-tight"
              >
                {article.title || "기사 제목이 이곳에 표시됩니다"}
              </h1>

              {/* 메타 정보 바 (신문사, 업데이트 일자, 구글검색 선호 등) */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">동아일보</span>
                  <span className="text-slate-300">|</span>
                  <span>업데이트 2026-10-10 07:28</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-50/50">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>구글검색 선호 추가</span>
                </div>
              </div>

              {/* 반응 및 액션 아이콘 줄 */}
              <div className="flex items-center justify-between py-2.5 border-y border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-700">39</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-700">8</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Share2 className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Bookmark className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition"><Volume2 className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 transition" onClick={() => window.print()}><Printer className="w-4 h-4" /></button>
                </div>
              </div>

              {/* 부제목 (동아일보 특유의 좌측 굵은 검은색 바 스타일 및 명조 서체) */}
              {article.subtitle && (
                <div className="border-l-[3.5px] border-slate-950 pl-3.5 py-1">
                  <div 
                    style={{ fontFamily: "'Nanum Myeongjo', Batang, 'Pretendard', sans-serif", wordBreak: "keep-all", letterSpacing: "-0.015em" }}
                    className="text-sm md:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line"
                  >
                    {article.subtitle}
                  </div>
                </div>
              )}

              {/* 대표 이미지 (있을 경우) */}
              {photos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={photos[0].url} alt="main article" className="w-full h-auto object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    ▲ {photos[0].caption} (출처: {photos[0].source})
                  </p>
                </div>
              )}

              {/* 본문 (동아일보 정통 신문 명조 서체 & 실제 기사 행간) */}
              <div
                style={{
                  fontFamily: "'Nanum Myeongjo', Batang, serif",
                  wordBreak: "keep-all",
                  lineHeight: "1.9",
                  letterSpacing: "-0.015em",
                  fontSize: "1.05rem"
                }}
                className="text-slate-800 space-y-4 pt-2"
                dangerouslySetInnerHTML={{ __html: article.content || "기사 본문 내용이 실시간으로 렌더링됩니다..." }}
              />
            </div>
          </div>
        )}

          {/* grid 닫기 */}
          </div>

        {/* 좌측 컬럼 flex-1 닫기 */}
        </div>

        {/* [우측 컬럼]: 팩트체크 & 근거자료 검증 패널 (나란히 인라인 배치되어 절대 겹치지 않음) */}
        {isFactCheckDrawerOpen && (
          <FactCheckDrawer
            isOpen={isFactCheckDrawerOpen}
            onClose={() => setIsFactCheckDrawerOpen(false)}
            article={article}
            setArticle={setArticle}
          />
        )}

        {/* 기사 작성 화면 메인 박스 오른쪽 상단 옆에 위치한 사이드바 */}
        {/* 기사 작성 화면 메인 박스 오른쪽 상단 바로 옆에 위치한 일관된 캡슐형 Hover 확장 사이드바 (미리보기 화면에서는 숨김) */}
        {viewMode !== "preview" && (
          <aside className="sticky top-6 flex-shrink-0 z-30 select-none">
            <div className="flex flex-col items-start gap-2">
              {/* 1. 사진 첨부 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                >
                  <ImagePlus className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    사진 첨부
                  </span>
                </button>
              </div>

              {/* 2. 미리보기 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "preview" ? "editor" : "preview")}
                  className={`absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border backdrop-blur-md ${
                    viewMode === "preview"
                      ? "bg-slate-100/90 border-slate-800 text-slate-950 font-black shadow-xs"
                      : "bg-white/95 border-slate-200/90 text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                  }`}
                >
                  <Eye className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    독자 화면 미리보기
                  </span>
                </button>
              </div>

              {/* 3. 복사하기 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={handleCopyArticle}
                  className="absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                >
                  <Copy className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    기사 복사하기
                  </span>
                </button>
              </div>

              {/* 4. 출력하기 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={handlePrintArticle}
                  className="absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                >
                  <Printer className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    기사 출력하기
                  </span>
                </button>
              </div>

              {/* 미니 구분선 */}
              <div className="w-6 h-[1px] bg-slate-200/80 my-0.5 ml-2" />

              {/* 5. AI 기사 초안 생성 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(true)}
                  className="absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                >
                  <Wand2 className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    AI 기사 초안 생성
                  </span>
                </button>
              </div>

              {/* 6. 취재자료 검색 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                >
                  <Search className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    취재자료 검색
                  </span>
                </button>
              </div>

              {/* 7. 기사 팩트체크 & 근거자료 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={() => {
                    setIsFactCheckDrawerOpen(true);
                    if (onRunFactCheck) onRunFactCheck();
                  }}
                  className={`absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border backdrop-blur-md ${
                    factCheckActive || isFactCheckDrawerOpen
                      ? "bg-slate-100/90 border-slate-800 text-slate-950 font-black shadow-xs"
                      : "bg-white/95 border-slate-200/90 text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                  }`}
                >
                  <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[180px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    기사 팩트체크 & 근거자료
                  </span>
                </button>
              </div>

              {/* 8. 에디터 전용 보기 */}
              <div className="relative w-10 h-10 group">
                <button
                  type="button"
                  onClick={() => setViewMode("editor")}
                  className={`absolute left-0 top-0 h-10 w-10 group-hover:w-max min-w-[40px] px-2.5 rounded-full flex items-center transition-all duration-200 ease-out z-10 group-hover:z-30 overflow-hidden cursor-pointer active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-md border backdrop-blur-md ${
                    viewMode === "editor"
                      ? "bg-slate-100/90 border-slate-800 text-slate-950 font-black shadow-xs"
                      : "bg-white/95 border-slate-200/90 text-slate-700 group-hover:text-slate-950 group-hover:border-slate-300"
                  }`}
                >
                  <Edit3 className="w-4.5 h-4.5 flex-shrink-0 text-slate-700" />
                  <span className="text-xs font-bold whitespace-nowrap pl-2 pr-2.5 opacity-0 max-w-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-200 overflow-hidden select-none">
                    에디터 전용 보기
                  </span>
                </button>
              </div>

            </div>
          </aside>
        )}

      {/* 메인 flex 컨테이너 닫기 */}
      </div>

      {/* ──────────────────────────────────────────
          3. 사진·미디어 관리 및 본문 삽입 모달
         ────────────────────────────────────────── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-float-in border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">기사 사진 업로드 및 규격 편집</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* 새 사진 업로드 폼 */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">사진 설명 (캡션)</label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="예: 국내 연구진이 발표한 차세대 AI 반도체 시제품"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">사진 출처</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="동아일보 DB"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">제공자</label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    placeholder="김동아 기자"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">자동 규격 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  {["16:9 (대표)", "4:3 (본문)", "1:1 (SNS)"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRatio(r)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        newRatio === r
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold rounded-xl border border-purple-200 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>내 PC에서 사진 파일 업로드</span>
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* 현재 등록된 사진 리스트 */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">등록된 사진 목록:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {photos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={p.url} alt="p" className="w-10 h-8 object-cover rounded-md flex-shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{p.caption}</span>
                    </div>
                    <button
                      onClick={() => handleInsertPhotoToContent(p)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-2xs flex-shrink-0 cursor-pointer"
                    >
                      본문 삽입
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          4. CMS 최종 발행 성공 알림 모달
         ────────────────────────────────────────── */}
      {isCmsSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-float-in border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-slate-950">CMS 발행이 완료되었습니다</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              동아일보 디지털 통합 시스템(CMS)과 포털 송고 대기열로 기사 텍스트와 사진 데이터가 성공적으로 이관되었습니다.
            </p>
            <button
              onClick={() => setIsCmsSuccessModal(false)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* AI 기사 초안 생성 모달 */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-white space-y-5 animate-float-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">AI 기사 초안 생성</h3>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
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
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E4DFD7] text-[#23211F] border border-[#DDD6CB] text-xs font-bold rounded-full transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="px-5 py-2 bg-[#23211F] hover:bg-[#38332E] text-[#FAF8F5] text-xs font-bold rounded-full transition shadow-xs cursor-pointer flex items-center gap-2 border border-[#23211F]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>초안 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-amber-300" />
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
