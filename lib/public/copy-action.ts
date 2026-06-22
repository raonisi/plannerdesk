export const COPY_FAILURE_MESSAGE =
  "복사하지 못했습니다. 직접 선택해 복사해 주세요.";

export type CopyActionSource =
  | "message-template"
  | "claim-guide"
  | "disclosure-guide"
  | "directory";

export type CopyActionOptions = {
  text: string;
  successMessage?: string;
  failureMessage?: string;
  source?: CopyActionSource;
};

export type CopyActionResult = {
  ok: boolean;
  userMessage: string;
};

export function isCopyableText(text: string): boolean {
  return text.trim().length > 0;
}

export function resolveCopySuccessMessage(
  source?: CopyActionSource,
  override?: string,
): string {
  const trimmed = override?.trim();
  if (trimmed) return trimmed;

  switch (source) {
    case "message-template":
      return "안전 문구를 복사했습니다.";
    case "claim-guide":
    case "disclosure-guide":
      return "안내 문구를 복사했습니다.";
    case "directory":
      return "연락 안내를 복사했습니다.";
    default:
      return "복사했습니다.";
  }
}

/** Client-only clipboard write with safe fallback. Returns false on empty input or failure. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!isCopyableText(text)) return false;

  if (typeof window !== "undefined") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through to execCommand fallback
    }
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function performCopyAction(
  options: CopyActionOptions,
): Promise<CopyActionResult> {
  const failureMessage = options.failureMessage?.trim() || COPY_FAILURE_MESSAGE;

  if (!isCopyableText(options.text)) {
    return { ok: false, userMessage: failureMessage };
  }

  const ok = await copyTextToClipboard(options.text);
  if (ok) {
    return {
      ok: true,
      userMessage: resolveCopySuccessMessage(options.source, options.successMessage),
    };
  }

  return { ok: false, userMessage: failureMessage };
}
