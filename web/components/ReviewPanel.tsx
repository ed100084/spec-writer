"use client";

import type { ReviewResult, Annotation } from "@/lib/types";

interface Props {
  review: ReviewResult;
  annotations: Annotation[];
}

export default function ReviewPanel({ review, annotations }: Props) {
  return (
    <aside className="w-full shrink-0 bg-white border-t max-h-[45dvh] overflow-y-auto sidebar-scroll md:w-80 md:border-l md:border-t-0 md:max-h-none">
      {/* Score */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">審查結果</h2>
          <span className={`text-2xl font-bold ${
            review.verdict === "pass" ? "text-green-600" :
            review.verdict === "conditional" ? "text-yellow-600" : "text-red-600"
          }`}>
            {review.score.percentage}%
          </span>
        </div>
        <div className={`text-sm px-3 py-1.5 rounded text-center font-medium ${
          review.verdict === "pass" ? "bg-green-50 text-green-700" :
          review.verdict === "conditional" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
        }`}>
          {review.verdict === "pass" ? "✅ 可送審" :
           review.verdict === "conditional" ? "⚠️ 補正後送審" : "❌ 不建議送審"}
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          {review.score.passed}/{review.score.total} 項通過
        </div>
      </div>

      {/* Chapter detection */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold mb-2">章節檢查</h3>
        <div className="space-y-1">
          {review.chapters.map((ch) => (
            <div key={ch.id} className="flex items-center text-xs">
              <span className="mr-2">
                {ch.found ? "✅" : ch.required ? "❌" : "⚠️"}
              </span>
              <span className={ch.found ? "text-gray-700" : "text-red-500"}>
                {ch.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold mb-2">Checklist</h3>
        <div className="space-y-3">
          {review.checklist.map((cat) => {
            const passed = cat.items.filter((i) => i.passed).length;
            const total = cat.items.length;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{cat.id}. {cat.title}</span>
                  <span className={passed === total ? "text-green-600" : "text-red-500"}>
                    {passed}/{total}
                  </span>
                </div>
                <div className="space-y-0.5 pl-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-start text-xs">
                      <span className="mr-1.5 mt-0.5">
                        {item.passed ? "✅" : item.blocking ? "❌" : "⚠️"}
                      </span>
                      <span className={item.passed ? "text-gray-500" : "text-gray-700"}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambiguous terms */}
      {review.ambiguousTerms.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-2 text-red-600">
            模糊用語（{review.ambiguousTerms.length}）
          </h3>
          <div className="space-y-1">
            {review.ambiguousTerms.map((item, idx) => (
              <div key={idx} className="text-xs">
                <span className="text-red-500 font-medium">「{item.term}」</span>
                <span className="text-gray-400 ml-1">{item.context}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annotations summary */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2">批注摘要</h3>
        <div className="text-xs text-gray-500">
          共 {annotations.length} 筆批注
          （{annotations.filter((a) => !a.resolved).length} 待處理）
        </div>
      </div>
    </aside>
  );
}
