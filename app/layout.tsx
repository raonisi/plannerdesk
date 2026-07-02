import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { RouteTransitionProgress } from "@/components/navigation/route-transition-progress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap"
});

export const metadata: Metadata = {
  title: "플래너데스크 | 보험설계사의 하루를 시작하는 실무 플랫폼",
  description:
    "전국 보험설계사를 위한 실무 포털 & 성장 플랫폼. 보험사 정보, 청구 서류, 고객 메시지, 검증 커뮤니티와 AI 도구를 한 곳에서 준비합니다.",
  metadataBase: new URL("https://plannerdesk.app"),
  openGraph: {
    title: "플래너데스크",
    description: "보험설계사의 하루를 시작하는 실무 플랫폼",
    type: "website",
    locale: "ko_KR"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${notoSansKr.variable}`}>
        <Suspense fallback={null}>
          <RouteTransitionProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
