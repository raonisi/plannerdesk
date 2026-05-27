import { signOut } from "@/auth";
import Link from "next/link";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";

interface AdminShellProps {
  session: {
    user?: {
      email?: string | null;
    } | null;
  } | null;
}

export default function AdminShell({ session }: AdminShellProps) {
  const userEmail = session?.user?.email || "알 수 없는 운영자";

  // Dashboard placeholder items
  const placeholders = [
    {
      title: "보험사 디렉토리 관리",
      status: "운영 중",
      description: "보험사 정보, 고객 센터 연락처, 팩스 번호 및 웹사이트 링크를 관리합니다.",
      enabled: true,
      link: "/admin/insurers",
    },
    {
      title: "청구서류 창고 관리",
      status: "운영 중",
      description: "보험사별 필요한 청구 서류 서식과 상세 가이드를 관리합니다.",
      enabled: true,
      link: "/admin/claim-documents",
    },
    {
      title: "공시·약관 링크 관리",
      status: "준비 중",
      description: "공시실 및 필수 약관 링크의 최신화 상태를 모니터링하고 편집합니다.",
      enabled: false,
      link: "#",
    },
    {
      title: "고객 안내 문구 관리",
      status: "준비 중",
      description: "설계사들이 사용하는 상황별/어조별 안내 메세지 템플릿을 관리합니다.",
      enabled: false,
      link: "#",
    },
  ];

  return (
    <div className={`min-h-screen ${surfaces.page}`}>
      {/* Top Header */}
      <header className={`${surfaces.hero} border-b ${borders.divider} py-4 px-6 sm:px-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">PlannerDesk Admin</span>
            <span className="text-xs bg-[#aa8137] text-white px-2 py-0.5 rounded-full font-semibold">
              MVP
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#d8c08f] hidden sm:inline-block">
              접속 계정: <span className="font-semibold text-white">{userEmail}</span>
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <button
                type="submit"
                className="py-1.5 px-3 rounded bg-red-800 text-white font-medium hover:bg-red-900 transition-colors text-xs cursor-pointer"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-10 px-6 sm:px-8">
        {/* Banner Section */}
        <div className={`mb-10 ${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-6 sm:p-8 relative overflow-hidden`}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#aa8137]/5 rounded-bl-full pointer-events-none" />
          <h1 className="text-3xl font-semibold text-[#102235] mb-2">관리자 데스크</h1>
          <p className={`${textStyles.body} max-w-2xl`}>
            플래너데스크 운영 자료를 관리하기 위한 준비 화면입니다. 추후 데이터베이스(Neon PostgreSQL) 및 CRUD 기능 연동 시 실제 관리 도구로 활성화됩니다.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {placeholders.map((item, index) => (
            <div
              key={index}
              className={`relative ${surfaces.card} ${borders.default} rounded-lg p-6 transition-all ${
                item.enabled ? 'border-solid shadow-sm' : 'opacity-75 grayscale border-dashed'
              }`}
            >
              {/* Badge */}
              <span className={`absolute top-6 right-6 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                item.enabled 
                  ? 'border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]' 
                  : 'bg-[#f7f1e5] border border-[#d9c9a8] text-[#4f5661]'
              }`}>
                {item.status}
              </span>

              {/* Icon Placeholder */}
              <div className="w-10 h-10 bg-[#f7f1e5] rounded-lg flex items-center justify-center mb-4 text-[#aa8137]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#102235] mb-2">{item.title}</h3>
              {/* Description */}
              <p className="text-sm text-[#4f5661] leading-relaxed">{item.description}</p>

              {/* Action Button */}
              {item.enabled ? (
                <Link
                  href={item.link}
                  className="mt-6 block w-full py-2 px-4 rounded border border-[#10243E] bg-[#10243E] text-xs font-semibold text-[#F7F3E8] hover:bg-[#17324F] transition-colors text-center focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
                >
                  관리하기
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-6 w-full py-2 px-4 rounded border border-[#d9c9a8] bg-[#f7f1e5] text-xs font-semibold text-[#4f5661] cursor-not-allowed text-center"
                >
                  비활성화됨
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
