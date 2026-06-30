import { safePublicReturnTo } from "@/lib/auth/safe-public-return-to";

const CALLBACK_URL_PARAM = "callbackUrl";

function hasMalformedPercentEncoding(input: string): boolean {
  return /%(?![0-9a-fA-F]{2})/.test(input);
}

function decodeCallbackPath(input: string): string | null {
  if (!/%[0-9a-fA-F]{2}/.test(input)) {
    return input;
  }

  try {
    return decodeURIComponent(input);
  } catch {
    return null;
  }
}

export function sanitizeOAuthCallbackPath(input?: string | null): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed || hasMalformedPercentEncoding(trimmed)) {
    return "/";
  }

  const decoded = decodeCallbackPath(trimmed);
  if (!decoded) {
    return "/";
  }

  return safePublicReturnTo(decoded);
}

export function safeAuthRedirectUrl(url: string, baseUrl: string): string {
  try {
    const urlObj = new URL(url, baseUrl);
    if (urlObj.origin !== baseUrl) {
      return baseUrl;
    }

    const pathWithSearch = urlObj.pathname + urlObj.search + urlObj.hash;
    const safePath = sanitizeOAuthCallbackPath(pathWithSearch);
    return `${baseUrl}${safePath === "/" ? "" : safePath}`;
  } catch {
    return baseUrl;
  }
}

export function sanitizeAuthCallbackUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  const callbackUrl = url.searchParams.get(CALLBACK_URL_PARAM);
  if (callbackUrl === null) {
    return requestUrl;
  }

  const safeCallbackUrl = sanitizeOAuthCallbackPath(callbackUrl);
  if (callbackUrl === safeCallbackUrl) {
    return requestUrl;
  }

  url.searchParams.set(CALLBACK_URL_PARAM, safeCallbackUrl);
  return url.toString();
}
