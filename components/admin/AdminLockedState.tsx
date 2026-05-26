import Link from "next/link";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";

export default function AdminLockedState() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${surfaces.page} px-4`}>
      <div className={`max-w-md w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}>
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 bg-[#aa8137]" />

        <div className="p-8 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 bg-[#f7f1e5] rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-[#aa8137]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#102235] mb-4">
            관리자 인증이 필요합니다.
          </h1>

          {/* Description */}
          <p className={`${textStyles.body} text-sm mb-6`}>
            현재 관리자 기능은 승인된 운영자만 접근할 수 있습니다.
          </p>

          {/* Notice Card for Unconfigured Auth */}
          <div className={`mb-6 p-4 rounded-md ${surfaces.muted} ${borders.subtle} text-left`}>
            <div className="flex items-start gap-2.5">
              <svg
                className="w-5 h-5 text-[#aa8137] shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-[#303845] mb-1">
                  인증 설정 정보
                </p>
                <p className="text-xs text-[#4f5661] leading-relaxed">
                  로그인 제공자는 아직 설정되지 않았습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/api/auth/signin"
              className="block w-full text-center py-2.5 px-4 rounded bg-[#102235] text-white font-medium hover:bg-[#1b344e] transition-colors text-sm shadow-sm"
            >
              로그인 페이지로 이동
            </Link>
            
            <Link
              href="/"
              className="block w-full text-center py-2.5 px-4 rounded border border-[#d9c9a8] hover:bg-white/50 text-[#4f5661] font-medium transition-colors text-sm"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
