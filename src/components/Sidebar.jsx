import React from "react";
import { 
  PenTool, 
  Search, 
  Mic, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  FolderArchive,
  PanelLeftClose, 
  PanelLeftOpen
} from "lucide-react";

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  activeTab, 
  setActiveTab 
}) {
  const sidebarNavItems = [
    { id: "writer", label: "기사 작성", icon: PenTool },
    { id: "search", label: "자료 검색", icon: Search },
    { id: "interview", label: "인터뷰·녹취", icon: Mic },
    { id: "factcheck", label: "기사 검증", icon: CheckCircle2 },
    { id: "publish", label: "발행 준비", icon: Send },
    { id: "convert", label: "콘텐츠 변환", icon: Sparkles },
    { id: "archive", label: "보관함", icon: FolderArchive }
  ];

  return (
    <aside 
      className={`h-full floating-black-sidebar transition-all duration-300 flex flex-col z-20 select-none ${
        isCollapsed ? "w-16" : "w-56 md:w-60"
      }`}
    >
      {/* Sidebar Header: Toggle Icon Button */}
      <div className={`p-3.5 border-b border-white/10 flex items-center ${isCollapsed ? "justify-center" : "justify-end"}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 shadow-xs border border-white/10 transition cursor-pointer"
          title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-white" /> : <PanelLeftClose className="w-4 h-4 text-slate-300" />}
        </button>
      </div>

      {/* Sidebar Navigation Menu Items */}
      <div className="py-4 space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "writer" && activeTab === "factcheck");
          return (
            <div 
              key={item.id} 
              className={`relative w-full ${isActive ? "pl-2.5 pr-0" : "px-2.5"}`}
            >
              {/* Top Sweeping Concave Curve SVG */}
              {isActive && (
                <div className="absolute -top-6 right-0 w-6 h-6 pointer-events-none z-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 0 H 24 V 24 C 24 10.746 13.254 0 0 0 Z" fill="#000000" />
                  </svg>
                </div>
              )}

              {/* Active / Inactive Button */}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`transition-all duration-200 cursor-pointer relative z-10 ${
                  isActive
                    ? "bg-[#ebedf1] text-black font-extrabold rounded-l-full rounded-r-none py-3.5 pl-4 pr-3 w-full shadow-xs flex items-center gap-3"
                    : "w-full rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 p-3 flex items-center gap-3"
                } ${isCollapsed ? (isActive ? "justify-center" : "justify-center px-0") : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-black" : "text-slate-400"}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>

              {/* Bottom Sweeping Concave Curve SVG */}
              {isActive && (
                <div className="absolute -bottom-6 right-0 w-6 h-6 pointer-events-none z-20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 24 H 24 V 0 C 24 13.254 13.254 24 0 24 Z" fill="#000000" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
