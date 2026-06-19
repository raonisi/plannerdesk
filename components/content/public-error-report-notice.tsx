import { USER_REPORT_NOTICE } from "@/lib/ops/user-support-inbox-plan";

export function PublicErrorReportNotice({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  if (variant === "compact") {
    return (
      <details className="group mt-3 text-left">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md text-xs font-semibold text-[#1f6b55] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 [&::-webkit-details-marker]:hidden">
          오류 제보 기준 보기
        </summary>
        <div
          className="mt-2 break-keep rounded-md border border-[#d9c9a8] bg-[#fbf7ee] px-3 py-3 text-xs leading-5 text-[#5f6670]"
          role="note"
        >
          <p className="font-semibold text-[#102235]">{USER_REPORT_NOTICE.title}</p>
          <p className="mt-2">{USER_REPORT_NOTICE.intro}</p>
          <p className="mt-2 font-medium text-[#102235]">
            {USER_REPORT_NOTICE.excludeHeading}
          </p>
          <p className="mt-1">
            고객명, 주민번호, 연락처, 계약번호, 상담 원문, secret 등은 포함하지
            말아 주세요.
          </p>
          {USER_REPORT_NOTICE.footer.map((line) => (
            <p className="mt-2" key={line}>
              {line}
            </p>
          ))}
        </div>
      </details>
    );
  }

  return (
    <details className="group rounded-xl border border-[#E3DED4] bg-white p-5 shadow-sm">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-bold text-[#0F1D2E]">오류 제보 안내</p>
          <p className="mt-1 break-keep text-sm leading-6 text-[#4A5565]">
            고객정보를 제외한 비식별 요약으로 제보해 주세요.
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
          펼치기
        </span>
        <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
          접기
        </span>
      </summary>
      <div className="mt-4 space-y-3 border-t border-[#E3DED4] pt-4 text-sm leading-6 text-[#4A5565]">
        <p className="break-keep">{USER_REPORT_NOTICE.intro}</p>
        <div>
          <p className="font-semibold text-[#0F1D2E]">
            {USER_REPORT_NOTICE.includeHeading}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {USER_REPORT_NOTICE.includeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#0F1D2E]">
            {USER_REPORT_NOTICE.excludeHeading}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
            {USER_REPORT_NOTICE.excludeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {USER_REPORT_NOTICE.footer.map((line) => (
          <p className="break-keep text-xs leading-5" key={line}>
            {line}
          </p>
        ))}
      </div>
    </details>
  );
}
