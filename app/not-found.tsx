import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Search, Home, FolderOpen, FileText, Wrench, Star } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          주소가 바뀌었거나 삭제된 페이지입니다. 자주 사용하는 업무 메뉴로 이동해 주세요.
        </p>
        <p className="text-sm text-slate-500 mb-10">
          필요한 자료를 찾지 못했다면 통합 검색이나 주요 업무 메뉴를 먼저 확인해 보세요.
        </p>

        <div className="w-full max-w-2xl pb-16">
          {/* Primary CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="홈으로 이동"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold text-lg">홈으로 가기</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center justify-center gap-3 bg-slate-100 text-slate-800 p-4 rounded-xl shadow-sm hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
              aria-label="통합 검색으로 이동"
            >
              <Search className="w-5 h-5" />
              <span className="font-semibold text-lg">통합 검색</span>
            </Link>
          </div>

          {/* Secondary CTAs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/directory"
              className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              <FolderOpen className="w-6 h-6 text-slate-600" />
              <span className="font-medium text-slate-700 text-sm">보험사 전산</span>
            </Link>
            <Link
              href="/claim-documents"
              className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              <FileText className="w-6 h-6 text-slate-600" />
              <span className="font-medium text-slate-700 text-sm">청구서류</span>
            </Link>
            <Link
              href="/work-tools"
              className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              <Wrench className="w-6 h-6 text-slate-600" />
              <span className="font-medium text-slate-700 text-sm">업무 도구</span>
            </Link>
            <Link
              href="/favorites"
              className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
            >
              <Star className="w-6 h-6 text-amber-500" />
              <span className="font-medium text-slate-700 text-sm">내 즐겨찾기</span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
