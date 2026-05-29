import Link from "next/link";
import { signOut } from "@/auth";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";

interface AdminAccessDeniedStateProps {
  email?: string | null;
}

export default function AdminAccessDeniedState({
  email = null,
}: AdminAccessDeniedStateProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${surfaces.page} px-4`}>
      <div className={`max-w-md w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}>
        <div className="h-1.5 bg-red-700" />

        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-700"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#102235] mb-4">
            관리자 권한이 없습니다
          </h1>

          <p className={`${textStyles.body} text-sm mb-4`}>
            현재 계정에는 관리자 데스크 접근 권한이 없습니다.
          </p>

          {email ? (
            <p className="text-xs text-[#4f5661] mb-4">
              접속 계정: <span className="font-semibold text-[#303845]">{email}</span>
            </p>
          ) : null}

          <div className={`mb-8 p-4 rounded-md ${surfaces.muted} ${borders.subtle} text-left`}>
            <p className="text-xs font-semibold text-[#303845] mb-2">
              권한 안내
            </p>
            <ul className="space-y-1.5 text-xs text-[#4f5661] leading-relaxed list-disc pl-4">
              <li>
                <strong>super_admin</strong>: 전체 관리자 기능
              </li>
              <li>
                <strong>content_admin</strong>: 콘텐츠 관리 기능
              </li>
              <li>그 외 역할은 /admin 접근이 차단됩니다.</li>
            </ul>
            <p className="mt-3 text-xs text-[#4f5661] leading-relaxed">
              접근이 필요하면 PlannerDesk 운영 관리자에게 역할 부여를
              요청해 주세요.
            </p>
          </div>

          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <button
                type="submit"
                className="block w-full text-center py-2.5 px-4 rounded border border-[#d9c9a8] bg-white hover:bg-[#f4efe5] text-[#102235] focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden transition-colors text-sm font-semibold"
              >
                다른 계정으로 로그인
              </button>
            </form>

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
