import type { Metadata } from "next";
import "./globals.css";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: `規格書檢視器 v${APP_VERSION}`,
  description: "上傳、檢視、批注、下載採購規格書",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}