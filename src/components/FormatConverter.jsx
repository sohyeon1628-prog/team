import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  Plus,
  Trash2,
  X,
  ArrowRight,
  Download,
  Loader2,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Wand2,
  FileText,
  BookOpen,
  Type,
  Copy,
  Printer,
  Move,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Hash,
  Save,
  FolderOpen,
  FileUp,
  Search,
  Newspaper,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Repeat,
  MoreHorizontal
} from "lucide-react";
import { searchUnsplashPhotos } from "../services/unsplash";

// 동아일보 DB 보도사진 아카이브 프리셋 데이터
const DONGA_DB_PHOTOS = [
  {
    id: "db-1",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    caption: "서울 종로구 광화문 동아미디어센터 사옥 전경",
    source: "동아일보 DB",
    date: "2026.10.05"
  },
  {
    id: "db-2",
    url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    caption: "국회 과학기술정보방송통신위원회 종합 국정감사 회의장",
    source: "동아일보 DB",
    date: "2026.10.02"
  },
  {
    id: "db-3",
    url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    caption: "한국과학기술원(KAIST) 반도체 융합 연구실 브리핑 현장",
    source: "동아일보 DB",
    date: "2026.09.28"
  },
  {
    id: "db-4",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    caption: "초거대 생성형 AI 기업 연합 기술 포럼 프레스룸",
    source: "동아일보 DB",
    date: "2026.09.25"
  }
];

export default function FormatConverter({ currentArticle: _currentArticle }) {
  // 현재 작성 중인 기사 데이터 연동 및 동기화
  const [activeArticle, setActiveArticle] = useState(() => {
    try {
      const saved = localStorage.getItem("team01_article_draft_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ..._currentArticle,
          title: parsed.title || _currentArticle?.title,
          subtitle: parsed.subtitle || _currentArticle?.subtitle,
          content: parsed.content || _currentArticle?.content,
          category: parsed.category || _currentArticle?.category || "사회",
          photos: parsed.photos || _currentArticle?.photos || [],
          status: _currentArticle?.status || "작성 중"
        };
      }
    } catch {}
    return _currentArticle || {
      title: "AI 반도체 개척자들... 초거대 AI 시대의 차세대 주도권 경쟁",
      subtitle: "국내 주요 반도체 기업, NPU 및 PIM 기술로 글로벌 시장에 도전장",
      content: "",
      category: "사회",
      status: "작성 중",
      photos: []
    };
  });

  useEffect(() => {
    if (_currentArticle) {
      setActiveArticle((prev) => ({
        ...prev,
        ..._currentArticle
      }));
    }
  }, [_currentArticle]);

  // ⭐ 기사 전문 보기 모달 상태 (사용자 요구: 플랫폼 변환 메인박스 왼쪽 상단 작성 중 기사 박스 및 전문 열람)
  const [showFullArticleModal, setShowFullArticleModal] = useState(false);
  const [fullArticleCopied, setFullArticleCopied] = useState(false);

  // ESC 키로 전문 보기 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showFullArticleModal) {
        setShowFullArticleModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullArticleModal]);

  // 기사 전문 전체 복사 핸들러
  const handleCopyFullArticle = () => {
    const fullText = `${activeArticle.title || ""}\n\n${activeArticle.subtitle ? activeArticle.subtitle + "\n\n" : ""}${activeArticle.content || ""}`;
    navigator.clipboard.writeText(fullText);
    setFullArticleCopied(true);
    setTimeout(() => setFullArticleCopied(false), 2000);
  };

  // 핵심 리드문 (첫 단락) 추출
  const leadParagraph = activeArticle.content
    ? activeArticle.content.split(/\n\n+/).filter(Boolean)[0]?.replace(/\[사진 삽입:.*?\]/g, "").trim()
    : "";

  // 1. 배포 플랫폼 선택 상태 및 활성 편집 플랫폼 (초기값: null, 사이드에서 카드뉴스 생성 시작하기 클릭 시 활성화)
  const [activePlatform, setActivePlatform] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram", "threads", "cardnews"]);
  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // 인스타그램 배포 전용 상태
  const [instagramCaption, setInstagramCaption] = useState("");
  const [instagramHashtags, setInstagramHashtags] = useState([
    "#뉴스", "#단독", "#속보", "#AI미디어", "#트렌드", "#헤드라인"
  ]);
  const [newHashtagInput, setNewHashtagInput] = useState("");
  const [isInstagramCopied, setIsInstagramCopied] = useState(false);
  const [isInstagramLiked, setIsInstagramLiked] = useState(false);
  const [instagramLikeCount, setInstagramLikeCount] = useState(1284);
  const [instagramImage, setInstagramImage] = useState(
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=80"
  );
  const [instagramAspectRatio, setInstagramAspectRatio] = useState("4:5"); // "4:5" | "1:1"
  const platformFileInputRef = useRef(null);

  // 인스타그램 / 스레드 우측 상단 미디어 모드 ("image": 이미지 첨부, "cardnews": 카드뉴스 불러오기)
  const [mediaSourceMode, setMediaSourceMode] = useState("image");
  const [selectedCardNewsIndex, setSelectedCardNewsIndex] = useState(0);

  // 인스타그램 로컬 앱 연결 노드형 타임라인 워크플로우 상태
  const [instaConnectionStarted, setInstaConnectionStarted] = useState(false); // 연결 시작하기 토글
  const [instaActiveStep, setInstaActiveStep] = useState(1); // 0: 계정 연결, 1: 로그인 상태 확인(기본 실행 중), 2: 원고·카드 준비, 3: 게시 준비 완료
  const [instaAppWindowOpen, setInstaAppWindowOpen] = useState(true);
  const [instaAccountConnected, setInstaAccountConnected] = useState(true);
  const [instaLoginStatus, setInstaLoginStatus] = useState("checking"); // 'checking' | 'verified' | 'error'

  // 스레드(Threads) 배포 전용 상태
  const [threadsList, setThreadsList] = useState([
    { id: 1, content: "" },
    { id: 2, content: "" }
  ]);
  const [isThreadsCopied, setIsThreadsCopied] = useState(false);
  const [isThreadsLiked, setIsThreadsLiked] = useState(false);
  const [threadsLikeCount, setThreadsLikeCount] = useState(342);

  // 스레드(Threads) 로컬 앱 연결 노드형 타임라인 워크플로우 상태
  const [threadsConnectionStarted, setThreadsConnectionStarted] = useState(false); // 연결 시작하기 토글
  const [threadsActiveStep, setThreadsActiveStep] = useState(1); // 0: 계정 연결, 1: 로그인 상태 확인(기본 실행 중), 2: 타래·원고 준비, 3: 게시 준비 완료
  const [threadsAppWindowOpen, setThreadsAppWindowOpen] = useState(true);
  const [threadsAccountConnected, setThreadsAccountConnected] = useState(true);
  const [threadsLoginStatus, setThreadsLoginStatus] = useState("checking"); // 'checking' | 'verified' | 'error'

  // ─── [뉴스 카드 편집실: 원고 검수 & 문단별 편집 & 연동 상태] ───
  const [draftSections, setDraftSections] = useState({
    intro: "러시아의 한 페스트 방역연구소 소속 연구원이 원인불명 폐렴으로 숨지면서 실험실 유출 의혹과 함께 불안이 고조되고 있습니다.",
    body1: "이르쿠츠크 페스트 방역연구소의 다리아 시밀로바 연구원은 지난달 29일 중증 폐렴 증상으로 입원해 치료를 받았으나 이달 2일 숨졌습니다.",
    body2: "숨진 직후 동료 사흐루비 연구원이 사후 체취 과정에서 페스트 병원체가 든 시험관을 실수로 깨뜨린 것이 사망 원인일 수 있다고 전했습니다.",
    body3: "세계보건기구(WHO)는 대중적 위험성은 낮다고 밝혔으나 미국과 유럽연합 보건당국은 신속하고 투명한 정보 공개를 촉구했습니다.",
    outro: "일각에서는 전 세계 질병연구소에 대한 감시 부족 우려를 제기하며 러시아의 투명한 정보 공개를 요구하고 있습니다.",
    hashtags: "#페스트균 #러시아연구원 #치사성 #WHO #신종병"
  });

  // 각 문단별 원문 근거 펼침 상태
  const [expandedSources, setExpandedSources] = useState({});
  const toggleSource = (key) => {
    setExpandedSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 전체 원고의 원문 근거 펼침 상태
  const [isAllSourceExpanded, setIsAllSourceExpanded] = useState(false);

  // 팩트체크 수정사항 데이터 및 적용 상태
  const [factCheckIssues, setFactCheckIssues] = useState([
    {
      id: "fc-1",
      target: "draft.도입",
      title: "발생장소",
      reason: "본문에 없는 발생장소가 언급되었거나 기업명을 사용했습니다.",
      correction: "발생 장소의 정보를 기관명의 발원장소로 수정합니다.",
      evidence: "이르쿠츠크 리스트 방역연구소의 위치가 시베리아 연방관구의 러시아 29개 주와 유대인 자치주 관할에 입각했다.",
      applied: false
    },
    {
      id: "fc-2",
      target: "draft.본문 3",
      title: "미국과 유럽연합 보건당국은 신속하고 투명한 정보 공개를 촉구했습니다.",
      reason: "본문에서 미국 외의 보건당국은 사안을 예의주시하고 있다고 했으며, 신속하고 투명한 정보 공개 촉구 주체는 별도의 보도 자료 및 인물들의 발언으로 구성되어 있어 오해를 배제했습니다.",
      correction: "본문의 취지에 맞게 내부의 보건청장 모니터링 사업을 예의주시하고 있다고 수정합니다.",
      reflected: "유럽질병관리센터 대변인은... 사실을 예의주시하고 있다.",
      source: '"신속연구 투명성 정보 공개하라"',
      applied: false
    }
  ]);

  // 각 단락별 원문 근거 매핑
  const sectionEvidenceMap = {
    intro: {
      label: "페스트균의 원문 근거",
      evidence: "기사 원문 1단락: 러시아 시베리아 지역 연구소 직원이 페스트 관련 증상으로 사망해 보건당국이 조사에 착수했다..."
    },
    body1: {
      label: "본문 1의 원문 근거",
      evidence: "기사 원문 2단락: 이르쿠츠크 방역연구소 소속 연구원이 고열과 호흡곤란으로 입원 후 사흘 만에 사망했다..."
    },
    body2: {
      label: "본문 2의 원문 근거",
      evidence: "기사 원문 3단락: 현지 연구원 증언에 따르면 실험실 내 표본 용기 파손 사고 가능성이 제기되었다..."
    },
    body3: {
      label: "본문 3의 원문 근거",
      evidence: "기사 원문 4단락: WHO는 성명을 내고 관련국에 투명한 역학조사 결과 공유를 요청했다..."
    },
    outro: {
      label: "마무리의 원문 근거",
      evidence: "기사 원문 5단락: 국제 보건 전문가들은 생물학 안전 연구시설에 대한 다국적 상호 실사 필요성을 강조했다..."
    }
  };

  // SNS 계정 연동 단계 상태
  const [snsConnectStep, setSnsConnectStep] = useState(2); // 1, 2, 3
  const [isAppVerified, setIsAppVerified] = useState(true);

  // 팩트체크 수정사항 토글/적용
  const handleApplyFactCheck = (id) => {
    setFactCheckIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, applied: !item.applied };
        }
        return item;
      })
    );
    showToast("팩트체크 수정사항이 원고에 반영되었습니다.");
  };

  // 스레드 내용 업데이트
  const updateThreadContent = (id, newContent) => {
    setThreadsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: newContent } : item))
    );
  };

  // 인스타그램 해시태그 추가/삭제
  const handleAddHashtag = (tag) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (!trimmed) return;
    const formatted = `#${trimmed}`;
    if (!instagramHashtags.includes(formatted)) {
      setInstagramHashtags((prev) => [...prev, formatted]);
      showToast(`'${formatted}' 해시태그가 추가되었습니다.`);
    }
    setNewHashtagInput("");
  };

  const handleRemoveHashtag = (tagToRemove) => {
    setInstagramHashtags((prev) => prev.filter((t) => t !== tagToRemove));
    showToast(`'${tagToRemove}' 해시태그가 삭제되었습니다.`);
  };

  // 인스타그램 캡션 복사
  const handleCopyInstagramCaption = () => {
    const fullText = `${instagramCaption}\n\n${instagramHashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setIsInstagramCopied(true);
    showToast("인스타그램 캡션과 해시태그가 클립보드에 복사되었습니다!");
    setTimeout(() => setIsInstagramCopied(false), 2000);
  };

  // 스레드 타래 전체 복사
  const handleCopyThreads = () => {
    const fullText = threadsList.map((t, idx) => `[타래 ${idx + 1}]\n${t.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(fullText);
    setIsThreadsCopied(true);
    showToast("스레드 타래 전체가 클립보드에 복사되었습니다!");
    setTimeout(() => setIsThreadsCopied(false), 2000);
  };

  // 원고 구성 문단 내용 피드에 삽입
  const handleInsertDraftSection = (sectionKey) => {
    const textToInsert = draftSections[sectionKey];
    if (!textToInsert) return;
    if (activePlatform === "instagram") {
      setInstagramCaption((prev) => (prev ? `${prev}\n\n${textToInsert}` : textToInsert));
      showToast(`'${sectionEvidenceMap[sectionKey]?.label || sectionKey}' 내용이 인스타그램 캡션에 반영되었습니다.`);
    } else if (activePlatform === "threads") {
      setThreadsList((prev) => [
        { ...prev[0], content: prev[0].content ? `${prev[0].content}\n\n${textToInsert}` : textToInsert },
        prev[1]
      ]);
      showToast(`'${sectionEvidenceMap[sectionKey]?.label || sectionKey}' 내용이 스레드 1번에 반영되었습니다.`);
    }
  };

  // 원고 구성 네비게이션 스크롤 함수
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[#8ECAE6]", "ring-offset-2");
      setTimeout(() => el.classList.remove("ring-2", "ring-[#8ECAE6]", "ring-offset-2"), 1500);
    }
  };

  // 초안 액션 버튼 물방울 인디케이터 상태 및 ref
  const [activeDraftAction, setActiveDraftAction] = useState("save");
  const [draftBubbleStyle, setDraftBubbleStyle] = useState({ left: 0, width: 0, isReady: false });
  const draftBtnContainerRef = useRef(null);
  const draftBtnRefs = useRef({});

  const updateDraftBubblePosition = (actionKey = activeDraftAction) => {
    const currentBtn = draftBtnRefs.current[actionKey];
    const container = draftBtnContainerRef.current;
    if (currentBtn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = currentBtn.getBoundingClientRect();
      setDraftBubbleStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        isReady: true
      });
    }
  };

  useEffect(() => {
    updateDraftBubblePosition(activeDraftAction);
    const timer = setTimeout(() => updateDraftBubblePosition(activeDraftAction), 60);
    return () => clearTimeout(timer);
  }, [activeDraftAction]);

  // 기사 내용 기반 인스타그램 캡션 및 스레드 자동 초기화
  useEffect(() => {
    if (!instagramCaption && activeArticle.title) {
      const initialCaption = `${activeArticle.title}\n\n${leadParagraph || activeArticle.content?.slice(0, 200) || ""}\n\n📌 자세한 내용은 AI Newsroom 기사 전문에서 확인하세요.`;
      setInstagramCaption(initialCaption);
    }
  }, [activeArticle, leadParagraph, instagramCaption]);

  useEffect(() => {
    if (threadsList[0].content === "" && activeArticle.title) {
      setThreadsList([
        {
          id: 1,
          content: `🧵 1/2. ${activeArticle.title}\n\n${leadParagraph || "오늘의 주요 보도 내용을 정리해 전달합니다."}`
        },
        {
          id: 2,
          content: `2/2. ${activeArticle.subtitle ? `핵심 포인트: ${activeArticle.subtitle}\n\n` : ""}더 많은 심층 취재 기사는 AI Newsroom에서 확인하실 수 있습니다.`
        }
      ]);
    }
  }, [activeArticle, leadParagraph, threadsList]);

  // 2. 초기 카드 데이터 (필드별 서식 및 고정 기능 내장)
  const defaultStyles = {
    tag: {
      fontSize: 13,
      color: "#A1A1AA",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrike: false,
      align: "left",
      isLocked: false
    },
    title: {
      fontSize: 28,
      color: "#FFFFFF",
      isBold: true,
      isItalic: false,
      isUnderline: false,
      isStrike: false,
      align: "left",
      isLocked: false
    },
    body: {
      fontSize: 14,
      color: "#E4E4E7",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrike: false,
      align: "left",
      isLocked: false
    }
  };

  const initialCards = [
    {
      id: 1,
      role: "표지",
      tag: "콘텐츠 제작",
      title: "하나의 기사,\n여러 개의 이야기",
      body: "사용자가 방향을 선택하고\nAI가 초안 제작을 돕습니다.",
      bgImage: null,
      fieldPositions: { tag: "top", title: "center", body: "bottom" },
      positions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      freePositions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      styles: JSON.parse(JSON.stringify(defaultStyles))
    },
    {
      id: 2,
      role: "본문",
      tag: "콘텐츠 제작",
      title: "핵심 키워드는\n내가 직접 선택",
      body: "클릭으로 방향을 선택하면\n생성된 3장 초안을 자유롭게 수정합니다.",
      bgImage: null,
      fieldPositions: { tag: "top", title: "center", body: "bottom" },
      positions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      freePositions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      styles: JSON.parse(JSON.stringify(defaultStyles))
    },
    {
      id: 3,
      role: "본문",
      tag: "콘텐츠 제작",
      title: "읽고, 고치고,\n완성하기",
      body: "좋은 기사를 완성할 때,\n내가 원하는 속도로 완성합니다.",
      bgImage: null,
      fieldPositions: { tag: "top", title: "center", body: "bottom" },
      positions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      freePositions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      styles: JSON.parse(JSON.stringify(defaultStyles))
    }
  ];

  const [cards, setCards] = useState(initialCards);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const activeCard = cards[activeCardIndex] || cards[0];

  // 구간별 텍스트 포커스/선택 상태 ('tag' | 'title' | 'body' | null)
  const [activeField, setActiveField] = useState("title");
  const [hoveredField, setHoveredField] = useState(null);
  const [focusedField, setFocusedField] = useState(null); // 실시간 텍스트 타이핑/수정 중인 필드
  const [isMouseOverActiveZone, setIsMouseOverActiveZone] = useState(false); // 활성 텍스트 + 툴바 영역 마우스 오버 여부

  // 자유 배치 모드 토글 상태
  const [isFreeLayoutMode, setIsFreeLayoutMode] = useState(false);

  // 인스타그램 스토리 스타일 자유 배치 중앙 가이드 스냅 상태
  const [isSnappedX, setIsSnappedX] = useState(false);
  const [isSnappedY, setIsSnappedY] = useState(false);
  const [dragCurrentPos, setDragCurrentPos] = useState(null); // 실시간 드래그 좌표 { x, y }

  // 마우스 드래그 추적 상태 (상중하 구역 스냅 & 자유 배치)
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedField, setDraggedField] = useState(null); // 'tag' | 'title' | 'body'
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragTargetZone, setDragTargetZone] = useState(null); // 'top' | 'center' | 'bottom'

  // 팔레트 팝오버 및 AI 메뉴 드롭다운 상태
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  // 저장 시간 상태 (LocalStorage 연동)
  const [lastSavedTime, setLastSavedTime] = useState(() => {
    try {
      const saved = localStorage.getItem("team01_news_card_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.savedAt || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  // 배포 성공 모달 상태
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  // 내 사진 파일 업로드 ref & 초안 파일 업로드 ref
  const fileInputRef = useRef(null);
  const draftFileInputRef = useRef(null);

  // Unsplash 검색 모달 상태
  const [showUnsplashModal, setShowUnsplashModal] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState("콘텐츠 제작");
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [isUnsplashLoading, setIsUnsplashLoading] = useState(false);
  const [unsplashError, setUnsplashError] = useState("");

  // 동아일보 DB 보도사진 모달 상태 및 인라인 이미지 패널 상태 ('unsplash' | 'dongaDb' | null)
  const [showDongaDbModal, setShowDongaDbModal] = useState(false);
  const [activeImagePanel, setActiveImagePanel] = useState(null);

  // 현재 활성 카드의 속성 업데이트
  const updateActiveCard = (field, value) => {
    setCards((prev) =>
      prev.map((c, idx) => (idx === activeCardIndex ? { ...c, [field]: value } : c))
    );
  };

  // 현재 활성 카드의 특정 구간(tag/title/body) 스타일 업데이트
  const updateFieldStyle = (field, key, value) => {
    setCards((prev) =>
      prev.map((c, idx) => {
        if (idx !== activeCardIndex) return c;
        const currentStyles = c.styles || JSON.parse(JSON.stringify(defaultStyles));
        const fieldStyle = currentStyles[field] || defaultStyles[field];
        return {
          ...c,
          styles: {
            ...currentStyles,
            [field]: {
              ...fieldStyle,
              [key]: value
            }
          }
        };
      })
    );
  };


  // 잠금 (Lock/Unlock) 토글
  const toggleFieldLock = (targetField) => {
    const f = targetField || activeField;
    const currentStyles = activeCard.styles || defaultStyles;
    const isLocked = !!(currentStyles[f] || defaultStyles[f]).isLocked;
    updateFieldStyle(f, "isLocked", !isLocked);
    showToast(
      !isLocked
        ? `🔒 ${f === "tag" ? "상단" : f === "title" ? "중간" : "하단"} 영역이 잠겼습니다.`
        : `🔓 잠금이 해제되었습니다.`
    );
  };

  // ⭐ 통합 텍스트 좌표 조회 및 업데이트 (자유 배치 토글 시에도 위치가 변하지 않도록 일원화)
  const getFieldPosition = (card, field) => {
    if (card?.positions?.[field]) return card.positions[field];
    if (card?.freePositions?.[field]) return card.freePositions[field];
    if (field === "tag") return { x: 50, y: 16 };
    if (field === "title") return { x: 50, y: 48 };
    return { x: 50, y: 80 };
  };

  const updateFieldPosition = (field, newPos) => {
    setCards((prev) =>
      prev.map((card, idx) => {
        if (idx !== activeCardIndex) return card;
        const currentPositions = card.positions || {
          tag: { x: 50, y: 16 },
          title: { x: 50, y: 48 },
          body: { x: 50, y: 80 }
        };
        return {
          ...card,
          positions: {
            ...currentPositions,
            [field]: newPos
          },
          freePositions: {
            ...(card.freePositions || {}),
            [field]: newPos
          }
        };
      })
    );
  };

  // ⭐ 개별 텍스트 구역 조회 및 업데이트
  const getFieldZone = (field) => {
    return activeCard.fieldPositions?.[field] || (field === "tag" ? "top" : field === "title" ? "center" : "bottom");
  };

  const updateFieldZone = (field, newZone) => {
    setCards((prev) =>
      prev.map((card, idx) => {
        if (idx !== activeCardIndex) return card;
        const currentPositions = card.fieldPositions || { tag: "top", title: "center", body: "bottom" };
        return {
          ...card,
          fieldPositions: {
            ...currentPositions,
            [field]: newZone
          }
        };
      })
    );
  };

  // ⭐ 마우스 드래그를 통한 상·중·하 개별 이동 및 자유 이동 핸들러 (인스타그램 스토리 스타일 가이드 지원)
  const handleStartFieldDrag = (e, field) => {
    const fieldStyle = (activeCard.styles || defaultStyles)[field] || defaultStyles[field];
    if (fieldStyle.isLocked) {
      // 잠금 상태에서도 클릭하여 선택하고 툴바(잠금 해제 버튼)를 띄울 수 있도록 허용
      setActiveField(field);
      setIsMouseOverActiveZone(true);
      return;
    }

    // 만약 이미 포커스되어 수정 중인 상태에서 input/textarea 내부를 클릭했다면 기본 타이핑 동작 허용
    if (focusedField === field && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let didDrag = false;

    const handleMouseMove = (moveEvent) => {
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (distance > 4) {
        if (!didDrag) {
          didDrag = true;
          setIsDragging(true);
          setDraggedField(field);
        }
        setMousePos({ x: moveEvent.clientX, y: moveEvent.clientY });

        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          if (isFreeLayoutMode) {
            // 자유 배치 모드: 마우스 위치에 맞춰 실시간 좌표 계산 + 인스타그램 스토리 중앙 가이드라인 스냅
            let relX = Math.max(12, Math.min(88, Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100)));
            let relY = Math.max(10, Math.min(90, Math.round(((moveEvent.clientY - rect.top) / rect.height) * 100)));

            const snapThreshold = 3.5;
            let snappedX = false;
            let snappedY = false;

            // X축 중앙 (50%) 스냅 감지
            if (Math.abs(relX - 50) <= snapThreshold) {
              relX = 50;
              snappedX = true;
            }
            // Y축 중앙 (50%) 스냅 감지
            if (Math.abs(relY - 50) <= snapThreshold) {
              relY = 50;
              snappedY = true;
            }

            setIsSnappedX(snappedX);
            setIsSnappedY(snappedY);
            setDragCurrentPos({ x: relX, y: relY });
          } else {
            // 틀 맞춤 (스냅) 모드
            const relY = moveEvent.clientY - rect.top;
            const height = rect.height;
            if (relY < height * 0.35) {
              setDragTargetZone("top");
            } else if (relY < height * 0.68) {
              setDragTargetZone("center");
            } else {
              setDragTargetZone("bottom");
            }
          }
        }
      }
    };

    const handleMouseUp = (upEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (didDrag) {
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          if (isFreeLayoutMode) {
            let finalX = Math.max(12, Math.min(88, Math.round(((upEvent.clientX - rect.left) / rect.width) * 100)));
            let finalY = Math.max(10, Math.min(90, Math.round(((upEvent.clientY - rect.top) / rect.height) * 100)));
            if (Math.abs(finalX - 50) <= 3.5) finalX = 50;
            if (Math.abs(finalY - 50) <= 3.5) finalY = 50;

            updateFieldPosition(field, { x: finalX, y: finalY });
            showToast(`✨ ${field === "tag" ? "태그" : field === "title" ? "제목" : "본문"}가 자유 위치로 이동되었습니다`);
          } else {
            const relY = upEvent.clientY - rect.top;
            const height = rect.height;
            const targetZone = relY < height * 0.35 ? "top" : relY < height * 0.68 ? "center" : "bottom";
            const zoneY = targetZone === "top" ? 16 : targetZone === "center" ? 48 : 80;
            updateFieldPosition(field, { x: 50, y: zoneY });
            updateFieldZone(field, targetZone);
            showToast(`📍 ${field === "tag" ? "태그" : field === "title" ? "제목" : "본문"}가 ${targetZone === "top" ? "상단" : targetZone === "center" ? "중간" : "하단"} 구역으로 이동되었습니다`);
          }
        }
        setIsDragging(false);
        setDraggedField(null);
        setDragTargetZone(null);
        setDragCurrentPos(null);
        setIsSnappedX(false);
        setIsSnappedY(false);
      } else {
        // 단순 클릭: 텍스트 박스 선택 및 포커스, 툴바 노출
        setActiveField(field);
        setFocusedField(field);
        setIsMouseOverActiveZone(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // ⭐ 상단/중간/하단 틀 맞춤 및 문구 설정 프리셋
  const handleApplyPlacementPreset = (pos) => {
    updateActiveCard("contentPosition", pos);
    let newPositions = {
      tag: { x: 50, y: 16 },
      title: { x: 50, y: 48 },
      body: { x: 50, y: 80 }
    };
    if (pos === "top") {
      newPositions = { tag: { x: 50, y: 14 }, title: { x: 50, y: 28 }, body: { x: 50, y: 44 } };
    } else if (pos === "center") {
      newPositions = { tag: { x: 50, y: 34 }, title: { x: 50, y: 48 }, body: { x: 50, y: 64 } };
    } else if (pos === "bottom") {
      newPositions = { tag: { x: 50, y: 56 }, title: { x: 50, y: 70 }, body: { x: 50, y: 84 } };
    }

    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIndex
          ? {
              ...c,
              contentPosition: pos,
              fieldPositions: { tag: pos, title: pos, body: pos },
              positions: newPositions,
              freePositions: newPositions
            }
          : c
      )
    );
    if (pos === "top") setActiveField("tag");
    else if (pos === "center") setActiveField("title");
    else if (pos === "bottom") setActiveField("body");
    showToast(`📐 ${pos === "top" ? "상단" : pos === "center" ? "중간" : "하단"} 틀에 맞춰 정렬 및 설정되었습니다.`);
  };

  // AI 텍스트 다듬기 변환 프리셋 실행
  const handleApplyAiPreset = (presetType) => {
    const currentText = activeCard[activeField] || "";
    let newText = currentText;

    if (activeField === "title") {
      switch (presetType) {
        case "refine":
          newText = "하나의 기사,\n무한한 인사이트의 시작";
          break;
        case "hook":
          newText = "초거대 AI 시대,\n단 하나의 질문이 바꾼다";
          break;
        case "formal":
          newText = "디지털 뉴스룸 혁신,\n차세대 콘텐츠 아키텍처";
          break;
        case "summarize":
          newText = "기사 한 편으로\n완성하는 멀티 카드";
          break;
        default:
          break;
      }
    } else if (activeField === "body") {
      switch (presetType) {
        case "refine":
          newText = "방향만 정하면 인공지능이 최적의 흐름을 제안하고,\n원하는 스타일로 손쉽게 다듬을 수 있습니다.";
          break;
        case "hook":
          newText = "기획부터 배포까지 걸리는 시간 단 3분,\n지금 바로 달라진 작업 방식을 경험해보세요.";
          break;
        case "formal":
          newText = "정밀한 분석 알고리즘을 토대로\n고품질 카드 뉴스 초안을 체계적으로 생성합니다.";
          break;
        case "summarize":
          newText = "핵심 키워드 추출과 초안 자동 생성을 통해\n신속한 배포를 지원합니다.";
          break;
        default:
          break;
      }
    } else {
      newText = presetType === "formal" ? "심층 기획 리포트" : "AI 트렌드 인사이트";
    }

    updateActiveCard(activeField, newText);
    setShowAiMenu(false);
    showToast("✨ AI가 텍스트를 최적화하여 다듬었습니다.");
  };

  // 새 카드 추가
  const handleAddCard = () => {
    const newId = Date.now();
    const newCard = {
      id: newId,
      role: "본문",
      tag: "콘텐츠 제작",
      title: "새 카드 제목",
      body: "내용을 입력하세요.",
      bgImage: null,
      bgGradient: "linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%)",
      fieldPositions: { tag: "top", title: "center", body: "bottom" },
      positions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      freePositions: { tag: { x: 50, y: 16 }, title: { x: 50, y: 48 }, body: { x: 50, y: 80 } },
      styles: JSON.parse(JSON.stringify(defaultStyles))
    };
    setCards((prev) => [...prev, newCard]);
    setActiveCardIndex(cards.length);
    setActiveField("title");
    showToast("새 카드가 추가되었습니다.");
  };

  // 카드 삭제
  const handleDeleteCard = (idx, e) => {
    e.stopPropagation();
    if (cards.length <= 1) {
      showToast("최소 1장의 카드는 유지되어야 합니다.");
      return;
    }
    const newCards = cards.filter((_, i) => i !== idx);
    setCards(newCards);
    if (activeCardIndex >= newCards.length) {
      setActiveCardIndex(newCards.length - 1);
    }
    showToast("카드가 삭제되었습니다.");
  };

  // 내 사진 업로드
  const handleUploadLocalImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const imageUrl = uploadEvent.target?.result;
      updateActiveCard("bgImage", imageUrl);
      showToast("내 사진이 카드 배경으로 적용되었습니다.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 검정 배경으로 변경
  const handleResetBlackBg = () => {
    updateActiveCard("bgImage", null);
    showToast("검정 배경으로 변경되었습니다.");
  };

  // Unsplash 사진 검색
  const handleSearchUnsplash = async (queryToSearch) => {
    const q = queryToSearch || unsplashQuery;
    if (!q.trim()) return;
    setIsUnsplashLoading(true);
    setUnsplashError("");
    try {
      const data = await searchUnsplashPhotos(q, 1, 16);
      setUnsplashResults(data.results || []);
      if (!data.results || data.results.length === 0) {
        setUnsplashError(`"${q}"에 대한 검색 결과가 없습니다.`);
      }
    } catch (err) {
      setUnsplashError(err.message || "사진 검색 중 오류가 발생했습니다.");
    } finally {
      setIsUnsplashLoading(false);
    }
  };

  // Unsplash 사진 선택 적용
  const handleSelectUnsplashPhoto = (photoUrl) => {
    updateActiveCard("bgImage", photoUrl);
    setInstagramImage(photoUrl);
    setShowUnsplashModal(false);
    showToast("사진이 성공적으로 적용되었습니다.");
  };

  // 플랫폼 이미지 직접 업로드
  const handleUploadPlatformImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const imageUrl = uploadEvent.target?.result;
      setInstagramImage(imageUrl);
      updateActiveCard("bgImage", imageUrl);
      showToast("내 사진이 성공적으로 적용되었습니다.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 초안 저장 핸들러
  const handleSaveDraft = () => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedTime(timeStr);
      const draft = {
        cards,
        selectedPlatforms,
        activePlatform,
        activeCardIndex,
        instagramCaption,
        instagramHashtags,
        threadsList,
        savedAt: timeStr,
        savedDate: now.toISOString()
      };
      localStorage.setItem("team01_news_card_draft", JSON.stringify(draft));
      showToast(`초안이 저장되었습니다. (${timeStr})`);
    } catch {
      showToast("초안 저장에 실패했습니다.");
    }
  };

  // 초안 불러오기 핸들러 (localStorage)
  const handleLoadDraft = () => {
    try {
      const raw = localStorage.getItem("team01_news_card_draft");
      if (!raw) {
        showToast("저장된 초안이 없습니다.");
        return;
      }
      const draft = JSON.parse(raw);
      if (draft.cards && Array.isArray(draft.cards) && draft.cards.length > 0) {
        setCards(draft.cards);
        if (draft.selectedPlatforms) setSelectedPlatforms(draft.selectedPlatforms);
        if (draft.activePlatform) setActivePlatform(draft.activePlatform);
        if (draft.activeCardIndex !== undefined) setActiveCardIndex(Math.min(draft.activeCardIndex, draft.cards.length - 1));
        if (draft.instagramCaption) setInstagramCaption(draft.instagramCaption);
        if (draft.instagramHashtags) setInstagramHashtags(draft.instagramHashtags);
        if (draft.threadsList) setThreadsList(draft.threadsList);
        if (draft.savedAt) setLastSavedTime(draft.savedAt);
        showToast(`초안을 불러왔습니다. (${draft.savedAt || "저장본"})`);
      } else {
        showToast("저장된 초안 데이터가 올바르지 않습니다.");
      }
    } catch {
      showToast("초안을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 내 문서에서 초안 불러오기 핸들러 (.json)
  const handleLoadFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) return;
        const parsed = JSON.parse(text);
        if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
          setCards(parsed.cards);
          if (parsed.selectedPlatforms) setSelectedPlatforms(parsed.selectedPlatforms);
          if (parsed.activePlatform) setActivePlatform(parsed.activePlatform);
          if (parsed.activeCardIndex !== undefined) setActiveCardIndex(Math.min(parsed.activeCardIndex, parsed.cards.length - 1));
          if (parsed.instagramCaption) setInstagramCaption(parsed.instagramCaption);
          if (parsed.instagramHashtags) setInstagramHashtags(parsed.instagramHashtags);
          if (parsed.threadsList) setThreadsList(parsed.threadsList);
          showToast(`내 문서의 "${file.name}" 초안을 불러왔습니다.`);
        } else {
          showToast("초안 파일 형식(cards 데이터)이 올바르지 않습니다.");
        }
      } catch {
        showToast("초안 파일(.json)을 파싱할 수 없습니다.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 배포하기 핸들러
  const handlePublish = () => {
    setIsPublishModalOpen(true);
  };

  // 현재 카드 JPG 다운로드 (HTML Canvas 1080x1350)
  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentStyles = activeCard.styles || defaultStyles;
    const tagStyle = currentStyles.tag || defaultStyles.tag;
    const titleStyle = currentStyles.title || defaultStyles.title;
    const bodyStyle = currentStyles.body || defaultStyles.body;

    const renderTextAndDownload = () => {
      // 그라데이션 오버레이
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      grad.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 태그 렌더링
      ctx.fillStyle = tagStyle.color || "#A1A1AA";
      ctx.font = `${tagStyle.isItalic ? "italic " : ""}${tagStyle.isBold ? "bold " : "normal "}${tagStyle.fontSize * 2.5}px sans-serif`;
      ctx.textAlign = tagStyle.align || "left";
      const tagX = tagStyle.align === "center" ? 540 : tagStyle.align === "right" ? 1000 : 80;
      ctx.fillText(activeCard.tag || "콘텐츠 제작", tagX, 860);

      // 제목 렌더링
      ctx.fillStyle = titleStyle.color || "#FFFFFF";
      ctx.font = `${titleStyle.isItalic ? "italic " : ""}${titleStyle.isBold ? "bold " : "normal "}${titleStyle.fontSize * 2.2}px sans-serif`;
      ctx.textAlign = titleStyle.align || "left";
      const titleX = titleStyle.align === "center" ? 540 : titleStyle.align === "right" ? 1000 : 80;
      const titleLines = (activeCard.title || "").split("\n");
      titleLines.forEach((line, idx) => {
        ctx.fillText(line, titleX, 940 + idx * 76);
      });

      // 본문 렌더링
      ctx.fillStyle = bodyStyle.color || "#E4E4E7";
      ctx.font = `${bodyStyle.isItalic ? "italic " : ""}${bodyStyle.isBold ? "bold " : "normal "}${bodyStyle.fontSize * 2.4}px sans-serif`;
      ctx.textAlign = bodyStyle.align || "left";
      const bodyX = bodyStyle.align === "center" ? 540 : bodyStyle.align === "right" ? 1000 : 80;
      const bodyLines = (activeCard.body || "").split("\n");
      const startY = 940 + titleLines.length * 76 + 25;
      bodyLines.forEach((line, idx) => {
        ctx.fillText(line, bodyX, startY + idx * 48);
      });

      // 다운로드 링크 트리거
      const link = document.createElement("a");
      link.download = `news-card-${activeCardIndex + 1}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      showToast(`${activeCardIndex + 1}번 카드가 다운로드되었습니다.`);
    };

    if (activeCard.bgImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
        renderTextAndDownload();
      };
      img.onerror = () => {
        ctx.fillStyle = "#18181B";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderTextAndDownload();
      };
      img.src = activeCard.bgImage;
    } else {
      ctx.fillStyle = "#18181B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      renderTextAndDownload();
    }
  };

  // 컬러 팔레트 목록
  const colorPalette = [
    { label: "화이트", value: "#FFFFFF" },
    { label: "웜 앰버", value: "#F4A940" },
    { label: "라이트 골드", value: "#FDE68A" },
    { label: "에메랄드", value: "#6EE7B7" },
    { label: "스카이 블루", value: "#93C5FD" },
    { label: "소프트 로즈", value: "#FCA5A5" },
    { label: "실버 그레이", value: "#A1A1AA" }
  ];



  // ────────────────────────────────────────────────────────
  // ⭐ 개별 텍스트 블록 렌더링 컴포넌트
  // 텍스트가 있는 범위에만 테두리가 타이트하게 감싸지도록 (인스타그램 스토리 스티커 스타일)
  // ────────────────────────────────────────────────────────
  const renderField = (field) => {
    const s = (activeCard.styles || defaultStyles)[field] || defaultStyles[field];
    const isEditing = focusedField === field;
    const isSelected = activeField === field;
    const isBeingDragged = isDragging && draggedField === field;

    return (
      <div
        key={field}
        onMouseDown={(e) => handleStartFieldDrag(e, field)}
        onClick={() => {
          setActiveField(field);
          setIsMouseOverActiveZone(true);
        }}
        onMouseEnter={() => {
          setHoveredField(field);
          if (activeField === field) {
            setIsMouseOverActiveZone(true);
          }
        }}
        onMouseLeave={(e) => {
          // 커서가 텍스트 박스와 툴바 영역을 완전히 벗어났을 때만 바가 사라지도록 처리
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsMouseOverActiveZone(false);
            setShowColorPicker(false);
            setShowAiMenu(false);
          }
        }}
        className={`relative inline-flex flex-col items-start w-[86%] p-2 rounded-xl transition-all ${
          s.isLocked
            ? "cursor-pointer opacity-85 ring-1 ring-amber-400/50 bg-amber-500/5 hover:ring-amber-400"
            : isBeingDragged
            ? isFreeLayoutMode
              ? "cursor-grabbing ring-2 ring-[#8ECAE6] border border-dashed border-[#8ECAE6] bg-[#8ECAE6]/15 shadow-xl scale-[1.03]"
              : "cursor-grabbing ring-2 ring-[#F4A940] border border-dashed border-[#F4A940] bg-[#F4A940]/15 shadow-xl scale-[1.03]"
            : isEditing
            ? isFreeLayoutMode
              ? "cursor-text ring-1 ring-[#8ECAE6] bg-white/10"
              : "cursor-text ring-1 ring-white/60 bg-white/10"
            : isSelected
            ? isFreeLayoutMode
              ? "cursor-grab active:cursor-grabbing ring-1.5 ring-[#8ECAE6] border border-dashed border-[#8ECAE6]/80 bg-[#8ECAE6]/5 shadow-md"
              : "cursor-grab active:cursor-grabbing ring-1.5 ring-[#F4A940] border border-dashed border-[#F4A940]/60 bg-white/5 shadow-md"
            : isFreeLayoutMode
            ? "cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-[#8ECAE6]/40 hover:bg-white/5"
            : "cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-white/25 hover:bg-white/5"
        } ${isBeingDragged ? "z-40" : ""}`}
      >
        {/* 필드별 입력 엘리먼트 (중앙왼쪽 정렬 고정) */}
        {field === "tag" ? (
          <div className="relative inline-grid items-center justify-start min-w-[50px] max-w-full">
            {/* 텍스트 폭을 정확하게 측정해주는 고스트 엘리먼트 */}
            <span
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 px-2.5 py-0.5 whitespace-pre select-none pointer-events-none tracking-tight text-left"
              style={{
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textAlign: "left",
                fontFamily: "inherit"
              }}
            >
              {activeCard.tag || "콘텐츠 제작"}
            </span>
            <input
              type="text"
              disabled={s.isLocked}
              value={activeCard.tag || ""}
              onFocus={() => {
                setActiveField("tag");
                setFocusedField("tag");
                setIsMouseOverActiveZone(true);
              }}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => updateActiveCard("tag", e.target.value)}
              placeholder="콘텐츠 제작"
              style={{
                color: s.color,
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textDecoration: `${s.isUnderline ? "underline " : ""}${s.isStrike ? "line-through" : ""}`.trim() || "none",
                textAlign: "left"
              }}
              className={`col-start-1 row-start-1 w-full bg-transparent outline-none px-2.5 py-0.5 tracking-tight text-left transition ${
                s.isLocked ? "cursor-pointer" : isEditing ? "cursor-text select-text" : "cursor-grab"
              }`}
            />
            {s.isLocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldLock(field);
                }}
                className="absolute -right-8 top-1/2 -translate-y-1/2 text-sky-200 hover:text-[#1E293B] bg-black/85 hover:bg-[#8ECAE6] transition-all px-1.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer shadow-md ring-1 ring-[#8ECAE6]/60 text-[9px] font-bold z-20"
                title="클릭하여 잠금 해제"
              >
                <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>해제</span>
              </button>
            )}
          </div>
        ) : field === "title" ? (
          <div className="relative inline-grid items-center justify-start min-w-[70px] max-w-full">
            {/* 줄바꿈 및 글자 폭을 완벽하게 반영하는 고스트 엘리먼트 */}
            <span
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 px-2.5 py-1 whitespace-pre-wrap break-words select-none pointer-events-none leading-tight tracking-tight text-left"
              style={{
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textAlign: "left",
                fontFamily: "inherit"
              }}
            >
              {(activeCard.title || "하나의 기사,\n여러 개의 이야기") + " "}
            </span>
            <textarea
              rows={activeCard.title ? activeCard.title.split("\n").length : 2}
              disabled={s.isLocked}
              value={activeCard.title || ""}
              onFocus={() => {
                setActiveField("title");
                setFocusedField("title");
                setIsMouseOverActiveZone(true);
              }}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => updateActiveCard("title", e.target.value)}
              placeholder="하나의 기사,\n여러 개의 이야기"
              style={{
                color: s.color,
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textDecoration: `${s.isUnderline ? "underline " : ""}${s.isStrike ? "line-through" : ""}`.trim() || "none",
                textAlign: "left"
              }}
              className={`col-start-1 row-start-1 w-full h-full bg-transparent outline-none resize-none px-2.5 py-1 leading-tight tracking-tight text-left transition ${
                s.isLocked ? "cursor-pointer" : isEditing ? "cursor-text select-text" : "cursor-grab"
              }`}
            />
            {s.isLocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldLock(field);
                }}
                className="absolute -top-3 -right-3 text-sky-200 hover:text-[#1E293B] bg-black/85 hover:bg-[#8ECAE6] transition-all px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer shadow-md ring-1 ring-[#8ECAE6]/60 text-[10px] font-bold z-20"
                title="클릭하여 잠금 해제"
              >
                <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>잠금 해제</span>
              </button>
            )}
          </div>
        ) : (
          <div className="relative inline-grid items-center justify-start min-w-[70px] max-w-full">
            <span
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 px-2.5 py-1 whitespace-pre-wrap break-words select-none pointer-events-none leading-relaxed tracking-tight text-left"
              style={{
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textAlign: "left",
                fontFamily: "inherit"
              }}
            >
              {(activeCard.body || "사용자가 방향을 선택하고\nAI가 초안 제작을 돕습니다.") + " "}
            </span>
            <textarea
              rows={activeCard.body ? activeCard.body.split("\n").length : 3}
              disabled={s.isLocked}
              value={activeCard.body || ""}
              onFocus={() => {
                setActiveField("body");
                setFocusedField("body");
                setIsMouseOverActiveZone(true);
              }}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => updateActiveCard("body", e.target.value)}
              placeholder="사용자가 방향을 선택하고\nAI가 초안 제작을 돕습니다."
              style={{
                color: s.color,
                fontSize: `${s.fontSize}px`,
                fontWeight: s.isBold ? "bold" : "normal",
                fontStyle: s.isItalic ? "italic" : "normal",
                textDecoration: `${s.isUnderline ? "underline " : ""}${s.isStrike ? "line-through" : ""}`.trim() || "none",
                textAlign: "left"
              }}
              className={`col-start-1 row-start-1 w-full h-full bg-transparent outline-none resize-none px-2.5 py-1 leading-relaxed tracking-tight text-left transition ${
                s.isLocked ? "cursor-pointer" : isEditing ? "cursor-text select-text" : "cursor-grab"
              }`}
            />
            {s.isLocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldLock(field);
                }}
                className="absolute -top-3 -right-3 text-sky-200 hover:text-[#1E293B] bg-black/85 hover:bg-[#8ECAE6] transition-all px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer shadow-md ring-1 ring-[#8ECAE6]/60 text-[10px] font-bold z-20"
                title="클릭하여 잠금 해제"
              >
                <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>잠금 해제</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-5 animate-fade-in text-[#292B2F]">
      {/* ──────────────────────────────────────────
          1. 최상단 헤더 바
          [NEWSROOM / CONTENT STUDIO]
          [뉴스 카드 편집실]
          [우측: 저장 시간 + 저장하기 버튼 + 배포하기 버튼]
         ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E2D9]">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-stone-600 block uppercase font-bold">
            NEWSROOM / CONTENT STUDIO
          </span>
          <h2 className="text-xl md:text-2xl font-black text-[#292B2F] tracking-tight">
            플랫폼 배포
          </h2>
        </div>

        {/* 저장 시간, 저장하기, 배포하기 버튼 그룹 */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* 저장 시간 인디케이터 */}
          {lastSavedTime ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[11px] font-mono font-medium text-stone-600 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>저장 {lastSavedTime}</span>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-stone-600 hidden sm:block px-2">
              저장 기록 없음
            </div>
          )}

          {/* 초안 액션 버튼 영역 (도형 구분 배제, 'ㅣ' 구분선, 부드러운 물방울 무빙 인디케이터) */}
          <div
            ref={draftBtnContainerRef}
            onMouseLeave={() => updateDraftBubblePosition(activeDraftAction)}
            className="relative flex items-center gap-1.5 px-1 py-1 select-none"
          >
            {/* 부드러운 물방울 형태의 투명감 있는 이동 인디케이터 */}
            {draftBubbleStyle.isReady && (
              <span
                className="absolute h-8 rounded-full pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                style={{
                  left: `${draftBubbleStyle.left}px`,
                  width: `${draftBubbleStyle.width}px`,
                  backgroundColor: "rgba(15, 23, 42, 0.08)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px rgba(255, 255, 255, 0.8)",
                }}
              />
            )}

            {/* 1. 초안 저장 버튼 */}
            <button
              ref={(el) => (draftBtnRefs.current["save"] = el)}
              type="button"
              onMouseEnter={() => updateDraftBubblePosition("save")}
              onClick={() => {
                setActiveDraftAction("save");
                handleSaveDraft();
              }}
              className={`relative z-10 px-3 py-1.5 text-xs tracking-tight transition-colors duration-200 cursor-pointer whitespace-nowrap rounded-full ${
                activeDraftAction === "save"
                  ? "text-stone-950 font-bold"
                  : "text-stone-500 hover:text-stone-800 font-medium"
              }`}
              title="현재 작업 중인 카드 초안을 저장합니다"
            >
              초안 저장
            </button>

            {/* 구분선 ㅣ */}
            <span className="text-stone-300 select-none text-xs font-light z-0">ㅣ</span>

            {/* 2. 초안 불러오기 버튼 */}
            <button
              ref={(el) => (draftBtnRefs.current["load"] = el)}
              type="button"
              onMouseEnter={() => updateDraftBubblePosition("load")}
              onClick={() => {
                setActiveDraftAction("load");
                handleLoadDraft();
              }}
              className={`relative z-10 px-3 py-1.5 text-xs tracking-tight transition-colors duration-200 cursor-pointer whitespace-nowrap rounded-full ${
                activeDraftAction === "load"
                  ? "text-stone-950 font-bold"
                  : "text-stone-500 hover:text-stone-800 font-medium"
              }`}
              title="저장된 카드 초안을 불러옵니다"
            >
              초안 불러오기
            </button>

            {/* 구분선 ㅣ */}
            <span className="text-stone-300 select-none text-xs font-light z-0">ㅣ</span>

            {/* 3. 내 문서에서 초안 불러오기 버튼 */}
            <button
              ref={(el) => (draftBtnRefs.current["file"] = el)}
              type="button"
              onMouseEnter={() => updateDraftBubblePosition("file")}
              onClick={() => {
                setActiveDraftAction("file");
                draftFileInputRef.current?.click();
              }}
              className={`relative z-10 px-3 py-1.5 text-xs tracking-tight transition-colors duration-200 cursor-pointer whitespace-nowrap rounded-full ${
                activeDraftAction === "file"
                  ? "text-stone-950 font-bold"
                  : "text-stone-500 hover:text-stone-800 font-medium"
              }`}
              title="내 문서(PC)에서 초안 파일(.json)을 불러옵니다"
            >
              내 문서에서 초안 불러오기
            </button>
          </div>
          <input
            type="file"
            ref={draftFileInputRef}
            accept=".json,application/json"
            onChange={handleLoadFromFile}
            className="hidden"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────
          2. 3단 메인 작업 영역
         ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ──────── [좌측 패널 (lg:col-span-3)]: 스크롤 시 화면을 따라오는 sticky 적용 ──────── */}
        <div className="lg:col-span-3 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
          
          {/* 1. 기사 제목과 부제목, 그 아래 기사 전문보기 버튼 */}
          <div className="pb-3.5 border-b border-stone-200/60 space-y-2">
            {/* 기사 제목 및 부제목만 노출 */}
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-[#292929] line-clamp-2 leading-snug">
                {activeArticle.title || "제목 없는 기사"}
              </p>
              {activeArticle.subtitle && (
                <p className="text-[11px] font-semibold text-[#57514A] line-clamp-2 leading-relaxed">
                  {activeArticle.subtitle}
                </p>
              )}
            </div>

            {/* 그 아래 기사 전문보기 버튼만 생성 */}
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setShowFullArticleModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#292929] hover:text-[#8ECAE6] transition-colors pt-1 cursor-pointer group"
              title="클릭 시 기사 전문 열람"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8ECAE6]" />
              <span>기사 전문 보기</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8ECAE6] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 2. 배포 플랫폼 선택 */}
          <div className="space-y-3 pb-3.5 border-b border-stone-200/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#292929]">플랫폼 선택 및 제작</h3>
            </div>

            {/* (1) 카드뉴스 생성 시작하기 */}
            <div className="space-y-1">
              <div
                onClick={() => {
                  setActivePlatform("cardnews");
                  if (!selectedPlatforms.includes("cardnews")) {
                    setSelectedPlatforms((prev) => [...prev, "cardnews"]);
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer select-none ${
                  activePlatform === "cardnews"
                    ? "bg-white border-[#8ECAE6] text-[#292929] shadow-2xs ring-1 ring-[#8ECAE6]/50"
                    : "bg-white/70 border-stone-200/80 text-stone-700 hover:bg-white"
                }`}
              >
                <span className={activePlatform === "cardnews" ? "text-[#292929] font-black" : "text-[#292929] font-bold"}>
                  {activePlatform === "cardnews" ? "카드뉴스 제작 중" : "카드뉴스 생성 시작하기"}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePlatform("cardnews");
                    if (!selectedPlatforms.includes("cardnews")) {
                      setSelectedPlatforms((prev) => [...prev, "cardnews"]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center cursor-pointer active:scale-95 ${
                    activePlatform === "cardnews"
                      ? "bg-[#8ECAE6] text-[#1E293B] shadow-2xs"
                      : "bg-stone-900 hover:bg-black text-white shadow-2xs"
                  }`}
                  title="카드뉴스 제작 화면으로 이동"
                >
                  <span>{activePlatform === "cardnews" ? "제작 중" : "제작하기"}</span>
                </button>
              </div>
            </div>

            {/* (2) 구분선 및 아래 배포 버튼 (인스타그램 & 스레드) */}
            <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-stone-700">배포 플랫폼</span>
                <span className="text-[10px] text-stone-400">SNS 연동</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: "instagram", label: "인스타그램", sub: "Instagram", badge: "피드" },
                  { id: "threads", label: "스레드", sub: "Threads", badge: "타래" }
                ].map((item) => {
                  const isActive = activePlatform === item.id;
                  const isChecked = selectedPlatforms.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActivePlatform(item.id);
                        if (!selectedPlatforms.includes(item.id)) {
                          setSelectedPlatforms((prev) => [...prev, item.id]);
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer select-none text-left ${
                        isActive
                          ? "bg-white border-[#8ECAE6] text-[#292929] shadow-2xs ring-1 ring-[#8ECAE6]/50"
                          : "bg-white/60 border-stone-200/70 text-stone-600 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlatform(item.id);
                          }}
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-[#8ECAE6] border-[#8ECAE6] text-[#1E293B]"
                              : "bg-white border-stone-300"
                          }`}
                          title="배포 대상 포함 여부"
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={isActive ? "text-[#292929] font-black" : "text-[#292929]"}>
                            {item.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({item.sub})
                          </span>
                        </div>
                      </div>
                      {isActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8ECAE6]/25 text-[#1E293B] font-black">
                          편집 화면
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-normal">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-[#999999] leading-relaxed pt-0.5">
              {activePlatform === "cardnews"
                ? "카드뉴스 규격(4:5) 제작 및 슬라이드 편집 화면입니다."
                : activePlatform === "instagram"
                ? "인스타그램 피드 이미지 및 캡션 배포 편집 화면입니다."
                : "스레드 타래 및 피드 글 배포 편집 화면입니다."}
            </p>
          </div>

          {/* 3. 플랫폼별 옵션 (카드뉴스 활성 시 사진 편집 도구 표시) */}
          {activePlatform === "cardnews" ? (
            <>
              {/* 편집 안내 */}
              <div className="space-y-1">
                <h3 className="text-xs font-black text-[#292929]">카드뉴스 편집 안내</h3>
                <p className="text-[11px] text-[#666666] leading-relaxed">
                  카드뉴스 내 텍스트를 직접 클릭하여 내용을 즉시 수정할 수 있으며, 규격에 맞춰 중앙왼쪽 정렬로 고정되어 깔끔하게 유지됩니다.
                </p>
              </div>
            </>
          ) : activePlatform === "instagram" ? (
            <div className="space-y-3.5">
              {/* Instagram 로컬 앱 연결 상단 텍스트 안내 */}
              <div className="space-y-1">
                <h3 className="text-xs font-black text-stone-900 leading-tight">Instagram 로컬 앱 연결</h3>
                <p className="text-[10px] text-stone-400 leading-snug">
                  계정 연결부터 게시 준비까지 진행 상태를 확인하세요.
                </p>
              </div>

              {/* 연결 시작하기 버튼 (선택 시 인스타그램 색상 활성화) */}
              <button
                type="button"
                onClick={() => setInstaConnectionStarted((prev) => !prev)}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  instaConnectionStarted
                    ? "bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs"
                    : "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 shadow-2xs"
                }`}
              >
                <span>{instaConnectionStarted ? "Instagram 로컬 앱 연결됨" : "연결 시작하기"}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                    instaConnectionStarted
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {instaConnectionStarted ? "연결 중" : "시작"}
                </span>
              </button>

              {/* 연결 시작하기 클릭 시 펼쳐지는 노드 영역 (외곽 박스 없이 노드 단독 표시) */}
              {instaConnectionStarted && (
                <div className="space-y-3 animate-smooth-in pt-1">
                  {/* 4단계 세로형 곡선 타임라인 워크플로우 */}
                  <div className="relative h-[272px] select-none">
                    {/* SVG 베지어 곡선 연결선 레이어 */}
                    {(() => {
                      const xBase = 20;
                      const xActive = 32;
                      const stepH = 68;
                      const totalH = stepH * 4;
                      const yCenter = 34 + instaActiveStep * stepH;
                      const yStart = Math.max(0, yCenter - 26);
                      const yEnd = Math.min(totalH, yCenter + 26);

                      const fullPathD = `
                        M ${xBase} 0
                        L ${xBase} ${yStart}
                        C ${xBase} ${yCenter - 11}, ${xActive} ${yCenter - 11}, ${xActive} ${yCenter}
                        C ${xActive} ${yCenter + 11}, ${xBase} ${yCenter + 11}, ${xBase} ${yEnd}
                        L ${xBase} ${totalH}
                      `;

                      const activeCurveD = `
                        M ${xBase} ${yStart}
                        C ${xBase} ${yCenter - 11}, ${xActive} ${yCenter - 11}, ${xActive} ${yCenter}
                        C ${xActive} ${yCenter + 11}, ${xBase} ${yCenter + 11}, ${xBase} ${yEnd}
                      `;

                      return (
                        <svg
                          className="absolute left-0 top-0 w-12 h-full pointer-events-none z-0"
                          viewBox={`0 0 48 ${totalH}`}
                        >
                          <defs>
                            <linearGradient id="instaPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FA7298" />
                              <stop offset="50%" stopColor="#E1306C" />
                              <stop offset="100%" stopColor="#C13584" />
                            </linearGradient>
                            <filter id="instaGlow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E1306C" floodOpacity="0.85" />
                            </filter>
                          </defs>
                          <path
                            d={fullPathD}
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                          <path
                            d={activeCurveD}
                            fill="none"
                            stroke="url(#instaPinkGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                          <circle
                            cx={xActive}
                            cy={yCenter}
                            r="5.5"
                            fill="#E1306C"
                            filter="url(#instaGlow)"
                            className="transition-all duration-300 ease-out"
                          />
                          <circle
                            cx={xActive}
                            cy={yCenter}
                            r="2.2"
                            fill="#FFFFFF"
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                      );
                    })()}

                    {/* 4개 단계 노드 */}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      {[
                        {
                          idx: 0,
                          title: "01. Instagram 계정 연결",
                          desc: "전용 창에서 계정을 연결합니다.",
                          status: instaAccountConnected ? "completed" : "pending",
                          icon: Check
                        },
                        {
                          idx: 1,
                          title: "02. 로그인 상태 확인",
                          desc: "전용 Instagram 창의 로그인 상태를 확인합니다.",
                          status:
                            instaLoginStatus === "checking"
                              ? "in_progress"
                              : instaLoginStatus === "verified"
                              ? "completed"
                              : "error",
                          icon: null
                        },
                        {
                          idx: 2,
                          title: "03. 원고·카드 준비",
                          desc: "현재 원고와 카드의 작성 상태를 확인합니다.",
                          status:
                            cards.length > 0 && instagramCaption
                              ? (instaActiveStep === 2 ? "in_progress" : "completed")
                              : (instaActiveStep === 2 ? "in_progress" : "pending"),
                          icon: FileText
                        },
                        {
                          idx: 3,
                          title: "04. 게시 준비 완료",
                          desc: "게시 전 필수 조건을 확인합니다.",
                          status:
                            instaActiveStep === 3
                              ? "in_progress"
                              : (instaAccountConnected && instaLoginStatus === "verified" && cards.length > 0)
                              ? "completed"
                              : "pending",
                          icon: Send
                        }
                      ].map((step) => {
                        const isActive = instaActiveStep === step.idx;
                        const isCompleted = step.status === "completed";
                        const isInProgress = step.status === "in_progress" || isActive;
                        const isError = step.status === "error";

                        return (
                          <div
                            key={step.idx}
                            onClick={() => setInstaActiveStep(step.idx)}
                            className={`h-[68px] flex items-center justify-between px-1.5 transition-all duration-200 cursor-pointer rounded-2xl ${
                              isActive
                                ? "bg-[#FDF2F8]/70 border border-[#FCE7F3]/80"
                                : "hover:bg-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-1">
                              <div className="w-10 flex items-center justify-center flex-shrink-0">
                                {isActive ? (
                                  <div className="w-6 h-6" />
                                ) : isCompleted ? (
                                  <div className="w-6 h-6 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center shadow-2xs">
                                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                                  </div>
                                ) : isError ? (
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shadow-2xs">
                                    {step.icon && <step.icon className="w-3.5 h-3.5 stroke-[2]" />}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-[11px] font-black text-stone-800 truncate leading-tight">
                                  {step.title}
                                </h4>
                                <p className="text-[9.5px] text-stone-400 truncate leading-tight mt-0.5">
                                  {step.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex-shrink-0 pl-1">
                              {isInProgress ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCE7F3] text-[#DB2777]">
                                  진행 중
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333]">
                                  완료
                                </span>
                              ) : isError ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  오류 안내
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                  대기 중
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 하단 전용 창 닫기 버튼 */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (instaAppWindowOpen) {
                          setInstaAppWindowOpen(false);
                          setInstaLoginStatus("verified");
                          setInstaActiveStep(2);
                          showToast("전용 창을 닫았습니다. 로그인 상태는 보존됩니다.");
                        } else {
                          setInstaAppWindowOpen(true);
                          setInstaLoginStatus("checking");
                          setInstaActiveStep(1);
                          showToast("전용 Instagram 창을 열었습니다.");
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-98 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      <span>
                        {instaAppWindowOpen
                          ? "전용 창 닫기 · 로그인 상태는 보존"
                          : "전용 창 열기 · 계정 상태 재확인"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 기존 카드뉴스 연동하기 및 배포 가이드 유지 */}
              <div className="space-y-2 pt-1 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setActivePlatform("cardnews")}
                  className="btn-pill-white w-full text-xs"
                  title="카드뉴스 화면으로 전환"
                >
                  <span>카드뉴스 연동하기</span>
                  <span className="btn-pill-badge" title="카드뉴스">
                    <Newspaper className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-black text-[#292929]">배포 가이드</h3>
                <p className="text-[11px] text-[#666666] leading-relaxed">
                  인스타그램 피드는 첫 125자가 더보기 전에 노출되므로, 서두에 핵심 헤드라인을 배치하는 것을 권장합니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Threads 로컬 앱 연결 상단 텍스트 안내 */}
              <div className="space-y-1">
                <h3 className="text-xs font-black text-stone-900 leading-tight">Threads 로컬 앱 연결</h3>
                <p className="text-[10px] text-stone-400 leading-snug">
                  계정 연결부터 타래 게시 준비까지 진행 상태를 확인하세요.
                </p>
              </div>

              {/* 연결 시작하기 버튼 (선택 시 스레드 시그니처 딥블랙 활성화) */}
              <button
                type="button"
                onClick={() => setThreadsConnectionStarted((prev) => !prev)}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  threadsConnectionStarted
                    ? "bg-[#101010] hover:bg-black text-white shadow-xs"
                    : "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 shadow-2xs"
                }`}
              >
                <span>{threadsConnectionStarted ? "Threads 로컬 앱 연결됨" : "연결 시작하기"}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                    threadsConnectionStarted
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {threadsConnectionStarted ? "연결 중" : "시작"}
                </span>
              </button>

              {/* 연결 시작하기 클릭 시 펼쳐지는 노드 영역 (외곽 박스 없이 노드 단독 표시) */}
              {threadsConnectionStarted && (
                <div className="space-y-3 animate-smooth-in pt-1">
                  {/* 4단계 세로형 곡선 타임라인 워크플로우 */}
                  <div className="relative h-[272px] select-none">
                    {/* SVG 베지어 곡선 연결선 레이어 */}
                    {(() => {
                      const xBase = 20;
                      const xActive = 32;
                      const stepH = 68;
                      const totalH = stepH * 4;
                      const yCenter = 34 + threadsActiveStep * stepH;
                      const yStart = Math.max(0, yCenter - 26);
                      const yEnd = Math.min(totalH, yCenter + 26);

                      const fullPathD = `
                        M ${xBase} 0
                        L ${xBase} ${yStart}
                        C ${xBase} ${yCenter - 11}, ${xActive} ${yCenter - 11}, ${xActive} ${yCenter}
                        C ${xActive} ${yCenter + 11}, ${xBase} ${yCenter + 11}, ${xBase} ${yEnd}
                        L ${xBase} ${totalH}
                      `;

                      const activeCurveD = `
                        M ${xBase} ${yStart}
                        C ${xBase} ${yCenter - 11}, ${xActive} ${yCenter - 11}, ${xActive} ${yCenter}
                        C ${xActive} ${yCenter + 11}, ${xBase} ${yCenter + 11}, ${xBase} ${yEnd}
                      `;

                      return (
                        <svg
                          className="absolute left-0 top-0 w-12 h-full pointer-events-none z-0"
                          viewBox={`0 0 48 ${totalH}`}
                        >
                          <defs>
                            <linearGradient id="threadsBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#71717A" />
                              <stop offset="50%" stopColor="#18181B" />
                              <stop offset="100%" stopColor="#09090B" />
                            </linearGradient>
                            <filter id="threadsGlow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#18181B" floodOpacity="0.4" />
                            </filter>
                          </defs>
                          <path
                            d={fullPathD}
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                          <path
                            d={activeCurveD}
                            fill="none"
                            stroke="url(#threadsBlackGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                          <circle
                            cx={xActive}
                            cy={yCenter}
                            r="5.5"
                            fill="#18181B"
                            filter="url(#threadsGlow)"
                            className="transition-all duration-300 ease-out"
                          />
                          <circle
                            cx={xActive}
                            cy={yCenter}
                            r="2.2"
                            fill="#FFFFFF"
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                      );
                    })()}

                    {/* 4개 단계 노드 */}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      {[
                        {
                          idx: 0,
                          title: "01. Threads 계정 연결",
                          desc: "전용 창에서 계정을 연결합니다.",
                          status: threadsAccountConnected ? "completed" : "pending",
                          icon: Check
                        },
                        {
                          idx: 1,
                          title: "02. 로그인 상태 확인",
                          desc: "전용 Threads 창의 로그인 상태를 확인합니다.",
                          status:
                            threadsLoginStatus === "checking"
                              ? "in_progress"
                              : threadsLoginStatus === "verified"
                              ? "completed"
                              : "error",
                          icon: null
                        },
                        {
                          idx: 2,
                          title: "03. 타래·원고 준비",
                          desc: "현재 원고와 타래(스레드)의 작성 상태를 확인합니다.",
                          status:
                            threadsList[0]?.content
                              ? (threadsActiveStep === 2 ? "in_progress" : "completed")
                              : (threadsActiveStep === 2 ? "in_progress" : "pending"),
                          icon: FileText
                        },
                        {
                          idx: 3,
                          title: "04. 게시 준비 완료",
                          desc: "타래 게시 전 필수 조건을 확인합니다.",
                          status:
                            threadsActiveStep === 3
                              ? "in_progress"
                              : (threadsAccountConnected && threadsLoginStatus === "verified" && threadsList[0]?.content)
                              ? "completed"
                              : "pending",
                          icon: Send
                        }
                      ].map((step) => {
                        const isActive = threadsActiveStep === step.idx;
                        const isCompleted = step.status === "completed";
                        const isInProgress = step.status === "in_progress" || isActive;
                        const isError = step.status === "error";

                        return (
                          <div
                            key={step.idx}
                            onClick={() => setThreadsActiveStep(step.idx)}
                            className={`h-[68px] flex items-center justify-between px-1.5 transition-all duration-200 cursor-pointer rounded-2xl ${
                              isActive
                                ? "bg-stone-100/90 border border-stone-200/90"
                                : "hover:bg-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-1">
                              <div className="w-10 flex items-center justify-center flex-shrink-0">
                                {isActive ? (
                                  <div className="w-6 h-6" />
                                ) : isCompleted ? (
                                  <div className="w-6 h-6 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center shadow-2xs">
                                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                                  </div>
                                ) : isError ? (
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shadow-2xs">
                                    {step.icon && <step.icon className="w-3.5 h-3.5 stroke-[2]" />}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="text-[11px] font-black text-stone-800 truncate leading-tight">
                                  {step.title}
                                </h4>
                                <p className="text-[9.5px] text-stone-400 truncate leading-tight mt-0.5">
                                  {step.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex-shrink-0 pl-1">
                              {isInProgress ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-900 text-white">
                                  진행 중
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333]">
                                  완료
                                </span>
                              ) : isError ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                  오류 안내
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                  대기 중
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 하단 전용 창 닫기 버튼 */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        if (threadsAppWindowOpen) {
                          setThreadsAppWindowOpen(false);
                          setThreadsLoginStatus("verified");
                          setThreadsActiveStep(2);
                          showToast("전용 창을 닫았습니다. 로그인 상태는 보존됩니다.");
                        } else {
                          setThreadsAppWindowOpen(true);
                          setThreadsLoginStatus("checking");
                          setThreadsActiveStep(1);
                          showToast("전용 Threads 창을 열었습니다.");
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-98 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                      <span>
                        {threadsAppWindowOpen
                          ? "전용 창 닫기 · 로그인 상태는 보존"
                          : "전용 창 열기 · 계정 상태 재확인"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 기존 카드뉴스 연동하기 및 Threads 배포 가이드 유지 */}
              <div className="space-y-2 pt-1 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setActivePlatform("cardnews")}
                  className="btn-pill-white w-full text-xs"
                  title="카드뉴스 화면으로 전환"
                >
                  <span>카드뉴스 연동하기</span>
                  <span className="btn-pill-badge" title="카드뉴스">
                    <Newspaper className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-black text-[#292929]">배포 가이드</h3>
                <p className="text-[11px] text-[#666666] leading-relaxed">
                  스레드는 타래당 최대 500자까지 작성할 수 있으며, 1번 글에 흥미를 유발하는 질문이나 핵심 결론을 제시하세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ──────── [카드뉴스 배포 화면 (activePlatform === "cardnews")]: 중앙 캔버스 & 우측 카드 목록 ──────── */}
        {activePlatform === "cardnews" && (
          <>
            {/* ──────── [중앙 패널 (lg:col-span-6)]: 카드 편집 캔버스 (스크롤 시 고정되어 따라오는 sticky 적용) ──────── */}
            <div className="lg:col-span-6 sticky top-4 self-start bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 relative z-10">
          {/* 상단 메타 바: N번 카드 수정 중 + 인스타 스레드 배포하기 버튼 */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black text-[#292929]">
                {activeCardIndex + 1}번 카드 수정 중
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* 오른쪽 상단: Instagram & Threads 영문 표기 및 배포하기 이동 버튼 */}
              <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform("instagram");
                    showToast("📱 Instagram 편집 화면으로 이동했습니다.");
                  }}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-stone-700 hover:text-stone-950 hover:bg-white transition cursor-pointer"
                  title="Instagram 편집 화면으로 이동"
                >
                  Instagram
                </button>
                <span className="text-stone-300 text-[10px]">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatform("threads");
                    showToast("🧵 Threads 편집 화면으로 이동했습니다.");
                  }}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-stone-700 hover:text-stone-950 hover:bg-white transition cursor-pointer"
                  title="Threads 편집 화면으로 이동"
                >
                  Threads
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetPlatform = selectedPlatforms.includes("threads") && !selectedPlatforms.includes("instagram") ? "threads" : "instagram";
                    setActivePlatform(targetPlatform);
                    showToast("🚀 배포를 위한 편집 화면으로 이동했습니다.");
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-stone-900 hover:bg-black text-white text-[11px] font-black transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 ml-0.5"
                  title="스레드 및 인스타그램 편집화면으로 이동"
                >
                  <Send className="w-2.5 h-2.5 text-[#8ECAE6]" />
                  <span>배포하기</span>
                </button>
              </div>
            </div>
          </div>

          {/* 중앙 카드 미리보기 (솔리드 블랙 4:5 비율 캔버스 - overflow-visible로 툴바 노출) */}
          <div className="py-6 flex items-center justify-center relative">
            <div
              ref={cardRef}
              className="w-full max-w-[430px] aspect-[4/5] rounded-2xl shadow-2xl relative select-none border border-zinc-900 transition-all overflow-visible"
            >
              {/* 내부 배경 및 그라데이션 레이어 (rounded & overflow-hidden) - 솔리드 블랙 유지 */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                style={{
                  backgroundColor: activeCard.bgImage ? "transparent" : "#18181B",
                  backgroundImage: activeCard.bgImage
                    ? `url(${activeCard.bgImage})`
                    : (activeCard.bgGradient || "linear-gradient(90deg, #18181B 0%, #27272A 50%, #18181B 100%)"),
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
              </div>

              {/* ⭐ 인스타그램 스토리 스타일 파란색 점선 중앙 가이드라인 (자유 배치 모드 드래그 시) */}
              {isFreeLayoutMode && isDragging && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20">
                  {/* 수직 중앙선 (V-Center Line: 50%) */}
                  <div
                    className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed transition-all duration-150 ${
                      isSnappedX
                        ? "border-[#8ECAE6] shadow-[0_0_14px_rgba(142,202,230,0.95)] opacity-100"
                        : "border-[#8ECAE6]/50 opacity-50"
                    }`}
                  />

                  {/* 수평 중앙선 (H-Center Line: 50%) */}
                  <div
                    className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed transition-all duration-150 ${
                      isSnappedY
                        ? "border-[#8ECAE6] shadow-[0_0_14px_rgba(142,202,230,0.95)] opacity-100"
                        : "border-[#8ECAE6]/50 opacity-50"
                    }`}
                  />

                  {/* 인스타그램 스타일 중앙 스냅 뱃지 알림 */}
                  {(isSnappedX || isSnappedY) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#8ECAE6] text-[#1E293B] px-3 py-1 rounded-full text-[11px] font-black shadow-[0_4px_16px_rgba(142,202,230,0.6)] flex items-center gap-1.5 animate-smooth-pop">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E293B] animate-ping" />
                      <span>
                        {isSnappedX && isSnappedY
                          ? "정중앙 맞춤 (Instagram Center)"
                          : isSnappedX
                          ? "수직 중앙선 맞춤"
                          : "수평 중앙선 맞춤"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ⭐ 틀 맞춤 모드 시 마우스 드래그 중 실시간으로 나타나는 점선 가이드 박스 */}
              {!isFreeLayoutMode && (
                <div
                  className={`absolute inset-x-5 inset-y-5 pointer-events-none flex flex-col justify-between z-20 transition-all duration-300 ease-out ${
                    isDragging
                      ? "opacity-100 scale-100 pointer-events-none"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div
                    className={`h-24 rounded-xl border-2 border-dashed transition-all duration-300 ease-out flex items-center justify-center text-xs font-black ${
                      dragTargetZone === "top"
                        ? "border-[#8ECAE6] bg-[#8ECAE6]/25 text-[#1E293B] shadow-lg scale-[1.02]"
                        : "border-white/20 text-white/30"
                    }`}
                  >
                    <span>상단 배치 영역</span>
                  </div>
                  <div
                    className={`h-28 rounded-xl border-2 border-dashed transition-all duration-300 ease-out flex items-center justify-center text-xs font-black ${
                      dragTargetZone === "center"
                        ? "border-[#8ECAE6] bg-[#8ECAE6]/25 text-[#1E293B] shadow-lg scale-[1.02]"
                        : "border-white/20 text-white/30"
                    }`}
                  >
                    <span>중간 배치 영역</span>
                  </div>
                  <div
                    className={`h-24 rounded-xl border-2 border-dashed transition-all duration-300 ease-out flex items-center justify-center text-xs font-black ${
                      dragTargetZone === "bottom"
                        ? "border-[#8ECAE6] bg-[#8ECAE6]/25 text-[#1E293B] shadow-lg scale-[1.02]"
                        : "border-white/20 text-white/30"
                    }`}
                  >
                    <span>하단 배치 영역</span>
                  </div>
                </div>
              )}

              {/* ⭐ 텍스트 배치 영역 (자유배치 토글 여부와 무관하게 동일한 절대 좌표 렌더링 -> 토글 시 위치 점프 0) */}
              <div className="absolute inset-6 z-10 pointer-events-none">
                {["tag", "title", "body"].map((f) => {
                  const pos = getFieldPosition(activeCard, f);
                  const isThisDragging = isDragging && draggedField === f;
                  const currentPos = isThisDragging && dragCurrentPos ? dragCurrentPos : pos;
                  return (
                    <div
                      key={f}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex justify-center items-center"
                      style={{
                        left: `${currentPos.x}%`,
                        top: `${currentPos.y}%`,
                        zIndex: isThisDragging ? 40 : activeField === f ? 30 : 20
                      }}
                    >
                      {renderField(f)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 카드뉴스 하단: 가로 카드 썸네일 스트립 (오른쪽 정렬 + + 버튼 인라인) + 페이지 네비게이션 & 다운로드 액션 */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            {/* 가로 카드 썸네일 스트립: 오른쪽 배치(justify-end) 및 + 버튼을 그 옆에 배치 */}
            <div className="flex items-center justify-end gap-2.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar">
              {cards.map((c, idx) => {
                const isCurrent = idx === activeCardIndex;
                return (
                  <div
                    key={c.id || idx}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`relative group flex-shrink-0 w-24 aspect-[4/5] rounded-none border transition-all cursor-pointer select-none overflow-hidden bg-[#18181b] ${
                      isCurrent
                        ? "border-2 border-white/80 ring-2 ring-stone-900/40 shadow-[0_16px_36px_rgba(0,0,0,0.45)] -translate-y-1 z-10"
                        : "border border-stone-800 shadow-2xs hover:border-stone-600 hover:shadow-xs opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* 실제 카드 내용 그대로 렌더링 (블랙 베이스 + 편집 화면 그대로의 디자인) */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-2.5 pointer-events-none">
                      {/* 상단: 태그 & 카드 번호 */}
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[7.5px] text-stone-400 font-bold truncate max-w-[55px] tracking-tight">
                          {c.tag || "콘텐츠 제작"}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-none leading-none ${
                          isCurrent
                            ? "bg-white text-stone-950 font-black"
                            : "bg-stone-800 text-stone-300 border border-stone-700"
                        }`}>
                          {idx + 1}
                        </span>
                      </div>

                      {/* 중앙: 카드 제목 (편집 화면과 동일한 흰색 굵은 텍스트) */}
                      <div className="my-auto py-1 text-center">
                        <p className="text-[8.5px] font-black leading-tight line-clamp-2 text-white drop-shadow-xs">
                          {c.title || "새 카드 제목"}
                        </p>
                      </div>

                      {/* 하단: 본문 내용 (편집 화면과 동일한 라이트 그레이 텍스트) & 잠금 아이콘 */}
                      <div className="flex items-end justify-between gap-1 pt-1 border-t border-white/10">
                        <p className="text-[6.5px] text-stone-300 line-clamp-2 leading-tight">
                          {c.body || "내용을 입력하세요."}
                        </p>
                        {Object.values(c.styles || {}).some((s) => s.isLocked) && (
                          <Lock className="w-2.5 h-2.5 text-amber-400 flex-shrink-0 mb-0.5" />
                        )}
                      </div>
                    </div>

                    {/* 카드 삭제 버튼 (2장 이상일 때 호버 시 표시) */}
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCard(idx, e)}
                        className="absolute top-1 right-1 z-20 w-4.5 h-4.5 rounded-none bg-stone-900 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                        title="카드 삭제"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* 그 옆에 바로 배치되는 (+) 추가 버튼 - 누르면 가로 그라데이션 형태로 새 카드 추가 */}
              <button
                type="button"
                onClick={handleAddCard}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 hover:bg-black text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
                title="새 카드 추가"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 메인 카드 하단 컨트롤 바: 페이지 이동 네비게이션 & 다운로드 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs text-xs font-black text-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveCardIndex(Math.max(0, activeCardIndex - 1))}
                  disabled={activeCardIndex === 0}
                  className="text-stone-400 hover:text-stone-900 disabled:opacity-30 cursor-pointer transition"
                  title="이전 카드"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="select-none tracking-tight">
                  페이지 {activeCardIndex + 1}/{cards.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCardIndex(Math.min(cards.length - 1, activeCardIndex + 1))}
                  disabled={activeCardIndex === cards.length - 1}
                  className="text-stone-400 hover:text-stone-900 disabled:opacity-30 cursor-pointer transition"
                  title="다음 카드"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 다운로드 버튼 */}
              <button
                type="button"
                onClick={handleDownloadCard}
                className="btn-pill-dark text-xs gap-3"
              >
                <span>현재 카드 JPG 다운로드</span>
                <span className="btn-pill-badge" title="다운로드">
                  <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ──────── [우측 패널 (lg:col-span-3)]: 스크롤 시 화면을 따라오는 sticky 적용 ──────── */}
        <div className="lg:col-span-3 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar bg-white/75 backdrop-blur-md rounded-2xl border border-white/80 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[520px]">
          <div className="space-y-4">
            {/* 상단: 이미지 첨부 기능 */}
            <div className="pb-3 border-b border-stone-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-700" />
                  <span className="text-xs font-black text-[#292929]">이미지 첨부</span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">카드 배경 적용</span>
              </div>

              {/* 이미지 소스 3대 버튼 */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = activeImagePanel === "unsplash" ? null : "unsplash";
                    setActiveImagePanel(next);
                    if (next === "unsplash" && unsplashResults.length === 0) {
                      handleSearchUnsplash(unsplashQuery);
                    }
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 ${
                    activeImagePanel === "unsplash"
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white hover:bg-stone-50 border-stone-200/90 text-stone-800"
                  }`}
                  title="언플래쉬에서 고화질 사진 찾기"
                >
                  <Search className={`w-3.5 h-3.5 ${activeImagePanel === "unsplash" ? "text-white" : "text-stone-600"}`} />
                  <span className="truncate">언플래쉬</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveImagePanel(activeImagePanel === "dongaDb" ? null : "dongaDb");
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 ${
                    activeImagePanel === "dongaDb"
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white hover:bg-stone-50 border-stone-200/90 text-stone-800"
                  }`}
                  title="동아일보 보도사진 DB 아카이브"
                >
                  <BookOpen className={`w-3.5 h-3.5 ${activeImagePanel === "dongaDb" ? "text-white" : "text-stone-600"}`} />
                  <span className="truncate">동아일보 DB</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 text-[11px] font-bold transition flex flex-col items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  title="내 PC에서 사진 불러오기"
                >
                  <FileUp className="w-3.5 h-3.5 text-stone-600" />
                  <span className="truncate">내 PC</span>
                </button>
              </div>

              {/* ⭐ 버튼 하단에 스크롤되어 나타나는 인라인 창: 언플래쉬 (곡률 없이 직사각형 형태) */}
              {activeImagePanel === "unsplash" && (
                <div className="p-3 bg-white border border-stone-200/90 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="text-[11px] font-black text-stone-800">언플래쉬 사진 검색</span>
                    <button
                      type="button"
                      onClick={() => setActiveImagePanel(null)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 검색창 */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={unsplashQuery}
                      onChange={(e) => setUnsplashQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchUnsplash()}
                      placeholder="검색어 입력 (예: 경제, 인공지능)"
                      className="flex-1 px-2.5 py-1.5 border border-stone-200 text-[11px] rounded-none outline-none focus:border-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchUnsplash()}
                      className="px-3 py-1.5 bg-stone-900 text-white text-[11px] font-bold rounded-none hover:bg-black cursor-pointer"
                    >
                      검색
                    </button>
                  </div>

                  {/* 스크롤 이미지 그리드 (곡률 없이 직사각형) */}
                  <div className="max-h-56 overflow-y-auto border border-stone-100 p-1">
                    {isUnsplashLoading ? (
                      <div className="flex items-center justify-center py-8 text-stone-400 text-xs gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
                        <span>사진 불러오는 중...</span>
                      </div>
                    ) : unsplashError ? (
                      <div className="text-center py-6 text-stone-400 text-[11px]">{unsplashError}</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {unsplashResults.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => {
                              handleSelectUnsplashPhoto(photo.urls?.regular || photo.urls?.small);
                              setActiveImagePanel(null);
                            }}
                            className="group relative aspect-[4/3] rounded-none overflow-hidden border border-stone-200 hover:border-stone-900 cursor-pointer"
                          >
                            <img
                              src={photo.urls?.small || photo.urls?.regular}
                              alt={photo.alt_description || "사진"}
                              className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              적용하기
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ⭐ 버튼 하단에 스크롤되어 나타나는 인라인 창: 동아일보 DB (곡률 없이 직사각형 형태) */}
              {activeImagePanel === "dongaDb" && (
                <div className="p-3 bg-white border border-stone-200/90 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                    <span className="text-[11px] font-black text-stone-800">동아일보 보도사진 DB</span>
                    <button
                      type="button"
                      onClick={() => setActiveImagePanel(null)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 스크롤 이미지 그리드 (곡률 없이 직사각형) */}
                  <div className="max-h-56 overflow-y-auto border border-stone-100 p-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      {DONGA_DB_PHOTOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            updateActiveCard("bgImage", item.url);
                            setInstagramImage(item.url);
                            showToast(`"${item.caption}" 사진이 적용되었습니다.`);
                            setActiveImagePanel(null);
                          }}
                          className="group relative aspect-[4/3] rounded-none overflow-hidden border border-stone-200 hover:border-stone-900 cursor-pointer text-left"
                        >
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-1.5">
                            <span className="text-[9px] text-white font-bold truncate leading-tight">
                              {item.caption}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 현재 배경 상태 및 검정 배경 복구 버튼 */}
              {activeCard.bgImage ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-100/80 border border-stone-200/70 text-xs">
                  <span className="text-[11px] font-bold text-stone-700 truncate max-w-[120px]">
                    이미지 적용됨
                  </span>
                  <button
                    type="button"
                    onClick={handleResetBlackBg}
                    className="text-[10px] font-bold text-stone-600 hover:text-rose-600 transition cursor-pointer"
                  >
                    검정 배경으로 변경
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-stone-100/50 border border-dashed border-stone-200 text-center">
                  <span className="text-[10px] text-stone-400 font-medium">기본 검정 배경 사용 중</span>
                </div>
              )}
            </div>

            {/* 카드뉴스 정보 배치 및 텍스트 수정 영역 (첨부 이미지 UI 맥락 적용) */}
            <div className="space-y-3 pt-2">
              {/* 상단 라벨: 표지 · 핵심 제목 or N번 카드 · 본문 */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <strong className="text-xs font-black text-stone-900 tracking-tight">
                  {activeCardIndex === 0 ? "표지 · 핵심 제목" : `${activeCardIndex + 1}번 카드 · ${activeCard.role || "본문"}`}
                </strong>
                <span className="text-[10px] font-bold text-stone-500 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/60">
                  {activeCardIndex + 1}/{cards.length}
                </span>
              </div>

              {/* 1. 정보 배치 드롭다운 */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">정보 배치</label>
                <div className="relative">
                  <select
                    value={activeCard.layout || "standard"}
                    onChange={(e) => updateActiveCard("layout", e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-stone-800 bg-white border border-stone-300 rounded-none outline-none focus:border-stone-900 appearance-none shadow-2xs cursor-pointer pr-8"
                  >
                    <option value="standard">설명형</option>
                    <option value="comparison">비교형</option>
                    <option value="list">목록형</option>
                    <option value="steps">단계형</option>
                    <option value="stat">수치 강조형</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. 강조할 구절 (쉼표로 구분, 최대 8개) & 글자 크기 체크박스 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 block">
                  강조할 구절 (쉼표로 구분, 최대 8개)
                </label>
                <input
                  type="text"
                  value={activeCard.highlights || ""}
                  onChange={(e) => updateActiveCard("highlights", e.target.value)}
                  placeholder="현재 제목·본문에 있는 구절을 입력하세요"
                  className="w-full px-2.5 py-1.5 text-xs text-stone-800 bg-white border border-stone-300 rounded-none outline-none focus:border-stone-900 shadow-2xs"
                />

                <label className="flex items-center gap-1.5 pt-0.5 text-xs text-stone-700 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={!!activeCard.isCompact}
                    onChange={(e) => updateActiveCard("isCompact", e.target.checked)}
                    className="w-3.5 h-3.5 accent-stone-900 rounded-none cursor-pointer"
                  />
                  <span>글자를 조금 작게 표시</span>
                </label>
              </div>

              {/* 3. 안내 문구 및 상태 표시 문구 */}
              <div className="space-y-1 pt-1 text-[10.5px] text-stone-500 leading-snug">
                <p>
                  비교형은 본문을 두 줄로, 목록·단계형은 2~4개 항목으로 줄바꿈하세요. 단계형은 실제 순서가 있는 내용에 사용하세요.
                </p>
                <p className="font-bold text-stone-700 pt-0.5">
                  글 영역 확인 완료 · 글 크기 {activeCard.isCompact ? "90%" : "100%"}
                </p>
              </div>

              {/* 4. 카드 제목 & 본문 내용 실시간 수정 입력란 */}
              <div className="pt-2 border-t border-stone-200/70 space-y-2.5">
                {/* 상단 태그 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block">상단 태그</label>
                  <input
                    type="text"
                    value={activeCard.tag || ""}
                    onChange={(e) => updateActiveCard("tag", e.target.value)}
                    placeholder="태그 (예: 심층 기획)"
                    className="w-full px-2.5 py-1.5 text-xs text-stone-800 bg-white border border-stone-300 rounded-none outline-none focus:border-stone-900 shadow-2xs"
                  />
                </div>

                {/* 카드 제목 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block">카드 제목</label>
                  <textarea
                    rows={2}
                    value={activeCard.title || ""}
                    onChange={(e) => updateActiveCard("title", e.target.value)}
                    placeholder="카드 제목을 입력하세요"
                    className="w-full px-2.5 py-1.5 text-xs font-bold leading-relaxed text-stone-800 bg-white border border-stone-300 rounded-none outline-none focus:border-stone-900 resize-none shadow-2xs"
                  />
                </div>

                {/* 본문 내용 */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block">본문 내용</label>
                  <textarea
                    rows={3}
                    value={activeCard.body || ""}
                    onChange={(e) => updateActiveCard("body", e.target.value)}
                    placeholder="본문 내용을 입력하세요"
                    className="w-full px-2.5 py-1.5 text-xs text-stone-700 bg-white border border-stone-300 rounded-none outline-none focus:border-stone-900 resize-none shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* ──────── [플랫폼 배포 화면 메인 박스 (activePlatform !== "cardnews")] ──────── */}
        {activePlatform !== "cardnews" && (
          <div className="lg:col-span-9 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar space-y-5">
            {/* 플랫폼 전환 탭 바 */}
            <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/80 w-fit shadow-xs">
              <button
                type="button"
                onClick={() => setActivePlatform("instagram")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePlatform === "instagram"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                }`}
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform("threads")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePlatform === "threads"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                }`}
              >
                Threads
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform("cardnews")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePlatform === "cardnews"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                }`}
              >
                카드뉴스
              </button>
            </div>

            {/* ──────── [인스타그램 플랫폼 가로형 피드 화면 및 인라인 편집] ──────── */}
            {activePlatform === "instagram" && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-stone-200/80 overflow-hidden text-xs w-full transition-all">
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                  {/* [가로형 좌측]: 피드 미디어 영역 (제작된 카드뉴스 자동 로드 및 슬라이드) */}
                  <div className="md:col-span-6 lg:col-span-7 bg-[#18181B] relative flex flex-col justify-between overflow-hidden min-h-[380px] md:min-h-[460px] select-none">
                    {(() => {
                      const currentCard = cards[selectedCardNewsIndex] || cards[0];
                      return (
                        <>
                          {/* 카드뉴스 배경 */}
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundColor: currentCard.bgImage ? "transparent" : "#18181B",
                              backgroundImage: currentCard.bgImage
                                ? `url(${currentCard.bgImage})`
                                : (currentCard.bgGradient || "linear-gradient(90deg, #18181B 0%, #27272A 50%, #18181B 100%)"),
                              backgroundSize: "cover",
                              backgroundPosition: "center"
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
                          </div>

                          {/* 카드뉴스 텍스트 레이아웃 */}
                          <div className="relative z-10 flex flex-col justify-between h-full p-6 text-white pointer-events-none">
                            {/* 상단: 태그 및 카드 번호 */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-300 tracking-tight">
                                {currentCard.tag || currentCard.role || "콘텐츠 제작"}
                              </span>
                              <span className="text-[11px] font-black px-2 py-0.5 rounded bg-white/20 text-white">
                                #{selectedCardNewsIndex + 1} / {cards.length}
                              </span>
                            </div>

                            {/* 중앙: 제목 */}
                            <div className="my-auto py-2 text-left">
                              <h3 className="text-lg md:text-xl xl:text-2xl font-black leading-snug drop-shadow text-white whitespace-pre-line">
                                {currentCard.title || "제목 없음"}
                              </h3>
                            </div>

                            {/* 하단: 본문 내용 */}
                            <div className="pt-2 border-t border-white/15">
                              <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line line-clamp-3">
                                {currentCard.body || "내용이 여기에 표시됩니다."}
                              </p>
                            </div>
                          </div>

                          {/* 슬라이드 넘김 인디케이터 (2장 이상일 때) */}
                          {cards.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-auto">
                              {cards.map((_, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => setSelectedCardNewsIndex(cIdx)}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    selectedCardNewsIndex === cIdx ? "bg-white w-3.5" : "bg-white/40 hover:bg-white/70 w-1.5"
                                  }`}
                                  title={`${cIdx + 1}번 카드로 전환`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* [가로형 우측]: 헤더 + 캡션 인라인 편집기 + 해시태그 + 인터랙션 */}
                  <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 bg-white">
                    {/* 상단 인스타그램 헤더 */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[1.5px] shadow-2xs">
                          <div className="w-full h-full rounded-full bg-white p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">
                              AI
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-stone-900 text-xs">ainewsroom_official</span>
                            <span className="w-3 h-3 rounded-full bg-[#8ECAE6] text-stone-950 flex items-center justify-center text-[8px] font-black" title="공식 채널">✓</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block font-medium">스폰서 기사 · AI Newsroom</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* 비율 토글 */}
                        <button
                          type="button"
                          onClick={() => setInstagramAspectRatio((prev) => prev === "4:5" ? "1:1" : "4:5")}
                          className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold transition cursor-pointer"
                          title="이미지 비율 변경"
                        >
                          {instagramAspectRatio}
                        </button>
                        <button type="button" className="text-stone-400 hover:text-stone-700 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 중간 스크롤 영역: 본문 캡션 및 해시태그 인라인 편집 */}
                    <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
                      {/* 피드 캡션 인라인 텍스트 편집기 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-stone-900 text-xs">ainewsroom_official</span>
                          <span className="text-[10px] text-stone-400 font-medium">✏️ 텍스트 직접 편집</span>
                        </div>
                        <textarea
                          value={instagramCaption}
                          onChange={(e) => setInstagramCaption(e.target.value)}
                          rows={4}
                          placeholder="인스타그램에 등록될 본문 텍스트를 직접 입력하거나 수정하세요..."
                          className="w-full p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-xs text-stone-800 leading-relaxed outline-none focus:border-[#8ECAE6] focus:ring-2 focus:ring-[#8ECAE6]/20 transition resize-none"
                        />
                      </div>

                      {/* 해시태그 인라인 편집 칩 목록 */}
                      <div className="space-y-1.5 pt-1 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {instagramHashtags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] text-[11px] font-bold border border-sky-100 group"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveHashtag(tag)}
                                className="text-stone-400 hover:text-rose-500 cursor-pointer"
                                title="태그 삭제"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* 태그 추가 인풋 */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <input
                            type="text"
                            value={newHashtagInput}
                            onChange={(e) => setNewHashtagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddHashtag(newHashtagInput);
                              }
                            }}
                            placeholder="#새 해시태그 입력 후 Enter"
                            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-[11px] text-stone-700 outline-none focus:border-[#8ECAE6] flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddHashtag(newHashtagInput)}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-bold hover:bg-black transition cursor-pointer"
                          >
                            추가
                          </button>
                        </div>
                      </div>

                      {/* 하단 메타 & 댓글 안내 */}
                      <div className="pt-1 text-[11px] text-stone-400 space-y-0.5">
                        <p className="cursor-pointer hover:underline">댓글 42개 모두 보기</p>
                        <p className="text-[10px]">방금 전 · AI Newsroom 공식 배포 채널</p>
                      </div>
                    </div>

                    {/* 하단 인터랙션 아이콘 바 및 캡션 복사 */}
                    <div className="px-4 py-3 border-t border-stone-100 space-y-2.5 bg-stone-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5 text-stone-800">
                          <button
                            type="button"
                            onClick={() => {
                              setIsInstagramLiked((prev) => !prev);
                              setInstagramLikeCount((prev) => isInstagramLiked ? prev - 1 : prev + 1);
                            }}
                            className="cursor-pointer transition-transform active:scale-125"
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors ${
                                isInstagramLiked ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
                              }`}
                            />
                          </button>
                          <button type="button" className="cursor-pointer hover:text-stone-950">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button type="button" className="cursor-pointer hover:text-stone-950">
                            <Send className="w-5 h-5" />
                          </button>
                          <button type="button" className="cursor-pointer hover:text-stone-950 text-stone-800">
                            <Bookmark className="w-5 h-5" />
                          </button>
                        </div>

                        {/* 피드 하단 빠른 액션 바 (캡션 복사) */}
                        <button
                          type="button"
                          onClick={handleCopyInstagramCaption}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-white text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>{isInstagramCopied ? "복사 완료 ✓" : "캡션 복사"}</span>
                        </button>
                      </div>

                      <div className="text-xs font-black text-stone-900">
                        좋아요 {instagramLikeCount.toLocaleString()}개
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ──────── [스레드(Threads) 플랫폼 화면 및 인라인 편집] ──────── */}
            {activePlatform === "threads" && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-stone-200/80 p-5 md:p-6 text-xs w-full max-w-xl xl:max-w-2xl mx-auto space-y-4 transition-all">
                {/* 타래 1번 포스트 */}
                <div className="flex items-start gap-3">
                  {/* 좌측 아바타 + 타래 연결선 */}
                  <div className="flex flex-col items-center self-stretch">
                    <div className="w-8 h-8 rounded-full bg-stone-950 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs">
                      @
                    </div>
                    <div className="w-0.5 bg-stone-200 flex-1 my-1 rounded-full"></div>
                  </div>

                  {/* 우측 본문 & 편집 영역 */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-stone-950 text-xs">ainewsroom_official</span>
                        <span className="text-[10px] text-stone-400">방금 전</span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-stone-400" />
                    </div>

                    {/* 1번 타래 인라인 텍스트 에디터 */}
                    <textarea
                      value={threadsList[0]?.content}
                      onChange={(e) => updateThreadContent(1, e.target.value)}
                      rows={4}
                      placeholder="스레드 1번 내용을 입력하세요..."
                      className="w-full p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-xs text-stone-900 leading-relaxed outline-none focus:border-[#8ECAE6] focus:ring-2 focus:ring-[#8ECAE6]/20 transition resize-none"
                    />

                    {/* 스레드 첨부 미디어: 자동 로드된 카드뉴스 (편집 불가, 자동 반영) */}
                    <div className="rounded-xl overflow-hidden border border-stone-800 relative select-none aspect-video bg-[#18181B]">
                      {(() => {
                        const currentCard = cards[selectedCardNewsIndex] || cards[0];
                        return (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundColor: currentCard.bgImage ? "transparent" : "#18181B",
                                backgroundImage: currentCard.bgImage
                                  ? `url(${currentCard.bgImage})`
                                  : (currentCard.bgGradient || "linear-gradient(90deg, #18181B 0%, #27272A 50%, #18181B 100%)"),
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
                            </div>
                            <div className="relative z-10 flex flex-col justify-between h-full p-3.5 text-white pointer-events-none">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-300">
                                  {currentCard.tag || currentCard.role || "콘텐츠 제작"}
                                </span>
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/20">
                                  AI 카드뉴스 #{selectedCardNewsIndex + 1}
                                </span>
                              </div>
                              <p className="text-xs font-black line-clamp-2 text-white my-auto">
                                {currentCard.title || "새 카드 제목"}
                              </p>
                              <p className="text-[10px] text-stone-300 line-clamp-1 border-t border-white/10 pt-1">
                                {currentCard.body || "내용이 여기에 표시됩니다."}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* 인터랙션 아이콘 바 */}
                    <div className="flex items-center gap-4 text-stone-600 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsThreadsLiked((prev) => !prev);
                          setThreadsLikeCount((prev) => isThreadsLiked ? prev - 1 : prev + 1);
                        }}
                        className="cursor-pointer flex items-center gap-1"
                      >
                        <Heart
                          className={`w-4 h-4 ${isThreadsLiked ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"}`}
                        />
                        <span className="text-[10px]">{threadsLikeCount}</span>
                      </button>
                      <MessageCircle className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                      <Repeat className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                      <Send className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* 타래 2번 포스트 (연결된 타래) */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-8 h-8 rounded-full bg-stone-950 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs">
                    @
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-stone-950 text-xs">ainewsroom_official</span>
                        <span className="text-[10px] text-stone-400">방금 전</span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-stone-400" />
                    </div>

                    {/* 2번 타래 인라인 텍스트 에디터 */}
                    <textarea
                      value={threadsList[1]?.content}
                      onChange={(e) => updateThreadContent(2, e.target.value)}
                      rows={3}
                      placeholder="스레드 2번 (연결 타래) 내용을 입력하세요..."
                      className="w-full p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 focus:bg-white text-xs text-stone-900 leading-relaxed outline-none focus:border-[#8ECAE6] focus:ring-2 focus:ring-[#8ECAE6]/20 transition resize-none"
                    />

                    {/* 인터랙션 아이콘 바 */}
                    <div className="flex items-center gap-4 text-stone-600 pt-0.5">
                      <Heart className="w-4 h-4 hover:text-rose-500 cursor-pointer" />
                      <MessageCircle className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                      <Repeat className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                      <Send className="w-4 h-4 hover:text-stone-950 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 바 (스레드 타래 복사) */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCopyThreads}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isThreadsCopied ? "복사 완료 ✓" : "스레드 타래 복사"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 파일 업로드 숨김 인풋 */}
            <input
              type="file"
              ref={platformFileInputRef}
              onChange={handleUploadPlatformImage}
              accept="image/*"
              className="hidden"
            />

            {/* ──────── [가로형 피드 아래 배치]: 원고 구성 (좌) + 연계 원고 검수 (우) ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              {/* 1. 원고 구성 바로가기 및 삽입 박스 (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-white/85 backdrop-blur-md rounded-2xl border border-stone-200/80 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="text-xs font-black text-[#292929]">원고 구성</h3>
                    <p className="text-[10px] text-stone-400">클릭 시 피드 원고에 해당 단락이 반영됩니다</p>
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-md">
                    총 6개 단락
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: "intro", label: "도입", text: draftSections.intro },
                    { id: "body1", label: "본문 1", text: draftSections.body1 },
                    { id: "body2", label: "본문 2", text: draftSections.body2 },
                    { id: "body3", label: "본문 3", text: draftSections.body3 },
                    { id: "outro", label: "마무리", text: draftSections.outro },
                    { id: "hashtags", label: "해시태그", text: draftSections.hashtags }
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-50/90 hover:bg-stone-100/90 border border-stone-200/80 text-left transition shadow-2xs group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-800">{item.label}</span>
                        <button
                          type="button"
                          onClick={() => handleInsertDraftSection(item.id)}
                          className="px-2 py-0.5 rounded-lg bg-stone-900 text-white text-[10px] font-bold hover:bg-black transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="w-2.5 h-2.5 text-[#8ECAE6]" />
                          <span>피드에 삽입</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 전체 원고 원문 근거 대조 토글 */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAllSourceExpanded((prev) => !prev)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-stone-600 hover:text-stone-950 transition cursor-pointer"
                  >
                    <span>▶ 전체 원고의 원문 근거 대조</span>
                    {isAllSourceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {isAllSourceExpanded && (
                    <div className="mt-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 text-[11px] text-stone-700 leading-relaxed whitespace-pre-line animate-in fade-in">
                      {activeArticle.content || "기사 원문 내용이 로드되었습니다."}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 연계 원고 검수 박스 (lg:col-span-7) */}
              <div className="lg:col-span-7 bg-white/85 backdrop-blur-md rounded-2xl border border-stone-200/80 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-stone-700 font-medium">
                      수정이 필요한 문자: <span className="font-black text-rose-500">2개</span> &nbsp;|&nbsp; 사실관계: <span className="font-black text-amber-600">2개</span> &nbsp;|&nbsp; 요구사항: <span className="font-bold text-stone-500">0개</span>
                    </p>
                    <p className="text-[10px] text-stone-400">
                      포함 내용은 직접 확인해주세요.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8ECAE6]" />
                    <span>{activePlatform === "threads" ? "Threads" : "Instagram"} 연계 원고 검수</span>
                  </div>
                </div>

                {/* 검수 항목 2개 카드 */}
                <div className="space-y-2.5">
                  {/* 항목 1 */}
                  <div className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200/50">
                      <span className="font-black text-stone-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        사실관계 - draft.도입
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyFactCheck("fc-1")}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          factCheckIssues[0].applied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-900 text-white hover:bg-black"
                        }`}
                      >
                        {factCheckIssues[0].applied ? "반영 완료 ✓" : "원고 반영"}
                      </button>
                    </div>
                    <p className="text-stone-700 font-semibold leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">확인할 내용:</span> 발생장소
                    </p>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">이유:</span> 본문에 없는 발생장소가 언급되었거나 기업명을 사실했습니다.
                    </p>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">수정:</span> 발생 장소의 정보를 기관명의 발원장소로 수정합니다.
                    </p>
                    <p className="text-stone-500 leading-relaxed text-[10px] bg-white/70 p-1.5 rounded-lg border border-stone-200/50 font-mono">
                      적용 근거: 이르쿠츠크 리스트 방역연구소의 위치가 시베리아 연방관구의 러시아 29개 주와 유대인 자치주 관할에 입각했다.
                    </p>
                  </div>

                  {/* 항목 2 */}
                  <div className="p-3 rounded-xl bg-stone-50/90 border border-stone-200/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200/50">
                      <span className="font-black text-stone-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        사실관계 - draft.본문 3
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyFactCheck("fc-2")}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          factCheckIssues[1].applied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-900 text-white hover:bg-black"
                        }`}
                      >
                        {factCheckIssues[1].applied ? "반영 완료 ✓" : "원고 반영"}
                      </button>
                    </div>
                    <p className="text-stone-700 font-semibold leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">확인할 내용:</span> 미국과 유럽연합 보건당국은 신속하고 투명한 정보 공개를 촉구했습니다.
                    </p>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">이유:</span> 본문에서 미국 외의 보건당국은 사안을 예의주시하고 있다고 했으며, 신속하고 투명한 정보 공개 촉구 주체는 별도의 보도 자료 및 인물들의 발언으로 구성되어 있어 오해를 배제했습니다.
                    </p>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      <span className="text-stone-500 font-bold">수정:</span> 본문의 취지에 맞게 내부의 보건청장 모니터링 사업을 예의주시하고 있다고 수정합니다.
                    </p>
                    <p className="text-stone-500 leading-relaxed text-[10px] bg-white/70 p-1.5 rounded-lg border border-stone-200/50 font-mono">
                      출처: "신속연구 투명성 정보 공개하라"
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ──────────────────────────────────────────
          3. Unsplash 사진 검색 모달
         ────────────────────────────────────────── */}
      {showUnsplashModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-4 animate-smooth-in">
          <div className="bg-white/96 backdrop-blur-2xl rounded-3xl p-6 max-w-2xl w-full shadow-[0_24px_64px_-12px_rgba(0,0,0,0.22),0_8px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] space-y-4 max-h-[85vh] flex flex-col border border-white ring-1 ring-stone-900/10 animate-smooth-pop">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-black text-[#292B2F]">Unsplash 사진 검색</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUnsplashModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 검색창 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={unsplashQuery}
                onChange={(e) => setUnsplashQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUnsplash()}
                placeholder="검색할 키워드를 입력하세요 (예: 비즈니스, 기술, 미디어)"
                className="flex-1 px-4 py-2 border border-stone-200 rounded-full text-xs outline-none focus:border-[#292B2F]"
              />
              <button
                type="button"
                onClick={() => handleSearchUnsplash()}
                className="px-5 py-2 bg-[#292B2F] hover:bg-black text-white rounded-full text-xs font-bold transition cursor-pointer"
              >
                검색
              </button>
            </div>

            {/* 검색 결과 그리드 */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-stone-100 rounded-2xl p-2">
              {isUnsplashLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-stone-400">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-700" />
                  <span className="text-xs">사진을 불러오는 중...</span>
                </div>
              ) : unsplashError ? (
                <div className="flex flex-col items-center justify-center h-48 text-stone-400 text-xs">
                  {unsplashError}
                </div>
              ) : unsplashResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-stone-400 text-xs">
                  검색 결과가 없습니다. 다른 키워드를 입력해보세요.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {unsplashResults.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleSelectUnsplashPhoto(photo.urls?.regular || photo.urls?.small)}
                      className="group relative aspect-[4/5] rounded-none overflow-hidden border border-stone-200 hover:border-black transition-all cursor-pointer"
                    >
                      <img
                        src={photo.urls?.small || photo.urls?.regular}
                        alt={photo.alt_description || "사진"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        선택
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          3-1. 동아일보 DB 보도사진 모달
         ────────────────────────────────────────── */}
      {showDongaDbModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-4 animate-smooth-in">
          <div className="bg-white/96 backdrop-blur-2xl rounded-3xl p-6 max-w-2xl w-full shadow-[0_24px_64px_-12px_rgba(0,0,0,0.22),0_8px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] space-y-4 max-h-[85vh] flex flex-col border border-white ring-1 ring-stone-900/10 animate-smooth-pop">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-black text-[#292B2F]">동아일보 보도사진 아카이브</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  공식 언론 DB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDongaDbModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] border border-stone-100 rounded-none p-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DONGA_DB_PHOTOS.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (activePlatform === "cardnews") {
                        updateActiveCard("bgImage", photo.url);
                        updateActiveCard("bgType", "image");
                        showToast("동아일보 DB 사진이 카드 배경으로 적용되었습니다.");
                      } else {
                        setInstagramImage(photo.url);
                        showToast("동아일보 DB 사진이 피드 이미지로 적용되었습니다.");
                      }
                      setShowDongaDbModal(false);
                    }}
                    className="group cursor-pointer rounded-none border border-stone-200/80 overflow-hidden bg-stone-50 hover:bg-white hover:border-stone-400 hover:shadow-xs transition flex flex-col"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-stone-200 relative rounded-none">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
                      />
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium">
                        {photo.date}
                      </span>
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-[11px] font-bold text-stone-800 line-clamp-1 leading-snug">
                        {photo.caption}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        출처: {photo.source}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          4. 배포 성공 알림 모달
         ────────────────────────────────────────── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-4 animate-smooth-in">
          <div className="bg-white/96 backdrop-blur-2xl rounded-3xl p-7 md:p-8 max-w-sm w-full shadow-[0_24px_64px_-12px_rgba(0,0,0,0.22),0_8px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] space-y-4 text-center border border-white ring-1 ring-stone-900/10 animate-smooth-pop">
            <div className="w-12 h-12 rounded-xl bg-[#8ECAE6] text-[#1E293B] flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-[#292B2F]">배포가 완료되었습니다</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              선택한 플랫폼 규격({selectedPlatforms.join(", ")})에 맞춰 뉴스 카드 콘텐츠가 정상적으로 배포되었습니다.
            </p>
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="btn-pill-dark w-full justify-center text-xs"
            >
              <span>확인</span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          ⭐ 6. 기사 전문 보기 모달 (사용자 요구: 가로 2단락 구성 박스 & 헤더 상단 기준 화면 정가운데 배치)
         ────────────────────────────────────────── */}
      {showFullArticleModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-4 pt-[74px] md:pt-[70px] animate-smooth-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFullArticleModal(false);
          }}
        >
          <div
            className="bg-[#FAF8F5]/96 backdrop-blur-2xl border border-white ring-1 ring-stone-900/10 rounded-3xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,1)] max-w-5xl w-full flex flex-col overflow-hidden animate-smooth-pop max-h-[82vh]"
          >
            {/* [모달 상단 헤더 바] */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D9] bg-white/70 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#292B2F] text-[#FAF8F5] flex items-center justify-center shadow-2xs">
                  <FileText className="w-4 h-4 text-[#8ECAE6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#292B2F]">작성 중인 기사 전문</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      실시간 연동 중
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E8982]">
                    가로 2단 구성 · [좌측] 기사 개요 및 메타 단락 · [우측] 기사 전문 본문 단락
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFullArticle}
                  className="px-3 py-1.5 bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#292B2F] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="기사 전문 전체 복사"
                >
                  {fullArticleCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>전문 복사</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] hover:text-[#18181B] rounded-xl transition cursor-pointer shadow-2xs"
                  title="인쇄하기"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullArticleModal(false)}
                  className="p-1.5 hover:bg-[#E7E2D9] text-[#71717A] hover:text-[#18181B] rounded-xl transition cursor-pointer"
                  title="닫기 (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* [⭐ 본체: 가로로 2가지 단락이 되어있는 박스 형태] */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E7E2D9] flex-1 overflow-hidden min-h-0">
              {/* ───────────────────────────────────
                  [가로 1번째 단락 - 좌측]: 내가 지금 어떤 기사를 작성중인지 (기사 개요, 메타데이터, 헤드라인, 사진, 리드문 요약)
                 ─────────────────────────────────── */}
              <div className="p-6 md:p-7 overflow-y-auto max-h-[calc(82vh-75px)] space-y-5 bg-[#FAF8F5]/80">
                {/* 1. 기사 정보 뱃지 및 카테고리 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#292B2F] text-[#FAF8F5]">
                      {activeArticle.category || "사회"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {activeArticle.status || "작성 중"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E8982]">
                    {activeArticle.updatedAt || "방금 수정"}
                  </span>
                </div>

                {/* 2. 기사 메인 헤드라인 제목 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8982]">
                    헤드라인 (기사 제목)
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-[#292B2F] leading-snug tracking-tight">
                    {activeArticle.title || "제목을 입력해주세요"}
                  </h2>
                  {activeArticle.subtitle && (
                    <p className="text-xs md:text-sm font-semibold text-[#57514A] leading-relaxed pt-1">
                      {activeArticle.subtitle}
                    </p>
                  )}
                </div>

                {/* 3. 대표 이미지 (있는 경우) */}
                {activeArticle.photos && activeArticle.photos.length > 0 && activeArticle.photos[0]?.url && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8E8982]">
                      대표 보도사진
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-[#E7E2D9] bg-white shadow-2xs">
                      <img
                        src={activeArticle.photos[0].url}
                        alt={activeArticle.photos[0].caption || "기사 대표 사진"}
                        className="w-full h-44 object-cover"
                      />
                      {activeArticle.photos[0].caption && (
                        <p className="text-[11.5px] text-[#71717A] p-2.5 bg-white border-t border-[#F4F4F5] leading-normal font-medium">
                          ▲ {activeArticle.photos[0].caption}
                          {activeArticle.photos[0].source && ` (${activeArticle.photos[0].source})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. 기사 핵심 리드문 (1단락/도입부 발췌 요약) */}
                <div className="bg-white p-4 rounded-2xl border border-[#E7E2D9] space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#008285]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>기사 핵심 리드문 (도입 단락 요약)</span>
                  </div>
                  <p className="text-xs text-[#57514A] leading-relaxed line-clamp-4">
                    {leadParagraph || "본문 내용이 작성되면 첫 도입 단락이 자동으로 리드문으로 요약됩니다."}
                  </p>
                </div>

                {/* 5. 기사 통계 지표 박스 */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-[#E7E2D9] text-center shadow-2xs">
                    <div className="text-[10.5px] font-bold text-[#8E8982]">전체 글자 수</div>
                    <div className="text-base font-black text-[#292B2F] mt-0.5">
                      {activeArticle.content ? activeArticle.content.length.toLocaleString() : 0}자
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E7E2D9] text-center shadow-2xs">
                    <div className="text-[10.5px] font-bold text-[#8E8982]">단락(문단) 수</div>
                    <div className="text-base font-black text-[#292B2F] mt-0.5">
                      {activeArticle.content ? activeArticle.content.split(/\n\n+/).filter(Boolean).length : 0}개
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#E7E2D9] text-center shadow-2xs">
                    <div className="text-[10.5px] font-bold text-[#8E8982]">예상 읽기 시간</div>
                    <div className="text-base font-black text-[#292B2F] mt-0.5">
                      약 {Math.max(1, Math.ceil((activeArticle.content?.length || 0) / 500))}분
                    </div>
                  </div>
                </div>

                {/* 6. 작성자 바이라인 & 연결 출처 */}
                <div className="flex items-center justify-between text-xs text-[#8E8982] pt-2 border-t border-[#E7E2D9]/70">
                  <span>작성: 김동아 기자 (디지털편집부)</span>
                  <span>출처 연계: {activeArticle.linkedSources?.length || 0}건</span>
                </div>
              </div>

              {/* ───────────────────────────────────
                  [가로 2번째 단락 - 우측]: 기사 전문 전체 본문 (포털/동아 표준 규격)
                 ─────────────────────────────────── */}
              <div className="p-6 md:p-7 overflow-y-auto max-h-[calc(82vh-75px)] space-y-4 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#008285]" />
                    <h4 className="text-xs font-black text-[#292B2F] uppercase tracking-wider">
                      기사 본문 전문 (Full Text)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#8E8982] font-semibold">
                    동아일보 기사 표준 규격
                  </span>
                </div>

                {/* 기사 헤드라인 제목 및 부제목 */}
                <div className="pb-3 border-b border-[#F4F4F5] space-y-1.5">
                  <h3 className="text-lg md:text-xl font-black text-[#292B2F] leading-snug">
                    {activeArticle.title || "제목 없는 기사"}
                  </h3>
                  {activeArticle.subtitle && (
                    <p className="text-xs md:text-sm font-bold text-[#57514A] leading-relaxed">
                      {activeArticle.subtitle}
                    </p>
                  )}
                </div>

                <div className="text-[15.5px] leading-[1.88] text-[#27272A] space-y-4 font-sans">
                  {activeArticle.content ? (
                    activeArticle.content.split(/\n\n+/).map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      const photoMatch = trimmed.match(/^\[사진 삽입:\s*(.*?)(?:\s*\(출처:\s*(.*?)\))?\]$/);
                      if (photoMatch) {
                        const caption = (photoMatch[1] || "").trim();
                        const matchedPhoto = activeArticle.photos?.find(p => p.caption === caption) || activeArticle.photos?.[0];
                        return (
                          <figure key={pIdx} className="my-5">
                            <div className="overflow-hidden bg-transparent rounded-lg">
                              {matchedPhoto?.url && (
                                <img src={matchedPhoto.url} alt={caption} className="w-full h-auto max-h-[420px] object-cover rounded-lg" />
                              )}
                            </div>
                            {caption && (
                              <figcaption className="mt-1.5 text-xs text-[#767676] text-center font-sans">
                                ▲ {caption}
                              </figcaption>
                            )}
                          </figure>
                        );
                      }

                      return (
                        <p key={pIdx} className="font-normal text-[#27272A] tracking-[-0.2px] text-justify leading-[1.88]">
                          {trimmed}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-stone-400 italic text-center py-10">
                      아직 작성된 본문 내용이 없습니다.
                    </p>
                  )}

                  {/* 바이라인 */}
                  {activeArticle.content && (
                    <div className="pt-6 mt-6 border-t border-[#F4F4F5] text-xs text-[#71717A] font-medium">
                      <p>김동아 기자 donga_reporter@donga.com</p>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                        Copyright ⓒ 동아일보 & donga.com All rights reserved.
                      </p>
                    </div>
                  )}
                </div>

                {/* 하단 플랫폼 카드 편집 복귀 버튼 */}
                <div className="pt-4 border-t border-[#F4F4F5] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFullArticleModal(false)}
                    className="px-4 py-2 bg-[#292B2F] hover:bg-[#1F2124] text-[#FAF8F5] text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>플랫폼 카드 편집으로 돌아가기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ 마우스 드래그 시 커서를 실시간으로 따라다니는 "위치 이동" 문구 뱃지 (드롭 시 깔끔하게 사라짐) */}
      {isDragging && (
        <div
          className={`fixed z-[99999] pointer-events-none -translate-x-1/2 -translate-y-full mb-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xl select-none animate-smooth-pop ${
            isFreeLayoutMode
              ? "bg-[#8ECAE6] text-[#1E293B] border border-white/60 shadow-[0_4px_20px_rgba(142,202,230,0.6)]"
              : "bg-[#18181B] text-[#8ECAE6] border border-[#8ECAE6]/50"
          }`}
          style={{
            left: mousePos.x,
            top: mousePos.y
          }}
        >
          <span className={`w-2 h-2 rounded-full ${isFreeLayoutMode ? "bg-[#1E293B]" : "bg-[#8ECAE6]"} animate-ping`} />
          <span>{isFreeLayoutMode ? "✨ 자유 위치 이동" : "위치 이동"}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────
          5. 플로팅 토스트 알림
         ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-xl text-stone-950 px-5 py-2.5 rounded-full text-xs font-black shadow-[0_12px_36px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] border border-white ring-1 ring-stone-900/15 animate-smooth-pop flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-stone-900 flex-shrink-0 shadow-[0_0_6px_rgba(0,0,0,0.3)]" />
          <span>
            {typeof toastMessage === "string" ? toastMessage.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").trim() : toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
