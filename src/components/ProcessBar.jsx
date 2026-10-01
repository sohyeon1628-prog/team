import React from "react";

export default function ProcessBar({ activeTab, setActiveTab }) {
  // Navigation Menu Tabs matching exact wording from the reference screenshot
  const menuTabs = [
    { id: "writer", label: "작성·검토" },
    { id: "publish", label: "발행 준비" },
    { id: "convert", label: "플랫폼 변환" },
    { id: "archive", label: "보관" }
  ];

  return (
    <div className="mb-6 inline-flex items-center bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
      {menuTabs.map((tab) => {
        // 'writer' or 'factcheck' maps to '작성·검토'
        const isActive = activeTab === tab.id || (tab.id === "writer" && activeTab === "factcheck");
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-slate-950 text-white shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
