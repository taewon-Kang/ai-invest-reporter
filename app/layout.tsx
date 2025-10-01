import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 투자 리포트 생성기",
  description: "심볼별 차트와 LLM 기반 투자 리포트 생성",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
