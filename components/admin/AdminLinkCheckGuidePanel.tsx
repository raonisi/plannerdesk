import {
  LINK_CHECK_CADENCE,
  LINK_CHECK_STATUS_ADMIN_HINT,
  LINK_CHECK_STATUS_LABEL,
  LINK_CHECK_TYPE_LABEL,
} from "@/lib/directory/link-check-status";
import { borders, surfaces, textStyles } from "@/lib/design-system";

export default function AdminLinkCheckGuidePanel({
  insurerName,
}: {
  insurerName?: string;
}) {
  return (
    <section
      className={`mb-5 rounded-lg border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-4 sm:px-5 ${borders.default}`}
      aria-labelledby="admin-link-check-guide"
    >
      <h2
        id="admin-link-check-guide"
        className="text-sm font-bold text-[#102235]"
      >
        링크 상태 수동 점검 (PR-134)
      </h2>
      <p className={`mt-2 ${textStyles.small}`}>
        {insurerName
          ? `${insurerName} 링크는 운영자가 수동으로 확인합니다.`
          : "업무 링크는 운영자가 수동으로 확인합니다."}{" "}
        HTTP 자동 크롤·대량 요청·자동 상태 검사는 사용하지 않습니다.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-[#4f5661]">
        <li>링크 유형·URL 확인</li>
        <li>공식 출처 또는 운영자 확인 여부 기록</li>
        <li>접근 제한(전산 로그인 등) 여부 확인</li>
        <li>상태 분류 후 수정 필요는 별도 데이터 PR로 이관</li>
        <li>확인 필요·보류는 public에 정상 링크로 표시하지 않음</li>
      </ol>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.entries(LINK_CHECK_STATUS_LABEL).map(([key, label]) => (
          <div
            key={key}
            className={`rounded-md border border-[#E3DED4] bg-white px-3 py-2 ${surfaces.card}`}
          >
            <p className="text-xs font-bold text-[#102235]">{label}</p>
            <p className="mt-1 text-[10px] leading-snug text-[#5f6670]">
              {LINK_CHECK_STATUS_ADMIN_HINT[key as keyof typeof LINK_CHECK_STATUS_ADMIN_HINT]}
            </p>
          </div>
        ))}
      </div>
      <p className={`mt-4 ${textStyles.small}`}>
        권장 주기 예: 전산·청구안내·헬프데스크 {LINK_CHECK_CADENCE.system},{" "}
        {LINK_CHECK_CADENCE.claim_guide}, {LINK_CHECK_CADENCE.helpdesk} / 공시{" "}
        {LINK_CHECK_CADENCE.disclosure}
      </p>
      <p className="mt-2 text-xs text-[#5f6670]">
        유형: {Object.values(LINK_CHECK_TYPE_LABEL).join(" · ")}
      </p>
      <p className="mt-3 text-xs">
        점검표·절차: 저장소{" "}
        <code className="rounded bg-white px-1 py-0.5 text-[10px]">docs/PR-134-*</code>
        {" "}(운영자용, public 미노출)
      </p>
    </section>
  );
}
