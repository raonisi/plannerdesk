import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "PlannerDesk 커뮤니티",
  description: "검증 설계사를 위한 실무 정보 공유 공간입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}

