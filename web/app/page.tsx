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
import { APP_VERSION } from "@/lib/version";

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
      <main className="min-h-dvh flex items-center justify-center">
        <UploadZone onUpload={handleUpload} loading={loading} error={error} />
      </main>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b px-3 py-2 sm:px-4 shrink-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
          <h1 className="whitespace-nowrap text-base font-semibold sm:text-lg">規格書檢視器 <span className="text-xs font-normal text-gray-400">v{APP_VERSION}</span></h1>
          <span className="block truncate text-xs text-gray-500 sm:text-sm md:max-w-md">{doc.fileName}</span>
          </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <button
            onClick={() => setShowReview(!showReview)}
            className="rounded bg-blue-50 px-2 py-2 text-sm text-blue-700 hover:bg-blue-100 sm:px-3 sm:py-1.5"
          >
            {showReview ? "隱藏審查" : "顯示審查"}
          </button>
          <button
            onClick={handleDownload}
            className="rounded bg-green-600 px-2 py-2 text-sm text-white hover:bg-green-700 sm:px-3 sm:py-1.5"
          >
            下載 .docx
          </button>
          <button
            onClick={() => {
              setDoc(null);
              setReview(null);
            }}
            className="rounded bg-gray-100 px-2 py-2 text-sm text-gray-700 hover:bg-gray-200 sm:px-3 sm:py-1.5"
          >
            重新上傳
          </button>
        </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden md:flex-row">
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
          review={review}
        />

        {/* Review panel (toggle) */}
        {showReview && review && (
          <ReviewPanel review={review} annotations={doc.annotations} />
        )}
      </div>
    </div>
  );
}
