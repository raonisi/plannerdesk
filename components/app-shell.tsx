import type { ReactNode } from "react";
import { PageFrame } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

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
      <div className={`flex min-h-screen flex-col ${className}`.trim()}>
        <Header />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </PageFrame>
  );
}
