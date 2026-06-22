"use client";

import Link from "next/link";
import { textStyles } from "@/lib/design-system";
import { buttons } from "@/lib/design-system";

export type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  ariaLabel?: string;
};

export type EmptyStateProps = {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  /** Compact left-aligned layout for inline panels (home favorites/recents). */
  variant?: "default" | "compact";
  role?: "status" | "alert";
};

function EmptyStateActions({
  actions,
  alignStart,
}: {
  actions: EmptyStateAction[];
  alignStart?: boolean;
}) {
  return (
    <div
      className={`mt-4 flex min-w-0 flex-wrap gap-2 ${
        alignStart ? "justify-start" : "justify-center sm:justify-start"
      }`}
    >
      {actions.map((action) => {
        const className = `${buttons.base} min-h-11 px-4 ${
          action.variant === "outline" ? buttons.outline : buttons.primary
        }`;
        const ariaLabel = action.ariaLabel ?? action.label;

        if (action.href) {
          return (
            <Link
              key={`${action.href}-${action.label}`}
              aria-label={ariaLabel}
              className={className}
              href={action.href}
            >
              {action.label}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            aria-label={ariaLabel}
            className={className}
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actions,
  variant = "default",
  role = "status",
}: EmptyStateProps) {
  const isCompact = variant === "compact";
  const hasActions = Boolean(actions && actions.length > 0);

  return (
    <div
      className={`min-w-0 rounded-xl border border-dashed border-[#E3DED4] bg-[#F7F4EE] p-5 sm:p-6 ${
        isCompact ? "text-left" : "text-center"
      } ${hasActions && !isCompact ? "sm:text-left" : ""}`}
      role={role}
    >
      <h3
        className={`break-keep font-bold text-[#0F1D2E] ${
          isCompact
            ? "text-sm"
            : "text-base sm:text-lg"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 break-keep leading-relaxed text-[#4A5565] ${
          isCompact ? "text-xs" : textStyles.small
        }`}
      >
        {description}
      </p>
      {hasActions ? (
        <EmptyStateActions actions={actions!} alignStart={isCompact} />
      ) : null}
    </div>
  );
}
