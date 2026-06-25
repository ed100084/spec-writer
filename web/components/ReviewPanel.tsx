"use client";

import type { ReviewResult, Annotation } from "@/lib/types";

interface Props {
  review: ReviewResult;
  annotations: Annotation[];
}

export default function ReviewPanel({ review, annotations }: Props) {
  const failedItems = review.checklist.flatMap((category) =>
    category.items
      .filter((item) => !item.passed)
      .map((item) => ({ ...item, categoryTitle: category.title }))
  );
  const highContentFindings = review.contentFindings.filter((finding) => finding.severity === "high");
  const unresolvedCount = annotations.filter((a) => !a.resolved).length;

  return (
    <aside className="w-full shrink-0 bg-white border-t max-h-[45dvh] overflow-y-auto sidebar-scroll md:w-96 md:border-l md:border-t-0 md:max-h-none">
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
          {review.verdict === "pass" ? "建議送審" :
           review.verdict === "conditional" ? "補強後送審" : "不建議送審"}
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          {review.score.passed}/{review.score.total} 項通過
        </div>
      </div>

      {review.contentFindings.length > 0 && (
        <div className="p-4 border-b">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">內文標註摘要</h3>
            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
              {review.contentFindings.length} 筆
            </span>
          </div>
          <div className="mb-2 text-xs text-gray-500">
            高風險 {highContentFindings.length} 筆。標註已放在對應段落下方，供逐段審閱。
          </div>
          <div className="space-y-2">
            {review.contentFindings.slice(0, 8).map((finding) => (
              <div key={finding.id} className="rounded border border-amber-100 bg-amber-50/70 p-2 text-xs">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="font-semibold text-amber-900">
                    {finding.label}｜{finding.chapterTitle}
                  </span>
                  <span className="shrink-0 text-gray-500">{finding.id}</span>
                </div>
                <FindingRow label="問題點" value={finding.issue} />
                <FindingRow label="建議改法" value={finding.recommendation} />
              </div>
            ))}
            {review.contentFindings.length > 8 && (
              <div className="text-xs text-gray-500">
                尚有 {review.contentFindings.length - 8} 筆，請在各章節內文查看。
              </div>
            )}
          </div>
        </div>
      )}

      {failedItems.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-3">問題點、原因與建議改法</h3>
          <div className="space-y-3">
            {failedItems.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded border border-red-100 bg-red-50/60 p-3 text-xs">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-semibold text-red-700">
                    {item.id} {item.categoryTitle}
                  </span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 ${
                    item.necessity === "required"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {item.necessity === "required" ? "一定要" : "建議"}
                  </span>
                </div>
                <FindingRow label="問題點" value={item.issue || item.text} />
                <FindingRow label="為什麼" value={item.why || ""} />
                <FindingRow label="建議改法" value={item.recommendation || ""} />
              </div>
            ))}
            {failedItems.length > 10 && (
              <div className="text-xs text-gray-500">
                尚有 {failedItems.length - 10} 項未顯示，請看下方 Checklist。
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold mb-2">章節檢視與建議結構</h3>
        <div className="space-y-2">
          {review.chapters.map((ch) => (
            <div key={ch.id} className={`rounded border p-2 text-xs ${
              ch.found ? "border-gray-100 bg-white" : "border-red-100 bg-red-50/60"
            }`}>
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className={ch.found ? "font-medium text-gray-700" : "font-medium text-red-700"}>
                  {ch.found ? "已存在" : "缺漏"}：{ch.title}
                </span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 ${
                  ch.required ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {ch.required ? "一定要" : "可選"}
                </span>
              </div>
              {!ch.found && <FindingRow label="為什麼" value={ch.why || ""} />}
              <FindingRow label="建議改法" value={ch.recommendation || ""} />
              <FindingRow label="建議結構" value={(ch.structure || []).join(" / ")} />
            </div>
          ))}
        </div>
      </div>

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
                        {item.passed ? "OK" : item.blocking ? "必補" : "建議"}
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

      {review.ambiguousTerms.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-2 text-red-600">
            模糊詞彙（{review.ambiguousTerms.length}）
          </h3>
          <div className="space-y-2">
            {review.ambiguousTerms.map((item, idx) => (
              <div key={idx} className="rounded bg-red-50 p-2 text-xs">
                <FindingRow label="問題點" value={`出現模糊詞「${item.term}」`} />
                <FindingRow label="為什麼" value="模糊詞會讓廠商估價、交付與驗收產生解讀差異。" />
                <FindingRow label="建議改法" value="改成可量測條件，例如數值、時間、容量、角色、流程或 Pass/Fail 判準。" />
                <div className="mt-1 text-gray-400">{item.context}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2">批註摘要</h3>
        <div className="text-xs text-gray-500">
          共 {annotations.length} 筆，{unresolvedCount} 筆未解決。
        </div>
      </div>
    </aside>
  );
}

function FindingRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="mt-1 leading-relaxed">
      <span className="font-medium text-gray-700">{label}：</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
