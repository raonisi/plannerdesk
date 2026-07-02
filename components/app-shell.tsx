import type { ReactNode } from "react";
import { PageFrame } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PublicMobileQuickTabs } from "@/components/navigation/mobile-quick-tabs";
import {
  publicMainLandmarkProps,
  SkipToContent,
} from "@/components/skip-to-content";
import { publicMobileQuickTabsContentInset } from "@/lib/navigation/public-nav";

/** 공개 페이지 공통 레이아웃: Header + 본문 + Footer */
export function AppShell({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PageFrame>
      <SkipToContent />
      <div
        className={`flex min-h-[100dvh] flex-col ${publicMobileQuickTabsContentInset} ${className}`.trim()}
      >
        <Header />
        <main
          {...publicMainLandmarkProps}
          className="flex min-w-0 flex-1 flex-col outline-none"
        >
          {children}
        </main>
        <Footer />
      </div>
      <PublicMobileQuickTabs />
    </PageFrame>
  );
}
