"use client";

import { useCallback, useState } from "react";
import { CollapsibleNotice } from "@/components/content-page";
import { CorrectionRequestDialog } from "@/components/directory/correction-request-dialog";
import type { DisclosureLinkEntry } from "@/lib/content";
import type { PublicInsurer } from "@/lib/public/insurers";
import { uiLabels } from "@/lib/ui-labels";
import { DisclosureLinkCenter } from "./disclosure-link-center";

export function DisclosureLinksClient({
  entries,
  insurers,
}: {
  entries: DisclosureLinkEntry[];
  insurers: PublicInsurer[];
}) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionInsurerId, setCorrectionInsurerId] = useState<string | null>(
    null
  );

  const openCorrection = useCallback(
    (insurerSearch: string) => {
      const match = insurers.find((ins) =>
        ins.name.includes(insurerSearch.replace(/보험|생명|손해/g, "").trim()) ||
        insurerSearch.includes(ins.name.slice(0, 2))
      );
      setCorrectionInsurerId(match?.id ?? null);
      setCorrectionOpen(true);
    },
    [insurers]
  );

  return (
    <>
      <DisclosureLinkCenter
        entries={entries}
        onRequestCorrection={openCorrection}
      />

      <CollapsibleNotice
        summary="본 자료는 설계사 실무 참고용입니다. 최종 기준은 보험사 공식 안내와 약관을 확인해 주세요."
        title={uiLabels.safetyBoundary}
      >
        <ul className="space-y-2 break-keep">
          <li>공식 링크는 보험사·협회 채널 기준이며, 개정 시점에 따라 달라질 수 있습니다.</li>
          <li>일부 자료는 공식 출처 기준으로 재확인이 필요할 수 있습니다.</li>
          <li>보험금 지급 여부·금액 판단은 제공하지 않습니다.</li>
        </ul>
      </CollapsibleNotice>

      <CorrectionRequestDialog
        insurers={insurers}
        onOpenChange={setCorrectionOpen}
        open={correctionOpen}
        preselectedInsurerId={correctionInsurerId}
      />
    </>
  );
}
