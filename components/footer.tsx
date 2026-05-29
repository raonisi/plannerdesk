export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex flex-col gap-1">
          <p className="font-black tracking-tight text-slate-900">플래너데스크</p>
          <p className="font-medium">보험설계사를 위한 실무 지원 플랫폼</p>
        </div>
        <div className="flex flex-col gap-1 text-right sm:text-left">
          <p className="font-medium text-slate-400">© 2026 플래너데스크</p>
          <p className="text-xs text-slate-300">made by 한국보험금융 이도현</p>
        </div>
      </div>
    </footer>
  );
}
