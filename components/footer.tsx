import { PUBLIC_LANDING_FOOTER_LINE } from "@/lib/ops/public-landing-safety";
import { uiLabels } from "@/lib/ui-labels";

export function Footer() {
  return (
    <footer className="border-t border-[#E3DED4] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 text-sm text-[#5B6470] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex flex-col gap-1">
          <p className="font-bold tracking-tight text-[#0F1D2E]">{uiLabels.brand}</p>
          <p className="font-medium">{uiLabels.footerTagline}</p>
          <p className="mt-1 max-w-md break-keep text-xs leading-relaxed">
            보험사 전산·청구·공시·고객 안내 자료를 한곳에서 확인하는 실무 참고 플랫폼입니다.
            {PUBLIC_LANDING_FOOTER_LINE}. 보험금 지급 판단·금액 산정·손해사정 업무는 제공하지 않습니다.
          </p>
        </div>
        <div className="flex flex-col gap-1 md:text-right">
          <p className="font-medium text-[#5B6470]">© 2026 {uiLabels.brand}</p>
          <p className="text-xs text-[#5B6470]/80">제작: 한국보험금융 이도현</p>
        </div>
      </div>
    </footer>
  );
}
