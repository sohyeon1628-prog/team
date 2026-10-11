import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ArticleWriter from "./components/ArticleWriter";
import SourceSearch from "./components/SourceSearch";
import InterviewStudio from "./components/interview/InterviewStudio";
import FormatConverter from "./components/FormatConverter";
import ArchiveView from "./components/ArchiveView";
import LoginScreen from "./components/LoginScreen";

import { initialArticles, mockFactCheckIssues } from "./data/mockData";

/**
 * 전체 배경 Soft Ambient Gradient Theme:
 * - 상단: 아주 은은한 Soft Blue glow (rgba(190, 220, 255, 0.25))
 * - 중앙: 거의 흰색에 가까운 매우 부드러운 transition
 * - 하단: 아주 은은한 Soft Lavender glow (rgba(215, 200, 255, 0.22))
 * - 두 색상이 경계 없이 화면 전체에 공기처럼 넓게 퍼지며 어우러짐
 */
const getAmbientGradient = (activeTab, factCheckActive) => {
  // 기사 작성 및 기본 메인 뷰: 상단 Soft Blue + 하단 Soft Lavender 완벽 블렌딩
  const editorialSoftGradient = [
    "radial-gradient(ellipse 95% 55% at 50% -5%, rgba(190, 220, 255, 0.25) 0%, rgba(255, 255, 255, 0) 75%)",
    "radial-gradient(ellipse 95% 55% at 50% 105%, rgba(215, 200, 255, 0.22) 0%, rgba(255, 255, 255, 0) 75%)",
    "#FAFAFA"
  ].join(", ");

  // 03 기사 검증 모드
  if (activeTab === "factcheck" || (activeTab === "writer" && factCheckActive)) {
    return [
      "radial-gradient(ellipse 95% 50% at 50% -5%, rgba(190, 220, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)",
      "radial-gradient(ellipse 85% 65% at 15% 82%, rgba(190, 235, 215, 0.22) 0%, rgba(255, 255, 255, 0) 72%)",
      "radial-gradient(ellipse 95% 50% at 50% 105%, rgba(215, 200, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)",
      "#FAFAFA"
    ].join(", ");
  }

  // 01 STT 모드
  if (activeTab === "interview") {
    return [
      "radial-gradient(ellipse 85% 55% at 20% 10%, rgba(190, 220, 255, 0.26) 0%, rgba(255, 255, 255, 0) 70%)",
      "radial-gradient(ellipse 85% 50% at 50% 105%, rgba(215, 200, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)",
      "#FAFAFA"
    ].join(", ");
  }

  // 04 아카이브 모드
  if (activeTab === "archive") {
    return [
      "radial-gradient(ellipse 95% 50% at 50% -5%, rgba(190, 220, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)",
      "radial-gradient(ellipse 85% 55% at 85% 85%, rgba(250, 225, 200, 0.20) 0%, rgba(255, 255, 255, 0) 72%)",
      "#FAFAFA"
    ].join(", ");
  }

  return editorialSoftGradient;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("writer");
  const [article, setArticle] = useState(initialArticles[0]);

  // Sidebar collapse state (기본 상태: 세로로 긴 Slim Sidebar 접힘 상태)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Fact check sequential state
  const [factCheckActive, setFactCheckActive] = useState(false);
  const [factCheckIssues] = useState(mockFactCheckIssues);
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  // Quick Source Search Modal inside Article Writer
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Right side tools tab collapse state
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);

  // Authentication screen view state: null | 'login' | 'signup'
  const [authView, setAuthView] = useState(null);
  const [reporterName, setReporterName] = useState("김동아 기자");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRunFactCheck = () => {
    setFactCheckActive(true);
    setActiveFactIndex(0);
    setActiveTab("writer");
  };

  const handleApplyFactFix = () => {
    const currentIssue = factCheckIssues[activeFactIndex];
    if (currentIssue) {
      const updatedContent = article.content.replace(currentIssue.targetText, currentIssue.suggestion);
      setArticle({ ...article, content: updatedContent });
    }

    if (activeFactIndex + 1 < factCheckIssues.length) {
      setActiveFactIndex(activeFactIndex + 1);
    } else {
      alert("모든 팩트체크 검증 항목이 수정 또는 처리 완료되었습니다.");
      setFactCheckActive(false);
      setArticle((prev) => ({ ...prev, status: "검증 완료" }));
    }
  };

  const handleSkipFactFix = () => {
    if (activeFactIndex + 1 < factCheckIssues.length) {
      setActiveFactIndex(activeFactIndex + 1);
    } else {
      alert("팩트체크 순서형 검사가 종료되었습니다.");
      setFactCheckActive(false);
    }
  };

  const handleConnectSource = (source) => {
    const citation = `\n\n[출처 참고: ${source.title} (${source.category})]`;
    setArticle((prev) => ({
      ...prev,
      content: prev.content + citation,
      linkedSources: Array.from(new Set([...prev.linkedSources, source.id]))
    }));
    setShowSearchModal(false);
    alert(`"${source.title}" 자료가 작성 기사의 출처로 연결되었습니다.`);
  };

  const handleReturnFromInterview = (editedTranscript) => {
    if (editedTranscript) {
      const interviewQuote = `\n\n[인터뷰 발췌 녹취: ${editedTranscript.slice(0, 80)}...]`;
      setArticle((prev) => ({ ...prev, content: prev.content + interviewQuote }));
    }
    setActiveTab("writer");
  };

  const [isReaderPreview, setIsReaderPreview] = useState(false);
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#8ECAE6]/40 selection:text-slate-900 text-[#292929] relative overflow-x-hidden ${isReaderPreview ? "bg-white" : "bg-transparent"}`}>
      {/* ──────────────────────────────────────────────────────────
          Soft Ambient Gradient Background Layer (콘텐츠 뒤 고정 앰비언트 레이어)
          - 상단 Soft Blue (rgba(190, 220, 255, 0.25))
          - 중앙 거의 흰색에 가까운 부드러운 transition
          - 하단 Soft Lavender (rgba(215, 200, 255, 0.22))
          - transition-all duration-700으로 화면 전환 시 부드러운 빛의 블렌딩 효과
          - 독자 화면 미리보기 시에는 순수 흰색(#FFFFFF)으로 전환
         ────────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-700 ease-out"
        style={{
          background: isReaderPreview ? "#FFFFFF" : getAmbientGradient(activeTab, factCheckActive),
        }}
      />

      {/* 1. Top Header (독자 화면 미리보기 및 사진 편집 모드 시 숨김 처리) */}
      {!isReaderPreview && !isPhotoEditing && (
        <Header
          currentArticleTitle={article.title}
          status={article.status}
          reporterName={reporterName}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          onOpenAuth={(mode) => setAuthView(mode)}
        />
      )}

      {/* 2. Main Workspace Layout 또는 로그인/회원가입 화면 (앰비언트 그라데이션 배경 유지) */}
      {authView ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)] z-20">
          <LoginScreen
            initialMode={authView}
            onClose={() => setAuthView(null)}
            onLoginSuccess={(name) => {
              if (name) setReporterName(name.includes("기자") ? name : `${name} 기자`);
              setIsLoggedIn(true);
              setAuthView(null);
            }}
          />
        </div>
      ) : (
        <div className={`flex flex-1 w-full relative min-h-[calc(100vh-70px)] ${isPhotoEditing ? "p-0" : "pl-6 md:pl-8 pr-5 md:pr-7 py-2.5 gap-4 md:gap-6"} items-start ${isReaderPreview ? "pt-5" : ""}`}>
          {/* Left Sidebar attached to edge (사진 편집 화면 시 숨김) */}
          {!isPhotoEditing && (
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Main Content Workspace (우측 여백 없이 전체 너비 자연스럽게 채움) */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 z-20 relative mr-0">
            {activeTab === "writer" || activeTab === "publish" || activeTab === "factcheck" ? (
              <ArticleWriter
                article={article}
                setArticle={setArticle}
                onOpenSearch={() => setShowSearchModal(true)}
                onRunFactCheck={handleRunFactCheck}
                factCheckActive={factCheckActive}
                factCheckIssues={factCheckIssues}
                activeFactIndex={activeFactIndex}
                onApplyFactFix={handleApplyFactFix}
                onSkipFactFix={handleSkipFactFix}
                isToolsCollapsed={isToolsCollapsed}
                setIsToolsCollapsed={setIsToolsCollapsed}
                isSidebarCollapsed={isSidebarCollapsed}
                onConnectSource={handleConnectSource}
                isReaderPreview={isReaderPreview}
                setIsReaderPreview={setIsReaderPreview}
                isPhotoEditing={isPhotoEditing}
                setIsPhotoEditing={setIsPhotoEditing}
              />
            ) : activeTab === "interview" ? (
              <main className="flex-1 py-7 px-5 md:px-10 min-w-0 transition-all z-20">
                <InterviewStudio onReturnToArticle={handleReturnFromInterview} />
              </main>
            ) : activeTab === "archive" ? (
              <main className="flex-1 min-w-0 transition-all z-20 py-2">
                <ArchiveView />
              </main>
            ) : (
              <main className="main-warm-container flex-1 py-7 px-5 md:px-10 min-w-0 transition-all z-20">
                {activeTab === "search" && (
                  <SourceSearch onConnectToArticle={handleConnectSource} />
                )}

                {activeTab === "convert" && (
                  <FormatConverter currentArticle={article} />
                )}
              </main>
            )}
          </div>
        </div>
      )}

      {/* Quick Source Search Modal during Writing */}
      {showSearchModal && (
        <SourceSearch
          isModal={true}
          onClose={() => setShowSearchModal(false)}
          onConnectToArticle={handleConnectSource}
        />
      )}
    </div>
  );
}

