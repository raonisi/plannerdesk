import Link from "next/link";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";
import {
  isAuthProviderConfigured,
  isAuthSecretConfigured,
} from "@/lib/auth/env";

export default function AdminLockedState() {
  const providerReady = isAuthProviderConfigured();
  const secretReady = isAuthSecretConfigured();

  return (
    <div className={`min-h-screen flex items-center justify-center ${surfaces.page} px-4`}>
      <div className={`max-w-md w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}>
        <div className="h-1.5 bg-[#aa8137]" />

        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-[#f7f1e5] rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-[#aa8137]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#102235] mb-4">
            로그인이 필요합니다
          </h1>

          <p className={`${textStyles.body} text-sm mb-6`}>
            관리자 데스크는 승인된 운영자 계정으로 로그인한 뒤에만 이용할 수
            있습니다.
          </p>

          <div className={`mb-6 p-4 rounded-md ${surfaces.muted} ${borders.subtle} text-left`}>
            <p className="text-xs font-semibold text-[#303845] mb-2">
              접근 안내
            </p>
            <ul className="space-y-1.5 text-xs text-[#4f5661] leading-relaxed list-disc pl-4">
              <li>
                <strong>super_admin</strong>, <strong>content_admin</strong>{" "}
                역할이 부여된 계정만 관리자 기능을 사용할 수 있습니다.
              </li>
              <li>
                공개 페이지(디렉토리, 청구서류, 지식 아카이브 등)는 로그인 없이
                그대로 이용할 수 있습니다.
              </li>
              {!providerReady ? (
                <li>
                  현재 환경에 로그인 제공자가 설정되지 않았습니다. 운영
                  담당자에게 문의해 주세요.
                </li>
              ) : null}
              {!secretReady && process.env.NODE_ENV === "production" ? (
                <li>
                  인증 서명 키(AUTH_SECRET)가 아직 구성되지 않았습니다. 운영
                  담당자에게 문의해 주세요.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="space-y-3">
            {providerReady ? (
              <Link
                href="/api/auth/signin?callbackUrl=/admin"
                className="block w-full text-center py-2.5 px-4 rounded bg-[#10243e] text-[#f7f3e8] hover:bg-[#17324f] focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden transition-colors text-sm font-semibold shadow-sm"
              >
                로그인하기
              </Link>
            ) : (
              <p className="text-sm text-[#4f5661]">
                로그인 기능이 준비 중입니다. 관리자에게 문의해 주세요.
              </p>
            )}

            <Link
              href="/"
              className="block w-full text-center py-2.5 px-4 rounded border border-[#d9c9a8] bg-white hover:bg-[#f4efe5] text-[#10243e] hover:text-[#10243e] focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden transition-colors text-sm font-semibold"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
