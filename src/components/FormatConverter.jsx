import React, { useState, useRef } from "react";
import {
  AtSign,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Printer,
  Send,
  Check,
  Sliders,
  Download,
  FileText,
  Hash,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark,
  MoreHorizontal
} from "lucide-react";
import { initialArticles } from "../data/mockData";

// Inline Custom Social Platform Icons (Ensures 100% module safety & clear visibility)
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const ThreadsIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1a3 3 0 0 1-6 0v-1a6 6 0 1 1 11.6 2.2" />
  </svg>
);

const XTwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function FormatConverter() {
  // 1. Article Selection
  const [selectedArticle, setSelectedArticle] = useState(initialArticles[0]);

  // 2. Multi Platform Selection (Independent Toggle: instagram, threads, twitter)
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram"]);

  // Active sub tab when multiple platforms are selected
  const [activePlatformTab, setActivePlatformTab] = useState("instagram");

  // Sample Images for replacement
  const sampleImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
  ];

  // 3. Platform Specific Data State
  const [platformData, setPlatformData] = useState({
    instagram: {
      image: sampleImages[0],
      aspectRatio: "1:1",
      zoom: 100,
      text: `[단독] AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁 🚀\n\n국내 주요 반도체 기업과 연구진이 NPU 및 PIM 기술을 통해 글로벌 빅테크 기업들과 차세대 반도체 패권 다툼을 시작합니다.\n\n전력 소비를 70% 이상 절감한 혁신적인 성과를 지금 확인해보세요.\n\n#AINewsroom #AI반도체 #NPU #PIM #빅테크 #기술혁신 #IT뉴스 #디지털인텔리전스`,
      hashtags: ["#AI반도체", "#NPU", "#PIM", "#빅테크", "#IT뉴스"]
    },
    threads: {
      image: sampleImages[1],
      aspectRatio: "16:9",
      zoom: 100,
      text: `GPU 중심 연산의 한계를 뛰어넘는 국내 AI 반도체 기술의 급부상! 🧵\n\n기존 대비 전력 소비 70% 감소, 데이터 병목 현상을 해결한 초거대 AI 지원 반도체 현장을 취재했습니다.\n\n알고리즘 최적화와 함께 펼쳐지는 글로벌 패권 경쟁, 여러분의 의견은 어떠신가요?`,
      hashtags: ["#ThreadsTech", "#AI반도체"]
    },
    twitter: {
      image: sampleImages[2],
      aspectRatio: "16:9",
      zoom: 100,
      text: `⚡️ [속보] AI 반도체 개척자들, 초거대 AI 시대 차세대 주도권 쟁탈전 개막!\n\n국내 개발진, NPU/PIM 독자 기술로 전력 70% 감소 성과 달성. 글로벌 빅테크와 대등한 경쟁 돌입.\n\n#AI반도체 #NPU #IT뉴스`,
      hashtags: ["#AI반도체", "#NPU", "#IT뉴스"]
    }
  });

  const fileInputRef = useRef(null);
  const [copiedStatus, setCopiedStatus] = useState("");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Toggle platform selection
  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      let next;
      if (prev.includes(platformId)) {
        if (prev.length === 1) return prev;
        next = prev.filter((p) => p !== platformId);
      } else {
        next = [...prev, platformId];
      }
      if (!next.includes(activePlatformTab) && next.length > 0) {
        setActivePlatformTab(next[0]);
      }
      return next;
    });
  };

  // Update specific platform data field
  const updatePlatformField = (platform, field, value) => {
    setPlatformData((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  // Image Upload Handler
  const handleImageUpload = (e, platform) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          updatePlatformField(platform, "image", uploadEvt.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Append hashtag
  const addHashtag = (platform, tag) => {
    const currentText = platformData[platform].text;
    if (!currentText.includes(tag)) {
      updatePlatformField(platform, "text", `${currentText} ${tag}`);
    }
  };

  // Copy content
  const handleCopyText = (platform) => {
    navigator.clipboard.writeText(platformData[platform].text);
    setCopiedStatus(platform);
    setTimeout(() => setCopiedStatus(""), 2000);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Publish simulation
  const handlePublishAll = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublishModalOpen(true);
    }, 1500);
  };

  const platforms = [
    { id: "instagram", label: "Instagram", icon: InstagramIcon, color: "from-purple-500 to-pink-500" },
    { id: "threads", label: "Threads", icon: ThreadsIcon, color: "from-slate-800 to-slate-950" },
    { id: "twitter", label: "X (Twitter)", icon: XTwitterIcon, color: "from-blue-400 to-slate-900" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-8 animate-float-in">

      {/* ──────────────────────────────────────────
          Header Title & Ambient Soft Light Glass Container (Expanded Wide Layout)
         ────────────────────────────────────────── */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8 rounded-3xl border border-white/90 shadow-sm space-y-4">
        {/* Soft Blue & Yellow Ambient Light Gradient Layer */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-slate-200/90 rounded-full text-xs md:text-sm font-extrabold text-slate-800 shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>소셜 원클릭 멀티 배포</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
              소셜 미디어 플랫폼 변환
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium">
              작성된 원문 기사를 인스타그램, 스레드, X 특성에 맞게 이미지와 텍스트를 커스텀 편집하고 배포합니다.
            </p>
          </div>

          {/* Target Article Switcher Pill (Larger & Clearer) */}
          <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/90 shadow-xs min-w-[280px]">
            <span className="text-xs font-bold text-slate-400 block px-1 mb-1">변환 대상 기사 선택</span>
            <select
              value={selectedArticle.id}
              onChange={(e) => {
                const art = initialArticles.find((a) => a.id === parseInt(e.target.value));
                if (art) setSelectedArticle(art);
              }}
              className="w-full bg-transparent text-sm font-extrabold text-slate-900 outline-none cursor-pointer"
            >
              {initialArticles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.title.slice(0, 26)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────
          1 & 2. Platform Selection (Segmented Control - Bigger & Highly Legible)
         ────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <span className="text-sm font-extrabold text-slate-700 tracking-wide">
          변환할 소셜 플랫폼 선택 (다중 선택 가능)
        </span>

        {/* Minimal Round Segmented Control Container */}
        <div className="inline-flex items-center bg-white/95 backdrop-blur-md p-2 rounded-full border border-slate-200/90 shadow-sm gap-2 transition-all">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatforms.includes(p.id);

            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`relative px-6 py-3.5 rounded-full text-sm md:text-base font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2.5 whitespace-nowrap select-none ${isSelected
                    ? "bg-slate-950 text-white shadow-md scale-100"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                  }`}
              >
                {/* Active Indicator Dot */}
                {isSelected ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <Icon className="w-5 h-5 text-slate-400" />
                )}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────
          3 ~ 7. Platform Editing & Live Preview Area (Wide 2-Column Grid)
         ────────────────────────────────────────── */}
      {selectedPlatforms.length > 0 ? (
        <div className="space-y-6 animate-float-in">

          {/* Sub Navigation Tabs for Selected Platforms if Multiple */}
          {selectedPlatforms.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 border-b border-slate-200/70 pb-4">
              <span className="text-xs md:text-sm font-extrabold text-slate-500 mr-2">선택된 편집 탭:</span>
              {selectedPlatforms.map((pid) => {
                const pInfo = platforms.find((p) => p.id === pid);
                const isTabActive = activePlatformTab === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setActivePlatformTab(pid)}
                    className={`px-5 py-2 rounded-xl text-xs md:text-sm font-extrabold transition cursor-pointer flex items-center gap-2 ${isTabActive
                        ? "bg-white text-slate-950 border border-slate-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 bg-slate-100/70"
                      }`}
                  >
                    <span>{pInfo?.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Render Active Platform Editors */}
          {selectedPlatforms.map((pid) => {
            const isSingle = selectedPlatforms.length === 1;
            const isCurrentTab = activePlatformTab === pid;

            if (!isSingle && !isCurrentTab) return null;

            const pInfo = platforms.find((p) => p.id === pid);
            const pData = platformData[pid];

            return (
              <div
                key={pid}
                className="glass-card p-6 md:p-10 rounded-3xl space-y-8 border border-slate-200/80 shadow-xs animate-float-in"
              >
                {/* Platform Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${pInfo?.color} text-white shadow-2xs`}>
                      {pInfo && <pInfo.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-extrabold text-slate-950">{pInfo?.label} 전용 편집</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-medium">플랫폼 규격에 맞는 이미지와 텍스트를 실시간 편집하세요.</p>
                    </div>
                  </div>

                  <span className="text-xs md:text-sm font-extrabold px-4 py-1.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200/80">
                    권장 비율: {pData.aspectRatio}
                  </span>
                </div>

                {/* Grid: Wide Left Control Panel (7 cols) / Right Live Preview Panel (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

                  {/* Left Column: Image & Text Controls */}
                  <div className="lg:col-span-7 space-y-6">

                    {/* Image Controls */}
                    <div className="bg-white/90 p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-slate-700" />
                          <span>1. 이미지 선택 및 교체</span>
                        </label>

                        {/* Aspect Ratio Switcher */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          {["1:1", "16:9", "4:5"].map((ratio) => (
                            <button
                              key={ratio}
                              onClick={() => updatePlatformField(pid, "aspectRatio", ratio)}
                              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${pData.aspectRatio === ratio
                                  ? "bg-white text-slate-950 shadow-2xs"
                                  : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Thumbnail Selector */}
                      <div className="grid grid-cols-4 gap-3">
                        {sampleImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => updatePlatformField(pid, "image", imgUrl)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition ${pData.image === imgUrl ? "border-slate-950 ring-2 ring-slate-900/20 scale-102" : "border-transparent opacity-75 hover:opacity-100"
                              }`}
                          >
                            <img src={imgUrl} alt="sample" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>

                      {/* Upload & Scale Slider Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs md:text-sm font-extrabold transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-slate-700" />
                          <span>내 파일 업로드</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleImageUpload(e, pid)}
                          accept="image/*"
                          className="hidden"
                        />

                        {/* Zoom Slider */}
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 font-bold">
                          <Sliders className="w-4 h-4 text-slate-500" />
                          <span>크기 조절:</span>
                          <input
                            type="range"
                            min="80"
                            max="140"
                            value={pData.zoom}
                            onChange={(e) => updatePlatformField(pid, "zoom", parseInt(e.target.value))}
                            className="w-28 accent-slate-900 cursor-pointer"
                          />
                          <span className="text-xs font-black text-slate-900 w-10">{pData.zoom}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Text Controls */}
                    <div className="bg-white/90 p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-700" />
                          <span>2. 게시 본문 직접 편집</span>
                        </label>
                        <span className="text-xs font-extrabold text-slate-400">
                          {pData.text.length}자
                        </span>
                      </div>

                      <textarea
                        value={pData.text}
                        onChange={(e) => updatePlatformField(pid, "text", e.target.value)}
                        rows={7}
                        className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-900 leading-relaxed outline-none focus:bg-white focus:border-slate-800 transition font-sans"
                        placeholder="플랫폼에 게재할 텍스트를 자유롭게 작성 및 수정하세요..."
                      />

                      {/* Quick Hashtag Recommender Chips */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-slate-400 block">추천 해시태그 원클릭 추가:</span>
                        <div className="flex flex-wrap gap-2">
                          {["#AI반도체", "#NPU", "#PIM", "#빅테크", "#IT뉴스", "#디지털뉴스룸"].map((tag) => (
                            <button
                              key={tag}
                              onClick={() => addHashtag(pid, tag)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <Hash className="w-3.5 h-3.5 text-slate-400" />
                              <span>{tag.replace("#", "")}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Card Preview Panel (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <span className="text-sm font-extrabold text-slate-700 block">
                        실시간 게시물 미리보기
                      </span>

                      {/* Platform Specific Mock Preview Frame */}
                      <div className="bg-slate-900/5 p-5 rounded-3xl border border-slate-200/90 shadow-inner">

                        {/* 1. INSTAGRAM MOCK PREVIEW */}
                        {pid === "instagram" && (
                          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden text-xs md:text-sm max-w-md mx-auto">
                            {/* Insta Header */}
                            <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[1.5px]">
                                  <div className="w-full h-full rounded-full bg-white p-[1px]">
                                    <div className="w-full h-full rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                      AI
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 text-xs md:text-sm">ai_newsroom_official</span>
                                  <span className="text-[10px] text-slate-400 block">서울, 대한민국</span>
                                </div>
                              </div>
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Insta Image */}
                            <div className="relative overflow-hidden bg-slate-100 aspect-square">
                              <img
                                src={pData.image}
                                alt="Insta Post"
                                style={{ transform: `scale(${pData.zoom / 100})` }}
                                className="w-full h-full object-cover transition-transform duration-200"
                              />
                            </div>

                            {/* Insta Action Bar */}
                            <div className="p-4 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5 text-slate-700">
                                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                  <MessageCircle className="w-5 h-5" />
                                  <Share2 className="w-5 h-5" />
                                </div>
                                <Bookmark className="w-5 h-5 text-slate-600" />
                              </div>

                              <p className="font-bold text-xs md:text-sm text-slate-900">좋아요 1,248개</p>

                              {/* Insta Caption Text */}
                              <div className="text-xs md:text-sm text-slate-900 leading-relaxed space-y-1">
                                <span className="font-extrabold mr-1.5 text-slate-950">ai_newsroom_official</span>
                                <span className="whitespace-pre-line">{pData.text}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. THREADS MOCK PREVIEW */}
                        {pid === "threads" && (
                          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 text-xs md:text-sm max-w-md mx-auto space-y-4">
                            <div className="flex items-start gap-3.5">
                              <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                                @
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-950 text-xs md:text-sm">ai_newsroom</span>
                                    <span className="text-[11px] text-slate-400">2시간 전</span>
                                  </div>
                                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                </div>

                                <p className="text-xs md:text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                                  {pData.text}
                                </p>

                                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-56">
                                  <img
                                    src={pData.image}
                                    alt="Threads Attached"
                                    style={{ transform: `scale(${pData.zoom / 100})` }}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="flex items-center gap-5 text-slate-500 pt-1">
                                  <Heart className="w-4 h-4 hover:text-red-500 transition cursor-pointer" />
                                  <MessageCircle className="w-4 h-4" />
                                  <Repeat className="w-4 h-4" />
                                  <Share2 className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. X (TWITTER) MOCK PREVIEW */}
                        {pid === "twitter" && (
                          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 text-xs md:text-sm max-w-md mx-auto space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs">
                                X
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-950 text-xs md:text-sm">AI Newsroom</span>
                                  <span className="text-xs text-slate-400">@ainews</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs md:text-sm text-slate-900 leading-relaxed whitespace-pre-line">
                              {pData.text}
                            </p>

                            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-52">
                              <img
                                src={pData.image}
                                alt="Twitter Media"
                                style={{ transform: `scale(${pData.zoom / 100})` }}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
                              <span>오전 10:30 · 2026년 10월 2일</span>
                              <div className="flex items-center gap-4">
                                <MessageCircle className="w-4 h-4" />
                                <Repeat className="w-4 h-4" />
                                <Heart className="w-4 h-4 text-red-500" />
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Quick Copy Action */}
                    <button
                      onClick={() => handleCopyText(pid)}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs md:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {copiedStatus === pid ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">클립보드에 복사되었습니다!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-700" />
                          <span>{pInfo?.label} 콘텐츠 텍스트 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      ) : (
        /* Empty State Warning when no platform is selected */
        <div className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto rounded-3xl border border-slate-200/80 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-extrabold text-slate-900">플랫폼을 선택하세요</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            상단 세그먼트 컨트롤에서 Instagram, Threads, X 중 원하시는 배포 플랫폼을 선택하면 편집 창이 자연스럽게 나타납니다.
          </p>
        </div>
      )}

      {/* ──────────────────────────────────────────
          8. Final Output & Export Section (Wide Full Width Dashboard)
         ────────────────────────────────────────── */}
      {selectedPlatforms.length > 0 && (
        <div className="glass-card p-6 md:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 animate-float-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                최종 결과물 및 멀티 배포 대시보드
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
                수정 완료된 모든 플랫폼 결과물을 확인하고 인쇄, 출력 또는 플랫폼으로 즉시 전송합니다.
              </p>
            </div>

            <span className="text-xs md:text-sm font-extrabold px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {selectedPlatforms.length}개 플랫폼 준비 완료
            </span>
          </div>

          {/* Final Output Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedPlatforms.map((pid) => {
              const pInfo = platforms.find((p) => p.id === pid);
              const pData = platformData[pid];
              return (
                <div key={pid} className="bg-white/90 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                        {pInfo && <pInfo.icon className="w-4 h-4 text-slate-800" />}
                        {pInfo?.label}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">준비됨</span>
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={pData.image} alt="final preview" className="w-full h-full object-cover" />
                    </div>

                    <p className="text-xs md:text-sm text-slate-800 line-clamp-3 leading-relaxed font-sans">
                      {pData.text}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyText(pid)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs md:text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    내용 복사
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Bar: Print / Export / Publish */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs md:text-sm font-extrabold transition shadow-2xs cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>결과물 인쇄 (PDF)</span>
              </button>

              <button
                onClick={() => alert("선택한 모든 플랫폼의 이미지 및 텍스트 데이터가 개별 압축 파일로 다운로드됩니다.")}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-xs md:text-sm font-extrabold transition shadow-2xs cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>데이터 다운로드</span>
              </button>
            </div>

            <button
              onClick={handlePublishAll}
              disabled={isPublishing}
              className="px-7 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-extrabold transition shadow-md cursor-pointer flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>플랫폼 전송 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>선택된 플랫폼 일괄 게시/배포</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Publish Modal Simulation */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 text-center animate-float-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-950">플랫폼 배포 성공!</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              선택하신 {selectedPlatforms.length}개 소셜 플랫폼({selectedPlatforms.join(", ")})으로 콘텐츠가 성공적으로 등록되었습니다.
            </p>
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="w-full py-3 bg-slate-950 text-white font-extrabold text-sm rounded-xl shadow-xs cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
