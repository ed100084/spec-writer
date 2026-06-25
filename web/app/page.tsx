"use client";

import { useState, useCallback } from "react";
import { parseDocx } from "@/lib/parse-docx";
import { downloadDocx } from "@/lib/generate-docx";
import { reviewDoc } from "@/lib/review";
import type { ParsedDoc, Annotation, ReviewResult } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import ContentPanel from "@/components/ContentPanel";
import ReviewPanel from "@/components/ReviewPanel";
import UploadZone from "@/components/UploadZone";

export default function Home() {
  const [doc, setDoc] = useState<ParsedDoc | null>(null);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const parsed = await parseDocx(file);
      setDoc(parsed);
      const result = reviewDoc(parsed);
      setReview(result);
      if (parsed.chapters.length > 0) {
        setActiveChapterId(parsed.chapters[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddAnnotation = useCallback((annotation: Annotation) => {
    setDoc((prev) => {
      if (!prev) return prev;
      return { ...prev, annotations: [...prev.annotations, annotation] };
    });
  }, []);

  const handleResolveAnnotation = useCallback((id: string) => {
    setDoc((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        annotations: prev.annotations.map((a) =>
          a.id === id ? { ...a, resolved: !a.resolved } : a
        ),
      };
    });
  }, []);

  const handleDeleteAnnotation = useCallback((id: string) => {
    setDoc((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        annotations: prev.annotations.filter((a) => a.id !== id),
      };
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!doc) return;
    await downloadDocx(doc);
  }, [doc]);

  if (!doc) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <UploadZone onUpload={handleUpload} loading={loading} error={error} />
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">規格書檢視器</h1>
          <span className="text-sm text-gray-500">{doc.fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReview(!showReview)}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          >
            {showReview ? "隱藏審查" : "顯示審查"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            下載 .docx
          </button>
          <button
            onClick={() => {
              setDoc(null);
              setReview(null);
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            重新上傳
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          chapters={doc.chapters}
          activeChapterId={activeChapterId}
          onSelectChapter={setActiveChapterId}
          annotations={doc.annotations}
          review={review}
        />

        {/* Content panel */}
        <ContentPanel
          doc={doc}
          activeChapterId={activeChapterId}
          onAddAnnotation={handleAddAnnotation}
          onResolveAnnotation={handleResolveAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
        />

        {/* Review panel (toggle) */}
        {showReview && review && (
          <ReviewPanel review={review} annotations={doc.annotations} />
        )}
      </div>
    </div>
  );
}