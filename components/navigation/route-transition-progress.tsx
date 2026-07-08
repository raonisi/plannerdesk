"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteTransitionProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  // 현재 경로가 바뀌면 로딩 바 숨김
  useEffect(() => {
    const t = setTimeout(() => setIsPending(false), 0);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // 새 탭, 다운로드, 수정자 키 조합, 외부 링크 제외
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      // Hash only 이동 제외
      if (href.startsWith("#")) return;

      // 같은 URL 이동 제외
      const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      if (href === currentUrl) return;

      // 로딩 바 활성화
      setIsPending(true);

      // 8초 후 자동 해제 (Fallback)
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsPending(false);
      }, 8000);
    };

    // Capture phase에서 클릭 이벤트 감지
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);

  if (!isPending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={true}
      className="fixed inset-x-0 top-0 z-[9999] h-1 animate-pulse bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.7)]"
    >
      <span className="sr-only">페이지 이동 중...</span>
    </div>
  );
}
