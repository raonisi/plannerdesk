import Link from "next/link";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";

export default function AdminAccessDeniedState() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${surfaces.page} px-4`}>
      <div className={`max-w-md w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}>
        {/* Decorative Top Accent Bar (Red warning accent) */}
        <div className="h-1.5 bg-red-700" />

        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-700"
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
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#102235] mb-4">
            관리자 권한이 필요합니다.
          </h1>

          {/* Description */}
          <p className={`${textStyles.body} text-sm mb-8`}>
            현재 계정에는 관리자 데스크 접근 권한이 없습니다.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full text-center py-2.5 px-4 rounded bg-[#10243e] text-[#f7f3e8] hover:bg-[#17324f] focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden transition-colors text-sm font-semibold shadow-sm"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
