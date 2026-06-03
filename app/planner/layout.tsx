import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "PlannerDesk · 검증 설계사",
  description: "검증 설계사 전용 업무 도구 영역입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
