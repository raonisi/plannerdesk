import Link from "next/link";
import { buttons } from "@/lib/design-system";
import {
  HOME_DATA_STATUS_COPY,
  type HomeLoadState,
} from "@/lib/dashboard/home-data-state";

const PRIMARY_LINKS = [
  { href: "/directory", label: "보험사 바로가기" },
  { href: "/claim-documents", label: "청구서류" },
  { href: "/disclosure-links", label: "공시·약관" },
  { href: "/message-templates", label: "고객 문구" },
  { href: "/work-tools", label: "업무 도구" },
] as const;

function noticeContent(state: HomeLoadState): {
  title: string;
  description: string;
  tone: "error" | "neutral";
} | null {
  if (state === "error") {
    return {
      title: HOME_DATA_STATUS_COPY.errorTitle,
      description: HOME_DATA_STATUS_COPY.errorDescription,
      tone: "error",
    };
  }
  if (state === "partial-error") {
    return {
      title: HOME_DATA_STATUS_COPY.partialTitle,
      description: HOME_DATA_STATUS_COPY.partialDescription,
      tone: "error",
    };
  }
  if (state === "empty") {
    return {
      title: HOME_DATA_STATUS_COPY.emptyTitle,
      description: HOME_DATA_STATUS_COPY.emptyDescription,
      tone: "neutral",
    };
  }
  return null;
}

export function HomeDataStatusNotice({
  loadState,
  showQuickLinks = true,
}: {
  loadState: HomeLoadState;
  showQuickLinks?: boolean;
}) {
  const content = noticeContent(loadState);
  if (!content) return null;

  const borderClass =
    content.tone === "error"
      ? "border-[#e8c4c4] bg-[#fdf8f8]"
      : "border-[#E3DED4] bg-[#F7F4EE]";

  return (
    <div
      className={`mt-6 rounded-xl border px-4 py-4 sm:px-5 ${borderClass}`}
      role="status"
    >
      <p className="break-keep text-sm font-bold text-[#0F1D2E]">{content.title}</p>
      <p className="mt-2 break-keep text-sm leading-relaxed text-[#5B6470]">
        {content.description}
      </p>
      {showQuickLinks ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              className={`${buttons.base} ${buttons.outline} min-h-10 px-3 text-xs`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
