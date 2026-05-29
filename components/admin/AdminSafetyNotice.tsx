import { borders } from "@/lib/design-system";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";

interface AdminSafetyNoticeProps {
  policySummary: string;
  showNeedsReview?: boolean;
  showSensitive?: boolean;
  showGuidance?: boolean;
}

export default function AdminSafetyNotice({
  policySummary,
  showNeedsReview = true,
  showSensitive = true,
  showGuidance = true,
}: AdminSafetyNoticeProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
        <p className="font-semibold">{policySummary}</p>
        <p className="mt-1 text-[#4f5661]">{ADMIN_CONTENT_SAFETY_COPY.draftRule}</p>
        {showNeedsReview ? (
          <p className="mt-1 text-[#4f5661]">
            {ADMIN_CONTENT_SAFETY_COPY.needsReviewRule}
          </p>
        ) : null}
        <p className="mt-1 text-[#4f5661]">
          {ADMIN_CONTENT_SAFETY_COPY.governanceRule}
        </p>
      </div>

      {showGuidance || showSensitive ? (
        <div
          className={`rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm leading-relaxed text-[#102235] ${borders.subtle}`}
        >
          {showGuidance ? (
            <p className="font-semibold">{ADMIN_CONTENT_SAFETY_COPY.guidanceNotice}</p>
          ) : null}
          {showSensitive ? (
            <p className={`text-[#4f5661] ${showGuidance ? "mt-1" : ""}`}>
              {ADMIN_CONTENT_SAFETY_COPY.sensitiveNotice}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[#4f5661]">
            {ADMIN_CONTENT_SAFETY_COPY.referenceNotice}
          </p>
        </div>
      ) : null}
    </div>
  );
}
