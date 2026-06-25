"use client";

import type { SpecChapter, Annotation, ReviewResult } from "@/lib/types";

interface Props {
  chapters: SpecChapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  annotations: Annotation[];
  review: ReviewResult | null;
}

export default function Sidebar({
  chapters,
  activeChapterId,
  onSelectChapter,
  annotations,
  review,
}: Props) {
  const unresolvedCount = annotations.filter((a) => !a.resolved).length;

  return (
    <aside className="w-64 shrink-0 bg-white border-r flex flex-col overflow-hidden">
      {/* Score badge */}
      {review && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">審查分數</span>
            <span className={`text-sm font-bold ${
              review.verdict === "pass" ? "text-green-600" :
              review.verdict === "conditional" ? "text-yellow-600" : "text-red-600"
            }`}>
              {review.score.percentage}%
            </span>
          </div>
          <div className={`text-xs px-2 py-1 rounded text-center font-medium ${
            review.verdict === "pass" ? "bg-green-50 text-green-700" :
            review.verdict === "conditional" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
          }`}>
            {review.verdict === "pass" ? "✅ 可送審" :
             review.verdict === "conditional" ? "⚠️ 補正後送審" : "❌ 不建議送審"}
          </div>
        </div>
      )}

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
          目錄
        </div>
        {chapters.map((ch) => {
          const chAnnotations = annotations.filter((a) => a.chapterId === ch.id);
          const hasUnresolved = chAnnotations.some((a) => !a.resolved);
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`w-full text-left px-3 py-2 text-sm border-l-2 transition-colors ${
                activeChapterId === ch.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{ch.title}</span>
                {chAnnotations.length > 0 && (
                  <span className={`ml-2 shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                    hasUnresolved ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {chAnnotations.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Annotations summary */}
      <div className="p-3 border-t text-xs text-gray-500">
        批注：{annotations.length} 筆
        {unresolvedCount > 0 && (
          <span className="text-yellow-600">（{unresolvedCount} 待處理）</span>
        )}
      </div>
    </aside>
  );
}