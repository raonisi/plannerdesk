import { PUBLIC_LINK_SAFETY_COPY } from "@/lib/directory/link-check-status";

export function PublicLinkCheckNotice({ className = "mt-3" }: { className?: string }) {
  return (
    <p
      className={`break-keep text-[11px] font-medium leading-5 text-[#5B6470] ${className}`}
    >
      {PUBLIC_LINK_SAFETY_COPY.noAutoCheck}
    </p>
  );
}
