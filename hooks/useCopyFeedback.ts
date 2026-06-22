"use client";

import { useCallback, useRef, useState } from "react";
import {
  performCopyAction,
  type CopyActionOptions,
  type CopyActionResult,
} from "@/lib/public/copy-action";

export type CopyFeedbackVariant = "success" | "failure";

export type CopyFeedbackState = {
  message: string;
  variant: CopyFeedbackVariant;
} | null;

const FEEDBACK_VISIBLE_MS = 2500;

export function useCopyFeedback() {
  const [feedback, setFeedback] = useState<CopyFeedbackState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (message: string, variant: CopyFeedbackVariant = "success") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setFeedback({ message, variant });
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        timeoutRef.current = null;
      }, FEEDBACK_VISIBLE_MS);
    },
    [],
  );

  const copyWithFeedback = useCallback(
    async (options: CopyActionOptions): Promise<CopyActionResult> => {
      const result = await performCopyAction(options);
      showFeedback(result.userMessage, result.ok ? "success" : "failure");
      return result;
    },
    [showFeedback],
  );

  return {
    feedback,
    showFeedback,
    clearFeedback,
    copyWithFeedback,
  };
}
