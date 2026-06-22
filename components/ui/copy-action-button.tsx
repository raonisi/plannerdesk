"use client";

import { Copy } from "lucide-react";
import { useRef, useState } from "react";

import { buttons } from "@/lib/design-system";
import type { CopyActionOptions, CopyActionResult } from "@/lib/public/copy-action";

type CopyActionButtonProps = {
  label: string;
  copyingLabel?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
  copyOptions: CopyActionOptions;
  onCopy: (options: CopyActionOptions) => Promise<CopyActionResult>;
  showIcon?: boolean;
};

export function CopyActionButton({
  label,
  copyingLabel = "복사 중…",
  ariaLabel,
  className = "",
  disabled = false,
  disabledReason,
  copyOptions,
  onCopy,
  showIcon = true,
}: CopyActionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [copying, setCopying] = useState(false);

  async function handleClick() {
    if (disabled || copying) return;
    setCopying(true);
    try {
      await onCopy(copyOptions);
    } finally {
      setCopying(false);
      buttonRef.current?.focus();
    }
  }

  const visibleLabel = copying ? copyingLabel : label;
  const isDisabled = disabled || copying;

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-busy={copying || undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={ariaLabel}
      className={`${buttons.base} ${buttons.primary} gap-2 ${className}`.trim()}
      disabled={isDisabled}
      onClick={handleClick}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      {showIcon ? <Copy aria-hidden className="h-4 w-4 shrink-0" /> : null}
      {visibleLabel}
    </button>
  );
}
