import Link from "next/link";
import { buttons } from "@/lib/design-system";

export function EmptyStatePanel({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "outline" }>;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#E3DED4] bg-[#F7F4EE] p-5">
      <p className="text-sm font-bold text-[#0F1D2E]">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#5B6470] break-keep">
        {description}
      </p>
      {actions && actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              className={`${buttons.base} px-4 ${
                action.variant === "primary"
                  ? buttons.primary
                  : buttons.outline
              }`}
              href={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
