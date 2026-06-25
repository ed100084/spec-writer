"use client";

import { useState, useRef } from "react";
import { APP_VERSION, BUILD_DATE } from "@/lib/version";

interface Props {
  onUpload: (file: File) => void;
  loading: boolean;
  error: string;
}

export default function UploadZone({ onUpload, loading, error }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.docx?$/i)) {
      return;
    }
    onUpload(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-2">規格書檢視器</h1>
      <p className="text-center text-gray-500 mb-1">
        上傳 .docx 規格書，線上檢視、加批注、下載
      </p>
      <p className="text-center text-xs text-gray-400 mb-8">
        v{APP_VERSION} · {BUILD_DATE}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.doc"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {loading ? (
          <div className="text-blue-600">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
            <p>解析中...</p>
          </div>
        ) : (
          <div>
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-gray-700">拖曳檔案到此或點擊上傳</p>
            <p className="text-sm text-gray-400 mt-1">支援 .docx 格式</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-400">
        <p className="text-center">功能：上傳 → 左側目錄導覽 → 右側檢視內容 → 選取文字加批注 → 下載含審查意見的 .docx</p>
      </div>
    </div>
  );
}