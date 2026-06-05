import { PUBLIC_INLINE_NOTICE } from "@/lib/ops/data-responsibility-notice";

export type DataResponsibilityNoticeVariant =
  keyof typeof PUBLIC_INLINE_NOTICE;

export function DataResponsibilityInlineNotice({
  variant,
}: {
  variant: DataResponsibilityNoticeVariant;
}) {
  return (
    <p
      className="break-keep rounded-md border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] px-4 py-3 text-sm leading-6 text-[#5f6670]"
      role="note"
    >
      {PUBLIC_INLINE_NOTICE[variant]}
    </p>
  );
}
