"use client";

import { useState, useRef, useCallback } from "react";
import type { ParsedDoc, Annotation, SpecChapter, SpecContent } from "@/lib/types";

interface Props {
  doc: ParsedDoc;
  activeChapterId: string;
  onAddAnnotation: (annotation: Annotation) => void;
  onResolveAnnotation: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function ContentPanel({
  doc,
  activeChapterId,
  onAddAnnotation,
  onResolveAnnotation,
  onDeleteAnnotation,
}: Props) {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const chapter = doc.chapters.find((ch) => ch.id === activeChapterId);
  const chapterAnnotations = doc.annotations.filter((a) => a.chapterId === activeChapterId);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 2) {
      setSelectedText(text);
      setShowCommentBox(true);
    }
  }, []);

  const handleSubmitComment = useCallback(() => {
    if (!comment.trim() || !chapter) return;

    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      chapterId: activeChapterId,
      contentIndex: 0,
      selectedText,
      comment: comment.trim(),
      author: author.trim() || "匿名",
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    onAddAnnotation(annotation);
    setComment("");
    setSelectedText("");
    setShowCommentBox(false);
    window.getSelection()?.removeAllRanges();
  }, [comment, author, chapter, activeChapterId, selectedText, onAddAnnotation]);

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        選擇左側章節以檢視內容
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50" ref={contentRef}>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        {/* Chapter title */}
        <h2 className="mb-4 border-b pb-2 text-xl font-bold leading-snug sm:mb-6 sm:text-2xl">{chapter.title}</h2>

        {/* Content */}
        <div
          onMouseUp={handleSelection}
          className="prose prose-sm max-w-none break-words"
        >
          {chapter.content.map((content, idx) => (
            <ContentBlock key={idx} content={content} />
          ))}
        </div>

        {/* Comment box */}
        {showCommentBox && (
          <div className="fixed inset-x-3 bottom-3 z-50 rounded-lg border bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:w-96">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">新增批注</h3>
              <button
                onClick={() => setShowCommentBox(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="mb-2 p-2 bg-yellow-50 rounded text-xs text-gray-600 max-h-20 overflow-y-auto">
              「{selectedText.substring(0, 100)}{selectedText.length > 100 ? "..." : ""}」
            </div>
            <input
              type="text"
              placeholder="批注者姓名"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full mb-2 px-2 py-1 text-sm border rounded"
            />
            <textarea
              placeholder="輸入審查意見..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mb-2 px-2 py-1 text-sm border rounded h-20 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCommentBox(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={handleSubmitComment}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新增
              </button>
            </div>
          </div>
        )}

        {/* Annotations for this chapter */}
        {chapterAnnotations.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              本章批注（{chapterAnnotations.length}）
            </h3>
            <div className="space-y-2">
              {chapterAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  className={`annotation-comment ${ann.resolved ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {ann.author} · {new Date(ann.createdAt).toLocaleString("zh-TW")}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        原文：「{ann.selectedText.substring(0, 60)}{ann.selectedText.length > 60 ? "..." : ""}」
                      </div>
                      <div className="text-sm text-gray-800">{ann.comment}</div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onResolveAnnotation(ann.id)}
                        className="text-xs px-2 py-0.5 rounded hover:bg-gray-100"
                        title={ann.resolved ? "標記為待處理" : "標記為已解決"}
                      >
                        {ann.resolved ? "↩️" : "✅"}
                      </button>
                      <button
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="text-xs px-2 py-0.5 text-red-400 rounded hover:bg-red-50"
                        title="刪除"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentBlock({ content }: { content: SpecContent }) {
  if (content.type === "table" && content.table) {
    return (
      <div className="my-3 overflow-x-auto">
        <table className="spec-table">
          <tbody>
            {content.table.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={rowIdx === 0 ? "font-semibold bg-gray-100" : ""}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (content.type === "list") {
    return (
      <div
        className="my-2 text-sm"
        dangerouslySetInnerHTML={{ __html: content.html || content.text || "" }}
      />
    );
  }

  // paragraph
  const text = content.text || "";
  // Check if it looks like a sub-heading (short, no period at end)
  if (text.length < 30 && !text.endsWith("。") && !text.endsWith(".") && !text.includes("|")) {
    return <h3 className="text-base font-semibold mt-4 mb-1">{text}</h3>;
  }

  return <p className="my-2 text-sm leading-relaxed">{text}</p>;
}
